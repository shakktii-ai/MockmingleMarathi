import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import TestResults from '@/components/TestResults';

function generateFallbackQuestions(count = 10) {
  const questions = [];
  const questionTexts = [
    'मला सामाजिक संमेलने आणि नवीन लोकांशी भेटायला आवडते.',
    'मला मोठ्या गटात अनेकदा चिंताग्रस्त वाटते.',
    'मला संघात काम करण्याऐवजी एकटा काम करणे पसंत आहे.',
    'मी स्वत:ला एक सुव्यवस्थित व्यक्ती मानतो/माना.',
    'मी गटाच्या वातावरणात पुढाकार घेण्याचा प्रयत्न करतो/करते.',
    'मला लवचिक वेळापत्रकाऐवजी नियमीत दिनचर्या आवडते.',
    'मला नवीन अनुभव आणि उपक्रम करण्यास आवडते.',
    'मी अनेकदा इतर लोक माझ्याबद्दल काय विचार करतात याची काळजी करतो/करते.',
    'मी निर्णय भावना न ठेवता विचारपूर्वक घेतो/घेते.',
    'इतर लोकांसोबत वेळ घालवल्यानंतर मला ऊर्जा प्राप्त होते.'
  ];


  for (let i = 0; i < Math.min(count, questionTexts.length); i++) {
    questions.push({
      id: `q${i + 1}`,
      text: questionTexts[i],
      options: [
        { value: '1', text: 'पूर्णतः असहमत' },
        { value: '2', text: 'असहमत' },
        { value: '3', text: 'निष्पक्ष' },
        { value: '4', text: 'सहमत' },
        { value: '5', text: 'पूर्णतः सहमत' }
      ]

    });
  }

  return questions;
}

