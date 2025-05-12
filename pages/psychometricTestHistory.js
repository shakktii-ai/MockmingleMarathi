import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PsychometricTestHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    // For testing purposes, we'll skip authentication
    // Fetch test history without token
    fetchTestHistory();
  }, []);

  const fetchTestHistory = async () => {
    try {
      setLoading(true);
      
      // For testing, we'll use a fixed userId in query params
      const response = await axios.get('/api/psychometricTests/getUserPsychometricTests?userId=6462a8d8f12c6d92f9f1b9e3');
      
      if (response.data.success) {
        setTests(response.data.tests);
        
        // If there are completed tests with responses, select the most recent one
        const completedTests = response.data.tests.filter(test => test.isCompleted && test.response);
        if (completedTests.length > 0) {
          setSelectedTest(completedTests[0]);
        }
      } else {
        toast.error('Failed to load test history');
      }
    } catch (error) {
      console.error('Error fetching test history:', error);
      toast.error('Error loading test history: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <title>Test History | SHAKKTII AI</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl">Loading your test history...</p>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Psychometric Test History | SHAKKTII AI</title>
      </Head>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Test List Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                <h1 className="text-xl font-bold text-white">Your Test History</h1>
              </div>
              
              <div className="p-4">
                <button
                  onClick={() => router.push('/psychometricTest')}
                  className="w-full mb-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                  Take New Test
                </button>
                
                {tests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No test history found</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {tests.map((test) => (
                      <div
                        key={test._id}
                        onClick={() => setSelectedTest(test)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedTest && selectedTest._id === test._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {formatDate(test.createdAt)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {test.isCompleted ? 'Completed' : 'Incomplete'}
                            </p>
                          </div>
                          
                          {test.response && (
                            <div className="flex items-center">
                              {renderStarRating(test.response.results.overallScore)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Test Details */}
          <div className="lg:w-2/3">
            {selectedTest && selectedTest.response ? (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                  <h1 className="text-xl font-bold text-white">Test Results</h1>
                  <p className="text-blue-100">
                    Completed on {formatDate(selectedTest.response.completedAt)}
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Competency Ratings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Empathy</h3>
                          {renderStarRating(selectedTest.response.results.empathy)}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Assertiveness</h3>
                          {renderStarRating(selectedTest.response.results.assertiveness)}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Ethical Reasoning</h3>
                          {renderStarRating(selectedTest.response.results.ethicalReasoning)}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Collaboration</h3>
                          {renderStarRating(selectedTest.response.results.collaboration)}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Conflict Resolution</h3>
                          {renderStarRating(selectedTest.response.results.conflictResolution)}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Leadership Potential</h3>
                          {renderStarRating(selectedTest.response.results.leadershipPotential)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Overall Assessment</h2>
                      <div className="flex items-center">
                        <span className="mr-2 font-medium">Rating:</span>
                        {renderStarRating(selectedTest.response.results.overallScore)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-line">{selectedTest.response.results.analysis}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Key Strengths</h2>
                      <ul className="bg-gray-50 p-4 rounded-lg">
                        {selectedTest.response.results.strengths.map((strength, index) => (
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
                        {selectedTest.response.results.areasToImprove.map((area, index) => (
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
                        {selectedTest.response.results.roleFitRecommendations.map((role, index) => (
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
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-xl font-medium text-gray-600 mb-2">No Test Selected</h2>
                  <p className="text-gray-500">
                    {tests.length > 0 
                      ? 'Select a test from the list to view results' 
                      : 'Take a psychometric test to see your results here'}
                  </p>
                  {tests.length === 0 && (
                    <button
                      onClick={() => router.push('/psychometricTest')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Take Your First Test
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
