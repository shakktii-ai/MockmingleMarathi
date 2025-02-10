// import React, { useEffect, useState } from 'react';

// function Report() {
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [jobRoleId, setJobRoleId] = useState(null);

//   useEffect(() => {
//     // Only access localStorage after the component is mounted (client-side)
//     const idFromLocalStorage = localStorage.getItem('_idForReport');

//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false); // Stop loading as the necessary data isn't available
//     }
//   }, []); // This useEffect runs only once when the component mounts

//   useEffect(() => {
//     if (!jobRoleId) return; // Don't fetch if we don't have jobRoleId

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);

//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }

//         const data = await response.json();
//         setReportData(data.data); // Assuming data is in `data` field
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
   
//     fetchJobRole();
   
//   }, [jobRoleId]); // This useEffect runs when jobRoleId changes

  
//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   return (
//     <div>
//       <h1>Job Role Report</h1>
//       <div>
//         <h2>Role: {reportData.role}</h2>
//         <h3>Email: {reportData.email}</h3>
//         <div>
//           <h4>Questions</h4>
//           <ul>
//             {reportData.questions?.map((question, index) => (
//               <li key={index}>
//                 <strong>{question.questionText}</strong>
//                 <p>{question.answer || 'No answer provided'}</p>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Report;


// import React, { useEffect, useState } from 'react';
// import { getApiResponseReport } from './api/report';

// function Report() {
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [jobRoleId, setJobRoleId] = useState(null);

//   useEffect(() => {
//     // Only access localStorage after the component is mounted (client-side)
//     const idFromLocalStorage = localStorage.getItem('_idForReport');

//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false); // Stop loading as the necessary data isn't available
//     }
//   }, []); // This useEffect runs only once when the component mounts

//   useEffect(() => {
//     if (!jobRoleId) return; // Don't fetch if we don't have jobRoleId

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);

//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }

//         const data = await response.json();
//         setReportData(data.data); // Assuming data is in `data` field

//         // After reportData is set, call the getApiResponseReport
//         const Reportdata = await getApiResponseReport(data.data);
//         console.log('Fetched Questions:', Reportdata);

//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
   
//     fetchJobRole();
   
//   }, [jobRoleId]); // This useEffect runs when jobRoleId changes

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   return (
//     <div>
//       <h1>Job Role Report</h1>
//       <div>
//         <h2>Role: {reportData.role}</h2>
//         <h3>Email: {reportData.email}</h3>
//         <div>
//           <h4>Questions</h4>
//           <ul>
//             {reportData.questions?.map((question, index) => (
//               <li key={index}>
//                 <strong>{question.questionText}</strong>
//                 <p>{question.answer || 'No answer provided'}</p>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Report;

// import React, { useEffect, useState } from 'react';
// import { getApiResponseReport } from './api/report';

// function Report() {
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [jobRoleId, setJobRoleId] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null); // For dynamic analysis data

//   useEffect(() => {
//     // Only access localStorage after the component is mounted (client-side)
//     const idFromLocalStorage = localStorage.getItem('_idForReport');

//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false); // Stop loading as the necessary data isn't available
//     }
//   }, []); // This useEffect runs only once when the component mounts

//   useEffect(() => {
//     if (!jobRoleId) return; // Don't fetch if we don't have jobRoleId

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);

//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }

//         const data = await response.json();
//         setReportData(data.data); // Assuming data is in `data` field

//         // After reportData is set, call the getApiResponseReport
//         const analysisData = await getApiResponseReport(data.data); // Dynamic analysis data
        
//         // If the analysis data is coming back as an array of characters, we join them into a string
//         if (Array.isArray(analysisData)) {
//           setReportAnalysis(analysisData.join('')); // Convert array of characters into a string
//         } else {
//           setReportAnalysis(analysisData); // Otherwise, just set the data as is
//         }

//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobRole();

//   }, [jobRoleId]); // This useEffect runs when jobRoleId changes

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   // Render dynamic analysis if available
//   return (
//     <div>
//       <h1>Job Role Report</h1>
//       <div>
//         <h2>Role: {reportData.role}</h2>
//         <h3>Email: {reportData.email}</h3>

//         <div>
//           <h4>Questions</h4>
//           <ul>
//             {reportData.questions?.map((question, index) => (
//               <li key={index}>
//                 <strong>{question.questionText}</strong>
//                 <p>{question.answer || 'No answer provided'}</p>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Render dynamic analysis */}
//         {reportAnalysis && (
//           <div>
//             <h4>Analysis</h4>
//             <p>{reportAnalysis}</p> {/* Display the analysis as a paragraph */}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Report;
    

// import React, { useEffect, useState } from 'react';
// import { getApiResponseReport } from './api/report';

// function Report() {
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [jobRoleId, setJobRoleId] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null); // For dynamic analysis data

//   useEffect(() => {
//     // Only access localStorage after the component is mounted (client-side)
//     const idFromLocalStorage = localStorage.getItem('_idForReport');

//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false); // Stop loading as the necessary data isn't available
//     }
//   }, []); // This useEffect runs only once when the component mounts

//   useEffect(() => {
//     if (!jobRoleId) return; // Don't fetch if we don't have jobRoleId

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);

//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }

//         const data = await response.json();
//         setReportData(data.data); // Assuming data is in `data` field

//         // After reportData is set, call the getApiResponseReport
//         const analysisData = await getApiResponseReport(data.data); // Dynamic analysis data
        
//         // If the analysis data is coming back as an array of characters, we join them into a string
//         if (Array.isArray(analysisData)) {
//           setReportAnalysis(analysisData.join('')); // Convert array of characters into a string
//         } else {
//           setReportAnalysis(analysisData); // Otherwise, just set the data as is
//         }

//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobRole();

//   }, [jobRoleId]); // This useEffect runs when jobRoleId changes

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   // Render dynamic analysis if available
//   return (
//     <div>
//       <h1>Job Role Report</h1>
//       <div>
//         <h2>Role: {reportData.role}</h2>
//         <h3>Email: {reportData.email}</h3>

//         <div>
//           <h4>Questions</h4>
//           <ul>
//             {reportData.questions?.map((question, index) => (
//               <li key={index}>
//                 <strong>{question.questionText}</strong>
//                 <p>{question.answer || 'No answer provided'}</p>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Render dynamic analysis */}
//         {reportAnalysis && (
//           <div>
//             <h4>Analysis</h4>
//             <p>{reportAnalysis.replace(/The user's/g, "You'r")}</p> {/* Replace "The user's" with "My" */}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Report;


// import React, { useEffect, useState } from 'react';
// import { getApiResponseReport } from './api/report';

// function Report() {
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [jobRoleId, setJobRoleId] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null); // For dynamic analysis data

//   useEffect(() => {
//     // Only access localStorage after the component is mounted (client-side)
//     const idFromLocalStorage = localStorage.getItem('_idForReport');

//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false); // Stop loading as the necessary data isn't available
//     }
//   }, []); // This useEffect runs only once when the component mounts

//   useEffect(() => {
//     if (!jobRoleId) return; // Don't fetch if we don't have jobRoleId

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);

//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }

//         const data = await response.json();
//         setReportData(data.data); // Assuming data is in `data` field

//         // After reportData is set, call the getApiResponseReport
//         const analysisData = await getApiResponseReport(data.data); // Dynamic analysis data
        
//         // If the analysis data is coming back as an array of characters, we join them into a string
//         if (Array.isArray(analysisData)) {
//           setReportAnalysis(analysisData.join('')); // Convert array of characters into a string
//         } else {
//           setReportAnalysis(analysisData); // Otherwise, just set the data as is
//         }

//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobRole();

//   }, [jobRoleId]); // This useEffect runs when jobRoleId changes

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   // Render dynamic analysis if available
//   return (
//     <div>
//       <h1>Job Role Report</h1>
//       <div>
//         <h2><strong>Role:</strong> {reportData.role}</h2>
//         <h3><strong>Email:</strong> {reportData.email}</h3>

//         <div>
//           <h4><strong>Questions</strong></h4>
//           <ul>
//             {reportData.questions?.map((question, index) => (
//               <li key={index}>
//                 <strong>{question.questionText}</strong>
//                 <p>{question.answer || 'No answer provided'}</p>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Render dynamic analysis */}
//         {reportAnalysis && (
//           <div>
//             <h4><strong>Analysis</strong></h4>
//             <p>{reportAnalysis.replace(/The user's/g, "You'r")}</p> {/* Replace "The user's" with "You'r" */}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Report;


// import React, { useEffect, useState } from 'react';
// import { getApiResponseReport } from './api/report';

// function Report() {
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [jobRoleId, setJobRoleId] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null); // For dynamic analysis data

//   useEffect(() => {
//     // Only access localStorage after the component is mounted (client-side)
//     const idFromLocalStorage = localStorage.getItem('_idForReport');

//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false); // Stop loading as the necessary data isn't available
//     }
//   }, []); // This useEffect runs only once when the component mounts

//   useEffect(() => {
//     if (!jobRoleId) return; // Don't fetch if we don't have jobRoleId

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);

//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }

//         const data = await response.json();
//         setReportData(data.data); // Assuming data is in `data` field

//         // After reportData is set, call the getApiResponseReport
//         const analysisData = await getApiResponseReport(data.data); // Dynamic analysis data
        
//         // If the analysis data is coming back as an array of characters, we join them into a string
//         if (Array.isArray(analysisData)) {
//           setReportAnalysis(analysisData.join('')); // Convert array of characters into a string
//         } else {
//           setReportAnalysis(analysisData); // Otherwise, just set the data as is
//         }

//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobRole();

//   }, [jobRoleId]); // This useEffect runs when jobRoleId changes

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   // Render dynamic analysis if available
//   return (
//     <div>
//       <h1>Job Role Report</h1>
//       <div>
//         <h2><strong>Role:</strong> {reportData.role}</h2>
//         <h3><strong>Email:</strong> {reportData.email}</h3>

