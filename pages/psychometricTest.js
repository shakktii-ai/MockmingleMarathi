import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PsychometricTest() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [test, setTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [reasonings, setReasonings] = useState([]);
  const [results, setResults] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    // For testing purposes, we'll skip authentication
    // Check if user has an active test without token
    checkExistingTest();
  }, []);

  const checkExistingTest = async () => {
    try {
      setLoading(true);
      setGenerating(true);
      
      // For testing, we'll use a fixed userId
      const response = await axios.post('/api/psychometricTests/generatePsychometricTest', {
        userId: "6462a8d8f12c6d92f9f1b9e3" // Test user ID
      });
      
      if (response.data.success) {
        setTest(response.data.test);
        // Initialize arrays for responses
        setSelectedOptions(new Array(response.data.test.questions.length).fill(null));
        setReasonings(new Array(response.data.test.questions.length).fill(''));
      } else {
        toast.error('Failed to load test');
      }
    } catch (error) {
      console.error('Error checking existing test:', error);
      toast.error('Error loading test: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };

  const handleReasoningChange = (e) => {
    const newReasonings = [...reasonings];
    newReasonings[currentQuestionIndex] = e.target.value;
    setReasonings(newReasonings);
  };

  const goToNextQuestion = () => {
    if (selectedOptions[currentQuestionIndex] === null) {
      toast.warning('Please select an option before continuing');
      return;
    }
    
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, submit test
      submitTest();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitTest = async () => {
    try {
      setEvaluating(true);
      
      // Prepare responses data
      const responses = selectedOptions.map((optionIndex, questionIndex) => ({
        questionIndex,
        selectedOption: optionIndex,
        reasoning: reasonings[questionIndex]
      }));
      
      const response = await axios.post('/api/psychometricTests/evaluatePsychometricTest', {
        testId: test._id,
        responses,
        userId: "6462a8d8f12c6d92f9f1b9e3" // Test user ID
      });
      
      if (response.data.success) {
        setResults(response.data.evaluation);
      } else {
        toast.error('Failed to evaluate test');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Error evaluating test: ' + (error.response?.data?.message || error.message));
    } finally {
      setEvaluating(false);
    }
  };

  const renderStarRating = (score) => {
    return (
      <div className="flex items-center">
        {[...Array(3)].map((_, i) => (
          <svg 
            key={i}
            className={`w-6 h-6 ${i < score ? 'text-yellow-500' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Head>
          <title>Psychometric Test | SHAKKTII AI</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl">
            {generating ? 'Generating your psychometric test...' : 'Loading...'}
          </p>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Head>
          <title>Evaluating Test | SHAKKTII AI</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl">Evaluating your responses with AI...</p>
          <p className="mt-2 text-gray-600">This may take a minute. We're analyzing your decision-making style.</p>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (results) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <Head>
          <title>Psychometric Test Results | SHAKKTII AI</title>
        </Head>
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Your Psychometric Assessment Results</h1>
          </div>
          
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Competency Ratings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Empathy</h3>
                    {renderStarRating(results.empathy.score)}
                  </div>
                  <p className="text-sm text-gray-600">{results.empathy.comments}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Assertiveness</h3>
                    {renderStarRating(results.assertiveness.score)}
                  </div>
                  <p className="text-sm text-gray-600">{results.assertiveness.comments}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Ethical Reasoning</h3>
                    {renderStarRating(results.ethicalReasoning.score)}
                  </div>
                  <p className="text-sm text-gray-600">{results.ethicalReasoning.comments}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Collaboration</h3>
                    {renderStarRating(results.collaboration.score)}
                  </div>
                  <p className="text-sm text-gray-600">{results.collaboration.comments}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Conflict Resolution</h3>
                    {renderStarRating(results.conflictResolution.score)}
                  </div>
                  <p className="text-sm text-gray-600">{results.conflictResolution.comments}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Leadership Potential</h3>
                    {renderStarRating(results.leadershipPotential.score)}
                  </div>
                  <p className="text-sm text-gray-600">{results.leadershipPotential.comments}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Overall Assessment</h2>
                <div className="flex items-center">
                  <span className="mr-2 font-medium">Rating:</span>
                  {renderStarRating(results.overallScore)}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">{results.analysis}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Key Strengths</h2>
                <ul className="bg-gray-50 p-4 rounded-lg">
                  {results.strengths.map((strength, index) => (
                    <li key={index} className="mb-2 flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Areas for Improvement</h2>
                <ul className="bg-gray-50 p-4 rounded-lg">
                  {results.areasToImprove.map((area, index) => (
                    <li key={index} className="mb-2 flex items-start">
                      <svg className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Role Fit Recommendations</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.roleFitRecommendations.map((role, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                      <span>{role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => router.push('/psychometricTestHistory')}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                View Test History
              </button>
              <button
                onClick={() => {
                  setResults(null);
                  setTest(null);
                  setCurrentQuestionIndex(0);
                  checkExistingTest();
                }}
                className="ml-4 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                Take New Test
              </button>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Head>
          <title>Psychometric Test | SHAKKTII AI</title>
        </Head>
        <div className="text-center">
          <p className="text-xl text-red-600">Failed to load test. Please try again.</p>
          <button
            onClick={() => checkExistingTest(token)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Psychometric Test | SHAKKTII AI</title>
      </Head>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Psychometric Assessment</h1>
            <p className="text-blue-100">
              Question {currentQuestionIndex + 1} of {test.questions.length}
            </p>
          </div>
          
          <div className="w-full bg-gray-200 h-2">
            <div 
              className="bg-blue-600 h-2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <div className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-2"
                style={{ 
                  backgroundColor: currentQuestion.difficulty === 'Easy' ? '#e0f2fe' : 
                                  currentQuestion.difficulty === 'Moderate' ? '#fef3c7' : 
                                  '#fee2e2',
                  color: currentQuestion.difficulty === 'Easy' ? '#0369a1' : 
                         currentQuestion.difficulty === 'Moderate' ? '#92400e' : 
                         '#b91c1c'
                }}
              >
                {currentQuestion.difficulty} Difficulty
              </div>
              <h2 className="text-xl font-medium text-gray-800">{currentQuestion.scenario}</h2>
            </div>
            
            <div className="space-y-4 mb-6">
              {currentQuestion.options.map((option, index) => (
                <div 
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedOptions[currentQuestionIndex] === index 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-5 w-5 mt-0.5 border rounded-full flex items-center justify-center ${
                      selectedOptions[currentQuestionIndex] === index 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300'
                    }`}>
                      {selectedOptions[currentQuestionIndex] === index && (
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-base ${
                        selectedOptions[currentQuestionIndex] === index 
                          ? 'text-gray-900 font-medium' 
                          : 'text-gray-700'
                      }`}>
                        {option.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mb-6">
              <label htmlFor="reasoning" className="block text-sm font-medium text-gray-700 mb-1">
                Optional: Why did you choose this response? (Your reasoning)
              </label>
              <textarea
                id="reasoning"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Explain your thought process..."
                value={reasonings[currentQuestionIndex] || ''}
                onChange={handleReasoningChange}
              ></textarea>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              
              <button
                onClick={goToNextQuestion}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {currentQuestionIndex < test.questions.length - 1 ? 'Next' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
