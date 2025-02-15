

// import React, { useState, useEffect } from 'react'; 
// import { getApiResponseReport } from './api/report'; 
// import { IoIosArrowBack } from "react-icons/io";
// import Link from 'next/link';
// import { useRouter } from 'next/router';
// function Report() { 
//   const router = useRouter(); 
//   const[user,setUser]=useState('')
//   const [email, setEmail] = useState(''); 
//   const [loading, setLoading] = useState(true); 
//   const [error, setError] = useState(null); 
//   const [reportAnalysis, setReportAnalysis] = useState(null);
//   const [reports, setReports] = useState([]);  
//   const [isEmailFetched, setIsEmailFetched] = useState(false);  

//   useEffect(() => {
//     if (!localStorage.getItem("token")) {
//       router.push("/login");

//     }
//   }, []);
//   useEffect(() => {
//     const userFromStorage = localStorage.getItem('user'); // Retrieve user data from localStorage
//     if (userFromStorage) {
//       const parsedUser = JSON.parse(userFromStorage); // Parse the stringified user object
//       const email = parsedUser.email; // Access the email field from the parsed object

//       // Log the email to check if it's being correctly fetched from localStorage
//       console.log("Fetched email from localStorage:", email);

//       if (email) {
//         setEmail(email);
//         setIsEmailFetched(true);
//         setVisibility((prevVisibility) => ({
//           ...prevVisibility,
//           previousReports: true,  // Show previous reports when jobRoleId is missing
//         }));
//       } else {
//         console.error("Email is missing in localStorage");
//         setError("Email is missing in localStorage");
//       }
//     } else {
//       // If no user data found in localStorage, handle the case gracefully
//       console.error("No user data found in localStorage");
//       setError("No user data found in localStorage");
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
//     if (!email) {
//       setError("Email is missing or empty.");
//       return; // Prevent API call if email is missing
//     }

//     const fetchReportsByEmail = async () => {
//       try {
//         // Log the email to make sure it's correct
//         console.log("Email being sent to API:", email);

//         const response = await fetch(`/api/storeReport?email=${email}`);

//         if (!response.ok) {
//           throw new Error(`Failed to fetch reports, status: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log('Fetched reports:', data);

//         if (data.reports && data.reports.length > 0) {
//           const sortedReports = data.reports.sort((a, b) => {
//             const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
//             const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
//             return dateB - dateA;
//           });
//           setReports(sortedReports);
//           setReportVisibility(new Array(sortedReports.length).fill(false)); // Initialize visibility for each report
//         } else {
//           console.log('No reports available for the given email.');
//           setReports([]);
//         }
//       } catch (err) {
//         console.error('Error fetching reports:', err);
//         setError(`Error fetching reports: ${err.message}`);
//       } finally {
//         setLoading(false);  
//       }
//     };

//     fetchReportsByEmail();
//   }, [email, isEmailFetched]);  // Depend on email and isEmailFetched




//   useEffect(() => {

//     const emailFromLocalStorage = localStorage.getItem('user'); // Retrieve user data from localStorage

//     if (emailFromLocalStorage) {
//       const parsedUser = JSON.parse(emailFromLocalStorage); // Parse the stringified user object
//       const email = parsedUser.email; // Access the email field from the parsed object
//       console.log(email); // Output the email

//       if (email) {
//         setEmail(email);
//         setIsEmailFetched(true);


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



//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   // Render "No job role data found" only if there's no job role data fetched and jobRoleId exists

//   const goBack = () => {
//     if (document.referrer.includes('/report')) {
//         router.push('/'); // Redirect to /page if coming from /report
//     } else {
//         router.back(); // Go back to the previous page
//     }
// };
// const downloadReport = (reportAnalysis) => {
//   const formattedHTML = reportAnalysis
//     .replace(/The user's/g, "You'r")
//     .replace(/\*\*(.*?)\*\*/g, (match, p1) => `</br><strong>${p1}</strong>`)
//     .replace(/\*/g, '')
//     .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong></br>')
//     .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency) Report/g, '<h5><strong>$1 Report</strong></h5>')
//     .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, '<strong>$1</strong>')
//     .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//     .replace(/(\.)/g, '.<br>');

//   const htmlContent = `
//     <html>
//       <head><title>Report Analysis</title></head>
//       <body>
//         ${formattedHTML}
//       </body>
//     </html>
//   `;

//   const blob = new Blob([htmlContent], { type: 'text/html' });
//   const link = document.createElement('a');
//   link.href = URL.createObjectURL(blob);
//   link.download = 'report-analysis.html';
//   link.click();
// };


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


// import React, { useState, useEffect } from 'react'; 
// import { IoIosArrowBack } from "react-icons/io";
// import { useRouter } from 'next/router';

// function Report() { 
//   const router = useRouter(); 
//   const [openReport, setOpenReport] = useState(false);
//   const [reportData, setReportData] = useState(null); 
//   const [user, setUser] = useState('');
//   const [email, setEmail] = useState(''); 
//   const [jobRole, setJobRole] = useState(''); 
//   const [loading, setLoading] = useState(true); 
//   const [error, setError] = useState(null); 
//   const [jobRoleId, setJobRoleId] = useState(null); 
//   const [reportAnalysis, setReportAnalysis] = useState(null);
//   const [reports, setReports] = useState([]);  
//   const [isEmailFetched, setIsEmailFetched] = useState(false);  
//   const [visibility, setVisibility] = useState({
//     report: false,
//     previousReports: false,
//   });
//   const [reportVisibility, setReportVisibility] = useState([]);

//   useEffect(() => {
//     const userFromStorage = localStorage.getItem('user'); // Retrieve user data from localStorage
//     if (userFromStorage) {
//       const parsedUser = JSON.parse(userFromStorage); // Parse the stringified user object
//       const email = parsedUser.email; // Access the email field from the parsed object

//       // Log email to check if it's fetched correctly
//       console.log("Fetched email from localStorage:", email);

//       if (email) {
//         setEmail(email);  // Set email in state
//         setIsEmailFetched(true);
//         setVisibility((prevVisibility) => ({
//           ...prevVisibility,
//           previousReports: true,  // Show previous reports when email is available
//         }));
//       } else {
//         console.error("Email is missing in localStorage");
//         setError("Email is missing in localStorage");
//       }
//     } else {
//       console.error("No user data found in localStorage");
//       setError("No user data found in localStorage");
//     }
//   }, []);

//   useEffect(() => {
//     if (!email) {
//       console.error("Email is still empty before making API request");
//       setError("Email is missing or empty.");
//       return; // Skip fetch if email is missing
//     }

//     const fetchReportsByEmail = async () => {
//       try {
//         console.log("Fetching reports for email:", email); // Log email for debugging

//         const response = await fetch(`/api/storeReport?email=${email}`);

//         if (!response.ok) {
//           throw new Error(`Failed to fetch reports, status: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log('Fetched reports:', data);

//         if (data.reports && data.reports.length > 0) {
//           const sortedReports = data.reports.sort((a, b) => {
//             const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
//             const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
//             return dateB - dateA;
//           });
//           setReports(sortedReports);
//           setReportVisibility(new Array(sortedReports.length).fill(false)); // Initialize visibility for each report
//         } else {
//           console.log('No reports available for the given email.');
//           setReports([]);
//         }
//       } catch (err) {
//         console.error('Error fetching reports:', err);
//         setError(`Error fetching reports: ${err.message}`);
//       } finally {
//         setLoading(false);  
//       }
//     };

//     fetchReportsByEmail();
//   }, [email, isEmailFetched]); // Trigger when email or isEmailFetched changes

//   // Handle Go Back Logic
//   const goBack = () => {
//     if (document.referrer.includes('/report')) {
//       router.push('/'); // Redirect to home if coming from report page
//     } else {
//       router.back(); // Go back to the previous page
//     }
//   };

//   // Handle toggle visibility of report sections
//   const toggleVisibility = (section) => {
//     setVisibility((prevVisibility) => ({
//       ...prevVisibility,
//       [section]: !prevVisibility[section],  
//     }));
//   };

//   // Toggle visibility for individual reports
//   const toggleIndividualReportVisibility = (index) => {
//     setReportVisibility((prevVisibility) => {
//       const newVisibility = [...prevVisibility];
//       newVisibility[index] = !newVisibility[index];
//       return newVisibility;
//     });
//   };