//         <div>
//           <h4><strong>Questions</strong></h4>
//           <ul>
//             {reportData.questions?.map((question, index) => (
//               <li key={index}>
//                 <strong>{question.questionText}</strong>
//                 <p>{question.answer || 'No answer provided'}</p>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Render dynamic analysis */}
//         {reportAnalysis && (
//   <div>
//     <h4><strong>Analysis</strong></h4>
//     <p
//       dangerouslySetInnerHTML={{
//         __html: reportAnalysis
//           .replace(/The user's/g, "You'r") // Replace "The user's" with "You'r"
//           .replace(
//             /\*\*(.*?)\*\*/g, // This regex matches text wrapped in ** **
//             (match, p1) => `</br><strong>${p1}</strong></br>` // Replace with <strong> tags
//           ) .replace(/\*/g, ''),
//       }}
//     />
//   </div>
// )}


//       </div>
//     </div>
//   );
// }

// export default Report;


// import React, { useEffect, useState } from 'react';
// import { getApiResponseReport } from './api/report';

// function Report() {
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [jobRoleId, setJobRoleId] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null); // For dynamic analysis data

//   useEffect(() => {
//     // Only access localStorage after the component is mounted (client-side)
//     const idFromLocalStorage = localStorage.getItem('_idForReport');

//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false); // Stop loading as the necessary data isn't available
//     }
//   }, []); // This useEffect runs only once when the component mounts

//   useEffect(() => {
//     if (!jobRoleId) return; // Don't fetch if we don't have jobRoleId

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);

//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }

//         const data = await response.json();
//         setReportData(data.data); // Assuming data is in `data` field

//         // After reportData is set, call the getApiResponseReport
//         const analysisData = await getApiResponseReport(data.data); // Dynamic analysis data
        
//         // If the analysis data is coming back as an array of characters, we join them into a string
//         if (Array.isArray(analysisData)) {
//           setReportAnalysis(analysisData.join('')); // Convert array of characters into a string
//         } else {
//           setReportAnalysis(analysisData); // Otherwise, just set the data as is
//         }

//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobRole();

//   }, [jobRoleId]); // This useEffect runs when jobRoleId changes

//   // Function to trigger the download
//   const downloadReport = () => {
//     const blob = new Blob([reportAnalysis], { type: 'text/plain' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report-analysis.txt'; // File name for the download
//     link.click();
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   // Render dynamic analysis if available
//   return (
//     <div>
//       <h1>Job Role Report</h1>
//       <div>
//         <h2><strong>Role:</strong> {reportData.role}</h2>
//         <h3><strong>Email:</strong> {reportData.email}</h3>

//         <div>
//           <h4><strong>Questions</strong></h4>
//           <ul>
//             {reportData.questions?.map((question, index) => (
//               <li key={index}>
//                 <strong>{question.questionText}</strong>
//                 <p>{question.answer || 'No answer provided'}</p>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Render dynamic analysis */}
//         {reportAnalysis && (
//           <div>
//             <h4><strong>Analysis</strong></h4>
//             <p
//               dangerouslySetInnerHTML={{
//                 __html: reportAnalysis
//                   .replace(/The user's/g, "You'r") // Replace "The user's" with "You'r"
//                   .replace(
//                     /\*\*(.*?)\*\*/g, // This regex matches text wrapped in ** **
//                     (match, p1) => `</br><strong>${p1}</strong></br>` // Replace with <strong> tags
//                   )
//                   .replace(/\*/g, ''),
//               }}
//             />
//             <button onClick={downloadReport}>Download Report</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Report;



// import React, { useEffect, useState } from 'react';
// import { getApiResponseReport } from './api/report';

// function Report() {
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [jobRoleId, setJobRoleId] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null); // For dynamic analysis data

//   useEffect(() => {
//     // Only access localStorage after the component is mounted (client-side)
//     const idFromLocalStorage = localStorage.getItem('_idForReport');

//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false); // Stop loading as the necessary data isn't available
//     }
//   }, []); // This useEffect runs only once when the component mounts

//   useEffect(() => {
//     if (!jobRoleId) return; // Don't fetch if we don't have jobRoleId

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);

//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }

//         const data = await response.json();
//         setReportData(data.data); // Assuming data is in `data` field

//         // After reportData is set, call the getApiResponseReport
//         const analysisData = await getApiResponseReport(data.data); // Dynamic analysis data
        
//         // If the analysis data is coming back as an array of characters, we join them into a string
//         if (Array.isArray(analysisData)) {
//           setReportAnalysis(analysisData.join('')); // Convert array of characters into a string
//         } else {
//           setReportAnalysis(analysisData); // Otherwise, just set the data as is
//         }

//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobRole();

//   }, [jobRoleId]); // This useEffect runs when jobRoleId changes

//   // Function to trigger the download with formatted HTML content
//   const downloadReport = () => {
//     // Format the HTML content as it's being rendered
//     const formattedHTML = reportAnalysis
//       .replace(/The user's/g, "You'r") // Replace "The user's" with "You'r"
//       .replace(
//         /\*\*(.*?)\*\*/g, // This regex matches text wrapped in ** **
//         (match, p1) => `<strong>${p1}</strong>` // Replace with <strong> tags
//       )
//       .replace(/\*/g, ''); // Remove single asterisks if needed

//     // Create the complete HTML structure
//     const htmlContent = `
//       <html>
//         <head>
//           <title>Report Analysis</title>
//         </head>
//         <body>
//           ${formattedHTML}
//         </body>
//       </html>
//     `;

//     // Create a Blob with the HTML content
//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report-analysis.html'; // File name for the download
//     link.click();
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   // Render dynamic analysis if available
//   return (
//     <div>
//       <h1>Job Role Report</h1>
//       <div>
//         <h2><strong>Role:</strong> {reportData.role}</h2>
//         <h3><strong>Email:</strong> {reportData.email}</h3>

//         <div>
//           <h4><strong>Questions</strong></h4>
//           <ul>
//             {reportData.questions?.map((question, index) => (
//               <li key={index}>
//                 <strong>{question.questionText}</strong>
//                 <p>{question.answer || 'No answer provided'}</p>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Render dynamic analysis */}
//         {reportAnalysis && (
//           <div>
//             <h4><strong>Analysis</strong></h4>
//             <p
//               dangerouslySetInnerHTML={{
//                 __html: reportAnalysis
//                   .replace(/The user's/g, "You'r") // Replace "The user's" with "You'r"
//                   .replace(
//                     /\*\*(.*?)\*\*/g, // This regex matches text wrapped in ** **
//                     (match, p1) => `</br><strong>${p1}</strong></br>` // Replace with <strong> tags
//                   )
//                   .replace(/\*/g, ''),
//               }}
//             />
//             <button onClick={downloadReport}>Download Report</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Report;



// import React, { useEffect, useState } from 'react';
// import { getApiResponseReport } from './api/report';

// function Report() {
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [jobRoleId, setJobRoleId] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null); // For dynamic analysis data

//   useEffect(() => {
//     // Only access localStorage after the component is mounted (client-side)
//     const idFromLocalStorage = localStorage.getItem('_idForReport');

//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false); // Stop loading as the necessary data isn't available
//     }
//   }, []); // This useEffect runs only once when the component mounts

//   useEffect(() => {
//     if (!jobRoleId) return; // Don't fetch if we don't have jobRoleId

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);

//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }

//         const data = await response.json();
//         setReportData(data.data); // Assuming data is in `data` field

//         // After reportData is set, call the getApiResponseReport
//         const analysisData = await getApiResponseReport(data.data); // Dynamic analysis data
        
//         // If the analysis data is coming back as an array of characters, we join them into a string
//         if (Array.isArray(analysisData)) {
//           setReportAnalysis(analysisData.join('')); // Convert array of characters into a string
//         } else {
//           setReportAnalysis(analysisData); // Otherwise, just set the data as is
//         }

//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobRole();

//   }, [jobRoleId]); // This useEffect runs when jobRoleId changes

//   // Function to trigger the download with formatted HTML content
//   const downloadReport = () => {
//     // Format the HTML content as it's being rendered
//     const formattedHTML = reportAnalysis
//       .replace(/The user's/g, "You'r") // Replace "The user's" with "You'r"
//       .replace(
//         /\*\*(.*?)\*\*/g, // This regex matches text wrapped in ** **
//         (match, p1) => `</br><strong>${p1}</strong></br>` // Replace with <strong> tags
//       )
//       .replace(/\*/g, ''); // Remove single asterisks if needed

//     // Create the complete HTML structure
//     const htmlContent = `
//       <html>
//         <head>
//           <title>Report Analysis</title>
//         </head>
//         <body>
//           ${formattedHTML}
//         </body>
//       </html>
//     `;

//     // Create a Blob with the HTML content
//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report-analysis.html'; // File name for the download
//     link.click();
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   // Render dynamic analysis if available
//   return (
//     <div>
//       <h1>Job Role Report</h1>
//       <div>
//         <h2><strong>Role:</strong> {reportData.role}</h2>
//         <h3><strong>Email:</strong> {reportData.email}</h3>

//         <div>
//           <h4><strong>Questions</strong></h4>
//           <ul>
//             {reportData.questions?.map((question, index) => (
//               <li key={index}>
//                 <strong>{question.questionText}</strong>
//                 <p>{question.answer || 'No answer provided'}</p>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Render dynamic analysis */}
//         {reportAnalysis && (
//   <div>
//     <h4><strong>Analysis</strong></h4>
//     <div
//       dangerouslySetInnerHTML={{
//         __html: reportAnalysis
//           .replace(/The user's/g, "You'r") // Replace "The user's" with "You'r"
//           .replace(
//             /\*\*(.*?)\*\*/g, // This regex matches text wrapped in ** **
//             (match, p1) => `</br><strong>${p1}</strong></br>` // Replace with <strong> tags
//           )
//           .replace(/\*/g, '')
//           .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong>') // Bold the overall score
//           .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>') // Bold report titles
//           .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>') // Bold "Recommendation"
//       }}
//     />
//     <button onClick={downloadReport}>Download Report</button>
//   </div>
// )}

