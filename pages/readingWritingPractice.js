import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function ReadingWritingPractice() {
  const router = useRouter();
  const [mode, setMode] = useState(''); // 'reading' or 'writing'
  const [difficulty, setDifficulty] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [testCompleted, setTestCompleted] = useState(false);
  const [token, setToken] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  
  // Level-based progress states
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [levelProgress, setLevelProgress] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [responses, setResponses] = useState([]);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Check if user is authenticated
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
      // Show mode selection initially
      setShowLevelSelection(false);
    }

    return () => {
      // Clean up timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Fetch level progress for the selected difficulty and mode
  const fetchLevelProgress = async (selectedDifficulty) => {
    if (!selectedDifficulty || !mode) return;
    
    setLoading(true);
    try {
      // Initialize default progress for all 30 levels
      const defaultProgress = Array.from({ length: 30 }, (_, i) => ({
        level: i + 1,
        stars: 0,
        completed: i === 0, // Only first level is unlocked by default
        questionsCompleted: 0
      }));
      
      // Get user ID
      const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      const userId = userObj?._id || userObj?.id || '6462d8fbf6c3e30000000001';
      
      // Fetch progress data from API
      const response = await fetch(`/api/getPracticeProgress?skillArea=${mode === 'reading' ? 'Reading' : 'Writing'}&difficulty=${selectedDifficulty}&userId=${userId}`);
      const data = await response.json();
      
      if (response.ok && data.progress) {
        // Find progress for this specific skill area and difficulty
        const skillProgress = data.progress.find(p => 
          p.skillArea === (mode === 'reading' ? 'Reading' : 'Writing') && p.difficulty === selectedDifficulty
        );
        
        if (skillProgress && skillProgress.levelProgress && skillProgress.levelProgress.length > 0) {
          // Merge the API data with default data to ensure we have all 30 levels
          const mergedProgress = defaultProgress.map(defaultLevel => {
            const apiLevel = skillProgress.levelProgress.find(l => l.level === defaultLevel.level);
            return apiLevel || defaultLevel;
          });
          setLevelProgress(mergedProgress);
        } else {
          setLevelProgress(defaultProgress);
        }
      } else {
        setLevelProgress(defaultProgress);
      }
    } catch (apiError) {
      console.error("API error, using default progress:", apiError);
      
      // Initialize empty progress for all 30 levels as fallback
      const emptyProgress = Array.from({ length: 30 }, (_, i) => ({
        level: i + 1,
        stars: 0,
        completed: i < 2 // Make first 2 levels completed by default for demo
      }));
      setLevelProgress(emptyProgress);
    } finally {
      setLoading(false);
      setShowLevelSelection(true);
    }
  };
  
  // Handle difficulty selection
  const handleDifficultySelect = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    fetchLevelProgress(selectedDifficulty);
  };
  
  // Handle level selection
  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    // If it's a double-click or if it's a single click on a level that was already selected, start the practice
    if (selectedLevel === level) {
      fetchQuestions();
    }
  };
  
  // Handle level double click to immediately start practice
  const handleLevelDoubleClick = (level) => {
    setSelectedLevel(level);
    fetchQuestions();
  };
  
  // Back to level selection
  const backToLevelSelection = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setShowEvaluation(false);
    setResponses([]);
    setShowLevelSelection(true);
  };

  const fetchQuestions = async () => {
    if (!mode || !difficulty || !selectedLevel) return;

    setLoading(true);
    try {
      console.log(`Fetching ${mode} practice questions for ${difficulty} level ${selectedLevel}`);
      
      // Simple auth approach - include user ID in the request body instead of using token in header
      const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      const userId = userObj?._id || userObj?.id || '6462d8fbf6c3e30000000001'; // Fallback to default ID
      
      const response = await fetch('/api/fetchPracticeQuestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header to avoid 431 error
        },
        body: JSON.stringify({
          skillArea: mode === 'reading' ? 'Reading' : 'Writing',
          difficulty: difficulty,
          count: 5,
          userId: userId, // Send user ID in the body instead
          level: selectedLevel // Include the selected level
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        // If unauthorized, redirect to login
        if (response.status === 401) {
          localStorage.removeItem('token');
          alert("Your session has expired. Please log in again.");
          router.push("/login");
          return;
        }
        throw new Error(data.error || 'Failed to fetch questions');
      }
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions received');
      }
      
      // Add default timeLimit property to questions if not present
      const processedQuestions = data.questions.map(question => ({
        ...question,
        timeLimit: question.timeLimit || 60, // Default to 60 seconds if not specified
        content: question.content || 'Read the content carefully and answer the question',
        instructions: question.instructions || 'Provide your response below'
      }));

      // Set the processed questions
      setQuestions(processedQuestions);
      setTestStarted(true);
      setCurrentIndex(0);
      setResponses([]); // Clear any previous responses
      setShowLevelSelection(false); // Hide level selection
      
      // Only start timer if we have valid questions
      if (processedQuestions.length > 0) {
        // Slight delay to ensure state is updated
        setTimeout(() => {
          startTimer();
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert(`Failed to load ${mode} practice questions. Please try again.`);
      // Reset to level selection on failure
      backToLevelSelection();
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    // Safety check to make sure questions and currentIndex are valid
    if (!questions || !questions.length || currentIndex >= questions.length) {
      console.log('No valid question found to start timer');
      return;
    }
    
    const currentQuestion = questions[currentIndex];
    // Safety check for timeLimit property
    const timeLimit = currentQuestion?.timeLimit || 60; // Default to 60 seconds if not specified
    
    setTimeLeft(timeLimit);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleOptionSelect = (option) => {
    setSelectedOptions(prevSelected => {
      // For single selection questions
      if (!Array.isArray(questions[currentIndex].options) || questions[currentIndex].options.length <= 4) {
        return [option];
      }
      
      // For multiple selection questions
      if (prevSelected.includes(option)) {
        return prevSelected.filter(item => item !== option);
      } else {
        return [...prevSelected, option];
      }
    });
  };

  const handleTextResponseChange = (e) => {
    setUserResponse(e.target.value);
  };

  const submitResponse = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const currentQuestion = questions[currentIndex];
    const responseToSubmit = selectedOptions.length > 0 
      ? selectedOptions.join(', ')
      : userResponse;
      
    if (!responseToSubmit.trim()) {
      alert("Please provide a response before submitting.");
      return;
    }
    
    setLoading(true);
    try {
      // Get userId from localStorage
      const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      const userId = userObj?._id || userObj?.id || '6462d8fbf6c3e30000000001';
      
      // Get or generate a valid cardId
      let cardId = currentQuestion?.cardId;
      if (!cardId) {
        // Generate a simple ID if none exists
        cardId = `${mode}-${difficulty}-level${selectedLevel}-q${currentIndex}`;
      }
      
      // Generate a test ID if one doesn't exist
      // This is a simplified way to create something that looks like an ObjectId
      const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
      const randomPart = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      const testIdToUse = timestamp + randomPart.padStart(16, '0');
      
      const response = await fetch('/api/submitPracticeResponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testId: testIdToUse, // Now we always send a valid-looking ID
          cardId: cardId, // Use our validated/generated cardId
          userResponse: responseToSubmit,
          score: 0, // To be determined by AI
          timeSpent: (currentQuestion?.timeLimit || 60) - (timeLeft || 0), // Add safety check
          userId,
          level: selectedLevel, // Include the level number
          difficulty: difficulty, // Include the difficulty
          skillArea: mode === 'reading' ? 'Reading' : 'Writing' // Explicitly specify skill area based on mode
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
        setScore(data.score || 0);
        
        // Store response data for level evaluation
        // Extract expected response from question if available
        let expectedResponse = '';
        if (currentQuestion.expectedResponse) {
          expectedResponse = currentQuestion.expectedResponse;
        } else if (currentQuestion.answer) {
          // Some questions may have an 'answer' field instead
          expectedResponse = currentQuestion.answer;
        }
        
        console.log('Storing response with expected response:', expectedResponse);
        
        setResponses(prevResponses => [...prevResponses, {
          cardId: currentQuestion.cardId || cardId,
          question: currentQuestion.instructions || currentQuestion.content,
          expectedResponse: expectedResponse,
          userResponse: responseToSubmit,
          score: data.score || 1,
          timeSpent: currentQuestion.timeLimit - timeLeft,
          completedAt: new Date()
        }]);
      } else {
        throw new Error('Error submitting answer');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      // Move to next question
      setCurrentIndex(currentIndex + 1);
      setUserResponse('');
      setSelectedOptions([]);
      setFeedback('');
      setScore(0);
      setTimeLeft(0);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Start timer for next question
      startTimer();
    } else {
      // Complete the test
      setTestCompleted(true);
      // Evaluate level completion with Claude AI
      evaluateLevelCompletion();
    }
  };
  
  // Function to evaluate level completion using Claude AI
  const evaluateLevelCompletion = async () => {
    try {
      setLoading(true);
      // Get userId from localStorage
      const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      const userId = userObj?._id || userObj?.id || '6462d8fbf6c3e30000000001'; // Use default ID if not found
      
      // Ensure we have a valid level value (use 1 as default if none is selected)
      const levelToEvaluate = selectedLevel || 1;
      
      // Make sure we have responses to evaluate
      if (!responses || responses.length === 0) {
        console.error('No responses to evaluate!');
        setEvaluationResult({
          evaluation: {
            overallRating: 1,
            feedback: "No responses were recorded for evaluation. We've assigned a default rating.",
            completed: true
          },
          levelProgress: {
            level: levelToEvaluate,
            stars: 1,
            completed: true
          }
        });
        setShowEvaluation(true);
        setLoading(false);
        return;
      }
      
      console.log('Evaluating level:', levelToEvaluate, 'with responses:', responses);
      
      const response = await fetch('/api/evaluateLevelCompletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          skillArea: mode === 'reading' ? 'Reading' : 'Writing',
          difficulty,
          level: levelToEvaluate, // Use the validated level value
          responses
        })
      });

      try {
        if (response.ok) {
          const result = await response.json();
          setEvaluationResult(result);
          setShowEvaluation(true);
          
          // Update local level progress data to show updated stars and unlock next level
          if (result.levelProgress) {
            setLevelProgress(prev => {
              const updatedProgress = [...prev];
              const levelIndex = updatedProgress.findIndex(p => p.level === selectedLevel);
              
              if (levelIndex > -1) {
                // Update current level as completed
                updatedProgress[levelIndex] = {
                  ...updatedProgress[levelIndex],
                  stars: result.levelProgress.stars,
                  completed: true
                };
                
                // Unlock the next level if it exists
                if (selectedLevel < 30) {
                  const nextLevelIndex = updatedProgress.findIndex(p => p.level === selectedLevel + 1);
                  if (nextLevelIndex > -1) {
                    // Unlock the next level
                    updatedProgress[nextLevelIndex] = {
                      ...updatedProgress[nextLevelIndex],
                      completed: false,  // Mark as not completed yet
                      locked: false      // Unlock it
                    };
                  }
                }
              }
              
              return updatedProgress;
            });
          }
        } else {
          console.error('Failed to evaluate level completion');
          // Force show evaluation with default values even on error
          setEvaluationResult({
            evaluation: {
              overallRating: 1,
              feedback: "We couldn't fully evaluate your responses, but you've completed the level.",
              completed: true
            },
            levelProgress: {
              level: selectedLevel,
              stars: 1,
              completed: true
            }
          });
          setShowEvaluation(true);
        }
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        // Force show evaluation with default values on parse error
        setEvaluationResult({
          evaluation: {
            overallRating: 1,
            feedback: "We couldn't process your level evaluation, but we've recorded your progress.",
            completed: true
          },
          levelProgress: {
            level: selectedLevel,
            stars: 1,
            completed: true
          }
        });
        setShowEvaluation(true);
      }
    } catch (error) {
      console.error('Error evaluating level completion:', error);
      // Even with complete failure, provide a graceful fallback
      setEvaluationResult({
        evaluation: {
          overallRating: 1,
          feedback: "There was a problem connecting to the server, but we've still recorded your practice session.",
          completed: true
        },
        levelProgress: {
          level: selectedLevel,
          stars: 1,
          completed: true
        }
      });
      setShowEvaluation(true);
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setTestStarted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setUserResponse('');
    setSelectedOptions([]);
    setFeedback('');
    setScore(0);
    setDifficulty('');
    setMode('');
    setTestCompleted(false);
  };

  // Determine if the current question is multiple choice or text input
  const isMultipleChoice = () => {
    const currentQuestion = questions[currentIndex];
    return currentQuestion && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0;
  };

  // Format time function
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
      <Head>
        <title>SHAKKTII AI - Reading & Writing Practice</title>
      </Head>
      <div className="min-h-screen bg-cover bg-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundImage: "url('/BG.jpg')" }}>
        <div className="absolute top-4 left-4">
          <button 
            onClick={() => router.push('/practices')} 
            className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
          >
            <img src="/2.svg" alt="Back" className="w-8 h-8 mr-2" />
            <span className="text-lg font-medium">Back</span>
          </button>
        </div>

        <div className="absolute top-4 right-4">
          <div className="rounded-full flex items-center justify-center">
            <img src="/logoo.png" alt="Logo" className="w-16 h-16" />
          </div>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden mt-12">
          {!mode ? (
            <div className="p-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Reading & Writing Practice</h1>
              <p className="text-lg text-gray-600 mb-8">
                Choose which skill you would like to practice
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  onClick={() => setMode('reading')}
                  className="p-6 border-2 border-purple-200 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <div className="h-24 flex items-center justify-center">
                    <img 
                      src="/reading.png" 
                      alt="Reading" 
                      className="h-20 w-20 object-contain"
                      onError={(e) => {
                        e.target.src = "/logoo.png";
                      }}  
                    />
                  </div>
                  <h3 className="text-xl font-bold text-purple-900 mt-4">Reading Practice</h3>
                  <p className="text-gray-600 mt-2">
                    Improve your reading comprehension through engaging passages and articles
                  </p>
                </div>
                
                <div 
                  onClick={() => setMode('writing')}
                  className="p-6 border-2 border-purple-200 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <div className="h-24 flex items-center justify-center">
                    <img 
                      src="/writing.png" 
                      alt="Writing" 
                      className="h-20 w-20 object-contain"
                      onError={(e) => {
                        e.target.src = "/logoo.png";
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-purple-900 mt-4">Writing Practice</h3>
                  <p className="text-gray-600 mt-2">
                    Develop your written expression skills with guided writing exercises
                  </p>
                </div>
              </div>
            </div>
          ) : mode && !difficulty ? (  
            <div className="p-8 text-center">  
              <h1 className="text-3xl font-bold text-gray-800 mb-4">  
                {mode === 'reading' ? 'Reading Practice' : 'Writing Practice'}  
              </h1>  
              <p className="text-lg text-gray-600 mb-6">  
                Select a difficulty level to begin your practice  
              </p>  
              
              <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">  
                {['Beginner', 'Moderate', 'Expert'].map((level) => (  
                  <button  
                    key={level}  
                    onClick={() => handleDifficultySelect(level)}  
                    className={`p-4 rounded-lg font-medium border-2 transition-colors ${  
                      difficulty === level  
                        ? 'border-purple-500 bg-purple-50 text-purple-800'  
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'  
                    }`}  
                  >  
                    {level}  
                  </button>  
                ))}  
              </div>  
              
              <button  
                onClick={() => setMode('')}  
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700"  
              >  
                Back  
              </button>  
            </div>  
          ) : showLevelSelection ? (  
            <div className="p-8 text-center">  
              <h1 className="text-3xl font-bold text-gray-800 mb-4">  
                {mode === 'reading' ? 'Reading Practice' : 'Writing Practice'} - {difficulty}  
              </h1>  
              <p className="text-lg text-gray-600 mb-6">  
                Select a level to start practicing  
              </p>  
              
              {loading ? (  
                <div className="flex justify-center items-center py-12">  
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>  
                </div>  
              ) : (  
                <div className="mb-8">  
                  {levelProgress && (  
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4">  
                      {levelProgress.map((levelData) => {  
                        const isSelected = selectedLevel === levelData.level;  
                        // A level is locked if it's not level 1, it's not completed, and the previous level is not completed
                        const isLocked = levelData.level !== 1 && 
                                     !levelData.completed && 
                                     !levelProgress.find(l => l.level === levelData.level - 1)?.completed;  
                        
                        return (  
                          <div  
                            key={levelData.level}  
                            onClick={() => !isLocked && handleLevelSelect(levelData.level)}  
                            onDoubleClick={() => !isLocked && handleLevelDoubleClick(levelData.level)}  
                            className={`relative p-4 rounded-xl cursor-pointer transition-all transform ${  
                              isLocked ? 'bg-gray-200 cursor-not-allowed' :  
                              isSelected ? 'bg-purple-100 border-2 border-purple-500 shadow-md scale-105' :  
                              'bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50'  
                            } flex flex-col items-center justify-center`}  
                          >  
                            <div className="text-2xl font-bold text-pink-900 mb-2">Level {levelData.level}</div>  
                            
                            {/* Star display */}  
                            <div className="flex space-x-1">  
                              {[...Array(3)].map((_, i) => (  
                                <svg   
                                  key={i}   
                                  xmlns="http://www.w3.org/2000/svg"   
                                  viewBox="0 0 24 24"   
                                  className={`w-6 h-6 ${i < (levelData.stars || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300 fill-current'}`}  
                                >  
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />  
                                </svg>  
                              ))}  
                            </div>  
                            
                            {/* Show locked indicator for locked levels */}  
                            {isLocked && (  
                              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black bg-opacity-60">  
                                <div className="bg-black bg-opacity-70 p-2 rounded-full">  
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">  
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />  
                                  </svg>  
                                </div>  
                              </div>  
                            )}  
                          </div>  
                        );  
                      })}  
                    </div>  
                  )}  
                </div>  
              )}  
              
              <div className="flex justify-center space-x-4">  
                <button  
                  onClick={() => {  
                    setDifficulty('');  
                    setSelectedLevel(null);  
                  }}  
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700"  
                >  
                  Back  
                </button>  
                <button  
                  onClick={fetchQuestions}  
                  disabled={!difficulty || !selectedLevel || loading}  
                  className={`px-6 py-3 rounded-lg font-medium ${  
                    !difficulty || !selectedLevel || loading  
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'  
                      : 'bg-gradient-to-r from-pink-800 to-purple-900 text-white hover:opacity-90'  
                  }`}  
                >  
                  {loading ? 'Loading...' : 'Start Practice'}  
                </button>  
              </div>  
            </div>  
          ) : !testStarted ? (
            <div className="p-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {mode === 'reading' ? 'Reading Practice' : 'Writing Practice'}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {mode === 'reading' 
                  ? 'Enhance your reading comprehension skills with our interactive exercises.'
                  : 'Improve your writing skills with our structured writing activities.'}
              </p>
              
              <div className="bg-purple-100 rounded-lg p-4 mb-6">
                <h2 className="font-bold text-purple-800 mb-2">Instructions:</h2>
                <ul className="text-left text-purple-700 list-disc pl-5 space-y-1">
                  {mode === 'reading' ? (
                    <>
                      <li>You'll read passages of varying complexity based on your level</li>
                      <li>After reading, you'll answer questions testing your comprehension</li>
                      <li>You'll have a limited time to provide your answers</li>
                      <li>Read carefully and think about the main ideas and details</li>
                    </>
                  ) : (
                    <>
                      <li>You'll be given writing prompts based on your level</li>
                      <li>Write your response in the provided text area</li>
                      <li>You'll have a limited time to complete each writing task</li>
                      <li>Focus on clarity, organization, and proper grammar</li>
                    </>
                  )}
                </ul>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Select Difficulty Level:</h3>
                <div className="flex justify-center space-x-4">
                  {['Beginner', 'Moderate', 'Expert'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        difficulty === level
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setMode('')}
                  className="px-4 py-2 rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={fetchQuestions}
                  disabled={!difficulty || loading}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    !difficulty || loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-800 to-purple-900 text-white hover:opacity-90'
                  }`}
                >
                  {loading ? 'Loading...' : 'Start Practice'}
                </button>
              </div>
            </div>
          ) : testCompleted && !showEvaluation ? (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Practice Completed!</h1>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
                  <p className="text-lg text-gray-600">Evaluating your responses with Claude AI...</p>
                </div>
              ) : (
                <>
                  <div className="w-32 h-32 mx-auto my-6">
                    <img src="/completed.svg" alt="Complete" className="w-full h-full" onError={(e) => {
                      e.target.src = "/logoo.png";
                    }} />
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                    Great job! You've completed the {mode} practice session.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={backToLevelSelection}
                      className="bg-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-700"
                    >
                      Back to Levels
                    </button>
                    <button
                      onClick={() => setShowEvaluation(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
                    >
                      Show Results
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : testCompleted && showEvaluation ? (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Practice Results</h1>
              
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h2 className="text-xl font-bold text-purple-800 mb-2">Overall Performance</h2>
                <div className="flex justify-center mb-4">
                  {/* Star display for overall rating */}
                  <div className="flex space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <svg 
                        key={i} 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        className={`w-10 h-10 ${i < (evaluationResult?.levelProgress?.stars || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300 fill-current'}`}
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
                
                <div className="text-lg text-gray-700 mb-4">
                  {evaluationResult?.evaluation?.feedback || "You've completed this level. Keep practicing to improve your skills!"}
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Level {selectedLevel} Completed!</h2>
                <p className="text-lg text-gray-600">
                  You've earned {evaluationResult?.levelProgress?.stars || 1} star{(evaluationResult?.levelProgress?.stars || 1) !== 1 ? 's' : ''} for this level.
                </p>
                {evaluationResult?.levelProgress?.stars === 3 && (
                  <div className="mt-2 text-green-600 font-bold">Perfect score! Excellent work!</div>
                )}
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={backToLevelSelection}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-700"
                >
                  Back to Levels
                </button>
                {selectedLevel < 30 && (
                  <button
                    onClick={() => {
                      // Only allow proceeding if evaluation is complete
                      if (evaluationResult && !loading) {
                        setSelectedLevel(prev => Math.min(prev + 1, 30));
                        setTestCompleted(false);
                        setShowEvaluation(false);
                        setResponses([]);
                        fetchQuestions();
                      }
                    }}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="inline-block animate-spin h-4 w-4 border-t-2 border-white rounded-full mr-2"></span>
                        Evaluating...
                      </>
                    ) : (
                      'Next Level'
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="w-20 h-20">
                  <CircularProgressbar
                    value={((currentIndex + 1) / questions.length) * 100}
                    text={`${currentIndex + 1}/${questions.length}`}
                    styles={buildStyles({
                      textSize: '22px',
                      pathColor: '#9333ea',
                      textColor: '#4a044e',
                      trailColor: '#e9d5ff',
                    })}
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-purple-900">
                    {mode === 'reading' ? 'Reading Practice' : 'Writing Practice'}
                  </h2>
                  <p className="text-sm text-gray-600">{difficulty} Level</p>
                </div>
                <div className="bg-purple-100 px-4 py-2 rounded-lg">
                  <span className="text-lg font-medium text-purple-800">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
                <p className="text-gray-700 mb-4">
                  {questions[currentIndex]?.instructions || "Loading..."}
                </p>
                
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-800 whitespace-pre-line">
                      {questions[currentIndex]?.content || "Loading..."}
                    </p>
                  </div>
                  
                  {questions[currentIndex]?.imageUrl && (
                    <div className="mt-4 flex justify-center">
                      <img 
                        src={questions[currentIndex].imageUrl} 
                        alt="Content image" 
                        className="max-h-48 rounded-lg shadow-sm"
                        onError={(e) => {
                          e.target.src = "/default-card.png";
                        }}
                      />
                    </div>
                  )}
                </div>
                
                {isMultipleChoice() ? (
                  <div className="space-y-3 mb-4">
                    {questions[currentIndex].options.map((option, index) => (
                      <div 
                        key={index}
                        onClick={() => handleOptionSelect(option)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedOptions.includes(option)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4">
                    <textarea
                      value={userResponse}
                      onChange={handleTextResponseChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={6}
                      placeholder={mode === 'reading' ? "Type your answer here..." : "Write your response here..."}
                      disabled={!!feedback}
                    />
                  </div>
                )}
                
                {!feedback && (
                  <div className="flex justify-center">
                    <button
                      onClick={submitResponse}
                      disabled={(!isMultipleChoice() && !userResponse.trim()) || (isMultipleChoice() && selectedOptions.length === 0)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        (!isMultipleChoice() && !userResponse.trim()) || (isMultipleChoice() && selectedOptions.length === 0)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      Submit Answer
                    </button>
                  </div>
                )}
                
                {feedback && (
                  <div className="mt-4">
                    <div className="flex items-center mb-2">
                      <h4 className="font-medium text-gray-700">Feedback:</h4>
                      <div className="ml-3 flex">
                        {[1, 2, 3].map((star) => (
                          <svg
                            key={star}
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 ${
                              star <= score ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 bg-purple-50 p-3 rounded-lg border border-purple-100">
                      {feedback}
                    </p>
                  </div>
                )}
              </div>

              {feedback && (
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
                  >
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Practice'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ReadingWritingPractice;