function PersonalityTest() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [token, setToken] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('demo-user');

  // Fetch questions from API
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/personalityTest/generateQuestions');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load questions');
      }

      // Ensure we have exactly 10 questions
      const questions = Array.isArray(data.questions) ? data.questions :
        (Array.isArray(data) ? data : []);

      if (questions.length === 0) {
        throw new Error('No questions returned from API');
      }

      // Take first 10 questions if more are returned
      setQuestions(questions.slice(0, 10));
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Using default questions instead.');
      // Fallback to default questions (10 questions)
      setQuestions(generateFallbackQuestions(10));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get user ID from localStorage when component mounts
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && (user._id || user.id)) {
        setUserId(user._id || user.id);
      }
    } catch (e) {
      console.error('Error getting user ID:', e);
    }
    
    // Check if user is authenticated
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push('/login');
      return;
    }
    setToken(storedToken);
    fetchQuestions();
  }, [fetchQuestions, router]);

  // Start the test timer (30 minutes)
 useEffect(() => {
     // Timer logic for the test
     if (testStarted && !results) {
       const totalTime = 1800; // 5 minutes in seconds
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

  // Handle option selection
  const handleSelectOption = (questionId, value) => {
    // Convert value to number to ensure consistent type
    const numericValue = Number(value);
    setResponses(prev => ({
      ...prev,
      [questionId]: numericValue
    }));
  };

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Function to clean up cookies and localStorage
  const cleanupAuthData = () => {
    try {
      // Clear all cookies
      document.cookie.split(';').forEach(c => {
        document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
      });
      
      // Clear localStorage items
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Force reload to clear any cached data
      window.location.href = '/login';
    } catch (error) {
      console.error('Error cleaning up auth data:', error);
    }
  };

  // Function to submit the test
  const submitTest = async () => {
    try {
      // Format responses as a simple object with just question IDs and selected options
      const formattedResponses = questions.reduce((acc, question) => {
        // Ensure the response is a number
        acc[question.id] = Number(responses[question.id]);
        return acc;
      }, {});
      
      console.log('Submitting test responses');
      
      // Prepare minimal request body
      const requestBody = {
        responses: formattedResponses,
        questions: questions.map(q => ({
          id: q.id,
          text: q.text
          // Don't include options here as they're not needed for evaluation
        }))
      };
      
      // Use minimal headers - no authentication
      const headers = { 'Content-Type': 'application/json' };
      
      // Simple fetch with increased timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // Increased to 120 seconds (2 minutes)
      
      try {
        const response = await fetch(`/api/personalityTest/evaluateTest?userId=${encodeURIComponent(userId)}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
          signal: controller.signal,
          credentials: 'omit' // Don't send cookies
        });
        
        clearTimeout(timeoutId);
        console.log("responses......",response);
        if (!response.ok) {
          const errorMessage = `HTTP error! status: ${response.status}`;
          console.error('Server error:', errorMessage);
          throw new Error(errorMessage);
        }
        
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Request failed:', error);
        if (error.name === 'AbortError') {
          throw new Error('The request took too long to complete. Please try again.');
        }
        throw new Error(error.message || 'Failed to submit test. Please check your connection and try again.');
      }
      
      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));
      
      // Handle both response formats for backward compatibility
      if (data.success) {
        // New format with nested data.analysis
        if (data.data?.analysis) {
          return {
            ...data.data.analysis,
            reportId: data.data.meta?.reportId
          };
        }
        // Old format with direct analysis
        else if (data.analysis) {
          return data.analysis;
        }
      }
      
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      // If this was a retry or we have no more attempts, rethrow the error
      if (attempt >= maxAttempts) {
        throw error;
      }
      
      // Otherwise, retry
      return submitTestWithRetry(attempt + 1, maxAttempts);
    }
  };

  // Submit test for evaluation
  const handleSubmitTest = async () => {
    if (isSubmitting) return;

    // Validate all questions are answered
    const unansweredQuestions = questions.filter(
      q => responses[q.id] === undefined ||
        responses[q.id] === null ||
        (typeof responses[q.id] === 'string' && responses[q.id].trim() === '')
    );

    if (unansweredQuestions.length > 0) {
         alert(`Please answer all questions before submitting. ${unansweredQuestions.length} question(s) remaining.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitTest();
      const result = await response.json();
      
      console.log('Test submission result:', result);
      
      if (result.success && result.data?.analysis) {
        setResults({
          ...result.data.analysis,
          reportId: result.data.meta?.reportId
        });
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('चाचणीचे मूल्यमापन करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle retake test
  const handleRetakeTest = () => {
    setResponses({});
    setResults(null);
    setCurrentQuestionIndex(0);
    setTestStarted(false);
    fetchQuestions();
  };

  // Render loading state
  if (isLoading && !testStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700">प्रश्न लोड करत आहे...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !testStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-4xl mb-4 text-center">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">प्रश्न लोड करताना त्रुटी आली आहे</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={fetchQuestions}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              पुन्हा प्रयत्न करा
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render test instructions
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-white text-center mb-6">व्यक्तिमत्त्व चाचणी</h1>
             <p className="text-lg text-white text-center mb-6">आमच्या सर्वसमावेशक मूल्यमापनाद्वारे आपली व्यक्तिमत्व वैशिष्ट्ये, सामर्थ्ये आणि वाढीच्या क्षेत्रांचा शोध घ्या..</p> 
        <div className="max-w-2xl w-full bg-[#D2E9FA] rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold test-gray-800 text-center mb-6">सूचना</h1>
            <div className="prose max-w-none text-gray-700 mb-8">
              <p className="mb-4">
                ही व्यक्तिमत्त्व चाचणी {questions.length} प्रश्नांची आहे, जी आपले व्यक्तिमत्त्व गुण अधिक चांगल्या प्रकारे समजून घेण्यास मदत करते.
              </p>
              <p className="mb-4">
                प्रत्येक विधानासाठी, कृपया "पूर्णतः असहमत" ते "पूर्णतः सहमत" या स्तरावर आपला कितपत सहमत किंवा असहमत आहात हे दर्शवा.
              </p>
              <p className="mb-6">
                चाचणी पूर्ण करण्यासाठी सुमारे १०-१५ मिनिटे लागतील. चाचणी सुरू केल्यानंतर ती पूर्ण करण्यासाठी आपल्याकडे ३० मिनिटे उपलब्ध असतील.
              </p>
              <div className="bg-white p-4 rounded-lg border shadow-[inset_0_0_10px_0_rgba(0,0,0,1)] border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">अचूक निकालांसाठी सूचना:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>कृपया प्रामाणिकपणे उत्तर द्या; येथे कोणतेही योग्य किंवा अयोग्य उत्तर नाहीत.</li>
                  <li>अतिविचार न करता, आपल्या पहिल्या प्रतिसादावर विश्वास ठेवा.</li>
                  <li>सर्व प्रश्नांचे उत्तर देण्याचा प्रयत्न करा.</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={startTest}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium"
              >
                टेस्ट सुरू करा
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render test results
  if (results) {
    return <TestResults results={results} onRetakeTest={handleRetakeTest} />;
  }

  // Render the test interface
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const selectedOption = responses[currentQuestion?.id] || '';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Head>
        <title>व्यक्तिमत्त्व चाचणी - प्रश्न {currentQuestionIndex + 1}</title>
      </Head>

      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              प्रश्न {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className="text-sm font-medium text-white">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Timer */}
        {timeLeft !== null && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              उर्वरित वेळ: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-[white] rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-medium text-gray-800 mb-6">
              {currentQuestion?.text}
            </h2>

            <div className="space-y-3">
              {currentQuestion?.options?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelectOption(currentQuestion.id, option.value)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedOption === Number(option.value)
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className=" px-6 py-4 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded-md ${currentQuestionIndex === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-indigo-600 hover:bg-indigo-50'
                }`}
            >
              मागे जा
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!selectedOption}
                className={`px-6 py-2 rounded-md ${!selectedOption
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
              >
                पुढे जा
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                disabled={!selectedOption || isSubmitting}
                className={`px-6 py-2 rounded-md flex items-center ${!selectedOption || isSubmitting
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    सबमिट करत आहे...
                  </>
                ) : (
                  'टेस्ट सबमिट करा'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalityTest;