//       </div>
//     </div>
//   );
// }

// export default Report;


// import React, { useEffect, useState } from 'react';
// import { getApiResponseReport } from './api/report';
// // import './Report.css'; // Make sure to create the corresponding CSS file

// function Report() {
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [jobRoleId, setJobRoleId] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null);

//   useEffect(() => {
//     const idFromLocalStorage = localStorage.getItem('_idForReport');
//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!jobRoleId) return;

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const data = await response.json();
//         setReportData(data.data);

//         const analysisData = await getApiResponseReport(data.data);
//         setReportAnalysis(analysisData);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobRole();
//   }, [jobRoleId]);

//   const downloadReport = () => {
//     const formattedHTML = reportAnalysis
//     .replace(/The user's/g, "You'r")
//     .replace(/\*\*(.*?)\*\*/g, (match, p1) => `</br><strong>${p1}</strong>`)
//     .replace(/\*/g, '')
//     .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//     .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//     .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//     .replace(/(\.)/g, '.<br>')

//     const htmlContent = `
//       <html>
//         <head><title>Report Analysis</title></head>
//         <body>
//           ${formattedHTML}
//         </body>
//       </html>
//     `;

//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report-analysis.html';
//     link.click();
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   return (
//     <div className="report-container">
//       <h1>Job Role Report</h1>
//       <div>
//         <h2><strong>Role:</strong> {reportData.role}</h2>
//         <h3><strong>Email:</strong> {reportData.email}</h3>

//         {reportAnalysis && (
//           <div className="report-analysis">
//             <h4><strong>Analysis</strong></h4>
//             <div
//               className="analysis-content"
//               dangerouslySetInnerHTML={{
//                 __html: reportAnalysis
//                   .replace(/The user's/g, "You'r")
//                   .replace(/\*\*(.*?)\*\*/g, (match, p1) => `<strong>${p1}</strong>`)
//                   .replace(/\*/g, '')
//                   .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong>')
//                   .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                   .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                   .replace(/(\.)/g, '.<br>') // Add a line break after every period
//               }}
//             />
//             <button onClick={downloadReport}>Download Report</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Report;


// import React, { useEffect, useState } from 'react';
// import { getApiResponseReport } from './api/report';
// // import './Report.css'; // Make sure to create the corresponding CSS file

// function Report() {
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [jobRoleId, setJobRoleId] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null);

//   useEffect(() => {
//     const idFromLocalStorage = localStorage.getItem('_idForReport');
//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!jobRoleId) return;

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const data = await response.json();
//         setReportData(data.data);

//         const analysisData = await getApiResponseReport(data.data);
//         setReportAnalysis(analysisData);

//         // After receiving reportAnalysis, send it to storeReport API
//         await storeReport(analysisData);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobRole();
//   }, [jobRoleId]);

//   const storeReport = async (reportData) => {
//     try {
//       const response = await fetch('/api/storeReport', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ report: reportData }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to store report');
//       }

//       const result = await response.json();
//       console.log('Report stored successfully:', result);
//     } catch (err) {
//       console.error('Error storing report:', err);
//     }
//   };

//   const downloadReport = () => {
//     const formattedHTML = reportAnalysis
//       .replace(/The user's/g, "You'r")
//       .replace(/\*\*(.*?)\*\*/g, (match, p1) => `</br><strong>${p1}</strong>`)
//       .replace(/\*/g, '')
//       .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//       .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//       .replace(/(\.)/g, '.<br>')

//     const htmlContent = `
//       <html>
//         <head><title>Report Analysis</title></head>
//         <body>
//           ${formattedHTML}
//         </body>
//       </html>
//     `;