//   // Handle report download
//   const downloadReport = (analysis) => {
//     const blob = new Blob([analysis], { type: 'application/pdf' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report.pdf';
//     link.click();
//   };

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     <div className='min-h-screen bg-cover' style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className='absolute top-5 left-3 text-4xl text-white' onClick={goBack}>
//         <IoIosArrowBack />
//       </div>
//       <div className="text-white">
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
//             <div className="mx-auto mt-5">
//               {reports.length > 0 ? (
//                 reports.map((report, index) => (
//                   <div key={index} className="bg-transparent rounded-lg mt-2">
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



// import React, { useState, useEffect } from 'react';
// import { IoIosArrowBack } from "react-icons/io";
// import { useRouter } from 'next/router';

// function Oldreport() {
//   const router = useRouter();

//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null);
//   const [reports, setReports] = useState([]);
//   const [isEmailFetched, setIsEmailFetched] = useState(false);
//   const [visibility, setVisibility] = useState({
//     report: false,
//     previousReports: false,
//   });
//   const [reportVisibility, setReportVisibility] = useState([]);

//   // Fetch email from localStorage
//   useEffect(() => {
//     const userFromStorage = localStorage.getItem('user');
//     if (userFromStorage) {
//       const parsedUser = JSON.parse(userFromStorage);
//       const email = parsedUser.email;

//       // Debug: log the email fetched from localStorage
//       console.log("Fetched email from localStorage:", email);

//       if (email) {
//         setEmail(email);
//         setIsEmailFetched(true);
//         setVisibility((prevVisibility) => ({
//           ...prevVisibility,
//           previousReports: true,
//         }));
//       } else {
//         console.error("Email is missing in localStorage");
//         setError("Email is missing in localStorage");
//       }
//     } else {
//       console.error("No user data found in localStorage");
//       setError("No user data found in localStorage");
//     }
//   }, []);

//   // Fetch reports when email is set
//   useEffect(() => {
//     // Ensure email is set and fetched before calling the API
//     if (email && isEmailFetched) {
//       const fetchReportsByEmail = async () => {
//         try {
//           console.log("Fetching reports for email:", email);

//           const response = await fetch(`/api/storeReport?email=${email}`);

//           if (!response.ok) {
//             throw new Error(`Failed to fetch reports, status: ${response.status}`);
//           }

//           const data = await response.json();
//           console.log('Fetched reports:', data);

//           if (data.reports && data.reports.length > 0) {
//             const sortedReports = data.reports.sort((a, b) => {
//               const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
//               const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
//               return dateB - dateA;
//             });
//             setReports(sortedReports);
//             setReportVisibility(new Array(sortedReports.length).fill(false));
//           } else {
//             console.log('No reports available for the given email.');
//             setReports([]);
//           }
//         } catch (err) {
//           console.error('Error fetching reports:', err);
//           setError(`Error fetching reports: ${err.message}`);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchReportsByEmail();
//     } else {
//       console.log("Waiting for email to be fetched and set.");
//     }
//   }, [email, isEmailFetched]);  // This will trigger once both are available

//   // Handle Go Back Logic
//   const goBack = () => {
//     if (document.referrer.includes('/report')) {
//       router.push('/');
//     } else {
//       router.back();
//     }
//   };

//   // Handle toggle visibility of report sections
//   const toggleVisibility = (section) => {
//     setVisibility((prevVisibility) => ({
//       ...prevVisibility,
//       [section]: !prevVisibility[section],
//     }));
//   };

//   // Toggle visibility for individual reports
//   const toggleIndividualReportVisibility = (index) => {
//     setReportVisibility((prevVisibility) => {
//       const newVisibility = [...prevVisibility];
//       newVisibility[index] = !newVisibility[index];
//       return newVisibility;
//     });
//   };

//   // Handle report download
//   const downloadReport = (analysis) => {
//     const blob = new Blob([analysis], { type: 'application/pdf' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report.pdf';
//     link.click();
//   };

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     <div className='min-h-screen bg-cover' style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className='absolute top-5 left-3 text-4xl text-white' onClick={goBack}>
//         <IoIosArrowBack />
//       </div>
//       <div className="text-white">
//         <h1 className="text-center text-4xl font-bold">Interview Report</h1>
//         <div className="mx-auto mt-5">


//           {visibility.previousReports && (
//             <div className="mx-auto mt-5">
//               {reports.length > 0 ? (
//                 reports.map((report, index) => (
//                   <div key={index} className="bg-transparent rounded-lg mt-2">
//                     <div
//                       className="bg-purple-500 p-4 rounded-lg cursor-pointer"
//                       onClick={() => toggleIndividualReportVisibility(index)}
//                     >
//                       {reportVisibility[index] ? 'Hide' : 'Show'} Report ▼
//                     </div>

//                     {reportVisibility[index] && (
//                       <div className='m-2'>
//                         <h2><strong>Role:</strong> {report.role}</h2>
//                         {/* <h3><strong>Email:</strong> {report.email}</h3> */}
//                         <p><strong>Created At:</strong> {new Date(report.createdAt).toLocaleString()}</p>
//                         <div className="report-analysis">
//                           <h4><strong>Analysis</strong></h4>
//                           <div
//   className="analysis-content"
//   dangerouslySetInnerHTML={{
//     __html: report.reportAnalysis
//       .replace(/The user's/g, "You'r") // Replace "The user's" with "You'r"
//       .replace(/\*/g, '') // Remove all * characters
//       .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong><br/>') // Bold the overall score and add a line break
//       // .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency)/g, 
//       //   '<div class="section-header">$1</div>') // Wrap headings in <div> and add two line breaks after each
//       .replace(/(Technical Proficiency:|Communication:|Decision-Making:|Confidence:|Language Fluency:)/g, 
//         '<br/><br/><div class="section-header">$1</div>') // Wrap headings in <div> and add two line breaks after each
//        // Wrap headings in <div> and add two line breaks after each
//       .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>') // Recommendation header
//       // .replace(/(\.)(?=\s)/g, '.<br/>') // Add <br/> after each period followed by a space
//   }}
// />
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

// export default Oldreport;
// import React, { useState, useEffect } from 'react';
// import { IoIosArrowBack } from "react-icons/io";
// import { useRouter } from 'next/router';
// import { CircularProgressbar } from 'react-circular-progressbar';
// import 'react-circular-progressbar/dist/styles.css';
// function Oldreport() {
//   const router = useRouter();

//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null);
//   const [reports, setReports] = useState([]);
//   const [isEmailFetched, setIsEmailFetched] = useState(false);
//   const [visibility, setVisibility] = useState({
//     report: false,
//     previousReports: false,
//   });
//   const [reportVisibility, setReportVisibility] = useState([]);
//   // const InterviewReport = ({ report, visibility, goBack, downloadReport, toggleIndividualReportVisibility, reportVisibility }) => {
//     // Extract numeric value from the score (e.g., "4/10")
//     const extractScore = (scoreString) => {
//       const match = scoreString.match(/(\d+)\/(\d+)/); // Match "4/10"
//       if (match) {
//         return parseInt(match[1]); // Return numeric value of score (e.g., 4)
//       }
//       return 0; // Fallback if the score is not valid
//     };

//   // Fetch email from localStorage
//   useEffect(() => {
//     const userFromStorage = localStorage.getItem('user');
//     if (userFromStorage) {
//       const parsedUser = JSON.parse(userFromStorage);
//       const email = parsedUser.email;

//       // Debug: log the email fetched from localStorage
//       console.log("Fetched email from localStorage:", email);

//       if (email) {
//         setEmail(email);
//         setIsEmailFetched(true);
//         setVisibility((prevVisibility) => ({
//           ...prevVisibility,
//           previousReports: true,
//         }));
//       } else {
//         console.error("Email is missing in localStorage");
//         setError("Email is missing in localStorage");
//       }
//     } else {
//       console.error("No user data found in localStorage");
//       setError("No user data found in localStorage");
//     }
//   }, []);

//   // Fetch reports when email is set
//   useEffect(() => {
//     // Ensure email is set and fetched before calling the API
//     if (email && isEmailFetched) {
//       const fetchReportsByEmail = async () => {
//         try {
//           console.log("Fetching reports for email:", email);

