
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
    if (!report || !report.reportAnalysis) {
      return 0;
    }

    const patterns = [
      // Pattern for "**Technical Proficiency (Score: 4/10)**"
      new RegExp(`\\*\\*${scoreType}.*?\\(Score:\\s*(\\d+)\\/\\d+\\)\\*\\*`, 'i'),
      // Pattern for "**Communication: 6/10**"
      new RegExp(`\\*\\*${scoreType}.*?\\s*(\\d+)\\/\\d+\\*\\*`, 'i'),
      // Pattern for "**Decision-Making (5/10)**"
      new RegExp(`\\*\\*${scoreType}.*?\\((\\d+)\\/\\d+\\)\\*\\*`, 'i')
    ];

    let score = 0;
    let feedback = 'फीडबॅक उपलब्ध नाही.';
    let scoreMatch = null;

    // Try each pattern until we find a match
    for (const pattern of patterns) {
      const match = report.reportAnalysis.match(pattern);
      if (match) {
        scoreMatch = match;
        break;
      }
    }

    if (scoreMatch) {
      // Extract score from the match
      let scoreNumber = null;
      if (scoreMatch[2]) {
        scoreNumber = parseInt(scoreMatch[2], 10);
      } else if (scoreMatch[1]) {
        scoreNumber = parseInt(scoreMatch[1], 10);
      }

      if (scoreNumber !== null) {
        score = scoreNumber;

        // Extract feedback text between markdown headers
        const feedbackStart = report.reportAnalysis.indexOf(scoreMatch[0]) + scoreMatch[0].length;
        const nextHeader = report.reportAnalysis.indexOf('\n**', feedbackStart);

        feedback = report.reportAnalysis
          .slice(feedbackStart, nextHeader !== -1 ? nextHeader : undefined)
          .replace(/^\n+|\n+$/g, '')
          .trim();
      }
    }

    return { score, feedback };
  };
  const extractRecommendations = (report) => {
    const regex = /शिफारस:([\s\S]*?)(?=(\n|$))/i;
    const match = report.reportAnalysis.match(regex);
    return match ? match[1].trim() : 'कोणतीही शिफारस उपलब्ध नाही.';
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
        setError("localStorage मध्ये ईमेल उपलब्ध नाही");
      }
    } else {
      setError("localStorage मध्ये वापरकर्ता डेटा आढळला नाही");
    }
  }, []);

  // Fetch reports when email is set
  useEffect(() => {
    if (email && isEmailFetched) {
      const fetchReportsByEmail = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/saveAndGetReport?email=${email}`);
          if (!response.ok) {
            throw new Error(`रिपोर्ट मिळवण्यात अडचण आली, स्टेटस: ${response.status}`);
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
          setError(`रिपोर्ट मिळवण्यात त्रुटी: ${err.message}`);
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

  // Generate PDF for detailed report analysis
  const downloadDetailedReport = () => {
    if (!fullReportData) return;

    try {
      // Create new PDF document with higher quality settings
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const reportDate = fullReportData.createdAt ? new Date(fullReportData.createdAt).toLocaleString() : "अज्ञात तारीख";
      let marginX = 15;
      let marginY = 20;
      let pageHeight = doc.internal.pageSize.height;
      let pageWidth = doc.internal.pageSize.width;
      let contentWidth = pageWidth - (marginX * 2);

      // Set up document metadata
      doc.setProperties({
        title: `SHAKKTII AI रिपोर्ट - ${fullReportData.role || 'मुलाखत विश्लेषण'}`,
        subject: 'मुलाखत विश्लेषण अहवाल',
        author: 'SHAKKTII AI',
        keywords: 'interview, analysis, AI assessment',
        creator: 'SHAKKTII AI प्लॅटफॉर्म'
      });

      // Add a branded header
      doc.setFillColor(30, 20, 70); // Dark purple background
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setTextColor(255, 255, 255); // White text for header
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("SHAKKTII AI मुलाखत विश्लेषण", pageWidth / 2, 10, { align: "center" });
      doc.setTextColor(0, 0, 0); // Reset text color to black

      // Title
      doc.setFontSize(20);
      doc.text("सविस्तर मुलाखत विश्लेषण", pageWidth / 2, marginY, { align: "center" });

      // Report Role and Date
      marginY += 15;
      doc.setFontSize(14);
      doc.text(`भूमिका: ${fullReportData.role || 'N/A'}`, marginX, marginY);
      marginY += 10;
      doc.text(`तारीख: ${reportDate}`, marginX, marginY);
      marginY += 15;

      // Extract and format the full report content
      const formatReportContentForPDF = (rawContent) => {
        if (!rawContent) return '';

        // Standardize line endings
        let cleanReport = rawContent.replace(/\r\n/g, '\n');

        // First extract the complete text content
        cleanReport = cleanReport
          // Handle markdown headers with proper spacing
          .replace(/^\s*#{1,6}\s+(.+)$/gm, '$1') // Keep header text but remove # symbols

          // Handle bold and italic formatting for visual clarity
          .replace(/\*\*\*(.+?)\*\*\*/g, '$1') // Bold and italic
          .replace(/\*\*(.+?)\*\*/g, '$1')     // Bold
          .replace(/\*(.+?)\*/g, '$1')         // Italic

          // Convert markdown links to readable text
          .replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)')

          // Ensure bullet points are properly formatted with consistent spacing
          .replace(/^\s*-\s*/gm, '- ')

          // Fix numbered list formatting
          .replace(/^\s*(\d+)\.(?!\d)/gm, '$1. ')

          // Handle nested bullet points by converting them to a standard format
          .replace(/^\s{2,}(-|\d+\.)\s/gm, '    • '); // Convert nested lists to indented bullets

        return cleanReport;
      };

      // Process the full report content
      const cleanReport = formatReportContentForPDF(fullReportData.reportAnalysis);

      // Split the detailed analysis by sections for better formatting
      // We keep empty lines as they may indicate paragraph breaks
      const sections = cleanReport.split('\n');

      doc.setFontSize(12);

      // Keep track of list structure
      let inList = false;
      let listNumber = 0;
      let listDepth = 0;
      let isInParagraph = false;

      // Function to check if we need a page break
      const checkPageBreak = (requiredSpace) => {
        if (marginY + requiredSpace > pageHeight - 20) {
          doc.addPage();
          // Reset the margin
          marginY = 25;

          // Add header to new page
          doc.setFillColor(30, 20, 70); // Dark purple background
          doc.rect(0, 0, pageWidth, 15, 'F');
          doc.setTextColor(255, 255, 255); // White text for header
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text("SHAKKTII AI मुलाखत विश्लेषण", pageWidth / 2, 10, { align: "center" });
          doc.setTextColor(0, 0, 0); // Reset text color to black
          doc.setFont(undefined, 'normal');
          return true;
        }
        return false;
      };

      sections.forEach((section, index) => {
        // Skip processing if the section is empty but not if it's a paragraph break
        if (section.trim() === '') {
          if (isInParagraph) {
            marginY += 4; // Add a small space for paragraph breaks
            isInParagraph = false;
          }
          return;
        }

        isInParagraph = true;

        // Identify section headers (lines that end with a colon or look like headers)
        const isHeader =
          section.match(/^[A-Za-z][^:]{3,}:$/) || // Ends with colon 
          section.match(/^(?:Assessment|Analysis|Summary|Recommendations|Strengths|Weaknesses|Feedback|Overall Score)(?:\s|:)/) ||
          section.match(/^Key\s+(?:Points|Findings|Recommendations)(?:\s|:)/);

        // Handle numbered lists
        const isNumberedItem = section.match(/^\d+\.\s/);

        // Handle bullet points
        const isBulletPoint = section.trim().startsWith('-');

        // Handle score indicators
        const isScoreItem = section.match(/\b(?:score|rating|points):\s*\d+(?:\/\d+)?\b/i) ||
          section.match(/\b\d+(?:\/\d+)\s*(?:score|points|rating)\b/i);

        // Format headers differently
        if (isHeader) {
          // Add a page break if we're close to the bottom
          if (marginY + 20 > pageHeight - 20) {
            doc.addPage();
            marginY = 20;
          }

          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');

          doc.text(section.trim(), marginX, marginY);
          marginY += 10;

          // Draw a line under headers
          doc.setDrawColor(100, 100, 200);
          doc.line(marginX, marginY - 5, marginX + 150, marginY - 5);

          // Reset font
          doc.setFontSize(12);
          doc.setFont(undefined, 'normal');

          // Reset list counter when encountering a new section
          inList = false;
          listNumber = 0;
        }
        // Handle numbered list items
        else if (isNumberedItem) {
          // Set list to active
          inList = true;

          // Add a page break if we're close to the bottom
          if (marginY + 15 > pageHeight - 20) {
            doc.addPage();
            marginY = 20;
          }

          doc.setFont(undefined, 'bold');
          doc.text(section.trim(), marginX, marginY);
          doc.setFont(undefined, 'normal');
          marginY += 8;

          // Get the number from this item
          const numMatch = section.match(/^(\d+)\./);
          if (numMatch) {
            listNumber = parseInt(numMatch[1], 10);
          }
        }
        // Handle bullet points
        else if (isBulletPoint) {
          // Add a page break if we're close to the bottom
          if (marginY + 15 > pageHeight - 20) {
            doc.addPage();
            marginY = 20;
          }

          // Format the bullet point text (remove the leading dash)
          const bulletText = section.trim().substring(1).trim();

          // Indent bullet points
          doc.text(`•  ${bulletText}`, marginX + 5, marginY);
          marginY += 8;
        }
        else {
          // Check if this contains a score
          const scoreMatch = section.match(/(\d+)\/(10|50)/);
          if (scoreMatch) {
            // Add a page break if we're close to the bottom
            if (marginY + 15 > pageHeight - 20) {
              doc.addPage();
              marginY = 20;
            }

            doc.text(section, marginX, marginY);
            marginY += 8;

            // Draw a score bar
            const scoreValue = parseInt(scoreMatch[1], 10);
            const maxValue = parseInt(scoreMatch[2], 10);
            const percentage = (scoreValue / maxValue);

            if (Number.isFinite(percentage) && percentage > 0) {
              const barWidth = 100 * percentage;
              doc.setFillColor(50, 100, 250);
              doc.rect(marginX, marginY - 5, barWidth, 3, "F");
              marginY += 10;
            }
          }
          // Handle regular paragraphs
          else {
            // If in a list, add indentation to paragraphs
            const textIndent = inList ? 10 : 0;

            // Regular text - wrap long content
            const wrappedText = doc.splitTextToSize(section, 170 - textIndent);

            // Check if we need a page break
            if (marginY + (wrappedText.length * 7) > pageHeight - 20) {
              doc.addPage();
              marginY = 20;
            }

            wrappedText.forEach(line => {
              doc.text(line, marginX + textIndent, marginY);
              marginY += 7;
            });

            marginY += 3; // Extra space between paragraphs
          }
        }
      });

      // Add company logo or branding at the bottom
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('SHAKKTII AI द्वारे व्युत्पन्न © ' + new Date().getFullYear(), doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, {
        align: 'center'
      });

      // Ensure all content is rendered properly before saving
      try {
        // Save with a meaningful filename based on role and date
        const fileName = `${fullReportData.role || 'interview'}_report_${new Date().toISOString().split('T')[0]}`;
        doc.save(`${fileName}.pdf`);

        console.log('PDF यशस्वीरित्या डाउनलोड झाले');
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('PDF अहवाल तयार करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
      }
    } catch (outerError) {
      console.error('Error processing report content:', outerError);
      alert('PDF अहवाल तयार करताना त्रुटी आली. कृपया नंतर पुन्हा प्रयत्न करा.');
    }
  };

  // Generate PDF Report for summary
  const downloadReport = (reportContent, report) => {
    const doc = new jsPDF();
    const reportDate = report.createdAt ? new Date(report.createdAt).toLocaleString() : "अज्ञात तारीख";
    let marginX = 20;
    let marginY = 20;
    let pageHeight = doc.internal.pageSize.height;

    // Title
    doc.setFontSize(20);
    doc.text("मुलाखत अहवाल", doc.internal.pageSize.width / 2, marginY, { align: "center" });

    // Report Role and Date
    marginY += 15;
    doc.setFontSize(14);
    doc.text(`भूमिका: ${report.role}`, marginX, marginY);
    marginY += 10;
    doc.text(`तारीख: ${reportDate}`, marginX, marginY);

    // Analysis Header
    marginY += 15;
    doc.setFontSize(14);
    doc.text("विश्लेषण:", marginX, marginY);

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
      { label: 'टेक्निकल स्किल्स', scoreData: extractScore(report, 'टेक्निकल स्किल्स') },
      { label: 'कम्युनिकेशन', scoreData: extractScore(report, 'कम्युनिकेशन') },
      { label: 'निर्णय क्षमता', scoreData: extractScore(report, 'निर्णय क्षमता') },
      { label: 'आत्मविश्वास', scoreData: extractScore(report, 'आत्मविश्वास') },
      { label: 'भाषा प्रावीण्य', scoreData: extractScore(report, 'भाषा प्रावीण्य') },
      { label: 'एकूण गुण', scoreData: extractScore(report, 'एकूण गुण') },
    ];

    scores.forEach((scoreItem) => {
      if (marginY + 15 > pageHeight - 20) {
        doc.addPage();
        marginY = 20;
      }
      doc.setFontSize(12);
      doc.text(`${scoreItem.label}:`, marginX, marginY);

      // Get the numeric score value (defaulting to 0 if undefined)
      const scoreValue = scoreItem.scoreData && typeof scoreItem.scoreData.score === 'number' ?
        scoreItem.scoreData.score : 0;

      // Progress Bar (Replaces Circle)
      let progressWidth = (scoreValue / 10) * 50;

      // Ensure progressWidth is a valid number
      progressWidth = Number.isFinite(progressWidth) ? progressWidth : 0;

      // Only draw the rectangle if we have valid dimensions
      if (progressWidth > 0) {
        doc.setFillColor(50, 150, 250); // Blue color
        doc.rect(marginX + 80, marginY - 5, progressWidth, 5, "F"); // Progress bar
      }

      doc.text(`${scoreValue}/10`, marginX + 140, marginY);

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
    doc.text("शिफारसी:", marginX, marginY);
    marginY += 10;
    doc.text(extractRecommendations(report), marginX, marginY);

    // Save the PDF
    doc.save(`report_${report.role}_${reportDate.replace(/[:/,]/g, '-')}.pdf`);
  };

  if (error) {
    return <div>त्रुटी: {error}</div>;
  }

  // We're no longer using the separate ScoreCard component as we integrated the scorecard display 

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 text-white">
      <Head>
        <title>मुलाखत अहवाल | SHAKKTII AI</title>
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
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">सविस्तर रिपोर्टचे विश्लेषण</h3>
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


            <div className="p-8">
              <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-indigo-800 mb-4">तपशीलवार विश्लेषण</h3>

                {fullReportData ? (
                  <div className="prose max-w-none text-gray-800">
                    {fullReportData.reportAnalysis.split('\n').map((line, index) => {
                      // Remove markdown heading (#)
                      if (line.trim().startsWith('#')) {
                        const headerText = line.replace(/^#+\s*/, '');
                        return (
                          <h3 key={index} className="text-xl font-bold mt-4 mb-2 text-indigo-800">
                            {headerText}
                          </h3>
                        );
                      }


                      if (line.trim().startsWith('|')) {
                        const cells = line.split('|').map(c => c.trim()).filter(c => c);
                        if (cells.length === 2) {
                          return (
                            <p key={index} className="mb-2">
                              <span className="font-semibold">{cells[0]}:</span> {cells[1]}
                            </p>
                          );
                        }
                        return null;
                      }


                      if (line.match(/\*\*[^*]+\*\*/)) {
                        const headerText = line.replace(/\*\*/g, '');
                        return (
                          <h4 key={index} className="text-lg font-bold mt-4 mb-2 text-indigo-800">
                            {headerText}
                          </h4>
                        );
                      }

                      // Bullet points
                      if (line.trim().startsWith('-')) {
                        const bulletText = line.trim().substring(1).trim();
                        return <li key={index} className="ml-6 mb-1">{bulletText}</li>;
                      }

                      // Numbered list
                      if (line.match(/^\s*\d+\.\s+/)) {
                        const numberText = line.replace(/^\s*\d+\.\s+/, '');
                        return <li key={index} className="ml-8 mb-1 list-decimal">{numberText}</li>;
                      }


                      if (line.match(/(\d+\/(10|50))/)) {
                        return <p key={index} className="font-semibold text-indigo-700 mb-2">{line}</p>;
                      }

                      // Empty line
                      if (line.trim() === '') {
                        return <div key={index} className="h-2"></div>;
                      }

                      // Default paragraph
                      return <p key={index} className="mb-2">{line}</p>;
                    })}

                  </div>
                ) : (
                  <p className="text-gray-600">कोणतेही अहवाल विश्लेषण उपलब्ध नाही</p>
                )}
              </div>

              {/* Download PDF section */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={downloadDetailedReport}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  तपशीलवार अहवाल डाउनलोड करा
                </button>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={downloadDetailedReport}
                  className="bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>तपशीलवार अहवाल डाउनलोड करा</span>
                </button>

                <button
                  onClick={() => setShowFullReport(false)}
                  className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <IoClose className="text-lg" />
                  <span>अहवाल बंद करा</span>
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
            {email && <span className="font-medium">वापरकर्ता: {email}</span>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-center text-4xl md:text-5xl font-bold mb-6 p-4 mt-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
          मुलाखतीतली प्रगती आणि परफॉर्मन्स रेकॉर्ड
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
                        <span className="font-bold text-lg"> {report.role}</span>
                        <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                          {reportVisibility[index] ? 'तपशील डिस्प्ले बंद करा' : 'तपशील शो करा'}
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
                            <p className="text-gray-400 text-sm">पद</p>
                            <p className="font-semibold text-lg">{report.role}</p>
                          </div>
                          {/* <div>
                            <p className="text-gray-400 text-sm">College</p>
                            <p className="font-semibold">{report.collageName || 'Not specified'}</p>
                          </div> */}
                          <div>
                            <p className="text-gray-400 text-sm">तारीख</p>
                            <p className="font-semibold">{new Date(report.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Performance Scores */}
                        <h3 className="text-xl font-bold mb-4 text-blue-300">परफॉर्मन्स स्कोअर्स</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                          {['टेक्निकल स्किल्स', 'कम्युनिकेशन', 'निर्णय क्षमता', 'आत्मविश्वास', 'भाषा प्रावीण्य', 'एकूण गुण'].map((category) => {
                            // Get score and feedback
                            const { score, feedback } = extractScore(report, category);

                            const isOverallScore = category === 'Overall Score';
                            const maxScore = isOverallScore ? 50 : 10;
                            // Ensure score is within valid range (0-10 for individual, 0-50 for overall)
                            let safeScore = Math.min(Math.max(0, score || 0), maxScore);

                            // If we still have a score of 1, which might be a default, try one more time
                            if (safeScore === 1 && !isOverallScore) {
                              // Look for the score in the report text directly
                              const scorePattern = new RegExp(`${category.replace(/[\s-]/g, '[\\s-]*')}[\\s:]*([0-9]+)`, 'i');
                              const match = report.reportAnalysis.match(scorePattern);
                              if (match && match[1]) {
                                const extractedScore = parseInt(match[1], 10);
                                if (!isNaN(extractedScore) && extractedScore > 1) {
                                  safeScore = extractedScore;
                                }
                              }
                            }

                            // Format the score text (e.g., "7/10" or "35/50")
                            const scoreText = isOverallScore ?
                              `${safeScore}/50` : `${safeScore}/10`;

                            // Scale for display (0-10 for all scores in the UI)
                            const displayScore = isOverallScore ?
                              (safeScore / 5) : // Scale 0-50 to 0-10
                              safeScore; // Already 0-10

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
                                      value={displayScore}
                                      maxValue={10}
                                      text={isOverallScore ? `${safeScore}/50` : scoreText}
                                      background
                                      backgroundPadding={6}
                                      styles={buildStyles({
                                        pathColor: isOverallScore
                                          ? 'url(#overallGradient)'
                                          : displayScore >= 7
                                            ? '#4ade80' // Good score (7-10)
                                            : displayScore >= 4
                                              ? '#facc15' // Average score (4-6.9)
                                              : '#f87171', // Poor score (0-3.9)
                                        backgroundColor: '#1f2937',
                                        textColor: '#ffffff',
                                        trailColor: '#374151',
                                        textSize: isOverallScore ? '20px' : '24px',
                                        pathTransitionDuration: 0.5,
                                        strokeLinecap: 'round',
                                        text: {
                                          fontSize: isOverallScore ? '20px' : '24px',
                                          fontWeight: 'bold'
                                        }
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
                                          width: `${(displayScore / (isOverallScore ? 10 : 10)) * 100}%`,
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
                            <span className="relative z-10">संपूर्ण रिपोर्ट पहा</span>
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
                            <span className="relative z-10">PDF रिपोर्ट डाउनलोड करा</span>
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
                  <h3 className="text-2xl font-semibold mb-2">तुमचा रिपोर्ट तयार करत आहे</h3>
                  <p className="text-gray-300">इंटरव्ह्यू रिपोर्ट तयार होण्यास साधारण ५ मिनिटांचा वेळ लागू शकतो. कृपया थोडा वेळ थांबा.</p>
                  <p className="text-gray-400 mt-4">कृपया थोडा वेळ द्या, लवकरच माहिती उपलब्ध होईल!</p>
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