//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report-analysis.html';
//     link.click();
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   return (
//     <div className="report-container">
//       <h1>Job Role Report</h1>
//       <div>
//         <h2><strong>Role:</strong> {reportData.role}</h2>
//         <h3><strong>Email:</strong> {reportData.email}</h3>

//         {reportAnalysis && (
//           <div className="report-analysis">
//             <h4><strong>Analysis</strong></h4>
//             <div
//               className="analysis-content"
//               dangerouslySetInnerHTML={{
//                 __html: reportAnalysis
//                   .replace(/The user's/g, "You'r")
//                   .replace(/\*\*(.*?)\*\*/g, (match, p1) => `<strong>${p1}</strong>`)
//                   .replace(/\*/g, '')
//                   .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong>')
//                   .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                   .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                   .replace(/(\.)/g, '.<br>') // Add a line break after every period
//               }}
//             />
//             <button onClick={downloadReport}>Download Report</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Report;

// import React, { useEffect, useState } from 'react';
// import { getApiResponseReport } from './api/report';
// // import './Report.css'; // Make sure to create the corresponding CSS file

// function Report() {
//   const [reportData, setReportData] = useState(null);
//   const [email, setEmail] = useState('');
//   const [jobRole, setJobRole] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [jobRoleId, setJobRoleId] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null);

//   useEffect(() => {
//     const idFromLocalStorage = localStorage.getItem('_idForReport');
//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!jobRoleId) return;

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const data = await response.json();
//         setReportData(data.data);
        
//         const analysisData = await getApiResponseReport(data.data);
//         setReportAnalysis(analysisData);
        
//         // After receiving reportAnalysis, send role, email, and reportAnalysis to storeReport API
//         await storeReport(analysisData);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobRole();
//   }, [jobRoleId]);


//   setEmail(data.data.email)
//         setJobRole(data.data.role)
//   const storeReport = async (role, email, reportAnalysis) => {
//     try {
//       const response = await fetch('/api/storeReport', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           role,       // Include the role
//           email,      // Include the email
//           report: reportAnalysis,  // Include the report analysis
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to store report');
//       }

//       const result = await response.json();
//       console.log('Report stored successfully:', result);
//     } catch (err) {
//       console.error('Error storing report:', err);
//     }
//   };

//   const downloadReport = () => {
//     const formattedHTML = reportAnalysis
//       .replace(/The user's/g, "You'r")
//       .replace(/\*\*(.*?)\*\*/g, (match, p1) => `</br><strong>${p1}</strong>`)
//       .replace(/\*/g, '')
//       .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//       .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//       .replace(/(\.)/g, '.<br>')

//     const htmlContent = `
//       <html>
//         <head><title>Report Analysis</title></head>
//         <body>
//           ${formattedHTML}
//         </body>
//       </html>
//     `;

//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report-analysis.html';
//     link.click();
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   return (
//     <div className="report-container">
//       <h1>Job Role Report</h1>
//       <div>
//         <h2><strong>Role:</strong> {reportData.role}</h2>
//         <h3><strong>Email:</strong> {reportData.email}</h3>

//         {reportAnalysis && (
//           <div className="report-analysis">
//             <h4><strong>Analysis</strong></h4>
//             <div
//               className="analysis-content"
//               dangerouslySetInnerHTML={{
//                 __html: reportAnalysis
//                   .replace(/The user's/g, "You'r")
//                   .replace(/\*\*(.*?)\*\*/g, (match, p1) => `<strong>${p1}</strong>`)
//                   .replace(/\*/g, '')
//                   .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong>')
//                   .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                   .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                   .replace(/(\.)/g, '.<br>') // Add a line break after every period
//               }}
//             />
//             <button onClick={downloadReport}>Download Report</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Report;



// import React, { useEffect, useState } from 'react'; 
// import { getApiResponseReport } from './api/report'; 
// // import '../styles/Home.module.css'; // Make sure to create the corresponding CSS file 

// function Report() { 
//   const [openReport, setOpenReport] = useState(false);

//   const toggleVisibility = () => {
//     setOpenReport(!openReport);
//   };
//     const [reportData, setReportData] = useState(null); 
//     const [email, setEmail] = useState(''); 
//     const [jobRole, setJobRole] = useState(''); 
//     const [loading, setLoading] = useState(true); 
//     const [error, setError] = useState(null); 
//     const [jobRoleId, setJobRoleId] = useState(null); 
//     const [reportAnalysis, setReportAnalysis] = useState(null);

//     useEffect(() => {
//         const idFromLocalStorage = localStorage.getItem('_idForReport');
//         if (idFromLocalStorage) {
//             setJobRoleId(idFromLocalStorage);
//         } else {
//             setError('Missing job role ID');
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         if (!jobRoleId) return;

//         const fetchJobRole = async () => {
//             try {
//                 const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch data');
//                 }
//                 const data = await response.json();
//                 setReportData(data.data);

//                 const analysisData = await getApiResponseReport(data.data);
//                 setReportAnalysis(analysisData);

//                 // Set the email and role before calling storeReport
//                 setEmail(data.data.email);
//                 setJobRole(data.data.role);

//                 // Now pass email, role, and reportAnalysis to storeReport
//                 await storeReport(data.data.role, data.data.email, analysisData);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchJobRole();
//     }, [jobRoleId]);

//     const storeReport = async (jobRole, email, reportAnalysis) => {
//         try {
//             const response = await fetch('/api/storeReport', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     role:jobRole,      // Include the role
//                     email,     // Include the email
//                     reportAnalysis,  // Include the report analysis
//                 }),
//             });
//             // localStorage.removeItem('_idForReport')
//             if (!response.ok) {
//                 throw new Error('Failed to store report');
//             }

//             const result = await response.json();
//             console.log('Report stored successfully:', result);
//         } catch (err) {
//             console.error('Error storing report:', err);
//         }
//     };

    

//     const downloadReport = () => {
//         const formattedHTML = reportAnalysis
//             .replace(/The user's/g, "You'r")
//             .replace(/\*\*(.*?)\*\*/g, (match, p1) => `</br><strong>${p1}</strong>`)
//             .replace(/\*/g, '')
//             .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//             .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//             .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//             .replace(/(\.)/g, '.<br>') // Add a line break after every period
        
//         const htmlContent = `
//             <html>
//                 <head><title>Report Analysis</title></head>
//                 <body>
//                     ${formattedHTML}
//                 </body>
//             </html>
//         `;

//         const blob = new Blob([htmlContent], { type: 'text/html' });
//         const link = document.createElement('a');
//         link.href = URL.createObjectURL(blob);
//         link.download = 'report-analysis.html';
//         link.click();
//     };

//     if (loading) {
//         return <div>Loading...</div>;
//     }

//     if (error) {
//         return <div>Error: {error}</div>;
//     }

//     if (!reportData) {
//         return <div>No job role data found</div>;
//     }

//     return (
//       <>
//         <div className="report-container">
//             <h1>Job Role Report</h1>
//             <div>
//                 <h2><strong>Role:</strong> {jobRole}</h2>
//                 <h3><strong>Email:</strong> {reportData.email}</h3>

                
//             </div>
//         </div>

//         <div className="max-w-md mx-auto mt-5">
//         {/* Report Section */}
//         <div 
//           className="bg-purple-700 p-4 rounded-lg mt-2 cursor-pointer"
//           onClick={toggleVisibility}
//         >
//           Report ▼
//         </div>
//         {openReport && (
//           <div className="bg-purple-600 p-4 rounded-lg mt-2">
//             {reportAnalysis && (
//                     <div className="report-analysis">
//                         <h4><strong>Analysis</strong></h4>
//                         <div
//                             className="analysis-content"
//                             dangerouslySetInnerHTML={{
//                                 __html: reportAnalysis
//                                     .replace(/The user's/g, "You'r")
//                                     // .replace(/\*\*(.*?)\*\*/g, (match, p1) => `<strong>${p1}</strong>`)
//                                     .replace(/\*/g, '')
//                                     .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//                                     .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                                     .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                                     .replace(/(\.)/g, '.<br>') // Add a line break after every period
//                             }}
//                         />
//                         <button onClick={downloadReport}>Download Report</button>
//                     </div>
//                 )}
//           </div>
//         )}
//       </div>
    
        
//         </>
//     );
// }

// export default Report;

// import React, { useEffect, useState } from 'react'; 
// import { getApiResponseReport } from './api/report'; 

// function Report() { 
//   const [openReport, setOpenReport] = useState(false);
//   const [reportData, setReportData] = useState(null); 
//   const [email, setEmail] = useState(''); 
//   const [jobRole, setJobRole] = useState(''); 
//   const [loading, setLoading] = useState(true); 
//   const [error, setError] = useState(null); 
//   const [jobRoleId, setJobRoleId] = useState(null); 
//   const [reportAnalysis, setReportAnalysis] = useState(null);
//   const [reports, setReports] = useState([]);  // Initialize reports state

//   const toggleVisibility = () => {
//     setOpenReport(!openReport);
//   };

//   // useEffect(() => {
//   //   if (!email) return;
//   //   console.log('Fetching reports for email:', email);
//   //   const fetchReportsByEmail = async () => {
//   //     try {
//   //       const response = await fetch(`/api/storeReport?email=${email}`);
//   //       if (!response.ok) {
//   //         throw new Error('Failed to fetch reports');
//   //       }
//   //       const data = await response.json();
//   //       console.log('Fetched reports:', data);  // Log the response to check the data
//   //       setReports(data.reports);
//   //     } catch (err) {
//   //       setError(err.message);
//   //     } finally {
//   //       setLoading(false);  // Mark loading as complete after fetching reports
//   //     }
//   //   };
    

//   //   fetchReportsByEmail();
//   // }, [email]);


//   useEffect(() => {
//     if (!email) {
//       return;  // Exit early if email is not yet set
//     }
  
//     console.log('Fetching reports for email:', email);  // Log email to check if it's correct
  
//     const fetchReportsByEmail = async () => {
//       try {
//         const response = await fetch(`/api/storeReport?email=${email}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch reports');
//         }
//         const data = await response.json();
//         console.log('Fetched reports:', data);  // Log the response to check the data
  
//         // Ensure the reports are set only if they exist
//         if (data.reports && data.reports.length > 0) {
//           setReports(data.reports);
//         } else {
//           console.log('No reports available for the given email.');
//           setReports([]);  // No reports found, so set to an empty array
//         }
//       } catch (err) {
//         console.error('Error fetching reports:', err);
//         setError(err.message);
//       } finally {
//         setLoading(false);  // Stop loading regardless of success or failure
//       }
//     };
  
//     fetchReportsByEmail();
//   }, [email]);  // This effect only runs when 'email' changes
  
//   useEffect(() => {
//     const idFromLocalStorage = localStorage.getItem('_idForReport');
//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!jobRoleId) return;

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const data = await response.json();
//         setReportData(data.data);

//         const analysisData = await getApiResponseReport(data.data);
//         setReportAnalysis(analysisData);

//         setEmail(data.data.email);
//         setJobRole(data.data.role);

//         await storeReport(data.data.role, data.data.email, analysisData);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);  // Mark loading as complete after data is fetched
//       }
//     };

//     fetchJobRole();
//   }, [jobRoleId]);

//   const storeReport = async (jobRole, email, reportAnalysis) => {
//     try {
//       const response = await fetch('/api/storeReport', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           role: jobRole,
//           email,
//           reportAnalysis,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to store report');
//       }

//       const result = await response.json();
//       console.log('Report stored successfully:', result);
//     } catch (err) {
//       console.error('Error storing report:', err);
//     }
//   };

  

//   const downloadReport = (reportAnalysis) => {
//     const formattedHTML = reportAnalysis
//       .replace(/The user's/g, "You'r")
//       .replace(/\*\*(.*?)\*\*/g, (match, p1) => `</br><strong>${p1}</strong>`)
//       .replace(/\*/g, '')
//       .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>') // Make these headings bold
//           .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//       .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//       .replace(/(\.)/g, '.<br>');

//     const htmlContent = `
//       <html>
//         <head><title>Report Analysis</title></head>
//         <body>
//           ${formattedHTML}
//         </body>
//       </html>
//     `;

//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report-analysis.html';
//     link.click();
//   };

 

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   return (
//     <div className="report-container">
//       <h1>Job Role Report</h1>
//       <div>
//         <h2><strong>Role:</strong> {reportData.jobRole}</h2>
//         <h3><strong>Email:</strong> {reportData.email}</h3>
//       </div>

//       <div className="max-w-md mx-auto mt-5">
//         {/* Report Section */}
//         <div 
//           className="bg-purple-700 p-4 rounded-lg mt-2 cursor-pointer"
//           onClick={toggleVisibility}
//         >
//           Report ▼
//         </div>
//         {openReport && (
//           <div className="bg-purple-600 p-4 rounded-lg mt-2">
//             {reportAnalysis && (
//               <div className="report-analysis">
//                 <h4><strong>Analysis</strong></h4>
//                 <div
//                   className="analysis-content"
//                   dangerouslySetInnerHTML={{
//                     __html: reportAnalysis
//                       .replace(/The user's/g, "You'r")
//                       .replace(/\*/g, '')
//                       .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//                       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>') // Make these headings bold
//           .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                       .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                       .replace(/(\.)/g, '.<br>'),
//                   }}
//                 />
//                 <button onClick={() => downloadReport(reportAnalysis)}>Download Report</button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {reports.length > 0 ? (
//           reports.map((report, index) => (
//             <div key={index} className="bg-purple-600 p-4 rounded-lg mt-2">
//               <h2><strong>Role:</strong> {report.role}</h2>
//               <h3><strong>Email:</strong> {report.email}</h3>
//               <div className="report-analysis">
//                 <h4><strong>Analysis</strong></h4>
//                 <div
//                   className="analysis-content"
//                   dangerouslySetInnerHTML={{
//                     __html: report.reportAnalysis
//                       .replace(/The user's/g, "You'r")
//                       .replace(/\*/g, '')
//                       .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//                       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>') // Make these headings bold
//           .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                       .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                       .replace(/(\.)/g, '.<br>'),
//                   }}
//                 />
//                 <button onClick={() => downloadReport(report.reportAnalysis)}>
//                   Download Report
//                 </button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div>No reports available.</div> // Show a message if no reports are found
//         )}
      
//     </div>
//   );
// }

// export default Report;


// import React, { useEffect, useState } from 'react'; 
// import { getApiResponseReport } from './api/report'; 

// function Report() { 
//   const [openReport, setOpenReport] = useState(false);
//   const [reportData, setReportData] = useState(null); 
//   const [email, setEmail] = useState(''); 
//   const [jobRole, setJobRole] = useState(''); 
//   const [loading, setLoading] = useState(true); 
//   const [error, setError] = useState(null); 
//   const [jobRoleId, setJobRoleId] = useState(null); 
//   const [reportAnalysis, setReportAnalysis] = useState(null);
//   const [reports, setReports] = useState([]);  // Initialize reports state
//   const [isEmailFetched, setIsEmailFetched] = useState(false);  // New state to track email fetching completion

//   const toggleVisibility = () => {
//     setOpenReport(!openReport);
//   };

//   // Fetch reports by email only if email is available and email fetching is completed
//   useEffect(() => {
//     if (!email || !isEmailFetched) {
//       return;  // Exit early if email is not yet set or email fetch is incomplete
//     }

//     console.log('Fetching reports for email:', email);  // Log email to check if it's correct

//     const fetchReportsByEmail = async () => {
//       try {
//         const response = await fetch(`/api/storeReport?email=${email}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch reports');
//         }
//         const data = await response.json();
//         console.log('Fetched reports:', data);  // Log the response to check the data

//         // Ensure the reports are set only if they exist
//         if (data.reports && data.reports.length > 0) {
//           setReports(data.reports);
//         } else {
//           console.log('No reports available for the given email.');
//           setReports([]);  // No reports found, so set to an empty array
//         }
//       } catch (err) {
//         console.error('Error fetching reports:', err);
//         setError(err.message);
//       } finally {
//         setLoading(false);  // Stop loading regardless of success or failure
//       }
//     };

//     fetchReportsByEmail();
//   }, [email, isEmailFetched]);  // This effect only runs when 'email' and 'isEmailFetched' are ready

//   // Fetch job role data and set email, job role, and analysis
//   useEffect(() => {
//     const idFromLocalStorage = localStorage.getItem('_idForReport');
//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!jobRoleId) return;

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const data = await response.json();
//         setReportData(data.data);

//         const analysisData = await getApiResponseReport(data.data);
//         setReportAnalysis(analysisData);

//         setEmail(data.data.email);  // Set email here
//         setJobRole(data.data.role);

//         await storeReport(data.data.role, data.data.email, analysisData);

//         setIsEmailFetched(true);  // Mark email as fetched
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);  // Mark loading as complete after data is fetched
//       }
//     };

//     fetchJobRole();
//   }, [jobRoleId]);

//   const storeReport = async (jobRole, email, reportAnalysis) => {
//     try {
//       const response = await fetch('/api/storeReport', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           role: jobRole,
//           email,
//           reportAnalysis,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to store report');
//       }

//       const result = await response.json();
//       console.log('Report stored successfully:', result);
//     } catch (err) {
//       console.error('Error storing report:', err);
//     }
//   };

//   const downloadReport = (reportAnalysis) => {
//     const formattedHTML = reportAnalysis
//       .replace(/The user's/g, "You'r")
//       .replace(/\*\*(.*?)\*\*/g, (match, p1) => `</br><strong>${p1}</strong>`)
//       .replace(/\*/g, '')
//       .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>') // Make these headings bold
//       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//       .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//       .replace(/(\.)/g, '.<br>');

//     const htmlContent = `
//       <html>
//         <head><title>Report Analysis</title></head>
//         <body>
//           ${formattedHTML}
//         </body>
//       </html>
//     `;

//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report-analysis.html';
//     link.click();
//   };

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   return (
//     <div className="report-container text-white" style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <h1>Job Role Report</h1>
//       <div>
//         <h2><strong>Role:</strong> {reportData.role}</h2>
//         <h3><strong>Email:</strong> {reportData.email}</h3>
//       </div>

//       <div className=" mx-auto mt-5">
//         {/* Report Section */}
//         <div 
//           className="bg-purple-700 p-4 rounded-lg mt-2 cursor-pointer"
//           onClick={toggleVisibility}
//         >
//           Report ▼
//         </div>
//         {openReport && (
//           <div className="bg-transparent p-4 rounded-lg mt-2">
//             {reportAnalysis && (
//               <div className="report-analysis">
//                 <h4><strong>Analysis</strong></h4>
//                 <div
//                   className="analysis-content"
//                   dangerouslySetInnerHTML={{
//                     __html: reportAnalysis
//                       .replace(/The user's/g, "You'r")
//                       .replace(/\*/g, '')
//                       .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//                       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>') // Make these headings bold
//                       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                       .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                       .replace(/(\.)/g, '.<br>'),
//                   }}
//                 />
//                 <button onClick={() => downloadReport(reportAnalysis)}>Download Report</button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {reports.length > 0 ? (
//         reports.map((report, index) => (
//           <div key={index} className="bg-transparent p-4 rounded-lg mt-2">
//             <h2><strong>Role:</strong> {report.role}</h2>
//             <h3><strong>Email:</strong> {report.email}</h3>
//             <div className="report-analysis">
//               <h4><strong>Analysis</strong></h4>
//               <div
//                 className="analysis-content"
//                 dangerouslySetInnerHTML={{
//                   __html: report.reportAnalysis
//                     .replace(/The user's/g, "You'r")
//                     .replace(/\*/g, '')
//                     .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//                     .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>') // Make these headings bold
//                     .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                     .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                     .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                     .replace(/(\.)/g, '.<br>'),
//                 }}
//               />
//               <button onClick={() => downloadReport(report.reportAnalysis)}>
//                 Download Report
//               </button>
//             </div>
//           </div>
//         ))
//       ) : (
//         <div>No reports available.</div> // Show a message if no reports are found
//       )}
//     </div>
//   );
// }

// export default Report;



// import React, { useState, useEffect } from 'react'; 
// import { getApiResponseReport } from './api/report'; 
// function Report() { 
//   const [openReport, setOpenReport] = useState(false);
//   const [reportData, setReportData] = useState(null); 
//   const [email, setEmail] = useState(''); 
//   const [jobRole, setJobRole] = useState(''); 
//   const [loading, setLoading] = useState(true); 
//   const [error, setError] = useState(null); 
//   const [jobRoleId, setJobRoleId] = useState(null); 
//   const [reportAnalysis, setReportAnalysis] = useState(null);
//   const [reports, setReports] = useState([]);  
//   const [isEmailFetched, setIsEmailFetched] = useState(false);  

//   // State to manage visibility of sections
//   const [visibility, setVisibility] = useState({
//     report: false,
//     previousReports: false,
//   });

//   const toggleVisibility = (section) => {
//     setVisibility((prevVisibility) => ({
//       ...prevVisibility,
//       [section]: !prevVisibility[section],  
//     }));
//   };

//   // Fetch reports by email only if email is available and email fetching is completed
//   useEffect(() => {
//     if (!email || !isEmailFetched) {
//       return;  
//     }

//     const fetchReportsByEmail = async () => {
//       try {
//         const response = await fetch(`/api/storeReport?email=${email}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch reports');
//         }
//         const data = await response.json();
//         console.log('Fetched reports:', data);  

//         if (data.reports && data.reports.length > 0) {
//           setReports(data.reports);
//         } else {
//           console.log('No reports available for the given email.');
//           setReports([]); 
//         }
//       } catch (err) {
//         console.error('Error fetching reports:', err);
//         setError(err.message);
//       } finally {
//         setLoading(false);  
//       }
//     };

//     fetchReportsByEmail();
//   }, [email, isEmailFetched]);

//   useEffect(() => {
//     const idFromLocalStorage = localStorage.getItem('_idForReport');
//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!jobRoleId) return;

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const data = await response.json();
//         setReportData(data.data);

//         const analysisData = await getApiResponseReport(data.data);
//         setReportAnalysis(analysisData);

//         setEmail(data.data.email);  
//         setJobRole(data.data.role);

//         await storeReport(data.data.role, data.data.email, analysisData);

//         setIsEmailFetched(true);  
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);  
//       }
//     };

//     fetchJobRole();
//   }, [jobRoleId]);

//   const storeReport = async (jobRole, email, reportAnalysis) => {
//     try {
//       const response = await fetch('/api/storeReport', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           role: jobRole,
//           email,
//           reportAnalysis,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to store report');
//       }

//       const result = await response.json();
//       console.log('Report stored successfully:', result);
//     } catch (err) {
//       console.error('Error storing report:', err);
//     }
//   };

//   const downloadReport = (reportAnalysis) => {
//     const formattedHTML = reportAnalysis
//       .replace(/The user's/g, "You'r")
//       .replace(/\*\*(.*?)\*\*/g, (match, p1) => `</br><strong>${p1}</strong>`)
//       .replace(/\*/g, '')
//       .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>')
//       .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//       .replace(/(\.)/g, '.<br>');

//     const htmlContent = `
//       <html>
//         <head><title>Report Analysis</title></head>
//         <body>
//           ${formattedHTML}
//         </body>
//       </html>
//     `;

//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report-analysis.html';
//     link.click();
//   };

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   return (
//     <div className='min-h-screen bg-cover' style={{ backgroundImage: "url('/BG.jpg')" }}>
//     <div className=" text-white" >
//       <h1 className="text-center">Interview Report</h1>
//       <div>
//         <h2 className="text-center"><strong>Role:</strong> {reportData.role}</h2>
//         <h3 className="text-center"><strong>Email:</strong> {reportData.email}</h3>
//       </div>

//       <div className="mx-auto mt-5">
//         <div 
//           className="bg-purple-700 p-4 rounded-lg mt-2 cursor-pointer"
//           onClick={() => toggleVisibility('report')}  // Now toggles the 'report' section visibility
//         >
//           Report ▼
//         </div>
//         {visibility.report && (
//           <div className="bg-transparent p-4 rounded-lg mt-2">
//             {reportAnalysis && (
//               <div className="report-analysis">
//                 <h4><strong>Analysis</strong></h4>
//                 <div
//                   className="analysis-content"
//                   dangerouslySetInnerHTML={{
//                     __html: reportAnalysis
//                       .replace(/The user's/g, "You'r")
//                       .replace(/\*/g, '')
//                       .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//                       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>') 
//                       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                       .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                       .replace(/(\.)/g, '.<br>'),
//                   }}
//                 />
//                 <button onClick={() => downloadReport(reportAnalysis)}>Download Report</button>
//               </div>
//             )}
//           </div>
//         )}

//         <div 
//           className="bg-purple-700 p-4 rounded-lg mt-2 cursor-pointer"
//           onClick={() => toggleVisibility('previousReports')}  // Now toggles the 'previousReports' section visibility
//         >
//           Previous Reports ▼
//         </div>
//         {visibility.previousReports && (
//           <div className="mx-auto mt-5">
//             {reports.length > 0 ? (
//               reports.map((report, index) => (
//                 <div key={index} className="bg-transparent p-4 rounded-lg mt-2">
//                   <h2><strong>Role:</strong> {report.role}</h2>
//                   <h3><strong>Email:</strong> {report.email}</h3>
//                   <p><strong>Created At:</strong> {new Date(report.createdAt).toLocaleString()}</p>
//                   <div className="report-analysis">
//                     <h4><strong>Analysis</strong></h4>
//                     <div
//                       className="analysis-content"
//                       dangerouslySetInnerHTML={{
//                         __html: report.reportAnalysis
//                           .replace(/The user's/g, "You'r")
//                           .replace(/\*/g, '')
//                           .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//                           .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>') 
//                           .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                           .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                           .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                           .replace(/(\.)/g, '.<br>'),
//                       }}
//                     />
//                     <button onClick={() => downloadReport(report.reportAnalysis)}>
//                       Download Report
//                     </button>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div>No reports available.</div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>

//     </div>
//   );
// }

// export default Report;



// import React, { useState, useEffect } from 'react'; 
// import { getApiResponseReport } from './api/report'; 

// function Report() { 
//   const [openReport, setOpenReport] = useState(false);
//   const [reportData, setReportData] = useState(null); 
//   const [email, setEmail] = useState(''); 
//   const [jobRole, setJobRole] = useState(''); 
//   const [loading, setLoading] = useState(true); 
//   const [error, setError] = useState(null); 
//   const [jobRoleId, setJobRoleId] = useState(null); 
//   const [reportAnalysis, setReportAnalysis] = useState(null);
//   const [reports, setReports] = useState([]);  
//   const [isEmailFetched, setIsEmailFetched] = useState(false);  

//   // State to manage visibility of sections
//   const [visibility, setVisibility] = useState({
//     report: false,
//     previousReports: false,
//   });

//   // State to manage visibility of each individual report
//   const [reportVisibility, setReportVisibility] = useState([]);

//   const toggleVisibility = (section) => {
//     setVisibility((prevVisibility) => ({
//       ...prevVisibility,
//       [section]: !prevVisibility[section],  
//     }));
//   };

//   const toggleIndividualReportVisibility = (index) => {
//     setReportVisibility((prevVisibility) => {
//       const newVisibility = [...prevVisibility];
//       newVisibility[index] = !newVisibility[index];
//       return newVisibility;
//     });
//   };

//   // Fetch reports by email only if email is available and email fetching is completed
//   useEffect(() => {
//     if (!email || !isEmailFetched) {
//       return;  
//     }

//     const fetchReportsByEmail = async () => {
//       try {
//         const response = await fetch(`/api/storeReport?email=${email}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch reports');
//         }
//         const data = await response.json();
//         console.log('Fetched reports:', data);  

//         if (data.reports && data.reports.length > 0) {
//           setReports(data.reports);
//           setReportVisibility(new Array(data.reports.length).fill(false)); // Initialize visibility for each report
//         } else {
//           console.log('No reports available for the given email.');
//           setReports([]); 
//         }
//       } catch (err) {
//         console.error('Error fetching reports:', err);
//         setError(err.message);
//       } finally {
//         setLoading(false);  
//       }
//     };

//     fetchReportsByEmail();
//   }, [email, isEmailFetched]);

//   useEffect(() => {
//     const idFromLocalStorage = localStorage.getItem('_idForReport');
//     if (idFromLocalStorage) {
//       setJobRoleId(idFromLocalStorage);
//     } else {
//       setError('Missing job role ID');
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!jobRoleId) return;

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const data = await response.json();
//         setReportData(data.data);

//         const analysisData = await getApiResponseReport(data.data);
//         setReportAnalysis(analysisData);

//         setEmail(data.data.email);  
//         setJobRole(data.data.role);

//         await storeReport(data.data.role, data.data.email, analysisData);
// localStorage.removeItem('_idForReport')
//         setIsEmailFetched(true);  
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);  
//       }
//     };

//     fetchJobRole();
//   }, [jobRoleId]);

//   const storeReport = async (jobRole, email, reportAnalysis) => {
//     try {
//       const response = await fetch('/api/storeReport', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           role: jobRole,
//           email,
//           reportAnalysis,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to store report');
//       }

//       const result = await response.json();
//       console.log('Report stored successfully:', result);
//     } catch (err) {
//       console.error('Error storing report:', err);
//     }
//   };

//   const downloadReport = (reportAnalysis) => {
//     const formattedHTML = reportAnalysis
//       .replace(/The user's/g, "You'r")
//       .replace(/\*\*(.*?)\*\*/g, (match, p1) => `</br><strong>${p1}</strong>`)
//       .replace(/\*/g, '')
//       .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>')
//       .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//       .replace(/(\.)/g, '.<br>');

//     const htmlContent = `
//       <html>
//         <head><title>Report Analysis</title></head>
//         <body>
//           ${formattedHTML}
//         </body>
//       </html>
//     `;

//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report-analysis.html';
//     link.click();
//   };

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!reportData) {
//     return <div>No job role data found</div>;
//   }

//   return (
//     <div className='min-h-screen bg-cover' style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className="text-white">
//         <h1 className="text-center">Interview Report</h1>
//         <div>
//           <h2 className="text-center"><strong>Role:</strong> {reportData.role}</h2>
//           <h3 className="text-center"><strong>Email:</strong> {reportData.email}</h3>
//         </div>

//         <div className="mx-auto mt-5">
//           <div 
//             className="bg-purple-700 p-4 rounded-lg mt-2 cursor-pointer"
//             onClick={() => toggleVisibility('report')}
//           >
//             Report ▼
//           </div>
//           {visibility.report && (
//             <div className="bg-transparent p-4 rounded-lg mt-2">
//               {reportAnalysis && (
//                 <div className="report-analysis">
//                   <h4><strong>Analysis</strong></h4>
//                   <div
//                     className="analysis-content"
//                     dangerouslySetInnerHTML={{
//                       __html: reportAnalysis
//                         .replace(/The user's/g, "You'r")
//                         .replace(/\*/g, '')
//                         .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//                         .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>') 
//                         .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                         .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                         .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                         .replace(/(\.)/g, '.<br>'),
//                     }}
//                   />
//                   <button onClick={() => downloadReport(reportAnalysis)}>Download Report</button>
//                 </div>
//               )}
//             </div>
//           )}

//           <div 
//             className="bg-purple-700 p-4 rounded-lg mt-2 cursor-pointer"
//             onClick={() => toggleVisibility('previousReports')}
//           >
//             Previous Reports ▼
//           </div>
//           {visibility.previousReports && (
//             <div className="mx-auto mt-5">
//               {reports.length > 0 ? (
//                 reports.map((report, index) => (
//                   <div key={index} className="bg-transparent  rounded-lg mt-2">
//                     <div 
//                       className="bg-purple-500 p-4 rounded-lg cursor-pointer"
//                       onClick={() => toggleIndividualReportVisibility(index)}
//                     >
//                       {reportVisibility[index] ? 'Hide' : 'Show'} Report ▼
//                     </div>

//                     {reportVisibility[index] && (
//                       <div>
//                         <h2><strong>Role:</strong> {report.role}</h2>
//                         <h3><strong>Email:</strong> {report.email}</h3>
//                         <p><strong>Created At:</strong> {new Date(report.createdAt).toLocaleString()}</p>
//                         <div className="report-analysis">
//                           <h4><strong>Analysis</strong></h4>
//                           <div
//                             className="analysis-content"
//                             dangerouslySetInnerHTML={{
//                               __html: report.reportAnalysis
//                                 .replace(/The user's/g, "You'r")
//                                 .replace(/\*/g, '')
//                                 .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//                                 .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>') 
//                                 .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                                 .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                                 .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                                 .replace(/(\.)/g, '.<br>'),
//                             }}
//                           />
//                           <button onClick={() => downloadReport(report.reportAnalysis)}>
//                             Download Report
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <div>No reports available.</div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Report;



// import React, { useState, useEffect } from 'react'; 
// import { getApiResponseReport } from './api/report'; 

// function Report() { 
//   const [openReport, setOpenReport] = useState(false);
//   const [reportData, setReportData] = useState(null); 
//   const [email, setEmail] = useState(''); 
//   const [jobRole, setJobRole] = useState(''); 
//   const [loading, setLoading] = useState(true); 
//   const [error, setError] = useState(null); 
//   const [jobRoleId, setJobRoleId] = useState(null); 
//   const [reportAnalysis, setReportAnalysis] = useState(null);
//   const [reports, setReports] = useState([]);  
//   const [isEmailFetched, setIsEmailFetched] = useState(false);  

//   // State to manage visibility of sections
//   const [visibility, setVisibility] = useState({
//     report: false,
//     previousReports: false,
//   });

//   // State to manage visibility of each individual report
//   const [reportVisibility, setReportVisibility] = useState([]);

//   const toggleVisibility = (section) => {
//     setVisibility((prevVisibility) => ({
//       ...prevVisibility,
//       [section]: !prevVisibility[section],  
//     }));
//   };

//   const toggleIndividualReportVisibility = (index) => {
//     setReportVisibility((prevVisibility) => {
//       const newVisibility = [...prevVisibility];
//       newVisibility[index] = !newVisibility[index];
//       return newVisibility;
//     });
//   };



//   // Fetch reports by email only if email is available and email fetching is completed
//   useEffect(() => {
//     if (!email || !isEmailFetched) {
//       return;  
//     }

//     const fetchReportsByEmail = async () => {
//       try {
//         const response = await fetch(`/api/storeReport?email=${email}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch reports');
//         }
//         const data = await response.json();
//         console.log('Fetched reports:', data);  

//         if (data.reports && data.reports.length > 0) {
//           setReports(data.reports);
//           setReportVisibility(new Array(data.reports.length).fill(false)); // Initialize visibility for each report
//         } else {
//           console.log('No reports available for the given email.');
//           setReports([]); 
//         }
//       } catch (err) {
//         console.error('Error fetching reports:', err);
//         setError(err.message);
//       } finally {
//         setLoading(false);  
//       }
//     };

//     fetchReportsByEmail();
//   }, [email, isEmailFetched]);

//   useEffect(() => {
//     const idFromLocalStorage = localStorage.getItem('_idForReport');
//     const emailFromLocalStorage = localStorage.getItem('user'); // Retrieve user data from localStorage
    
//     if (emailFromLocalStorage) {
//       const parsedUser = JSON.parse(emailFromLocalStorage); // Parse the stringified user object
//       const email = parsedUser.email; // Access the email field from the parsed object
//       console.log(email); // Output the email
  
//       if (idFromLocalStorage) {
//         // If jobRoleId is available, set the jobRoleId
//         setJobRoleId(idFromLocalStorage);
//       } else {
//         // If jobRoleId is missing, set the email and show previous reports
//         setEmail(email);
//         setIsEmailFetched(true);
//         setVisibility((prevVisibility) => ({
//           ...prevVisibility,
//           previousReports: true,  // Show previous reports when jobRoleId is missing
//         }));
//       }
//     } else {
//       // If neither jobRoleId nor email is available, show an error
//       setError('Missing job role ID and email');
//       setLoading(false);
//     }
//   }, []);
  

//   // Fetch job role data if jobRoleId exists
//   useEffect(() => {
//     if (!jobRoleId) return;

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const data = await response.json();
//         setReportData(data.data);

//         const analysisData = await getApiResponseReport(data.data);
//         setReportAnalysis(analysisData);

//         setEmail(data.data.email);  
//         setJobRole(data.data.role);

//         await storeReport(data.data.role, data.data.email, analysisData);
//         localStorage.removeItem('_idForReport');
//         setIsEmailFetched(true);  
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);  
//       }
//     };