//           const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/storeReport?email=${email}`);

//           if (!response.ok) {
//             throw new Error(`Failed to fetch reports, status: ${response.status}`);
//           }

//           const data = await response.json();
//           console.log('Fetched reports:', data);

//           if (data.reports && data.reports.length > 0) {
//             const sortedReports = data.reports.sort((a, b) => {
//               const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
//               const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
//               return dateB - dateA;
//             });
//             setReports(sortedReports);
//             setReportVisibility(new Array(sortedReports.length).fill(false)); // Initialize visibility
//           } else {
//             console.log('No reports available for the given email.');
//             setReports([]);
//           }
//         } catch (err) {
//           console.error('Error fetching reports:', err);
//           setError(`Error fetching reports: ${err.message}`);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchReportsByEmail();
//     } else {
//       console.log("Waiting for email to be fetched and set.");
//     }
//   }, [email, isEmailFetched]);

//   // Handle Go Back Logic
//   const goBack = () => {
//     if (document.referrer.includes('/report')) {
//       router.push('/');
//     } else {
//       router.back();
//     }
//   };

//   // Handle toggle visibility of report sections
//   const toggleVisibility = (section) => {
//     setVisibility((prevVisibility) => ({
//       ...prevVisibility,
//       [section]: !prevVisibility[section],
//     }));
//   };

//   // Toggle visibility for individual reports
//   const toggleIndividualReportVisibility = (index) => {
//     setReportVisibility((prevVisibility) => {
//       const newVisibility = [...prevVisibility];
//       newVisibility[index] = !newVisibility[index];  // Toggle visibility at the given index
//       return newVisibility;
//     });
//   };

//   // Handle report download
//   const downloadReport = (analysis) => {
//     const blob = new Blob([analysis], { type: 'application/pdf' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report.pdf';
//     link.click();
//   };

//   if (error) {
//     return <div>Error: {error}</div>;
//   }



//   return (
// //     <div className='min-h-screen bg-cover' style={{ backgroundImage: "url('/BG.jpg')" }}>
// //       <div className='absolute top-5 left-3 text-4xl text-white' onClick={goBack}>
// //         <IoIosArrowBack />
// //       </div>
// //       <div className="text-white">
// //         <h1 className="text-center  text-4xl font-bold">Interview Report</h1>
// //         <div className="mx-auto mt-5">
// //   {visibility.previousReports && (
// //     <div className="mx-auto mt-5">
// //       {reports.length > 0 ? (
// //         reports.map((report, index) => (
// //           <div key={index} className="bg-transparent shadow-lg rounded-lg p-2 max-w-lg mx-auto">
// //             <div
// //               className="bg-purple-500 text-white p-4 rounded-t-lg cursor-pointer flex justify-between items-center"
// //               onClick={() => toggleIndividualReportVisibility(index)}
// //             >
// //               <span>{reportVisibility[index] ? 'Hide' : 'Show'} Report ▼</span>
// //               <span className="text-sm">{new Date(report.createdAt).toLocaleString()}</span>
// //             </div>

// //             {reportVisibility[index] && (
// //               <div className="p-4">
// //                 <h2 className="text-lg font-semibold">
// //                   <strong>Role:</strong> {report.role}
// //                 </h2>
// //                 <div className="report-analysis mt-4">
// //                   <h4 className="text-xl font-semibold mb-2">
// //                     <strong>Analysis</strong>
// //                   </h4>
// //                   <div
// //                     className="analysis-content mb-4"
// //                     dangerouslySetInnerHTML={{
// //                       __html: report.reportAnalysis
// //                         .replace(/The user's/g, "You're")
// //                         .replace(/\*/g, '')
// //                         .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong><br/>')
// //                         .replace(/(Technical Proficiency:|Communication:|Decision-Making:|Confidence:|Language Fluency:|Overall|recommendations|recommendation)/g,
// //                           '<br/><br/><div class="section-header">$1</div>')
// //                         .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency|Overall|recommendations|recommendation)/g,
// //                           '<br/><div class="section-header">$1</div>')
// //                         .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
// //                     }}
// //                   />
// //                   <button
// //                     className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-2 hover:bg-blue-600"
// //                     onClick={() => downloadReport(report.reportAnalysis)}
// //                   >
// //                     Download Report
// //                   </button>
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         ))
// //       ) : (
// //         <div className="text-center mt-5 text-gray-600">For Report Visit After 5 Min</div>
// //       )}
// //     </div>
// //   )}
// // </div>

// //       </div>
// //     </div>
// <div className='min-h-screen bg-cover' style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className='absolute top-5 left-3 text-4xl text-white' onClick={goBack}>
//         {/* Back Arrow Icon */}
//       </div>
//       <div className="text-white">
//         <h1 className="text-center text-4xl font-bold">Interview Report</h1>
//         <div className="mx-auto mt-5">
//           {visibility.previousReports && (
//             <div className="mx-auto mt-5">
//               {report ? (
//                 <div className="bg-transparent shadow-lg rounded-lg p-4 max-w-lg mx-auto mb-6">
//                   <div
//                     className="bg-purple-500 text-white p-4 rounded-t-lg cursor-pointer flex justify-between items-center"
//                     onClick={() => toggleIndividualReportVisibility(0)}
//                   >
//                     <span>{reportVisibility[0] ? 'Hide' : 'Show'} Report ▼</span>
//                     <span className="text-sm">{new Date(report.createdAt).toLocaleString()}</span>
//                   </div>

//                   {reportVisibility[0] && (
//                     <div className="p-4">
//                       <h2 className="text-lg font-semibold">
//                         <strong>Role:</strong> {report.role}
//                       </h2>
//                       <div className="report-analysis mt-4">
//                         <h4 className="text-xl font-semibold mb-2">
//                           <strong>Analysis</strong>
//                         </h4>
//                         <div
//                           className="analysis-content mb-4"
//                           dangerouslySetInnerHTML={{
//                             __html: report.reportAnalysis
//                               .replace(/The user's/g, "You're")
//                               .replace(/\*/g, '')
//                           }}
//                         />

//                         {/* Circular Progress Bars for Scores */}
//                         <div className="mt-4">
//                           <h5>Technical Proficiency</h5>
//                           <div className="flex justify-center items-center mt-2">
//                             <CircularProgressbar
//                               value={extractScore("4/10")} // Example score extraction
//                               maxValue={10}
//                               text={`4/10`}
//                               strokeWidth={10}
//                               styles={{
//                                 path: {
//                                   stroke: '#4b5563', // Path color
//                                 },
//                                 text: {
//                                   fill: '#ffffff', // Text color
//                                   fontSize: '16px',
//                                 },
//                               }}
//                             />
//                           </div>
//                         </div>

//                         {/* Other categories (e.g., Communication, Confidence) */}
//                         <div className="mt-4">
//                           <h5>Communication</h5>
//                           <div className="flex justify-center items-center mt-2">
//                             <CircularProgressbar
//                               value={extractScore("5/10")} // Example score extraction
//                               maxValue={10}
//                               text={`5/10`}
//                               strokeWidth={10}
//                               styles={{
//                                 path: {
//                                   stroke: '#4b5563',
//                                 },
//                                 text: {
//                                   fill: '#ffffff',
//                                   fontSize: '16px',
//                                 },
//                               }}
//                             />
//                           </div>
//                         </div>

//                         {/* Other sections here */}
//                       </div>

//                       {/* Download Button */}
//                       <button
//                         className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 hover:bg-blue-600"
//                         onClick={() => downloadReport(report.reportAnalysis)}
//                       >
//                         Download Report
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center mt-5 text-gray-600">For Report Visit After 5 Min</div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>


//   );
// }

// export default Oldreport;

// import React, { useState, useEffect } from 'react';
// import { IoIosArrowBack } from "react-icons/io";
// import { useRouter } from 'next/router';
// import { CircularProgressbar } from 'react-circular-progressbar';
// import 'react-circular-progressbar/dist/styles.css';

// function Oldreport() {
//   const router = useRouter();

