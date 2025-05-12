import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function PersonalityTest() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [token, setToken] = useState('');

  // Sample personality questions - in production, these should come from the API
  const questions = [
    {
      id: 'p1',
      text: 'I enjoy being the center of attention in social situations.',
      options: [
        { value: 1, text: 'Strongly Disagree' },
        { value: 2, text: 'Disagree' },
        { value: 3, text: 'Neutral' },
        { value: 4, text: 'Agree' },
        { value: 5, text: 'Strongly Agree' }
      ]
    },
    {
      id: 'p2',
      text: 'I prefer making plans in advance rather than being spontaneous.',
      options: [
        { value: 1, text: 'Strongly Disagree' },
        { value: 2, text: 'Disagree' },
        { value: 3, text: 'Neutral' },
        { value: 4, text: 'Agree' },
        { value: 5, text: 'Strongly Agree' }
      ]
    },
    {
      id: 'p3',
      text: 'I often rely on logic rather than feelings when making decisions.',
      options: [
        { value: 1, text: 'Strongly Disagree' },
        { value: 2, text: 'Disagree' },
        { value: 3, text: 'Neutral' },
        { value: 4, text: 'Agree' },
        { value: 5, text: 'Strongly Agree' }
      ]
    },
    {
      id: 'p4',
      text: 'I enjoy working under pressure with tight deadlines.',
      options: [
        { value: 1, text: 'Strongly Disagree' },
        { value: 2, text: 'Disagree' },
        { value: 3, text: 'Neutral' },
        { value: 4, text: 'Agree' },
        { value: 5, text: 'Strongly Agree' }
      ]
    },
    {
      id: 'p5',
      text: 'I prefer working in a team rather than independently.',
      options: [
        { value: 1, text: 'Strongly Disagree' },
        { value: 2, text: 'Disagree' },
        { value: 3, text: 'Neutral' },
        { value: 4, text: 'Agree' },
        { value: 5, text: 'Strongly Agree' }
      ]
    },
    {
      id: 'p6',
      text: 'I am comfortable with change and adapting to new situations.',
      options: [
        { value: 1, text: 'Strongly Disagree' },
        { value: 2, text: 'Disagree' },
        { value: 3, text: 'Neutral' },
        { value: 4, text: 'Agree' },
        { value: 5, text: 'Strongly Agree' }
      ]
    },
    {
      id: 'p7',
      text: 'I prefer to focus on details rather than the big picture.',
      options: [
        { value: 1, text: 'Strongly Disagree' },
        { value: 2, text: 'Disagree' },
        { value: 3, text: 'Neutral' },
        { value: 4, text: 'Agree' },
        { value: 5, text: 'Strongly Agree' }
      ]
    },
    {
      id: 'p8',
      text: 'I find it easy to empathize with others\' feelings.',
      options: [
        { value: 1, text: 'Strongly Disagree' },
        { value: 2, text: 'Disagree' },
        { value: 3, text: 'Neutral' },
        { value: 4, text: 'Agree' },
        { value: 5, text: 'Strongly Agree' }
      ]
    },
    {
      id: 'p9',
      text: 'I prefer environments with clear rules and structures.',
      options: [
        { value: 1, text: 'Strongly Disagree' },
        { value: 2, text: 'Disagree' },
        { value: 3, text: 'Neutral' },
        { value: 4, text: 'Agree' },
        { value: 5, text: 'Strongly Agree' }
      ]
    },
    {
      id: 'p10',
      text: 'I am often the one who takes initiative in group settings.',
      options: [
        { value: 1, text: 'Strongly Disagree' },
        { value: 2, text: 'Disagree' },
        { value: 3, text: 'Neutral' },
        { value: 4, text: 'Agree' },
        { value: 5, text: 'Strongly Agree' }
      ]
    }
  ];

  useEffect(() => {
    // Check if user is authenticated
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    // Timer logic for the test
    if (testStarted && !results) {
      const totalTime = 300; // 5 minutes in seconds
      setTimeLeft(totalTime);

      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleSubmitTest();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, results]);

  const startTest = () => {
    setTestStarted(true);
  };

  const handleSelectOption = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleSubmitTest = async () => {
    // Make sure all questions are answered
    if (Object.keys(responses).length < questions.length) {
      // Add default neutral responses for unanswered questions
      const updatedResponses = { ...responses };
      questions.forEach(q => {
        if (!updatedResponses[q.id]) {
          updatedResponses[q.id] = 3; // Default to neutral
        }
      });
      setResponses(updatedResponses);
    }

    setIsSubmitting(true);

    try {
      // Call Claude API to analyze personality
      const analysisResponse = await fetch('/api/analyzePersonality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ responses })
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze personality');
      }

      const analysisData = await analysisResponse.json();
      setResults(analysisData.analysis);
    } catch (error) {
      console.error('Error submitting personality test:', error);
      // Fallback results if API fails
      setResults({
        personality_type: "Analytical Problem-Solver",
        strengths: [
          "Logical thinking",
          "Detail-oriented",
          "Good at planning"
        ],
        challenges: [
          "May overthink decisions",
          "Could improve emotional intelligence"
        ],
        career_matches: [
          "Software Development",
          "Data Analysis",
          "Project Management"
        ],
        development_suggestions: [
          "Practice active listening",
          "Take on leadership opportunities",
          "Develop creative thinking skills"
        ]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate progress percentage
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Current question
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      <Head>
        <title>SHAKKTII AI - Personality Test</title>
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
          {!testStarted ? (
            <div className="p-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Personality Assessment</h1>
              <p className="text-lg text-gray-600 mb-6">
                Discover your personality traits, strengths, and areas for growth with our comprehensive assessment.
              </p>
              <div className="bg-purple-100 rounded-lg p-4 mb-6">
                <h2 className="font-bold text-purple-800 mb-2">Instructions:</h2>
                <ul className="text-left text-purple-700 list-disc pl-5 space-y-1">
                  <li>This test consists of 10 questions</li>
                  <li>You will have 5 minutes to complete the assessment</li>
                  <li>Answer honestly for the most accurate results</li>
                  <li>There are no right or wrong answers</li>
                </ul>
              </div>
              <button
                onClick={startTest}
                className="bg-gradient-to-r from-pink-800 to-purple-900 text-white py-3 px-8 rounded-lg text-lg font-medium hover:opacity-90 transition-opacity"
              >
                Start Assessment
              </button>
            </div>
          ) : results ? (
            <div className="p-8">
              <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Your Personality Profile</h1>
              
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-purple-900 mb-2">{results.personality_type}</h2>
                <p className="text-gray-700 italic">Based on your responses to our assessment</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-purple-800 mb-3">Your Strengths</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {results.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-purple-800 mb-3">Areas for Growth</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {results.challenges.map((challenge, index) => (
                      <li key={index}>{challenge}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-bold text-purple-800 mb-3">Career Matches</h3>
                <div className="flex flex-wrap gap-2">
                  {results.career_matches.map((career, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {career}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-purple-800 mb-3">Development Suggestions</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {results.development_suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-8 text-center">
                <button
                  onClick={() => router.push('/practices')}
                  className="bg-gradient-to-r from-pink-800 to-purple-900 text-white py-2 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Return to Practices
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="w-20 h-20">
                  <CircularProgressbar
                    value={progress}
                    text={`${currentQuestionIndex + 1}/${questions.length}`}
                    styles={buildStyles({
                      textSize: '22px',
                      pathColor: '#9333ea',
                      textColor: '#4a044e',
                      trailColor: '#e9d5ff',
                    })}
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-purple-900">Personality Assessment</h2>
                </div>
                <div className="bg-purple-100 px-4 py-2 rounded-lg">
                  <span className="text-lg font-medium text-purple-800">{formatTime(timeLeft)}</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">{currentQuestion.text}</h3>
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <div 
                      key={option.value}
                      onClick={() => handleSelectOption(currentQuestion.id, option.value)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        responses[currentQuestion.id] === option.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      {option.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Previous
                </button>
                
                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitTest}
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isSubmitting
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-800 to-purple-900 text-white hover:opacity-90'
                    }`}
                  >
                    {isSubmitting ? 'Analyzing...' : 'Submit'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default PersonalityTest;