//     fetchJobRole();
//   }, [jobRoleId]);

//   const storeReport = async (jobRole, email, reportAnalysis) => {
//     try {
//       const response = await fetch('/api/storeReport', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           role: jobRole,
//           email,
//           reportAnalysis,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to store report');
//       }

//       const result = await response.json();
//       console.log('Report stored successfully:', result);
//     } catch (err) {
//       console.error('Error storing report:', err);
//     }
//   };

//   const downloadReport = (reportAnalysis) => {
//     const formattedHTML = reportAnalysis
//       .replace(/The user's/g, "You'r")
//       .replace(/\*\*(.*?)\*\*/g, (match, p1) => `</br><strong>${p1}</strong>`)
//       .replace(/\*/g, '')
//       .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>')
//       .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//       .replace(/(\.)/g, '.<br>');

//     const htmlContent = `
//       <html>
//         <head><title>Report Analysis</title></head>
//         <body>
//           ${formattedHTML}
//         </body>
//       </html>
//     `;

//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report-analysis.html';
//     link.click();
//   };

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   // Render "No job role data found" only if there's no job role data fetched and jobRoleId exists
//   if (!reportData && jobRoleId) {
//     return <div>No job role data found</div>;
//   }

//   return (
//     <div className='min-h-screen bg-cover' style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className="text-white">
//         <h1 className="text-center">Interview Report</h1>
//         <div>
         