//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null);
//   const [reports, setReports] = useState([]);
//   const [isEmailFetched, setIsEmailFetched] = useState(false);
//   const [visibility, setVisibility] = useState({
//     report: false,
//     previousReports: false,
//   });
//   const [reportVisibility, setReportVisibility] = useState([]);

//   // Extract numeric value from the score (e.g., "2/10" or any numeric score)
//   // Extract numeric value from the score (e.g., "4/10", "5 out of 10", or "3 of 10")
//   const extractScore = (scoreString) => {
//     console.log("scoreString",scoreString);
    
//     if (typeof scoreString === 'string') {
//       // Match any "X/10", "X out of 10", or "X of 10" pattern
//       const match = scoreString.match(/(\d+)\s*(?:\/|out\s*of\s*|of)\s*10/i);
//       if (match) {
//         return parseInt(match[1], 10); // Return the first numeric value (e.g., "4" from "4/10")
//       }
//     }
//     return 0; // Default value if no match is found
//   };
  

//   // Fetch email from localStorage
//   useEffect(() => {
//     const userFromStorage = localStorage.getItem('user');
//     if (userFromStorage) {
//       const parsedUser = JSON.parse(userFromStorage);
//       const email = parsedUser.email;

//       if (email) {
//         setEmail(email);
//         setIsEmailFetched(true);
//         setVisibility((prevVisibility) => ({
//           ...prevVisibility,
//           previousReports: true,
//         }));
//       } else {
//         setError("Email is missing in localStorage");
//       }
//     } else {
//       setError("No user data found in localStorage");
//     }
//   }, []);

//   // Fetch reports when email is set
//   useEffect(() => {
//     if (email && isEmailFetched) {
//       const fetchReportsByEmail = async () => {
//         try {
//           const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/storeReport?email=${email}`);
//           if (!response.ok) {
//             throw new Error(`Failed to fetch reports, status: ${response.status}`);
//           }
//           const data = await response.json();
//           if (data.reports && data.reports.length > 0) {
//             const sortedReports = data.reports.sort((a, b) => {
//               const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
//               const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
//               return dateB - dateA;
//             });
//             setReports(sortedReports);
//             setReportVisibility(new Array(sortedReports.length).fill(false)); // Initialize visibility
//           } else {
//             setReports([]);
//           }
//         } catch (err) {
//           setError(`Error fetching reports: ${err.message}`);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchReportsByEmail();
//     }
//   }, [email, isEmailFetched]);

//   // Handle Go Back Logic
//   const goBack = () => {
//     if (document.referrer.includes('/report')) {
//       router.push('/');
//     } else {
//       router.back();
//     }
//   };

//   // Handle toggle visibility of report sections
//   const toggleVisibility = (section) => {
//     setVisibility((prevVisibility) => ({
//       ...prevVisibility,
//       [section]: !prevVisibility[section],
//     }));
//   };

//   // Toggle visibility for individual reports
//   const toggleIndividualReportVisibility = (index) => {
//     setReportVisibility((prevVisibility) => {
//       const newVisibility = [...prevVisibility];
//       newVisibility[index] = !newVisibility[index];
//       return newVisibility;
//     });
//   };

//   // Handle report download
//   const downloadReport = (analysis) => {
//     const blob = new Blob([analysis], { type: 'application/pdf' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report.pdf';
//     link.click();
//   };

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     <div className='min-h-screen bg-cover' style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className='absolute top-5 left-3 text-4xl text-white' onClick={goBack}>
//         {/* Back Arrow Icon */}
//       </div>
//       <div className="text-white">
//         <h1 className="text-center text-4xl font-bold">Interview Report</h1>
//         <div className="mx-auto mt-5">
//           {visibility.previousReports && (
//             <div className="mx-auto mt-5">
//               {reports && reports.length > 0 ? (
//                 reports.map((report, index) => (
//                   <div key={index} className="bg-transparent shadow-lg rounded-lg p-4 max-w-lg mx-auto mb-6">
//                     <div
//                       className="bg-purple-500 text-white p-4 rounded-t-lg cursor-pointer flex justify-between items-center"
//                       onClick={() => toggleIndividualReportVisibility(index)}
//                     >
//                       <span>{reportVisibility[index] ? 'Hide' : 'Show'} Report ▼</span>
//                       <span className="text-sm">{new Date(report.createdAt).toLocaleString()}</span>
//                     </div>

//                     {reportVisibility[index] && (
//                       <div className="p-4">
//                         <h2 className="text-lg font-semibold">
//                           <strong>Role:</strong> {report.role}
//                         </h2>
//                         <div className="report-analysis mt-4">
//                           <h4 className="text-xl font-semibold mb-2">
//                             <strong>Analysis</strong>
//                           </h4>
//                           <div
//                             className="analysis-content mb-4"
//                             dangerouslySetInnerHTML={{
//                               __html: report.reportAnalysis.replace(/The user's/g, "You're").replace(/\*/g, ''),
//                             }}
//                           />

//                           {/* Displaying Circular Progressbars for scores */}
//                           <div className="mt-4">
//                             <h5>Technical Proficiency</h5>
//                             <div className="flex justify-center items-center mt-2">
//                               <CircularProgressbar
//                                 value={extractScore(report.technicalProficiency)} // This will dynamically extract the score
//                                 maxValue={10}
//                                 text={`${extractScore(report.technicalProficiency)}/10`}
//                                 strokeWidth={10}
//                                 styles={{
//                                   path: { stroke: '#4b5563' },
//                                   text: { fill: '#ffffff', fontSize: '16px' },
//                                 }}
//                               />

//                             </div>
//                           </div>

//                           <div className="mt-4">
//                             <h5>Communication</h5>
//                             <div className="flex justify-center items-center mt-2">
//                               <CircularProgressbar
//                                 value={extractScore(report.communication)} // Dynamic score extraction from report data
//                                 maxValue={10}
//                                 text={`${extractScore(report.communication)}/10`}
//                                 strokeWidth={10}
//                                 styles={{
//                                   path: { stroke: '#4b5563' },
//                                   text: { fill: '#ffffff', fontSize: '16px' },
//                                 }}
//                               />
//                             </div>
//                           </div>

//                           {/* Other sections like Decision-Making, Confidence */}
//                           <div className="mt-4">
//                             <h5>Decision-Making</h5>
//                             <div className="flex justify-center items-center mt-2">
//                               <CircularProgressbar
//                                 value={extractScore(report.decisionMaking)} // Dynamic score extraction from report data
//                                 maxValue={10}
//                                 text={`${extractScore(report.decisionMaking)}/10`}
//                                 strokeWidth={10}
//                                 styles={{
//                                   path: { stroke: '#4b5563' },
//                                   text: { fill: '#ffffff', fontSize: '16px' },
//                                 }}
//                               />
//                             </div>
//                           </div>

//                           <div className="mt-4">
//                             <h5>Confidence</h5>
//                             <div className="flex justify-center items-center mt-2">
//                               <CircularProgressbar
//                                 value={extractScore(report.confidence)} // Dynamic score extraction from report data
//                                 maxValue={10}
//                                 text={`${extractScore(report.confidence)}/10`}
//                                 strokeWidth={10}
//                                 styles={{
//                                   path: { stroke: '#4b5563' },
//                                   text: { fill: '#ffffff', fontSize: '16px' },
//                                 }}
//                               />
//                             </div>
//                           </div>

//                           {/* Download Button */}
//                           <button
//                             className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 hover:bg-blue-600"
//                             onClick={() => downloadReport(report.reportAnalysis)}
//                           >
//                             Download Report
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center mt-5 text-gray-600">For Report Visit After 5 Min</div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Oldreport;


// import React, { useState, useEffect } from 'react';
// import { IoIosArrowBack } from "react-icons/io";
// import { useRouter } from 'next/router';
// import { CircularProgressbar } from 'react-circular-progressbar';
// import 'react-circular-progressbar/dist/styles.css';

// function Oldreport() {
//   const router = useRouter();

//   const [email, setEmail] = useState('');
//   const[score,setScore]=useState('')
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null);
//   const [reports, setReports] = useState([]);
//   const [isEmailFetched, setIsEmailFetched] = useState(false);
//   const [visibility, setVisibility] = useState({
//     report: false,
//     previousReports: false,
//   });
//   const [reportVisibility, setReportVisibility] = useState([]);

