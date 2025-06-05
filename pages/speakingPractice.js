import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function SpeakingPractice() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [testCompleted, setTestCompleted] = useState(false);
  const [token, setToken] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [levelProgress, setLevelProgress] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [responses, setResponses] = useState([]);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Check if user is authenticated
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
    }

    // Check if speech recognition is supported
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setSpeechSupported(false);
      alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
    }

    return () => {
      // Clean up recognition and timer on unmount
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping recognition:", e);
        }
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Fetch level progress data when difficulty changes
  useEffect(() => {
    if (difficulty) {
      // Reset any previously selected level
      setSelectedLevel(null);
      fetchLevelProgress();
    }
  }, [difficulty]);
  
  // Function to fetch user's level progress
  const fetchLevelProgress = async () => {
    if (!difficulty) return;
    
    setLoading(true);
    try {
      // Simple auth approach - get user info from localStorage
      const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      const userId = userObj?._id || userObj?.id || '6462d8fbf6c3e30000000001'; // Use default ID if not found
      
      // Create default progress array for 30 levels
      const defaultProgress = [];
      for (let i = 1; i <= 30; i++) {
        defaultProgress.push({
          level: i,
          stars: 0,
          completed: i <= 2, // Make first 2 levels completed by default for demo
          questionsCompleted: i <= 2 ? 5 : 0
        });
      }
      
      try {
        const response = await fetch(`/api/getPracticeProgress?skillArea=Speaking&difficulty=${difficulty}&userId=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (response.ok && data.progress) {
          // Find progress for this specific skill area and difficulty
          const speakingProgress = data.progress.find(p => 
            p.skillArea === 'Speaking' && p.difficulty === difficulty
          );
          
          if (speakingProgress && speakingProgress.levelProgress && speakingProgress.levelProgress.length > 0) {
            // Merge the API data with default data to ensure we have all 30 levels
            const mergedProgress = defaultProgress.map(defaultLevel => {
              const apiLevel = speakingProgress.levelProgress.find(l => l.level === defaultLevel.level);
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
        setLevelProgress(defaultProgress);
      }
      
      setShowLevelSelection(true);
    } catch (error) {
      console.error("Error in level progress logic:", error);
      
      // Initialize empty progress for all 30 levels as fallback
      const emptyProgress = Array.from({ length: 30 }, (_, i) => ({
        level: i + 1,
        stars: 0,
        completed: i < 2 // Make first 2 levels completed by default for demo
      }));
      setLevelProgress(emptyProgress);
      setShowLevelSelection(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions for a specific level
  const fetchQuestions = async () => {
    if (!difficulty || !selectedLevel) return;

    setLoading(true);
    try {
      console.log(`Fetching speaking practice questions for ${difficulty} level ${selectedLevel}`);
      
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
          skillArea: 'Speaking',
          difficulty: difficulty,
          count: 5,
          userId: userId, // Send user ID in the body instead
          level: selectedLevel // Include the selected level
        })
      });

      const data = await response.json();
      console.log('API response:', data);
      
      if (!response.ok) {
        // If unauthorized, redirect to login
        if (response.status === 401) {
          localStorage.removeItem('token');
          alert("सत्राचा कालावधी संपला आहे. कृपया पुनः लॉगिन करा.");
          router.push("/login");
          return;
        }
        throw new Error(data.error || 'प्रश्न लोड करण्यात अडचण आली.');
      }
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error('कोणतेही प्रश्न प्राप्त झाले नाहीत.');
      }

      setQuestions(data.questions);
      setShowLevelSelection(false);
      setTestStarted(true);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert("स्पीकिंग प्रॅक्टिस प्रश्न लोड करण्यात अडचण आली आहे. कृपया नंतर पुन्हा प्रयत्न करा.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle level selection
  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    // Add a short delay to allow the UI to update before fetching questions
    setTimeout(() => {
      fetchQuestions();
    }, 100);
  };

  const startSpeechRecognition = () => {
    if (!speechSupported) return;
    
    // Initialize speech recognition
    if (!recognitionRef.current) {
      recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        setUserResponse(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event);
        if (event.error === 'not-allowed') {
          alert("मायक्रोफोन परवानगी नाकारली. कृपया मायक्रोफोन अ‍ॅक्सेस चालू करा.");
        }
      };
    }
    
    // Start recording
    try {
      recognitionRef.current.start();
      setRecording(true);
      
      // Start timer
      const currentQuestion = questions[currentIndex];
      setTimeLeft(currentQuestion.timeLimit);
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            stopSpeechRecognition();
            clearInterval(timerRef.current);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  };

  const stopSpeechRecognition = async () => {
    if (!speechSupported || !recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.error("Error stopping recognition:", e);
    }
    
    setRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Submit for feedback if there's a response
    if (userResponse.trim()) {
      await submitForFeedback();
    }
  };

  const submitForFeedback = async () => {
    if (!userResponse.trim()) return;
    
    try {
      // Get user ID from localStorage to avoid token-in-header issues
      const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      const userId = userObj?._id || userObj?.id || '6462d8fbf6c3e30000000001';
      
      const currentQuestion = questions[currentIndex];
      // Check if the question has a valid MongoDB ObjectId
      let testIdToUse = null;
      if (currentQuestion._id && typeof currentQuestion._id === 'string' && currentQuestion._id.length === 24) {
        testIdToUse = currentQuestion._id;
      } else {
        // Don't send an invalid testId, the API will use a default
        console.log('No valid ObjectId found for question, using default');
      }
      
      const response = await fetch('/api/submitPracticeResponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Don't include token in headers to avoid 431 errors
        },
        body: JSON.stringify({
          testId: testIdToUse, // Only send if it's a valid ObjectId
          cardId: currentQuestion.cardId,
          userResponse: userResponse,
          score: 0, // Will be assessed by AI
          timeSpent: currentQuestion.timeLimit - timeLeft,
          userId: userId, // Include userId in the body instead
          level: selectedLevel, // Include the level number
          difficulty: difficulty, // Include the difficulty
          skillArea: 'Speaking' // Explicitly set skill area to Speaking
        })
      });

      if (!response.ok) {
        throw new Error('प्रतिसाद सबमिट करण्यात अयशस्वी.');
      }

      const data = await response.json();
      setFeedback(data.feedback);
      
      // Determine score based on feedback sentiment (simplified)
      let questionScore = 1;
      if (data.feedback.includes("excellent") || data.feedback.includes("perfect")) {
        questionScore = 3;
      } else if (data.feedback.includes("good") || data.feedback.includes("well done")) {
        questionScore = 2;
      }
      setScore(questionScore);
      
      // Store response data for level evaluation
      setResponses(prevResponses => [...prevResponses, {
        cardId: currentQuestion.cardId,
        question: currentQuestion.instructions,
        expectedResponse: currentQuestion.expectedResponse,
        userResponse: userResponse,
        score: questionScore,
        timeSpent: currentQuestion.timeLimit - timeLeft,
        completedAt: new Date()
      }]);
    } catch (error) {
      console.error("Error submitting for feedback:", error);
      setFeedback("माफ करा, तुमचा प्रतिसाद स्वीकारला जाऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.");
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      // Move to next question
      setCurrentIndex(currentIndex + 1);
      setUserResponse('');
      setFeedback('');
      setScore(0);
      setTimeLeft(0);
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
      console.log('Evaluating level:', levelToEvaluate);
      
      const response = await fetch('/api/evaluateLevelCompletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          skillArea: 'Speaking',
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
          
          // Update local level progress data to show updated stars
          if (result.levelProgress) {
            setLevelProgress(prev => {
              const updatedProgress = [...prev];
              const levelIndex = updatedProgress.findIndex(p => p.level === selectedLevel);
              
              if (levelIndex > -1) {
                updatedProgress[levelIndex] = {
                  ...updatedProgress[levelIndex],
                  stars: result.levelProgress.stars,
                  completed: true
                };
              }
              
              return updatedProgress;
            });
          }
        } else {
          console.error('लेव्हल पूर्णतेचे मूल्यमापन करण्यात अडचण आली.');
          // Force show evaluation with default values even on error
          setEvaluationResult({
            evaluation: {
              overallRating: 1,
              feedback: "तुमच्या प्रतिसादांचे संपूर्ण मूल्यमापन शक्य झाले नाही, तरीही तुम्ही लेव्हल पूर्ण केला आहे.",
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
            feedback: "तुमच्या लेव्हलचे मूल्यांकन पूर्ण करू शकले नाही, तरीही तुमचा प्रगती नोंदवला आहे.",
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
          feedback: "सर्व्हरशी कनेक्ट होण्यात त्रुटी आली, पण तुमचा सराव सत्र नोंदवला आहे.",
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
    setTestCompleted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setUserResponse('');
    setFeedback('');
    setScore(0);
    setResponses([]);
    setEvaluationResult(null);
    setShowEvaluation(false);
    // We don't reset difficulty or level selection so user can continue with other levels
  };
  
  const backToLevelSelection = () => {
    resetTest();
    setShowLevelSelection(true);
    setSelectedLevel(null);
  };

  return (
    <>
      <Head>
        <title>SHAKKTII AI - बोलण्याचा सराव</title>
      </Head>
      <div className="min-h-screen bg-gray-100" style={{ backgroundImage: "url('/BG.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', backgroundColor: 'rgba(0,0,0,0.7)', backgroundBlendMode: 'overlay' }}>
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <button 
                onClick={() => router.push('/practices')} 
                className="flex items-center text-pink-600 hover:text-pink-800 transition-colors"
              >
                <img src="/2.svg" alt="Back" className="w-8 h-8 mr-2" />
                <span className="text-lg font-medium">सराव भागाकडे परत जा</span>
              </button>
            </div>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <img src="/logoo.png" alt="Logo" className="w-10 h-10" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-pink-900">बोलण्याचा सराव</h1>
            <p className="text-lg text-gray-700 mt-2">
              परस्पर संवादात्मक सरावांद्वारे तुमच्या बोलण्याच्या कौशल्यात सुधारणा करा.
            </p>
          </div>

          {!testStarted ? (
            <div>
              {!showLevelSelection ? (
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6">
                  <h2 className="text-2xl font-bold text-center text-pink-900 mb-4">लेव्हल निवडा</h2>
                  <div className="space-y-4">
                    {['बिगिनर', 'मॉडरेट', 'एक्स्पर्ट'].map(level => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`block w-full py-3 px-6 text-lg rounded-lg transition-colors ${
                          difficulty === level ? 
                          'bg-pink-600 text-white' : 
                          'bg-gray-200 hover:bg-pink-100 text-gray-800'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              ) : testCompleted && showEvaluation && evaluationResult ? (
                <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold mb-4 text-green-600">लेव्हल {selectedLevel} पूर्ण झाली!</h2>
                  
                  {/* Level evaluation results with stars */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">तुमचा पर्फॉर्मन्स</h3>
                    <p className="text-gray-600 mb-4">{evaluationResult.evaluation?.feedback || "तुमचा लेव्हल मूल्यांकन केला गेला आहे."}</p>
                    
                    <div className="flex justify-center mb-4">
                      {[...Array(3)].map((_, i) => (
                        <svg 
                          key={i} 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          className={`w-10 h-10 ${i < (evaluationResult.evaluation?.overallRating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300 fill-current'}`}
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                    
                    <div className="text-center text-sm text-gray-500">
                      {evaluationResult.evaluation?.overallRating === 3 ? (
                        <span>छान! तुम्ही हा स्तर पार केला आहे!</span>
                      ) : evaluationResult.evaluation?.overallRating === 2 ? (
                        <span>छान! तुम्ही २ स्टार मिळवले आहेत! </span>
                      ) : evaluationResult.evaluation?.overallRating === 1 ? (
                        <span>चांगला प्रयत्न! तुम्हाला १ स्टार मिळाला आहे. सराव करत रहा!</span>
                      ) : (
                        <span>या पातळीवर तुम्हाला अधिक सरावाची आवश्यकता आहे.</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={backToLevelSelection}
                      className="py-2 px-6 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                    >
                     लेव्हल परत जा
                    </button>
                    {evaluationResult.nextLevel && (
                      <button
                        onClick={() => {
                          resetTest();
                          setSelectedLevel(evaluationResult.nextLevel);
                          setTimeout(() => fetchQuestions(), 100);
                        }}
                        className="py-2 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        पुढील लेव्हल
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto bg-white bg-opacity-90 p-6 rounded-xl shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-pink-900">
                      {difficulty} लेव्हल सराव
                    </h2>
                    <button 
                      onClick={() => {setShowLevelSelection(false); setDifficulty('');}}
                      className="text-pink-600 hover:text-pink-800 transition-colors"
                    >
                      ← लेव्हल कडे परत जा.
                    </button>
                  </div>
                  
                  {loading ? (
                    <div className="flex justify-center py-20">
                      <svg className="animate-spin h-10 w-10 text-pink-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {Array.from({length: 30}, (_, i) => i + 1).map((level) => {
                        // Find the current level's progress (if it exists)
                        const levelData = levelProgress.find(p => p.level === level) || { level, completed: false, stars: 0 };
                        
                        // Find the previous level's progress
                        const prevLevelData = level > 1 ? levelProgress.find(p => p.level === level-1) : { completed: true };
                        
                        // Make first three levels always unlocked
                        const isLocked = level > 3 && !prevLevelData?.completed;
                        const isCompleted = levelData.completed;
                        const stars = levelData.stars || 0;
                        
                        return (
                          <div 
                            key={`level-${level}`}
                            onClick={() => !isLocked && handleLevelSelect(level)}
                            className={`bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center relative ${!isLocked ? 'cursor-pointer hover:shadow-xl hover:bg-pink-50 transform hover:scale-105' : 'cursor-not-allowed opacity-80'} transition-all duration-200 ${
                              isCompleted ? 'border-2 border-green-500' : ''
                            } ${
                              selectedLevel === level ? 'ring-4 ring-pink-500 ring-opacity-70 transform scale-105' : ''
                            }`}
                          >
                            <div className="text-2xl font-bold text-pink-900 mb-2">लेव्हल {level}</div>
                            
                            {/* Star display */}
                            <div className="flex space-x-1">
                              {[...Array(3)].map((_, i) => (
                                <svg 
                                  key={i} 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  viewBox="0 0 24 24" 
                                  className={`w-6 h-6 ${i < stars ? 'text-yellow-500 fill-current' : 'text-gray-300 fill-current'}`}
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
            </div>
          ) : testCompleted && !showEvaluation ? (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">सराव पूर्ण झाला!</h1>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
                  <p className="text-lg text-gray-600">क्लॉड एआय सोबत तुमच्या प्रतिसादांचे मूल्यांकन करत आहे...</p>
                </div>
              ) : (
                <>
                  <div className="w-32 h-32 mx-auto my-6">
                    <img src="/completed.svg" alt="Complete" className="w-full h-full" onError={(e) => {
                      e.target.src = "/logoo.png";
                    }} />
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                   छान! तुम्ही बोलण्याचा सराव सत्र पूर्ण केला आहे.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={backToLevelSelection}
                      className="bg-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-700"
                    >
                       लेव्हल परत जा
                    </button>
                    <button
                      onClick={() => setShowEvaluation(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
                    >
                      निकाल दाखवा
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : testCompleted && showEvaluation ? (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">तुमचे सरावाचे निकाल</h1>
              
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h2 className="text-xl font-bold text-purple-800 mb-2">एकूण पर्फॉर्मन्स</h2>
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
                  {evaluationResult?.evaluation?.feedback || "तुम्ही हा स्तर पूर्ण केला आहे. तुमच्या कौशल्यांना सुधारण्यासाठी सराव चालू ठेवा!"}
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">लेवल {selectedLevel} पूर्ण झाली</h2>
                <p className="text-lg text-gray-600">
                  तुम्ही या लेवलसाठी {evaluationResult?.levelProgress?.stars || 1} स्टार{(evaluationResult?.levelProgress?.stars || 1) !== 1 ? 's' : ''} मिळवला आहे.
                </p>
                {evaluationResult?.levelProgress?.stars === 3 && (
                  <div className="mt-2 text-green-600 font-bold">उत्तम गुण! छान!</div>
                )}
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={backToLevelSelection}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-700"
                >
                  लेव्हल्सकडे परत जा 
                </button>
                {selectedLevel < 30 && (
                  <button
                    onClick={() => {
                      setSelectedLevel(prev => Math.min(prev + 1, 30));
                      setTestCompleted(false);
                      setShowEvaluation(false);
                      setResponses([]);
                      fetchQuestions(selectedLevel + 1);
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
                  >
                    पुढील लेवल
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6 mb-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    प्रश्न {currentIndex + 1} / {questions.length}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {difficulty} लेवल  • {selectedLevel || ''}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mb-1">
                  <div 
                    className="bg-pink-500 h-1 rounded-full" 
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {questions[currentIndex]?.instructions || "Read the following prompt and respond:"}
                </h2>
                <div className="p-4 bg-pink-50 rounded-lg text-pink-900">
                  {questions[currentIndex]?.content || ""}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <button
                      onClick={recording ? stopSpeechRecognition : startSpeechRecognition}
                      disabled={!!feedback}
                      className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                        recording 
                          ? 'bg-red-500 animate-pulse' 
                          : feedback 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-pink-500 hover:bg-pink-600'
                      }`}
                    >
                      {recording ? (
                        <span className="w-6 h-6 bg-white rounded-sm"></span>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                        </svg>
                      )}
                    </button>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {recording ? "रेकॉर्डिंग सुरू आहे... थांबवण्यासाठी क्लिक करा" : "बोलण्यासाठी क्लिक करा"}
                    </span>
                  </div>

                  {timeLeft > 0 && (
                    <div className="w-10 h-10">
                      <CircularProgressbar
                        value={timeLeft}
                        maxValue={questions[currentIndex]?.timeLimit || 60}
                        text={`${timeLeft}`}
                        styles={buildStyles({
                          textSize: '35px',
                          pathColor: timeLeft < 10 ? '#ef4444' : '#ec4899',
                          textColor: timeLeft < 10 ? '#ef4444' : '#ec4899',
                        })}
                      />
                    </div>
                  )}
                </div>

                {userResponse && (
                  <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">फीडबॅक</h3>
                    <p className="text-gray-800">{userResponse}</p>
                  </div>
                )}

                {feedback && (
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h3 className="text-sm font-semibold text-green-800 mb-2">फीडबॅक:</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex space-x-1 mr-2">
                        {[...Array(3)].map((_, i) => (
                          <svg 
                            key={i} 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            className={`w-5 h-5 ${i < score ? 'text-yellow-500 fill-current' : 'text-gray-300 fill-current'}`}
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {score === 3 ? 'उत्कृष्ट!' : score === 2 ? 'चांगले काम!' : 'सराव करत राहा!'}
                      </span>
                    </div>
                    <p className="text-green-800 text-sm">
                      {feedback}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!feedback}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    !feedback
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {currentIndex < questions.length - 1 ? 'पुढील प्रश्न' : 'सराव पूर्ण करा'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SpeakingPractice;