//         </div>

//         <div className="mx-auto mt-5">
//         <div 
//   className="bg-purple-700 p-4 rounded-lg mt-2 cursor-pointer"
//   onClick={() => toggleVisibility('report')}
// >
// {reportAnalysis && (
//   <div>
//     <div 
//       className="bg-purple-700 p-4 rounded-lg mt-2 cursor-pointer"
//       onClick={() => toggleVisibility('report')}
//     >
//       Report ▼
//     </div>
    
//     {visibility.report && (
//       <div className="bg-transparent p-4 rounded-lg mt-2">
//         <div className="report-analysis">
//           <h4><strong>Analysis</strong></h4>
//           <div
//             className="analysis-content"
//             dangerouslySetInnerHTML={{
//               __html: reportAnalysis
//                 .replace(/The user's/g, "You'r")
//                 .replace(/\*/g, '')
//                 .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//                 .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>') 
//                 .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                 .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                 .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                 .replace(/(\.)/g, '.<br>'),
//             }}
//           />
//           <button onClick={() => downloadReport(reportAnalysis)}>Download Report</button>
//         </div>
//       </div>
//     )}
//   </div>
// )}
// </div>

//           <div 
//             className="bg-purple-700 p-4 rounded-lg mt-2 cursor-pointer"
//             onClick={() => toggleVisibility('previousReports')}
//           >
//             Previous Reports ▼
//           </div>
//           {visibility.previousReports && (
//             <div className="mx-auto mt-5">
//               {reports.length > 0 ? (
//                 reports.map((report, index) => (
//                   <div key={index} className="bg-transparent  rounded-lg mt-2">
//                     <div 
//                       className="bg-purple-500 p-4 rounded-lg cursor-pointer"
//                       onClick={() => toggleIndividualReportVisibility(index)}
//                     >
//                       {reportVisibility[index] ? 'Hide' : 'Show'} Report ▼
//                     </div>