//   // Extract numeric value from the score (e.g., "4/10", "5 out of 10", or "3 of 10")
//   const extractScore = (reports) => {
//     console.log("scoreString", reports);

//     if (typeof reports === 'string') {
//       // Match any "X/10", "X out of 10", or "X of 10" pattern
//       const match = reports.match(/(\d+)\s*(?:\/|out\s*of\s*|of)\s*10/i);
//       if (match) {
//         return parseInt(match[1], 10); // Return the first numeric value (e.g., "4" from "4/10")
//       }
//     }
//     return 0; // Default value if no match is found
//   };

//   // Fetch email from localStorage
//   useEffect(() => {
//     const userFromStorage = localStorage.getItem('user');
//     if (userFromStorage) {
//       const parsedUser = JSON.parse(userFromStorage);
//       const email = parsedUser.email;

//       if (email) {
//         setEmail(email);
//         setIsEmailFetched(true);
//         setVisibility((prevVisibility) => ({
//           ...prevVisibility,
//           previousReports: true,
//         }));
//       } else {
//         setError("Email is missing in localStorage");
//       }
//     } else {
//       setError("No user data found in localStorage");
//     }
//   }, []);

//   // Fetch reports when email is set
//   useEffect(() => {
//     if (email && isEmailFetched) {
//       const fetchReportsByEmail = async () => {
//         try {
//           const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/storeReport?email=${email}`);
//           if (!response.ok) {
//             throw new Error(`Failed to fetch reports, status: ${response.status}`);
//           }
//           const data = await response.json();
//           if (data.reports && data.reports.length > 0) {
//             const sortedReports = data.reports.sort((a, b) => {
//               const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
//               const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
//               return dateB - dateA;
//             });
//             setReports(sortedReports);
//             setReportVisibility(new Array(sortedReports.length).fill(false));

//             const score = extractScore(sortedReports);

//             setScore(score);
//           } else {
//             setReports([]);
//           }
//         } catch (err) {
//           setError(`Error fetching reports: ${err.message}`);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchReportsByEmail();
//     }
//   }, [email, isEmailFetched]);

//   // Handle Go Back Logic
//   const goBack = () => {
//     if (document.referrer.includes('/report')) {
//       router.push('/');
//     } else {
//       router.back();
//     }
//   };

//   // Handle toggle visibility of report sections
//   const toggleVisibility = (section) => {
//     setVisibility((prevVisibility) => ({
//       ...prevVisibility,
//       [section]: !prevVisibility[section],
//     }));
//   };

//   // Toggle visibility for individual reports
//   const toggleIndividualReportVisibility = (index) => {
//     setReportVisibility((prevVisibility) => {
//       const newVisibility = [...prevVisibility];
//       newVisibility[index] = !newVisibility[index];
//       return newVisibility;
//     });
//   };

//   // Handle report download
//   const downloadReport = (analysis) => {
//     const blob = new Blob([analysis], { type: 'application/pdf' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report.pdf';
//     link.click();
//   };

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     <div className='min-h-screen bg-cover' style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className='absolute top-5 left-3 text-4xl text-white' onClick={goBack}>
//         {/* Back Arrow Icon */}
//       </div>
//       <div className="text-white">
//         <h1 className="text-center text-4xl font-bold">Interview Report</h1>
//         <div className="mx-auto mt-5">
//           {visibility.previousReports && (
//             <div className="mx-auto mt-5">
//               {reports && reports.length > 0 ? (
//                 reports.map((report, index) => (
//                   <div key={index} className="bg-transparent shadow-lg rounded-lg p-4 max-w-lg mx-auto mb-6">
//                     <div
//                       className="bg-purple-500 text-white p-4 rounded-t-lg cursor-pointer flex justify-between items-center"
//                       onClick={() => toggleIndividualReportVisibility(index)}
//                     >
//                       <span>{reportVisibility[index] ? 'Hide' : 'Show'} Report ▼</span>
//                       <span className="text-sm">{new Date(report.createdAt).toLocaleString()}</span>
//                     </div>

//                     {reportVisibility[index] && (
//                       <div className="p-4">
//                         <h2 className="text-lg font-semibold">
//                           <strong>Role:</strong> {report.role}
//                         </h2>
//                         <div className="report-analysis mt-4">
//                           <h4 className="text-xl font-semibold mb-2">
//                             <strong>Analysis</strong>
//                           </h4>
//                           <div
//                             className="analysis-content mb-4"
//                             dangerouslySetInnerHTML={{
//                               __html: report.reportAnalysis.replace(/The user's/g, "You're").replace(/\*/g, ''),
//                             }}
//                           />

//                           {/* Displaying Circular Progressbars for scores */}
//                           <div className="mt-4">
//                             <h5>Technical Proficiency</h5>
//                             <div className="flex justify-center items-center mt-2">
//                               <CircularProgressbar
//                                 value={extractScore(report.technicalProficiency || '')} // Safe check for undefined or missing score
//                                 maxValue={10}
//                                 text={`${extractScore(report.technicalProficiency || '')}/10`}
//                                 strokeWidth={10}
//                                 styles={{
//                                   path: { stroke: '#4b5563' },
//                                   text: { fill: '#ffffff', fontSize: '16px' },
//                                 }}
//                               />
//                             </div>
//                           </div>

//                           <div className="mt-4">
//                             <h5>Communication</h5>
//                             <div className="flex justify-center items-center mt-2">
//                               <CircularProgressbar
//                                 value={extractScore(report.communication || '')} // Safe check for undefined or missing score
//                                 maxValue={10}
//                                 text={`${extractScore(report.communication || '')}/10`}
//                                 strokeWidth={10}
//                                 styles={{
//                                   path: { stroke: '#4b5563' },
//                                   text: { fill: '#ffffff', fontSize: '16px' },
//                                 }}
//                               />
//                             </div>
//                           </div>

//                           <div className="mt-4">
//                             <h5>Decision-Making</h5>
//                             <div className="flex justify-center items-center mt-2">
//                               <CircularProgressbar
//                                 value={extractScore(report.decisionMaking || '')} // Safe check for undefined or missing score
//                                 maxValue={10}
//                                 text={`${extractScore(report.decisionMaking || '')}/10`}
//                                 strokeWidth={10}
//                                 styles={{
//                                   path: { stroke: '#4b5563' },
//                                   text: { fill: '#ffffff', fontSize: '16px' },
//                                 }}
//                               />
//                             </div>
//                           </div>

//                           <div className="mt-4">
//                             <h5>Confidence</h5>
//                             <div className="flex justify-center items-center mt-2">
//                               <CircularProgressbar
//                                 value={extractScore(report.confidence || '')} // Safe check for undefined or missing score
//                                 maxValue={10}
//                                 text={`${extractScore(report.confidence || '')}/10`}
//                                 strokeWidth={10}
//                                 styles={{
//                                   path: { stroke: '#4b5563' },
//                                   text: { fill: '#ffffff', fontSize: '16px' },
//                                 }}
//                               />
//                             </div>
//                           </div>

//                           {/* Download Button */}
//                           <button
//                             className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 hover:bg-blue-600"
//                             onClick={() => downloadReport(report.reportAnalysis)}
//                           >
//                             Download Report
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center mt-5 text-gray-600">For Report Visit After 5 Min</div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Oldreport;


// import React, { useState, useEffect } from 'react';
// import { IoIosArrowBack } from "react-icons/io";
// import { useRouter } from 'next/router';
// import { CircularProgressbar } from 'react-circular-progressbar';
// import 'react-circular-progressbar/dist/styles.css';

// function Oldreport() {
//   const router = useRouter();

//   const [email, setEmail] = useState('');
//   const [score, setScore] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null);
//   const [reports, setReports] = useState([]);
//   const [isEmailFetched, setIsEmailFetched] = useState(false);
//   const [visibility, setVisibility] = useState({
//     report: false,
//     previousReports: false,
//   });
//   const [reportVisibility, setReportVisibility] = useState([]);

//   // Extract numeric value from the score (e.g., "4/10", "5 out of 10", or "3 of 10")
//   const extractScore = (report, scoreType) => {
//     console.log("Extracting score from:", report);

//     if (!report || !scoreType) {
//       return 0; // Return 0 if the report or scoreType is invalid
//     }

