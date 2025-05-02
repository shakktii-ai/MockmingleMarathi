
import React, { useState, useEffect } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from 'next/router';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Head from 'next/head';
import { IoClose } from "react-icons/io5";
import { jsPDF } from "jspdf";

function Oldreport() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [isEmailFetched, setIsEmailFetched] = useState(false);
  const [visibility, setVisibility] = useState({
    report: false,
    previousReports: false,
  });
  const [reportVisibility, setReportVisibility] = useState([]);
  const [fullReportData, setFullReportData] = useState(null);
  const [showFullReport, setShowFullReport] = useState(false);

  const extractScore = (report, scoreType) => {
    // console.log("Extracting score from:", report);

    if (!report || !report.reportAnalysis) {
      return 0; // Return 0 if no report or reportAnalysis field is available
    }

    // Handle different score formats
    let regexPatterns = [];
    
    // Check if this is Overall Score (which uses /50 instead of /10)
    if (scoreType === 'Overall Score') {
      // Format: "Overall Score: 30/50"
      regexPatterns.push(new RegExp(`${scoreType}:\s*(\d+)\/50`, 'i'));
      // Format: "Overall Score: (30/50)"
      regexPatterns.push(new RegExp(`${scoreType}:\s*\((\d+)\/50\)`, 'i'));
      // Format: "**Overall Score:** 30/50"
      regexPatterns.push(new RegExp(`\*\*${scoreType}:\*\*\s*(\d+)\/50`, 'i'));
      // Format: "Overall Score (Score: 30/50)"
      regexPatterns.push(new RegExp(`${scoreType}\s*\(Score:\s*(\d+)\/50\)`, 'i'));
    } else {
      // Format: "Technical Proficiency: 7/10"
      regexPatterns.push(new RegExp(`${scoreType}:\s*(\d+)\/10`, 'i'));
      // Format: "Technical Proficiency: (7/10)"
      regexPatterns.push(new RegExp(`${scoreType}:\s*\((\d+)\/10\)`, 'i'));
      // Format: "**Technical Proficiency:** 7/10"
      regexPatterns.push(new RegExp(`\*\*${scoreType}:\*\*\s*(\d+)\/10`, 'i'));
      // Format: "Technical Proficiency (Score: 7/10)"
      regexPatterns.push(new RegExp(`${scoreType}\s*\(Score:\s*(\d+)\/10\)`, 'i'));
    }

    // Try each regex pattern until we find a match
    for (const regex of regexPatterns) {
      const match = report.reportAnalysis.match(regex);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }

    return 0; // Return 0 if no score is found
  };
  // Extract score based on the scoreType passed (Technical Proficiency, Communication, etc.)
  // Extract score and detailed feedback for a specific category
  const extractScoreAndFeedback = (report, category) => {
    // console.log(report);

    if (!report || !report.reportAnalysis) {
      return { score: 0, feedback: 'No data available.' };
    }

    // Array of regex patterns to match different score formats
    const scorePatterns = [];
    const feedbackPatterns = [];
    
    // Handle different formats based on whether it's Overall Score or other categories
    if (category === 'Overall Score') {
      // Score patterns for Overall Score (using /50)
      scorePatterns.push(
        new RegExp(`${category}:\s*(\d+)\/50`, 'i'),                  // Overall Score: 30/50
        new RegExp(`${category}:\s*\((\d+)\/50\)`, 'i'),             // Overall Score: (30/50)
        new RegExp(`\*\*${category}:\*\*\s*(\d+)\/50`, 'i'),         // **Overall Score:** 30/50
        new RegExp(`\*\*${category}\*\*:\s*(\d+)\/50`, 'i'),         // **Overall Score**: 30/50
        new RegExp(`${category}\s*\(Score:\s*(\d+)\/50\)`, 'i')      // Overall Score (Score: 30/50)
      );
      
      // Feedback patterns for Overall Score
      feedbackPatterns.push(
        new RegExp(`${category}:\s*(\d+/50)\s*([^]*?)(?=\n[A-Z][a-zA-Z ]+:|$)`, 'i'),
        new RegExp(`${category}:\s*\((\d+/50)\)\s*([^]*?)(?=\n[A-Z][a-zA-Z ]+:|$)`, 'i'),
        new RegExp(`\*\*${category}:\*\*\s*(\d+/50)\s*([^]*?)(?=\n[A-Z][a-zA-Z ]+:|$)`, 'i'),
        new RegExp(`\*\*${category}\*\*:\s*(\d+/50)\s*([^]*?)(?=\n[A-Z][a-zA-Z ]+:|$)`, 'i')
      );
    } else {
      // Score patterns for other categories (using /10)
      scorePatterns.push(
        new RegExp(`${category}:\s*(\d+)\/10`, 'i'),                  // Technical Proficiency: 7/10
        new RegExp(`${category}:\s*\((\d+)\/10\)`, 'i'),             // Technical Proficiency: (7/10)
        new RegExp(`\*\*${category}:\*\*\s*(\d+)\/10`, 'i'),         // **Technical Proficiency:** 7/10
        new RegExp(`\*\*${category}\*\*:\s*(\d+)\/10`, 'i'),         // **Technical Proficiency**: 7/10
        new RegExp(`${category}\s*\(Score:\s*(\d+)\/10\)`, 'i')      // Technical Proficiency (Score: 7/10)
      );
      
      // Feedback patterns for other categories
      feedbackPatterns.push(
        new RegExp(`${category}:\s*(\d+/10)\s*([^]*?)(?=\n[A-Z][a-zA-Z ]+:|Overall|$)`, 'i'),
        new RegExp(`${category}:\s*\((\d+/10)\)\s*([^]*?)(?=\n[A-Z][a-zA-Z ]+:|Overall|$)`, 'i'),
        new RegExp(`\*\*${category}:\*\*\s*(\d+/10)\s*([^]*?)(?=\n[A-Z][a-zA-Z ]+:|Overall|$)`, 'i'),
        new RegExp(`\*\*${category}\*\*:\s*(\d+/10)\s*([^]*?)(?=\n[A-Z][a-zA-Z ]+:|Overall|$)`, 'i')
      );
    }

    // Try to find a score match using all patterns
    let scoreMatch = null;
    for (const pattern of scorePatterns) {
      const match = report.reportAnalysis.match(pattern);
      if (match && match[1]) {
        scoreMatch = match;
        break;
      }
    }

    // Try to find a feedback match using all patterns
    let feedbackMatch = null;
    for (const pattern of feedbackPatterns) {
      const match = report.reportAnalysis.match(pattern);
      if (match) {
        feedbackMatch = match;
        break;
      }
    }

    // Extract numeric score from match
    let score = 0;
    if (scoreMatch && scoreMatch[1]) {
      // Extract just the number from patterns like "7/10" or "30/50"
      const scoreText = scoreMatch[1];
      const numberMatch = scoreText.match(/(\d+)/);
      score = numberMatch ? parseInt(numberMatch[1], 10) : 0;
    }

    // Extract feedback text
    const feedback = feedbackMatch ? feedbackMatch[0] : 'No feedback available.';

    return { score, feedback };
  };

  // Extract Overall Score

  // Extract Recommendations
  const extractRecommendations = (report) => {
    const regex = /Recommendation:([\s\S]*?)(?=(\n|$))/i;
    const match = report.reportAnalysis.match(regex);
    return match ? match[1].trim() : 'No recommendations available.';
  };

  // Fetch email from localStorage
  useEffect(() => {
    const userFromStorage = localStorage.getItem('user');
    if (userFromStorage) {
      const parsedUser = JSON.parse(userFromStorage);
      const email = parsedUser.email;

      if (email) {
        setEmail(email);
        setIsEmailFetched(true);
        setVisibility((prevVisibility) => ({
          ...prevVisibility,
          previousReports: true,
        }));
      } else {
        setError("Email is missing in localStorage");
      }
    } else {
      setError("No user data found in localStorage");
    }
  }, []);

  // Fetch reports when email is set
  useEffect(() => {
    if (email && isEmailFetched) {
      const fetchReportsByEmail = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/saveAndGetReport?email=${email}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch reports, status: ${response.status}`);
          }
          const data = await response.json();
          if (data.reports && data.reports.length > 0) {
            const sortedReports = data.reports.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
              const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
              return dateB - dateA;
            });
            setReports(sortedReports);
            setReportVisibility(new Array(sortedReports.length).fill(false));
          } else {
            setReports([]);
          }
        } catch (err) {
          setError(`Error fetching reports: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };

      fetchReportsByEmail();
    }
  }, [email, isEmailFetched]);

  // Handle Go Back Logic
  const goBack = () => {
    if (document.referrer.includes('/report')) {
      router.push('/');
    } else {
      router.back('/');
    }
  };

  // Handle toggle visibility of report sections
  const toggleVisibility = (section) => {
    setVisibility((prevVisibility) => ({
      ...prevVisibility,
      [section]: !prevVisibility[section],
    }));
  };

  // Toggle visibility for individual reports
  const toggleIndividualReportVisibility = (index) => {
    setReportVisibility((prevVisibility) => {
      const newVisibility = [...prevVisibility];
      newVisibility[index] = !newVisibility[index];
      return newVisibility;
    });
  };

  // Generate PDF Report
  const downloadReport = (reportContent, report) => {
    const doc = new jsPDF();
    const reportDate = report.createdAt ? new Date(report.createdAt).toLocaleString() : "Unknown Date";
    let marginX = 20;
    let marginY = 20;
    let pageHeight = doc.internal.pageSize.height;

    // Title
    doc.setFontSize(20);
    doc.text("Interview Report", doc.internal.pageSize.width / 2, marginY, { align: "center" });

    // Report Role and Date
    marginY += 15;
    doc.setFontSize(14);
    doc.text(`Role: ${report.role}`, marginX, marginY);
    marginY += 10;
    doc.text(`Date: ${reportDate}`, marginX, marginY);

    // Analysis Header
    marginY += 15;
    doc.setFontSize(14);
    doc.text("Analysis:", marginX, marginY);

    // Wrap long content
    doc.setFontSize(12);
    marginY += 10;
    let wrappedText = doc.splitTextToSize(reportContent.replace(/<[^>]*>/g, ' '), 170);
    wrappedText.forEach(line => {
      if (marginY + 10 > pageHeight - 20) {
        doc.addPage();
        marginY = 20;
      }
      doc.text(line, marginX, marginY);
      marginY += 7;
    });

    // Scores Section
    marginY += 10;
    const scores = [
      { label: 'Technical Proficiency', score: extractScore(report, 'Technical Proficiency') },
      { label: 'Communication', score: extractScore(report, 'Communication') },
      { label: 'Decision-Making', score: extractScore(report, 'Decision-Making') },
      { label: 'Confidence', score: extractScore(report, 'Confidence') },
      { label: 'Language Fluency', score: extractScore(report, 'Language Fluency') },
      { label: 'Overall Score', score: extractScore(report, 'Overall Score') },
    ];

    scores.forEach((score) => {
      if (marginY + 15 > pageHeight - 20) {
        doc.addPage();
        marginY = 20;
      }
      doc.setFontSize(12);
      doc.text(`${score.label}:`, marginX, marginY);

      // Progress Bar (Replaces Circle)
      let progressWidth = (score.score / 10) * 50;
      doc.setFillColor(50, 150, 250); // Blue color
      doc.rect(marginX + 80, marginY - 5, progressWidth, 5, "F"); // Progress bar
      doc.text(`${score.score}/10`, marginX + 140, marginY);

      marginY += 15;
    });

    // Separator Line
    if (marginY + 10 > pageHeight - 20) {
      doc.addPage();
      marginY = 20;
    }
    doc.setLineWidth(0.5);
    doc.line(marginX, marginY, 190, marginY);
    marginY += 10;

    // Recommendations Section
    if (marginY + 10 > pageHeight - 20) {
      doc.addPage();
      marginY = 20;
    }
    doc.setFontSize(12);
    doc.text("Recommendations:", marginX, marginY);
    marginY += 10;
    doc.setFontSize(12);
    doc.text(extractRecommendations(report), marginX, marginY);

    // Save the PDF
    doc.save(`report_${report.role}_${reportDate.replace(/[:/,]/g, '-')}.pdf`);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }
  
  // We're no longer using the separate ScoreCard component as we integrated the scorecard display 

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 text-white">
      <Head>
        <title>Interview Reports | SHAKKTII AI</title>
        <meta name="description" content="View your AI-powered interview performance reports" />
      </Head>
      
      {/* Full Report Modal with enhanced UI */}
      {showFullReport && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto transition-all duration-300">
          <div 
            className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-500 border-opacity-40 transform transition-all duration-500"
            style={{ boxShadow: '0 0 25px rgba(147, 51, 234, 0.3)' }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-900 to-purple-900 px-6 py-5 flex justify-between items-center z-10 backdrop-blur">
              <div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">Detailed Report Analysis</h3>
                <p className="text-sm text-gray-300 mt-1">{fullReportData?.role} - {fullReportData?.date}</p>
              </div>
              <button 
                onClick={() => setShowFullReport(false)}
                className="text-gray-300 hover:text-white text-2xl focus:outline-none hover:bg-gray-800 hover:bg-opacity-30 p-2 rounded-full transition-all duration-200"
                aria-label="Close modal"
              >
                <IoClose />
              </button>
            </div>
            
            {/* Modal Content with improved typography and spacing */}
            <div className="p-8">
              <div className="bg-gray-900 bg-opacity-70 rounded-xl p-7 whitespace-pre-wrap shadow-inner border border-gray-700 border-opacity-50">
                {fullReportData?.reportAnalysis.split('\n').map((paragraph, i) => {
                  // Check if this is a header line (contains **: or **)  
                  if (paragraph.includes('**:') || paragraph.includes(':**') || paragraph.match(/\*\*[^*]+\*\*/)) {
                    return (
                      <div key={i}>
                        <h4 className="text-xl font-bold text-blue-300 mt-6 mb-3">
                          {paragraph.replace(/\*\*/g, '')}
                        </h4>
                        {/* Extract score if present in header */}
                        {paragraph.match(/(\d+)\/(10|50)/) ? (
                          (() => {
                            const scoreMatch = paragraph.match(/(\d+)\/(10|50)/);
                            const scoreValue = scoreMatch ? parseInt(scoreMatch[1]) : 0;
                            const maxValue = scoreMatch ? parseInt(scoreMatch[2]) : 10;
                            const percentage = (scoreValue / maxValue) * 100;
                            
                            return (
                              <div className="w-full h-2 bg-gray-700 rounded-full mb-5">
                                <div 
                                  className="h-2 bg-blue-500 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="w-full h-0.5 bg-blue-800 mb-4"></div>
                        )}
                      </div>
                    );
                  }
                  // Check if line contains a score
                  else if (paragraph.match(/(\d+\/10|\d+\/50)/)) {
                    const scoreMatch = paragraph.match(/(\d+)\/(10|50)/);
                    const scoreValue = scoreMatch ? parseInt(scoreMatch[1]) : 0;
                    const maxValue = scoreMatch ? parseInt(scoreMatch[2]) : 10;
                    const percentage = (scoreValue / maxValue) * 100;
                    
                    return (
                      <div key={i} className="mb-6">
                        <p className="text-blue-100 font-medium mb-2">{paragraph}</p>
                        {/* Horizontal score bar matching the heading style */}
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ 
                              width: `${percentage}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  }
                  // Normal paragraph
                  return <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>;
                })}
              </div>
              
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setShowFullReport(false)}
                  className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <IoClose className="text-lg" />
                  <span>Close Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header with Navigation */}
      <div className="sticky top-0 bg-black bg-opacity-30 backdrop-blur-sm z-10 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={goBack} className="text-white text-3xl hover:text-indigo-300 transition-all duration-300 transform hover:scale-110">
              <IoIosArrowBack />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-300">SHAKKTII AI</h1>
          </div>
          <div className="text-sm md:text-base text-gray-200">
            {email && <span className="font-medium">User: {email}</span>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-center text-4xl md:text-5xl font-bold mb-6 mt-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
          Interview Performance History
        </h1>

        {/* Reports Section */}
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-300"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {reports && reports.length > 0 ? (
                reports.map((report, index) => (
                  <div key={index} className="bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm border border-purple-500 border-opacity-30 transition-all duration-300 hover:shadow-purple-500/20">
                    {/* Report Header */}
                    <div
                      onClick={() => toggleIndividualReportVisibility(index)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 cursor-pointer flex items-center justify-between hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-lg">{report.role}</span>
                        <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                          {reportVisibility[index] ? 'Hide Details' : 'Show Details'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm opacity-80">{new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}</span>
                        <span className="transform transition-transform duration-300 text-lg">
                          {reportVisibility[index] ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Report Content - Conditional Render */}
                    {reportVisibility[index] && (
                      <div className="p-6">
                        {/* Report Meta */}
                        <div className="flex flex-wrap justify-between mb-6 pb-4 border-b border-gray-600">
                          <div>
                            <p className="text-gray-400 text-sm">Role</p>
                            <p className="font-semibold text-lg">{report.role}</p>
                          </div>
                          {/* <div>
                            <p className="text-gray-400 text-sm">College</p>
                            <p className="font-semibold">{report.collageName || 'Not specified'}</p>
                          </div> */}
                          <div>
                            <p className="text-gray-400 text-sm">Date</p>
                            <p className="font-semibold">{new Date(report.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Performance Scores */}
                        <h3 className="text-xl font-bold mb-4 text-blue-300">Performance Scores</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                          {['Technical Proficiency', 'Communication', 'Decision-Making', 'Confidence', 'Language Fluency', 'Overall Score'].map((category) => {
                            // First try to get score directly using the improved extractScore function
                            let score = extractScore(report, category);
                            // If that fails, try the more detailed extractScoreAndFeedback function
                            const { score: detailedScore, feedback } = extractScoreAndFeedback(report, category);
                            // Use whichever score is higher (non-zero)
                            score = score > 0 ? score : detailedScore;
                            
                            const isOverallScore = category === 'Overall Score';
                            const maxScore = isOverallScore ? 50 : 10;
                            const normalizedScore = isOverallScore ? score : score * 5; // Scale up for visual consistency
                            const scoreText = isOverallScore ? `${score}/50` : `${score}/10`;
                            
                            return (
                              <div key={category} className="bg-gray-900 bg-opacity-60 rounded-lg p-5 transform transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 border border-transparent hover:border-purple-500/20">
                                <div className="flex items-center mb-4">
                                  <h4 className="font-semibold text-lg flex-1 text-blue-200">{category}</h4>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row items-center">
                                  {/* Enhanced Circular Progress Bar */}
                                  <div className="w-28 h-28 mb-4 sm:mb-0 relative group">
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300 -z-10"></div>
                                    <CircularProgressbar
                                      value={score}
                                      maxValue={maxScore}
                                      text={scoreText}
                                      background
                                      backgroundPadding={6}
                                      styles={buildStyles({
                                        pathColor: isOverallScore 
                                          ? 'url(#overallGradient)' 
                                          : score >= maxScore * 0.7 
                                            ? '#4ade80' // Good score
                                            : score >= maxScore * 0.4 
                                              ? '#facc15' // Average score
                                              : '#f87171', // Poor score
                                        backgroundColor: '#1f2937',
                                        textColor: '#ffffff',
                                        trailColor: '#374151',
                                        textSize: '24px',
                                        pathTransitionDuration: 0.5,
                                        strokeLinecap: 'round',
                                      })}
                                    />
                                    {/* Add SVG gradient definition for overall score */}
                                    <svg style={{ height: 0 }}>
                                      <defs>
                                        <linearGradient id="overallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                          <stop offset="0%" stopColor="#8b5cf6" />
                                          <stop offset="100%" stopColor="#d946ef" />
                                        </linearGradient>
                                      </defs>
                                    </svg>
                                  </div>
                                  
                                  <div className="ml-0 sm:ml-5 flex-1">
                                    {/* Score bar with animation */}
                                    <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
                                      <div 
                                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                                        style={{ 
                                          width: `${(score / maxScore) * 100}%`,
                                          boxShadow: '0 0 8px rgba(147, 51, 234, 0.5)'
                                        }}
                                      ></div>
                                    </div>
                                    
                                    <div className="text-sm text-gray-300 leading-relaxed">
                                      {/* Limit to approximately 20-25 words */}
                                      {feedback.split(/\s+/).slice(0, 22).join(" ")}...
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Report Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center mt-8 space-y-4 sm:space-y-0 sm:space-x-5">
                          <button
                            onClick={() => {
                              setFullReportData({
                                reportAnalysis: report.reportAnalysis,
                                role: report.role,
                                date: new Date(report.createdAt).toLocaleDateString()
                              });
                              setShowFullReport(true);
                            }}
                            className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center group"
                          >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            <span className="relative z-10">View Full Report</span>
                            <span className="absolute bottom-0 left-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                          </button>
                        
                          <button
                            onClick={() => downloadReport(report.reportAnalysis, report)}
                            className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-700 hover:from-indigo-600 hover:to-purple-800 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center group"
                          >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="relative z-10">Download PDF Report</span>
                            <span className="absolute bottom-0 left-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-16 rounded-xl bg-gray-800 bg-opacity-40 backdrop-blur-sm">
                  <div className="text-5xl mb-4">⏳</div>
                  <h3 className="text-2xl font-semibold mb-2">Your report is being prepared</h3>
                  <p className="text-gray-300">Interview reports typically take about 5 minutes to generate.</p>
                  <p className="text-gray-400 mt-4">Please check back soon!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Oldreport;



  