//                     {reportVisibility[index] && (
//                       <div>
//                         <h2><strong>Role:</strong> {report.role}</h2>
//                         <h3><strong>Email:</strong> {report.email}</h3>
//                         <p><strong>Created At:</strong> {new Date(report.createdAt).toLocaleString()}</p>
//                         <div className="report-analysis">
//                           <h4><strong>Analysis</strong></h4>
//                           <div
//                             className="analysis-content"
//                             dangerouslySetInnerHTML={{
//                               __html: report.reportAnalysis
//                                 .replace(/The user's/g, "You'r")
//                                 .replace(/\*/g, '')
//                                 .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//                                 .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>') 
//                                 .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                                 .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                                 .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                                 .replace(/(\.)/g, '.<br>'),
//                             }}
//                           />
//                           <button onClick={() => downloadReport(report.reportAnalysis)}>
//                             Download Report
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <div>No reports available.</div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Report;


// import React, { useState, useEffect } from 'react'; 
// import { getApiResponseReport } from './api/report'; 
// import { IoIosArrowBack } from "react-icons/io";
// import Link from 'next/link';
// import { useRouter } from 'next/router';
// function Report() { 
//   const router = useRouter(); 
//   const [openReport, setOpenReport] = useState(false);
//   const [reportData, setReportData] = useState(null); 
//   const[user,setUser]=useState('')
//   const [email, setEmail] = useState(''); 
//   const [jobRole, setJobRole] = useState(''); 
//   const [loading, setLoading] = useState(true); 
//   const [error, setError] = useState(null); 
//   const [jobRoleId, setJobRoleId] = useState(null); 
//   const [reportAnalysis, setReportAnalysis] = useState(null);
//   const [reports, setReports] = useState([]);  
//   const [isEmailFetched, setIsEmailFetched] = useState(false);  

//   useEffect(() => {
//     if (!localStorage.getItem("token")) {
//       router.push("/login");
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');  // Initialize email here directly
//       }
//     }
//   }, []);

//   // State to manage visibility of sections
//   const [visibility, setVisibility] = useState({
//     report: false,
//     previousReports: false,
//   });

//   // State to manage visibility of each individual report
//   const [reportVisibility, setReportVisibility] = useState([]);

//   const toggleVisibility = (section) => {
//     setVisibility((prevVisibility) => ({
//       ...prevVisibility,
//       [section]: !prevVisibility[section],  
//     }));
//   };

//   const toggleIndividualReportVisibility = (index) => {
//     setReportVisibility((prevVisibility) => {
//       const newVisibility = [...prevVisibility];
//       newVisibility[index] = !newVisibility[index];
//       return newVisibility;
//     });
//   };

//   // Fetch reports by email only if email is available and email fetching is completed
  

//   useEffect(() => {
//     const idFromLocalStorage = localStorage.getItem('_idForReport');
//     const emailFromLocalStorage = localStorage.getItem('user'); // Retrieve user data from localStorage
    
//     if (emailFromLocalStorage) {
//       const parsedUser = JSON.parse(emailFromLocalStorage); // Parse the stringified user object
//       const email = parsedUser.email; // Access the email field from the parsed object
//       console.log(email); // Output the email
  
//       if (idFromLocalStorage) {
//         // If jobRoleId is available, set the jobRoleId
//         setJobRoleId(idFromLocalStorage);
//       } else {
//         // If jobRoleId is missing, set the email and show previous reports
//         setEmail(email);
//         setIsEmailFetched(true);
//         setVisibility((prevVisibility) => ({
//           ...prevVisibility,
//           previousReports: true,  // Show previous reports when jobRoleId is missing
//         }));
//       }
//     } else {
//       // If neither jobRoleId nor email is available, show an error
//       setError('Missing job role ID and email');
//       setLoading(false);
//     }
//   }, []);

//   // Fetch job role data if jobRoleId exists
//   useEffect(() => {
//     if (!jobRoleId) return;

//     const fetchJobRole = async () => {
//       try {
//         localStorage.setItem('status',"processing");
//         const response = await fetch(`/api/getReportData?jobRoleId=${jobRoleId}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const data = await response.json();
//         setReportData(data.data);

//         const analysisData = await getApiResponseReport(data.data);
//         setReportAnalysis(analysisData);

//         setEmail(data.data.email);  
//         setJobRole(data.data.role);

//         await storeReport(data.data.role, data.data.email, analysisData);
//         localStorage.removeItem('_idForReport');
//         localStorage.removeItem('status');
//         localStorage.setItem('store',"success");
//         setIsEmailFetched(true);  
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);  
//       }
//     };

//     fetchJobRole();
//   }, [jobRoleId]);

//   const storeReport = async (jobRole, email, reportAnalysis) => {
//     try {
//       const response = await fetch('/api/storeReport', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           role: jobRole,
//           email,
//           reportAnalysis,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to store report');
//       }