//     const score = report[scoreType];

//     if (typeof score === 'string') {
//       const match = score.match(/(\d+)\s*(?:\/|out\s*of\s*|of)\s*10/i);
//       if (match) {
//         return parseInt(match[1], 10); // Return the first numeric value (e.g., "4" from "4/10")
//       }
//     }

//     return 0; // Return 0 if no score is found or the score is invalid
//   };

//   // Fetch email from localStorage
//   useEffect(() => {
//     const userFromStorage = localStorage.getItem('user');
//     if (userFromStorage) {
//       const parsedUser = JSON.parse(userFromStorage);
//       const email = parsedUser.email;

//       if (email) {
//         setEmail(email);
//         setIsEmailFetched(true);
//         setVisibility((prevVisibility) => ({
//           ...prevVisibility,
//           previousReports: true,
//         }));
//       } else {
//         setError("Email is missing in localStorage");
//       }
//     } else {
//       setError("No user data found in localStorage");
//     }
//   }, []);

//   // Fetch reports when email is set
//   useEffect(() => {
//     if (email && isEmailFetched) {
//       const fetchReportsByEmail = async () => {
//         try {
//           const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/storeReport?email=${email}`);
//           if (!response.ok) {
//             throw new Error(`Failed to fetch reports, status: ${response.status}`);
//           }
//           const data = await response.json();
//           console.log('Fetched data:', data); // Log the fetched data to inspect the structure

//           if (data.reports && data.reports.length > 0) {
//             const sortedReports = data.reports.sort((a, b) => {
//               const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
//               const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
//               return dateB - dateA;
//             });
//             setReports(sortedReports);
//             setReportVisibility(new Array(sortedReports.length).fill(false));

//             // Calculate score
//             const score = extractScore(sortedReports);
//             setScore(score);
//           } else {
//             setReports([]);
//           }
//         } catch (err) {
//           setError(`Error fetching reports: ${err.message}`);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchReportsByEmail();
//     }
//   }, [email, isEmailFetched]);

//   // Handle Go Back Logic
//   const goBack = () => {
//     if (document.referrer.includes('/report')) {
//       router.push('/');
//     } else {
//       router.back();
//     }
//   };

//   // Handle toggle visibility of report sections
//   const toggleVisibility = (section) => {
//     setVisibility((prevVisibility) => ({
//       ...prevVisibility,
//       [section]: !prevVisibility[section],
//     }));
//   };

//   // Toggle visibility for individual reports
//   const toggleIndividualReportVisibility = (index) => {
//     setReportVisibility((prevVisibility) => {
//       const newVisibility = [...prevVisibility];
//       newVisibility[index] = !newVisibility[index];
//       return newVisibility;
//     });
//   };

//   // Handle report download
//   const downloadReport = (analysis) => {
//     const blob = new Blob([analysis], { type: 'application/pdf' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'report.pdf';
//     link.click();
//   };

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   // ScoreCard component to handle repeated circular progress bar logic
//   const ScoreCard = ({ label, score }) => (
//     <div className="mt-4">
//       <h5>{label}</h5>
//       <div className="flex justify-center items-center mt-2">
//         <CircularProgressbar
//           value={score}
//           maxValue={10}
//           text={`${score}/10`}
//           strokeWidth={10}
//           styles={{
//             path: { stroke: '#4b5563' },
//             text: { fill: '#ffffff', fontSize: '16px' },
//           }}
//         />
//       </div>
//     </div>
//   );

//   return (
//     <div className='min-h-screen bg-cover' style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className='absolute top-5 left-3 text-4xl text-white' onClick={goBack}>
//         {/* Back Arrow Icon */}
//       </div>
//       <div className="text-white">
//         <h1 className="text-center text-4xl font-bold">Interview Report</h1>
//         <div className="mx-auto mt-5">
//           {visibility.previousReports && (
//             <div className="mx-auto mt-5">
//               {reports && reports.length > 0 ? (
//                 reports.map((report, index) => (
//                   <div key={index} className="bg-transparent shadow-lg rounded-lg p-4 max-w-lg mx-auto mb-6">
//                     <div
//                       className="bg-purple-500 text-white p-4 rounded-t-lg cursor-pointer flex justify-between items-center"
//                       onClick={() => toggleIndividualReportVisibility(index)}
//                     >
//                       <span>{reportVisibility[index] ? 'Hide' : 'Show'} Report ▼</span>
//                       <span className="text-sm">{new Date(report.createdAt).toLocaleString()}</span>
//                     </div>

//                     {reportVisibility[index] && (
//                       <div className="p-4">
//                         <h2 className="text-lg font-semibold">
//                           <strong>Role:</strong> {report.role}
//                         </h2>
//                         <div className="report-analysis mt-4">
//                           <h4 className="text-xl font-semibold mb-2">
//                             <strong>Analysis</strong>
//                           </h4>
//                           <div
//                             className="analysis-content mb-4"
//                             dangerouslySetInnerHTML={{
//                               __html: report.reportAnalysis.replace(/The user's/g, "You're").replace(/\*/g, ''),
//                             }}
//                           />
//                           {/* Displaying Circular Progressbars for scores */}
//                           <ScoreCard label="Technical Proficiency" score={extractScore(report, 'technicalProficiency')} />
//                           <ScoreCard label="Communication" score={extractScore(report, 'communication')} />
//                           <ScoreCard label="Decision-Making" score={extractScore(report, 'decisionMaking')} />
//                           <ScoreCard label="Confidence" score={extractScore(report, 'confidence')} />

//                           {/* Download Button */}
//                           <button
//                             className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 hover:bg-blue-600"
//                             onClick={() => downloadReport(report.reportAnalysis)}
//                           >
//                             Download Report
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center mt-5 text-gray-600">For Report Visit After 5 Min</div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Oldreport;


// import React, { useState, useEffect } from 'react';
// import { IoIosArrowBack } from "react-icons/io";
// import { useRouter } from 'next/router';
// import { CircularProgressbar } from 'react-circular-progressbar';
// import 'react-circular-progressbar/dist/styles.css';
// import { jsPDF } from "jspdf";

// function Oldreport() {
//   const router = useRouter();

//   const [email, setEmail] = useState('');
//   const [score, setScore] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [reportAnalysis, setReportAnalysis] = useState(null);
//   const [reports, setReports] = useState([]);
//   const [isEmailFetched, setIsEmailFetched] = useState(false);
//   const [visibility, setVisibility] = useState({
//     report: false,
//     previousReports: false,
//   });
//   const [reportVisibility, setReportVisibility] = useState([]);

//   // Extract score based on the scoreType passed (Technical Proficiency, Communication, etc.)
//   const extractScore = (report, scoreType) => {
//     console.log("Extracting score from:", report);
//     console.log("Extracting score from:", scoreType);

//     if (!report || !report.reportAnalysis) {
//       return 0; // Return 0 if no report or reportAnalysis field is available
//     }

//     // Use regex to extract the score from reportAnalysis
//     const scoreRegex = new RegExp(`${scoreType}:\\s*(\\d+)\\/10`, 'i');
    

//     // const scoreRegex = new RegExp(`(?:${scoreType}:\\s*(\\d+)\\/10|([A-Za-z\\s]+(?:\\s?\\(\\d+-\\d+\\))?:\\s*(\\d+)\\/10))`, 'i');


    
//     const match = report.reportAnalysis.match(scoreRegex);

//     if (match) {
//       return parseInt(match[1], 10); // Return the numeric value found
//     }

//     return 0; // Return 0 if no score is found
//   };

//   // Fetch email from localStorage
//   useEffect(() => {
//     const userFromStorage = localStorage.getItem('user');
//     if (userFromStorage) {
//       const parsedUser = JSON.parse(userFromStorage);
//       const email = parsedUser.email;

//       if (email) {
//         setEmail(email);
//         setIsEmailFetched(true);
//         setVisibility((prevVisibility) => ({
//           ...prevVisibility,
//           previousReports: true,
//         }));
//       } else {
//         setError("Email is missing in localStorage");
//       }
//     } else {
//       setError("No user data found in localStorage");
//     }
//   }, []);

//   // Fetch reports when email is set
//   useEffect(() => {
//     if (email && isEmailFetched) {
//       const fetchReportsByEmail = async () => {
//         try {
//           const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/storeReport?email=${email}`);
//           if (!response.ok) {
//             throw new Error(`Failed to fetch reports, status: ${response.status}`);
//           }
//           const data = await response.json();
//           console.log('Fetched data:', data); // Log the fetched data to inspect the structure

//           if (data.reports && data.reports.length > 0) {
//             const sortedReports = data.reports.sort((a, b) => {
//               const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
//               const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
//               return dateB - dateA;
//             });
//             setReports(sortedReports);
//             setReportVisibility(new Array(sortedReports.length).fill(false));

//             // Calculate score
//             const score = extractScore(sortedReports);
//             setScore(score);
//           } else {
//             setReports([]);
//           }
//         } catch (err) {
//           setError(`Error fetching reports: ${err.message}`);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchReportsByEmail();
//     }
//   }, [email, isEmailFetched]);

//   // Handle Go Back Logic
//   const goBack = () => {
//     if (document.referrer.includes('/report')) {
//       router.push('/');
//     } else {
//       router.back();
//     }
//   };

//   // Handle toggle visibility of report sections
//   const toggleVisibility = (section) => {
//     setVisibility((prevVisibility) => ({
//       ...prevVisibility,
//       [section]: !prevVisibility[section],
//     }));
//   };

//   // Toggle visibility for individual reports
//   const toggleIndividualReportVisibility = (index) => {
//     setReportVisibility((prevVisibility) => {
//       const newVisibility = [...prevVisibility];
//       newVisibility[index] = !newVisibility[index];
//       return newVisibility;
//     });
//   };


  
  

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   const ScoreCard = ({ label, score }) => (
//     <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-lg shadow-lg">
//       <h5 className="text-white text-xl font-semibold">{label}</h5>
//       <div className="flex justify-center items-center mt-4">
//         <div></div>
//         <CircularProgressbar
//           value={score}
//           maxValue={10}
//           text={`${score}/10`}
//           strokeWidth={12}
//           styles={{
//             path: {
//               stroke: '#0700e7', // Gradient stroke
//               strokeLinecap: 'initial', // Smooth edges
//               strokeLinejoin: 'miter', // Start of the stroke will be sharp
//             transition: 'stroke-dashoffset 0.5s ease 0s', // Smooth transition
//               // text: { fill: '#ffffff', fontSize: '16px' },
            
//             },
//             trail: {
//               stroke: '#e0e0e0', // Light gray trail
//               strokeLinecap: 'round',
//             },
//             text: {
//               fill: '#ffffff', // White text
//               fontSize: '18px', // Larger font size
//               fontWeight: 'bold', // Bold text
//             },
//           }}
//         />
//       </div>
//       {/* SVG Gradient Definition */}
//       <svg className="hidden">
//         <defs>
//           <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" style={{ stopColor: '#4caf50', stopOpacity: 1 }} />
//             <stop offset="100%" style={{ stopColor: '#ff9800', stopOpacity: 1 }} />
//           </linearGradient>
//         </defs>
//       </svg>
//     </div>
//     );
//   return (
//     <div className='min-h-screen bg-cover' style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className='absolute top-5 left-3 text-4xl text-white' onClick={goBack}>
//         {/* Back Arrow Icon */}
//       </div>
//       <div className="text-white">
//         <h1 className="text-center text-4xl font-bold">Interview Report</h1>
//         <div className="mx-auto mt-5">
//           {visibility.previousReports && (
//             <div className="mx-auto ">
//               {reports && reports.length > 0 ? (
//                 reports.map((report, index) => (
//                   <div key={index} className="bg-transparent shadow-lg rounded-lg p-2 max-w-lg mx-auto">
//                     <div
//                       className="bg-purple-500 text-white p-4 rounded-t-lg cursor-pointer flex justify-between items-center"
//                       onClick={() => toggleIndividualReportVisibility(index)}
//                     >
//                       <span>{reportVisibility[index] ? 'Hide' : 'Show'} Report ▼</span>
//                       <span className="text-sm">{new Date(report.createdAt).toLocaleString()}</span>
//                     </div>

//                     {reportVisibility[index] && (
//                       <div className="p-4">
//                         <h2 className="text-lg font-semibold">
//                           <strong>Role:</strong> {report.role}
//                         </h2>
//                         <div className="report-analysis mt-4">
//                           <h4 className="text-xl font-semibold mb-2">
//                             <strong>Analysis</strong>
//                           </h4>
//                           <div className="grid grid-cols-2 gap-5">
                            
//                           <ScoreCard label="Technical Proficiency" score={extractScore(report, 'Technical Proficiency')} />
//                            <ScoreCard label="Communication" score={extractScore(report, 'Communication')} />
                         
                          
//                           <ScoreCard  label="Decision-Making" score={extractScore(report, 'Decision-Making')} />
//                            <ScoreCard label="Confidence" score={extractScore(report, 'Confidence')} />
                          
//                           <ScoreCard label="Language Fluency" score={extractScore(report, 'Language Fluency')} />
//                           </div>
//                           <div
//                     className="analysis-content mb-4"
//                     dangerouslySetInnerHTML={{
//                       __html: report.reportAnalysis
//                         .replace(/The user's/g, "You're")
//                         .replace(/\*/g, '')
//                         .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong><br/>')
//                         .replace(/(Technical Proficiency:|Communication:|Decision-Making:|Confidence:|Language Fluency:|Overall|recommendations|recommendation)/g,
//                           '<br/><br/><div class="section-header">$1</div>')
//                         .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency|Overall|recommendations|recommendation)/g,
//                           '<br/><div class="section-header">$1</div>')
//                         .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
//                     }} />
//                           {/* Displaying Circular Progressbars for scores */}
                         
//                           {/* Download Button */}
//                           <button
//                             className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 hover:bg-blue-600"
//                             onClick={() => downloadReport(report.reportAnalysis, report)}
//                           >
//                             Download Report
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center mt-5 text-gray-600">For Report Visit After 5 Min</div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Oldreport;

import React, { useState, useEffect } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from 'next/router';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { jsPDF } from "jspdf";

function Oldreport() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [score, setScore] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportAnalysis, setReportAnalysis] = useState(null);
  const [reports, setReports] = useState([]);
  const [isEmailFetched, setIsEmailFetched] = useState(false);
  const [visibility, setVisibility] = useState({
    report: false,
    previousReports: false,
  });
  const [reportVisibility, setReportVisibility] = useState([]);

  // Extract score based on the scoreType passed (Technical Proficiency, Communication, etc.)
  const extractScore = (report, scoreType) => {
    console.log("Extracting score from:", report);
    console.log("Extracting score from:", scoreType);

    if (!report || !report.reportAnalysis) {
      return 0; // Return 0 if no report or reportAnalysis field is available
    }

    // Use regex to extract the score from reportAnalysis
    const scoreRegex = new RegExp(`${scoreType}:\\s*(\\d+)\\/10`, 'i');
    

    // const scoreRegex = new RegExp(`(?:${scoreType}:\\s*(\\d+)\\/10|([A-Za-z\\s]+(?:\\s?\\(\\d+-\\d+\\))?:\\s*(\\d+)\\/10))`, 'i');


    
    const match = report.reportAnalysis.match(scoreRegex);

    if (match) {
      return parseInt(match[1], 10); // Return the numeric value found
    }

    return 0; // Return 0 if no score is found
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
          const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/storeReport?email=${email}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch reports, status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Fetched data:', data); // Log the fetched data to inspect the structure

          if (data.reports && data.reports.length > 0) {
            const sortedReports = data.reports.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
              const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
              return dateB - dateA;
            });
            setReports(sortedReports);
            setReportVisibility(new Array(sortedReports.length).fill(false));

            // Calculate score
            const score = extractScore(sortedReports);
            setScore(score);
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
      router.back();
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


 
  const createCircularProgress = (doc, x, y, percentage) => {
    const radius = 20;
    const angle = (percentage / 100) * 360; // Calculate the angle in degrees for the progress
  
    // Background Circle (Light gray)
    doc.setFillColor(220, 220, 220); // Light gray for background
    doc.circle(x, y, radius, "F");   // Full background circle
  
    // Start angle for the progress arc (starting at the top)
    const startAngle = -90; // -90 degrees is the top of the circle
  
    // Create path to simulate the arc (draw lines forming an arc)
    doc.setFillColor(0, 112, 255); // Blue color for progress
  
    // Convert angles to radians for the path
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = ((startAngle - angle) * Math.PI) / 180;
  
    // Create the progress circle arc manually using path
    doc.moveTo(x, y); // Start from the center of the circle
    doc.lineTo(x + radius, y); // Move to the rightmost point on the circle
    // doc.arc(x, y, radius, startAngleRad, endAngleRad, "F");  // Draw filled arc
  
    // Draw the percentage text in the center of the circle
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(10);
    doc.text(`${percentage}%`, x - 10, y + 3); // Adjust text position as necessary
  };
  
  
  
  
 