//       const result = await response.json();
//       console.log('Report stored successfully:', result);
//     } catch (err) {
//       console.error('Error storing report:', err);
//     }
//   };

//   const downloadReport = (reportAnalysis) => {
//     const formattedHTML = reportAnalysis
//       .replace(/The user's/g, "You'r")
//       .replace(/\*\*(.*?)\*\*/g, (match, p1) => `</br><strong>${p1}</strong>`)
//       .replace(/\*/g, '')
//       .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//       .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>')
//       .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//       .replace(/(\.)/g, '.<br>');

//     const htmlContent = `
//       <html>
//         <head><title>Report Analysis</title></head>
//         <body>
//           ${formattedHTML}
//         </body>
//       </html>
//     `;

//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report-analysis.html';
//     link.click();
//   };

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   // Render "No job role data found" only if there's no job role data fetched and jobRoleId exists
//   if (!reportData && jobRoleId) {
//     return <div>No job role data found</div>;
//   }
//   const goBack = () => {
//     router.push('/'); // This will take the user to the previous page
//   };
//   useEffect(() => {
//     if (!email || !isEmailFetched) {
//       return;  
//     }

//     const fetchReportsByEmail = async () => {
//       try {
//         const response = await fetch(`/api/storeReport?email=${email}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch reports');
//         }
//         const data = await response.json();
//         console.log('Fetched reports:', data);  

//         if (data.reports && data.reports.length > 0) {
//           setReports(data.reports);
//           setReportVisibility(new Array(data.reports.length).fill(false)); // Initialize visibility for each report
//         } else {
//           console.log('No reports available for the given email.');
//           setReports([]); 
//         }
//       } catch (err) {
//         console.error('Error fetching reports:', err);
//         setError(err.message);
//       } finally {
//         setLoading(false);  
//       }
//     };

//     fetchReportsByEmail();
//   }, [email, isEmailFetched]);

//   return (
//     <div className='min-h-screen bg-cover' style={{ backgroundImage: "url('/BG.jpg')" }}>
//      <div className='absolute top-5 left-3 text-4xl text-white' onClick={goBack} ><IoIosArrowBack /></div>
//      <div className="text-white">
//         <h1 className="text-center text-4xl font-bold">Interview Report</h1>

//         <div className="mx-auto mt-5">
//           {reportAnalysis && (
//             <div>
//               <div 
//                 className="bg-purple-700 p-4 rounded-lg mt-2 cursor-pointer"
//                 onClick={() => toggleVisibility('report')}
//               >
//                 Report ▼
//               </div>

//               {visibility.report && (
//                 <div className="bg-transparent p-4 rounded-lg mt-2">
//                   <div className="report-analysis">
//                     <h4><strong>Analysis</strong></h4>
//                     <div
//                       className="analysis-content"
//                       dangerouslySetInnerHTML={{
//                         __html: reportAnalysis
//                           .replace(/The user's/g, "You'r")
//                           .replace(/\*/g, '')
//                           .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//                           .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>') 
//                           .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                           .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                           .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                           .replace(/(\.)/g, '.<br>'),
//                       }}
//                     />
//                     <button onClick={() => downloadReport(reportAnalysis)}>Download Report</button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           <div 
//             className="bg-purple-700 p-4 rounded-lg mt-2 cursor-pointer"
//             onClick={() => toggleVisibility('previousReports')}
//           >
//             Previous Reports ▼
//           </div>

//           {visibility.previousReports && (
//             <div className="mx-auto mt-5 ">
//               {reports.length > 0 ? (
//                 reports.map((report, index) => (
//                   <div key={index} className="bg-transparent  rounded-lg mt-2 ">
//                     <div 
//                       className="bg-purple-500 p-4 rounded-lg cursor-pointer"
//                       onClick={() => toggleIndividualReportVisibility(index)}
//                     >
//                       {reportVisibility[index] ? 'Hide' : 'Show'} Report ▼
//                     </div>

//                     {reportVisibility[index] && (
//                       <div className='m-2'>
//                         <h2><strong>Role:</strong> {report.role}</h2>
//                         <h3><strong>Email:</strong> {report.email}</h3>
//                         <p><strong>Created At:</strong> {new Date(report.createdAt).toLocaleString()}</p>
//                         <div className="report-analysis">
//                           <h4><strong>Analysis</strong></h4>
//                           <div
//                             className="analysis-content"
//                             dangerouslySetInnerHTML={{
//                               __html: report.reportAnalysis
//                                 .replace(/The user's/g, "You'r")
//                                 .replace(/\*/g, '')
//                                 .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br></br>')
//                                 .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>') 
//                                 .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                                 .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//                                 .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                                 .replace(/(\.)/g, '.<br>'),
//                             }}
//                           />
//                           <button onClick={() => downloadReport(report.reportAnalysis)}>Download Report</button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <div>For Report Visit After 5 Min </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Report;



import React, { useState, useEffect } from 'react'; 
import { getApiResponseReport } from '/report'; 
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from 'next/router';

function Report() { 
  const router = useRouter(); 
  const [openReport, setOpenReport] = useState(false);
  const [reportData, setReportData] = useState(null); 
  const [user, setUser] = useState('');
  const [email, setEmail] = useState(''); 
  const [jobRole, setJobRole] = useState(''); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [jobRoleId, setJobRoleId] = useState(null); 
  const [reportAnalysis, setReportAnalysis] = useState(null);
  const [isEmailFetched, setIsEmailFetched] = useState(false);  

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push(`${process.env.NEXT_PUBLIC_HOST}/login`);
    } else {
      const userFromStorage = JSON.parse(localStorage.getItem('user'));
      if (userFromStorage) {
        setUser(userFromStorage);
        setEmail(userFromStorage.email || '');  // Initialize email here directly
      }
    }
  }, []);

  // Fetch job role data if jobRoleId exists
  useEffect(() => {
    localStorage.removeItem('_id');
    const idFromLocalStorage = localStorage.getItem('_idForReport');
    const emailFromLocalStorage = localStorage.getItem('user'); // Retrieve user data from localStorage

    if (emailFromLocalStorage) {
      const parsedUser = JSON.parse(emailFromLocalStorage); // Parse the stringified user object
      const email = parsedUser.email; // Access the email field from the parsed object
      console.log(email); // Output the email

      if (idFromLocalStorage) {
        // If jobRoleId is available, set the jobRoleId
        setJobRoleId(idFromLocalStorage);
      } else {
        // If jobRoleId is missing, set the email and show previous reports
        setEmail(email);
        setIsEmailFetched(true);
      }
    } else {
      // If neither jobRoleId nor email is available, show an error
      setError('Missing job role ID and email');
      setLoading(false);
    }
  }, []);

  // Fetch job role data if jobRoleId exists
  useEffect(() => {
    if (!jobRoleId) return;

    const fetchJobRole = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/getReportData?jobRoleId=${jobRoleId}`);
        localStorage.setItem('status', "processing");
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setReportData(data.data);
        localStorage.removeItem('status');
        localStorage.setItem('status', "model processing");
        const analysisData = await getApiResponseReport(data.data);
        setReportAnalysis(analysisData);
        localStorage.removeItem('status');
        localStorage.setItem('status', "model 5 min");

        setEmail(data.data.email);  
        setJobRole(data.data.role);

        await storeReport(data.data.role, data.data.email, analysisData);
        localStorage.removeItem('_idForReport');
        localStorage.removeItem('status');
        localStorage.setItem('store',"success");
        setIsEmailFetched(true);  
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);  
      }
    };

    fetchJobRole();
  }, [jobRoleId]);

  const storeReport = async (jobRole, email, reportAnalysis) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/storeReport`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: jobRole,
          email,
          reportAnalysis,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to store report');
      }

      const result = await response.json();
      console.log('Report stored successfully:', result);
    } catch (err) {
      console.error('Error storing report:', err);
    }
  };

  const downloadReport = (reportAnalysis) => {
    const formattedHTML = reportAnalysis
      .replace(/The user's/g, "You'r")
      .replace(/\*\*(.*?)\*\*/g, (match, p1) => `</br><strong>${p1}</strong>`)
      .replace(/\*/g, '')
      .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
      .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
      .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>')
      .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
      .replace(/(\.)/g, '.<br>');

    const htmlContent = `
      <html>
        <head><title>Report Analysis</title></head>
        <body>
          ${formattedHTML}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'report-analysis.html';
    link.click();
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render "No job role data found" only if there's no job role data fetched and jobRoleId exists
  if (!reportData && jobRoleId) {
    return <div>No job role data found</div>;
  }

  const goBack = () => {
    router.push('/'); // This will take the user to the previous page
  };

  return (
    <div className='min-h-screen bg-cover' style={{ backgroundImage: "url('/BG.jpg')" }}>
      <div className='absolute top-5 left-3 text-4xl text-white' onClick={goBack} ><IoIosArrowBack /></div>
      <div className="text-white">
        <h1 className="text-center text-4xl font-bold">Interview Report</h1>

        <div className="mx-auto mt-5">
          {reportAnalysis && (
            <div>
              <div 
                className="bg-purple-700 p-4 rounded-lg mt-2 cursor-pointer"
                onClick={() => setOpenReport(!openReport)}
              >
                Report ▼
              </div>

              {openReport && (
                <div className="bg-transparent p-4 rounded-lg mt-2">
                  <div className="report-analysis">
                    <h4><strong>Analysis</strong></h4>
                    <div
                      className="analysis-content"
                      dangerouslySetInnerHTML={{
                        __html: reportAnalysis
                          .replace(/The user's/g, "You'r")
                          .replace(/\*/g, '')
                          .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
                          .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>') 
                          .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
                          .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
                          .replace(/(\.)/g, '.<br>'),
                      }}
                    />
                    <button onClick={() => downloadReport(reportAnalysis)}>Download Report</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Report;