//   const downloadReport = (reportContent, report) => {
//     const doc = new jsPDF();

//     // Fix Date Issue
//     const reportDate = report.createdAt ? new Date(report.createdAt).toLocaleString() : "Unknown Date";

//     // Title of the report
//     doc.setFontSize(20);
//     doc.text("Interview Report", doc.internal.pageSize.width / 2, 20, { align: "center" });

//     // Report Role and Date
//     doc.setFontSize(14);
//     doc.text(`Role: ${report.role}`, 20, 30);
//     doc.text(`Date: ${reportDate}`, 20, 40);

//     // Analysis Section
//     doc.setFontSize(14);
//     doc.text("Analysis:", 20, 50);

//     // Wrap long text
//     doc.setFontSize(12);
//     const wrappedText = doc.splitTextToSize(reportContent.replace(/<[^>]*>/g, ' '), 170);
//     doc.text(wrappedText, 20, 60);

//     // Scores Section
//     const scores = [
//         { label: 'Technical Proficiency', score: extractScore(report, 'Technical Proficiency') },
//         { label: 'Communication', score: extractScore(report, 'Communication') },
//         { label: 'Decision-Making', score: extractScore(report, 'Decision-Making') },
//         { label: 'Confidence', score: extractScore(report, 'Confidence') },
//         { label: 'Language Fluency', score: extractScore(report, 'Language Fluency') },
//     ];

//     let currentY = 100;
//     scores.forEach((score) => {
//         doc.setFontSize(12);
//         doc.text(`${score.label}:`, 20, currentY);

//         // Progress Bar instead of Circular Progress
//         const progressWidth = (score.score / 10) * 50; // Scale to 50 pixels
//         doc.setFillColor(50, 150, 250); // Blue color
//         doc.rect(100, currentY - 5, progressWidth, 5, "F"); // Fill rectangle as progress bar

//         // Display the score
//         doc.text(`${score.score}/10`, 160, currentY);
//         currentY += 20; // Space between scores
//     });

//     // Separator Line
//     doc.setLineWidth(0.5);
//     doc.line(20, currentY + 5, 190, currentY + 5);

//     // Recommendations Section
//     doc.text(`Recommendation:\n${report.recommendations || "No recommendation provided."}`, 20, currentY + 15);

//     // Save the PDF
//     doc.save(`report_${report.role}_${reportDate.replace(/[:/,]/g, '-')}.pdf`);
// };


const downloadReport = (reportContent, report) => {
  const doc = new jsPDF();

  // Fix Date Issue
  const reportDate = report.createdAt ? new Date(report.createdAt).toLocaleString() : "Unknown Date";

  // Page settings
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
  // let recommendations = `Recommendation:\n${report.recommendations || "No recommendation provided."}`;
  // let wrappedRecommendations = doc.splitTextToSize(recommendations, 170);
  // wrappedRecommendations.forEach(line => {
  //     if (marginY + 10 > pageHeight - 20) {
  //         doc.addPage();
  //         marginY = 20;
  //     }
  //     doc.text(line, marginX, marginY);
  //     marginY += 7;
  // });

  // Save the PDF
  doc.save(`report_${report.role}_${reportDate.replace(/[:/,]/g, '-')}.pdf`);
};



  if (error) {
    return <div>Error: {error}</div>;
  }

  const ScoreCard = ({ label, score }) => (
    <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-lg shadow-lg">
      <h5 className="text-white text-xl font-semibold">{label}</h5>
      <div className="flex justify-center items-center mt-4">
        <div></div>
        <CircularProgressbar
          value={score}
          maxValue={10}
          text={`${score}/10`}
          strokeWidth={12}
          styles={{
            path: {
              stroke: '#0700e7', // Gradient stroke
              strokeLinecap: 'initial', // Smooth edges
              strokeLinejoin: 'miter', // Start of the stroke will be sharp
            transition: 'stroke-dashoffset 0.5s ease 0s', // Smooth transition
              // text: { fill: '#ffffff', fontSize: '16px' },
            
            },
            trail: {
              stroke: '#e0e0e0', // Light gray trail
              strokeLinecap: 'round',
            },
            text: {
              fill: '#ffffff', // White text
              fontSize: '18px', // Larger font size
              fontWeight: 'bold', // Bold text
            },
          }}
        />
      </div>
      {/* SVG Gradient Definition */}
      <svg className="hidden">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#4caf50', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#ff9800', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>
    </div>
    );
  return (
    <div className='min-h-screen bg-cover' style={{ backgroundImage: "url('/BG.jpg')" }}>
      <div className='absolute top-5 left-3 text-4xl text-white' onClick={goBack}>
        {/* Back Arrow Icon */}
      </div>
      <div className="text-white">
        <h1 className="text-center text-4xl font-bold">Interview Report</h1>
        <div className="mx-auto mt-5">
          {visibility.previousReports && (
            <div className="mx-auto ">
              {reports && reports.length > 0 ? (
                reports.map((report, index) => (
                  <div key={index} className="bg-transparent shadow-lg rounded-lg p-2 max-w-lg mx-auto">
                    <div
                      className="bg-purple-500 text-white p-4 rounded-t-lg cursor-pointer flex justify-between items-center"
                      onClick={() => toggleIndividualReportVisibility(index)}
                    >
                      <span>{reportVisibility[index] ? 'Hide' : 'Show'} Report ▼</span>
                      <span className="text-sm">{new Date(report.createdAt).toLocaleString()}</span>
                    </div>

                    {reportVisibility[index] && (
                      <div className="p-4">
                        <h2 className="text-lg font-semibold">
                          <strong>Role:</strong> {report.role}
                        </h2>
                        <div className="report-analysis mt-4">
                          <h4 className="text-xl font-semibold mb-2">
                            <strong>Analysis</strong>
                          </h4>
                          <div className="grid grid-cols-2 gap-5">
                            
                          <ScoreCard label="Technical Proficiency" score={extractScore(report, 'Technical Proficiency')} />
                           <ScoreCard label="Communication" score={extractScore(report, 'Communication')} />
                         
                          
                          <ScoreCard  label="Decision-Making" score={extractScore(report, 'Decision-Making')} />
                           <ScoreCard label="Confidence" score={extractScore(report, 'Confidence')} />
                          
                          <ScoreCard label="Language Fluency" score={extractScore(report, 'Language Fluency')} />
                          </div>
                          <div
                    className="analysis-content mb-4"
                    dangerouslySetInnerHTML={{
                      __html: report.reportAnalysis
                        .replace(/The user's/g, "You're")
                        .replace(/\*/g, '')
                        .replace(/(Overall Score: \d+\/10)/g, '<strong>$1</strong><br/>')
                        .replace(/(Technical Proficiency:|Communication:|Decision-Making:|Confidence:|Language Fluency:|Overall|recommendations|recommendation)/g,
                          '<br/><br/><div class="section-header">$1</div>')
                        .replace(/(Technical Proficiency|Communication|Decision-Making|Confidence|Language Fluency|Overall|recommendations|recommendation)/g,
                          '<br/><div class="section-header">$1</div>')
                        .replace(/Recommendation:/g, '<h6><strong>Recommendation:</strong></h6>')
                    }} />
                          {/* Displaying Circular Progressbars for scores */}
                         
                          {/* Download Button */}
                          <button
                            className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 hover:bg-blue-600"
                            onClick={() => downloadReport(report.reportAnalysis, report)}
                          >
                            Download Report
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center mt-5 text-gray-600">For Report Visit After 5 Min</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Oldreport;
