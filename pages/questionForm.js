// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
  
//   useEffect(() => { 
//     // Ensure the user is logged in before fetching questions
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
// // console.log(email);

// useEffect(() => {
//   const fetchQuestions = async () => {
//     try {
//       const res = await fetch(`/api/fetchQuestions?email=${email}`);

//       if (!res.ok) {
//         throw new Error(`Failed to fetch questions: ${res.statusText}`);
//       }

//       const data = await res.json();
//       setQuestions(data);
//     } catch (error) {
//       console.error('Error fetching questions:', error);
//       alert('An error occurred while fetching the questions.');
//     }
//   };

//   if (email) {
//     fetchQuestions();
//   }
// }, [email]);

  

//   const handleAnswerChange = (questionText, answerText) => {
//     setQuestions(prevQuestions => 
//       prevQuestions.map(question => 
//         question.questionText === questionText 
//           ? { ...question, answer: answerText } 
//           : question
//       )
//     );
//   };

//   const handleSubmit = async () => {
//     const answers = questions.map(question => ({
//       questionText: question.questionText,
//       answerText: question.answer || '', // Use an empty string if no answer is provided
//     }));

//     const res = await fetch('/api/saveAnswer', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email,
//         questions: answers,
//       }),
//     });

//     if (res.ok) {
//       alert('Answers saved successfully!');
//     } else {
//       alert('Error saving data');
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Answer the Questions</h1>

//       <div className="space-y-4">
//         {questions.map((question, index) => (
//           <div key={index} className="bg-white p-4 rounded-lg shadow-md">
//             <label className="block text-xl font-semibold text-gray-800">
//               {index + 1}. {question.questionText}
//             </label>
//             <input
//               type="text"
//               value={question.answer || ''}
//               onChange={(e) => handleAnswerChange(question.questionText, e.target.value)}
//               className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               placeholder="Your answer here..."
//             />
//           </div>
//         ))}
//       </div>

//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={handleSubmit}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Submit Answers
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;




// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Tracks the current question index

//   useEffect(() => {
//     // Ensure the user is logged in before fetching questions
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

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);

//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   const handleAnswerChange = (answerText) => {
//     setQuestions(prevQuestions => 
//       prevQuestions.map((question, index) => 
//         index === currentQuestionIndex 
//           ? { ...question, answer: answerText } 
//           : question
//       )
//     );
//   };

//   const handleNext = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const handleSubmit = async () => {
//     const answers = questions.map(question => ({
//       questionText: question.questionText,
//       answerText: question.answer || '', // Use an empty string if no answer is provided
//     }));

//     const res = await fetch('/api/saveAnswer', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email,
//         questions: answers,
//       }),
//     });

//     if (res.ok) {
//       alert('Answers saved successfully!');
//     } else {
//       alert('Error saving data');
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Answer the Questions</h1>

//       {questions.length > 0 && (
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <label className="block text-xl font-semibold text-gray-800">
//               {questions[currentQuestionIndex].questionText}
//           </label>
//           <input
//             type="text"
//             value={questions[currentQuestionIndex].answer || ''}
//             onChange={(e) => handleAnswerChange(e.target.value)}
//             className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             placeholder="Your answer here..."
//           />
//         </div>
//       )}

//       <div className="mt-6 flex justify-between">
//         <button
//           onClick={handlePrevious}
//           disabled={currentQuestionIndex === 0}
//           className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
//         >
//           Previous
//         </button>

//         <button
//           onClick={handleNext}
//           disabled={currentQuestionIndex === questions.length - 1}
//           className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>

//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={handleSubmit}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Submit Answers
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Tracks the current question index

//   useEffect(() => {
//     // Ensure the user is logged in before fetching questions
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

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);

//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   const handleAnswerChange = (answerText) => {
//     setQuestions(prevQuestions => 
//       prevQuestions.map((question, index) => 
//         index === currentQuestionIndex 
//           ? { ...question, answer: answerText } 
//           : question
//       )
//     );
//   };

//   const handleNext = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const handleSubmit = async () => {
//     const answers = questions.map(question => ({
//       questionText: question.questionText,
//       answerText: question.answer || '', // Use an empty string if no answer is provided
//     }));

//     const res = await fetch('/api/saveAnswer', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email,
//         questions: answers,
//       }),
//     });

//     if (res.ok) {
//       alert('Answers saved successfully!');
//     } else {
//       alert('Error saving data');
//     }
//   };

//   // Function to speak the current question
//   const speakQuestion = (questionText) => {
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     // Optionally, set the voice, language, and other properties
//     utterance.lang = 'en-US'; // Set language
//     utterance.pitch = 1; // Default pitch
//     utterance.rate = 1; // Default speaking rate
//     speechSynthesis.speak(utterance); // Speak the question
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText); // Speak the question when it changes
//     }
//   }, [currentQuestionIndex, questions]);

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Answer the Questions</h1>

//       {questions.length > 0 && (
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <label className="block text-xl font-semibold text-gray-800">
//              {questions[currentQuestionIndex].questionText}
//           </label>
//           <input
//             type="text"
//             value={questions[currentQuestionIndex].answer || ''}
//             onChange={(e) => handleAnswerChange(e.target.value)}
//             className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             placeholder="Your answer here..."
//           />
//         </div>
//       )}

//       <div className="mt-6 flex justify-between">
//         <button
//           onClick={handlePrevious}
//           disabled={currentQuestionIndex === 0}
//           className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
//         >
//           Previous
//         </button>

//         <button
//           onClick={handleNext}
//           disabled={currentQuestionIndex === questions.length - 1}
//           className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>

//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={handleSubmit}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Submit Answers
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Tracks the current question index
//   const [recordedText, setRecordedText] = useState(''); // To store the recorded text
//   const [isListening, setIsListening] = useState(false); // To track if we're currently listening
//   const [loading, setLoading] = useState(false); // To track if the form is submitting or speaking

//   useEffect(() => {
//     // Ensure the user is logged in before fetching questions
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

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);

//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   const handleAnswerChange = (answerText) => {
//     setQuestions(prevQuestions => 
//       prevQuestions.map((question, index) => 
//         index === currentQuestionIndex 
//           ? { ...question, answer: answerText } 
//           : question
//       )
//     );
//   };

//   const handleNext = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const handleSubmit = async () => {
//     const answers = questions.map(question => ({
//       questionText: question.questionText,
//       answerText: question.answer || '', // Use an empty string if no answer is provided
//     }));

//     const res = await fetch('/api/saveAnswer', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email,
//         questions: answers,
//       }),
//     });

//     if (res.ok) {
//       alert('Answers saved successfully!');
//     } else {
//       alert('Error saving data');
//     }
//   };

//   // Function to speak the current question
//   const speakQuestion = (questionText) => {
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-US'; // Set language
//     utterance.pitch = 1; // Default pitch
//     utterance.rate = 1; // Default speaking rate
//     speechSynthesis.speak(utterance); // Speak the question
//   };

//   // Start or stop listening to the user's speech
//   const handleMicClick = () => {
//     if (isListening) {
//       stopListening();
//     } else {
//       startListening();
//     }
//   };

//   // Function to start speech recognition
//   const startListening = () => {
//     setIsListening(true);
//     setLoading(true);
    
//     const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//     recognition.lang = 'en-US';
//     recognition.interimResults = false;
//     recognition.maxAlternatives = 1;

//     recognition.onresult = (event) => {
//       const transcript = event.results[0][0].transcript;
//       setRecordedText(transcript); // Set the recorded text from speech
//     };

//     recognition.onerror = (event) => {
//       console.error("Speech recognition error", event.error);
//       setIsListening(false);
//       setLoading(false);
//     };

//     recognition.onend = () => {
//       setIsListening(false);
//       setLoading(false);
//     };

//     recognition.start();
//   };

//   // Function to stop listening
//   const stopListening = () => {
//     setIsListening(false);
//     setLoading(false);
//     const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//     recognition.stop(); // Stop the recognition
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText); // Speak the question when it changes
//     }
//   }, [currentQuestionIndex, questions]);

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Answer the Questions</h1>

//       {questions.length > 0 && (
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <label className="block text-xl font-semibold text-gray-800">
//             {currentQuestionIndex + 1}. {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading}  // Disable input while listening or speaking
//             />
//             <button
//               className={`mic-button absolute right-4 ${isListening ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={loading}  // Disable mic button while speaking
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex justify-between">
//         <button
//           onClick={handlePrevious}
//           disabled={currentQuestionIndex === 0}
//           className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
//         >
//           Previous
//         </button>

//         <button
//           onClick={handleNext}
//           disabled={currentQuestionIndex === questions.length - 1}
//           className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>

//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={handleSubmit}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Submit Answers
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;



// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Tracks the current question index
//   const [recordedText, setRecordedText] = useState(''); // To store the recorded text
//   const [isListening, setIsListening] = useState(false); // To track if we're currently listening
//   const [loading, setLoading] = useState(false); // To track if the form is submitting or speaking
//   const [recognition, setRecognition] = useState(null); // Store the recognition instance

//   useEffect(() => {
//     // Ensure the user is logged in before fetching questions
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

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);

//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   const handleAnswerChange = (answerText) => {
//     setQuestions(prevQuestions => 
//       prevQuestions.map((question, index) => 
//         index === currentQuestionIndex 
//           ? { ...question, answer: answerText } 
//           : question
//       )
//     );
//   };

//   const handleNext = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const handleSubmit = async () => {
//     const answers = questions.map(question => ({
//       questionText: question.questionText,
//       answerText: question.answer || '', // Use an empty string if no answer is provided
//     }));

//     const res = await fetch('/api/saveAnswer', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email,
//         questions: answers,
//       }),
//     });

//     if (res.ok) {
//       alert('Answers saved successfully!');
//     } else {
//       alert('Error saving data');
//     }
//   };

//   // Function to speak the current question
//   const speakQuestion = (questionText) => {
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-US'; // Set language
//     utterance.pitch = 1; // Default pitch
//     utterance.rate = 1; // Default speaking rate
//     speechSynthesis.speak(utterance); // Speak the question
//   };

//   // Start or stop listening to the user's speech
//   const handleMicClick = () => {
//     if (isListening) {
//       stopListening(); // Stop listening when clicked while already listening
//     } else {
//       startListening(); // Start listening when clicked while not listening
//     }
//   };

//   // Function to start speech recognition
//   const startListening = () => {
//     const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//     recognitionInstance.lang = 'en-US';
//     recognitionInstance.interimResults = false;
//     recognitionInstance.maxAlternatives = 1;
//     recognitionInstance.continuous = true; // Enable continuous listening

//     recognitionInstance.onresult = (event) => {
//       const transcript = event.results[event.results.length - 1][0].transcript; // Get the latest result
//       setRecordedText(transcript); // Set the recorded text from speech
//       setIsListening(true); // Set listening state to true
//     };

//     recognitionInstance.onerror = (event) => {
//       console.error("Speech recognition error", event.error);
//       setIsListening(false);
//       setLoading(false);
//     };

//     recognitionInstance.onend = () => {
//       if (isListening) {
//         startListening(); // Restart recognition if it ends and listening state is still true
//       }
//     };

//     recognitionInstance.start(); // Start listening
//     setRecognition(recognitionInstance); // Store the recognition instance
//     setLoading(true); // Indicate that the system is listening
//   };

//   // Function to stop listening
//   const stopListening = () => {
//     if (recognition) {
//       recognition.stop(); // Manually stop listening
//     }
//     setIsListening(false); // Set listening state to false
//     setLoading(false); // Indicate that the system is no longer listening
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText); // Speak the question when it changes
//     }
//   }, [currentQuestionIndex, questions]);

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Answer the Questions</h1>

//       {questions.length > 0 && (
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <label className="block text-xl font-semibold text-gray-800">
//             {currentQuestionIndex + 1}. {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading}  // Disable input while listening or speaking
//             />
//             <button
//               className={`mic-button absolute right-4 ${isListening ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={loading}  // Disable mic button while speaking
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex justify-between">
//         <button
//           onClick={handlePrevious}
//           disabled={currentQuestionIndex === 0}
//           className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
//         >
//           Previous
//         </button>

//         <button
//           onClick={handleNext}
//           disabled={currentQuestionIndex === questions.length - 1}
//           className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>

//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={handleSubmit}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Submit Answers
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false); // Track whether speech recognition is active
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null); // Store recognition instance

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//       router.push('/login');
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   const handleAnswerChange = (answerText) => {
//     setQuestions((prevQuestions) =>
//       prevQuestions.map((question, index) =>
//         index === currentQuestionIndex
//           ? { ...question, answer: answerText }
//           : question
//       )
//     );
//   };

//   const handleNext = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const handleSubmit = async () => {
//     const answers = questions.map((question) => ({
//       questionText: question.questionText,
//       answerText: question.answer || '',
//     }));

//     const res = await fetch('/api/saveAnswer', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email,
//         questions: answers,
//       }),
//     });

//     if (res.ok) {
//       alert('Answers saved successfully!');
//     } else {
//       alert('Error saving data');
//     }
//   };

//   const speakQuestion = (questionText) => {
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-US'; // Set language
//     utterance.pitch = 1; // Default pitch
//     utterance.rate = 1; // Default speaking rate
//     speechSynthesis.speak(utterance); // Speak the question
//   };

//   const handleMicClick = () => {
//     if (isListening) {
//       stopListening();
//     } else {
//       startListening();
//     }
//   };

//   const startListening = () => {
//     const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//     recognitionInstance.lang = 'en-US';
//     recognitionInstance.interimResults = false;
//     recognitionInstance.maxAlternatives = 1;
//     recognitionInstance.continuous = true; // Enable continuous listening

//     recognitionInstance.onresult = (event) => {
//       const transcript = event.results[event.results.length - 1][0].transcript;
//       setRecordedText(transcript); // Update the recorded text
//       setIsListening(true); // Update the listening state
//     };

//     recognitionInstance.onerror = (event) => {
//       console.error('Speech recognition error', event.error);
//       setIsListening(false);
//       setLoading(false);
//     };

//     recognitionInstance.onend = () => {
//       if (isListening) {
//         startListening(); // Restart recognition if the user is still speaking
//       }
//     };

//     recognitionInstance.start(); // Start listening
//     setRecognition(recognitionInstance); // Save the recognition instance
//     setLoading(true); // Set loading state to true
//   };

//   const stopListening = () => {
//     if (recognition) {
//       recognition.stop(); // Manually stop listening
//     }
//     setIsListening(false); // Update listening state to false
//     setLoading(false); // Set loading state to false
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText); // Speak the current question
//     }
//   }, [currentQuestionIndex, questions]);

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Answer the Questions</h1>

//       {questions.length > 0 && (
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <label className="block text-xl font-semibold text-gray-800">
//             {currentQuestionIndex + 1}. {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading} // Disable input while listening or speaking
//             />
//             <button
//               className={`mic-button absolute right-4 ${isListening ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={loading} // Disable mic button while speaking
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex justify-between">
//         <button
//           onClick={handlePrevious}
//           disabled={currentQuestionIndex === 0}
//           className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
//         >
//           Previous
//         </button>

//         <button
//           onClick={handleNext}
//           disabled={currentQuestionIndex === questions.length - 1}
//           className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>

//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={handleSubmit}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Submit Answers
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false); // Track whether speech recognition is active
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null); // Store recognition instance

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//       router.push('/login');
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true; // Enable continuous listening

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText(transcript); // Update the recorded text
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         if (isListening) {
//           recognitionInstance.start(); // Restart recognition if the user is still speaking
//         }
//       };

//       setRecognition(recognitionInstance); // Store recognition instance
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, []);

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop the recognition
//         setIsListening(false);
//         setLoading(false);
//       } else {
//         recognition.start(); // Start the recognition
//         setIsListening(true);
//         setLoading(true); // Set loading state to true
//       }
//     }
//   };

//   const handleAnswerChange = (answerText) => {
//     setQuestions((prevQuestions) =>
//       prevQuestions.map((question, index) =>
//         index === currentQuestionIndex
//           ? { ...question, answer: answerText }
//           : question
//       )
//     );
//   };

//   const handleNext = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const handleSubmit = async () => {
//     const answers = questions.map((question) => ({
//       questionText: question.questionText,
//       answerText: question.answer || '',
//     }));

//     const res = await fetch('/api/saveAnswer', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email,
//         questions: answers,
//       }),
//     });

//     if (res.ok) {
//       alert('Answers saved successfully!');
//     } else {
//       alert('Error saving data');
//     }
//   };

//   const speakQuestion = (questionText) => {
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-US'; // Set language
//     utterance.pitch = 1; // Default pitch
//     utterance.rate = 1; // Default speaking rate
//     speechSynthesis.speak(utterance); // Speak the question
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText); // Speak the current question
//     }
//   }, [currentQuestionIndex, questions]);

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Answer the Questions</h1>

//       {questions.length > 0 && (
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <label className="block text-xl font-semibold text-gray-800">
//              {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading} // Disable input while listening or speaking
//             />
//             <button
//               className={`mic-button absolute right-4 ${isListening ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
              
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex justify-between">
//         <button
//           onClick={handlePrevious}
//           disabled={currentQuestionIndex === 0}
//           className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
//         >
//           Previous
//         </button>

//         <button
//           onClick={handleNext}
//           disabled={currentQuestionIndex === questions.length - 1}
//           className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>

//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={handleSubmit}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Submit Answers
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false); // Track whether speech recognition is active
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null); // Store recognition instance
//   const [isSpeaking, setIsSpeaking] = useState(false); // Track whether the question is being spoken

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//       router.push('/login');
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true; // Enable continuous listening

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText(transcript); // Update the recorded text
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         if (isListening) {
//           recognitionInstance.start(); // Restart recognition if the user is still speaking
//         }
//       };

//       setRecognition(recognitionInstance); // Store recognition instance
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, []);

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop the recognition
//         setIsListening(false);
//         setLoading(false);
//       } else {
//         recognition.start(); // Start the recognition
//         setIsListening(true);
//         setLoading(true); // Set loading state to true
//       }
//     }
//   };

//   const handleAnswerChange = (answerText) => {
//     setQuestions((prevQuestions) =>
//       prevQuestions.map((question, index) =>
//         index === currentQuestionIndex
//           ? { ...question, answer: answerText }
//           : question
//       )
//     );
//   };

//   const handleNext = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setRecordedText('')
//     }
//   };

//   const handlePrevious = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const handleSubmit = async () => {
//     const answers = questions.map((question) => ({
//       questionText: question.questionText,
//       answerText: question.answer || '',
//     }));
    
    

//     const res = await fetch('/api/saveAnswer', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email,
//         questions: answers,
//       }),
//     });

//     if (res.ok) {
//       alert('Answers saved successfully!');
//     } else {
//       alert('Error saving data');
//     }
//   };

//   const speakQuestion = (questionText) => {
//     setIsSpeaking(true); // Set isSpeaking to true when the question is being spoken
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-US'; // Set language
//     utterance.pitch = 1; // Default pitch
//     utterance.rate = 1; // Default speaking rate

//     utterance.onend = () => {
//       setIsSpeaking(false); // Set isSpeaking to false once speaking is finished
//     };

//     speechSynthesis.speak(utterance); // Speak the question
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText); // Speak the current question
//     }
//   }, [currentQuestionIndex, questions]);

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Answer the Questions</h1>

//       {questions.length > 0 && (
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <label className="block text-xl font-semibold text-gray-800">
//              {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading || isSpeaking} // Disable input while listening or speaking
//             />
//             <button
//               className={`mic-button absolute right-4 ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={isSpeaking} // Disable the mic button while speaking
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex justify-between">
//         <button
//           onClick={handlePrevious}
//           disabled={currentQuestionIndex === 0}
//           className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
//         >
//           Previous
//         </button>

//         <button
//           onClick={handleNext}
//           disabled={currentQuestionIndex === questions.length - 1}
//           className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>

//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={handleSubmit}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Submit Answers
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false); // Track whether speech recognition is active
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null); // Store recognition instance
//   const [isSpeaking, setIsSpeaking] = useState(false); // Track whether the question is being spoken

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//       router.push('/login');
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true; // Enable continuous listening

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText(transcript); // Update the recorded text
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         if (isListening) {
//           recognitionInstance.start(); // Restart recognition if the user is still speaking
//         }
//       };

//       setRecognition(recognitionInstance); // Store recognition instance
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, []);

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop the recognition
//         setIsListening(false);
//         setLoading(false);
//       } else {
//         recognition.start(); // Start the recognition
//         setIsListening(true);
//         setLoading(true); // Set loading state to true
//       }
//     }
//   };

//   const handleAnswerChange = (answerText) => {
//     setQuestions((prevQuestions) =>
//       prevQuestions.map((question, index) =>
//         index === currentQuestionIndex
//           ? { ...question, answer: answerText }
//           : question
//       )
//     );
//   };

//   const handleNext = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setRecordedText(''); // Clear the recorded text for the next question
//     }
//   };

//   const handlePrevious = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const handleSubmit = async () => {
//     const answers = questions.map((question) => ({
//       questionId: question._id,  // Use _id instead of questionText
//       answer: question.answer || '',
//     }));

//     try {
//       const res = await fetch('/api/saveAnswer', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email,
//           questions: answers,
//         }),
//       });

//       if (res.ok) {
//         alert('Answers saved successfully!');
//       } else {
//         alert('Error saving data');
//       }
//     } catch (error) {
//       console.error('Error submitting answers:', error);
//       alert('An error occurred while saving the answers.');
//     }
//   };

//   const speakQuestion = (questionText) => {
//     setIsSpeaking(true); // Set isSpeaking to true when the question is being spoken
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-US'; // Set language
//     utterance.pitch = 1; // Default pitch
//     utterance.rate = 1; // Default speaking rate

//     utterance.onend = () => {
//       setIsSpeaking(false); // Set isSpeaking to false once speaking is finished
//     };

//     speechSynthesis.speak(utterance); // Speak the question
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText); // Speak the current question
//     }
//   }, [currentQuestionIndex, questions]);

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Answer the Questions</h1>

//       {questions.length > 0 && (
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <label className="block text-xl font-semibold text-gray-800">
//             {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading || isSpeaking} // Disable input while listening or speaking
//             />
//             <button
//               className={`mic-button absolute right-4 ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={isSpeaking} // Disable the mic button while speaking
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex justify-between">
//         <button
//           onClick={handlePrevious}
//           disabled={currentQuestionIndex === 0}
//           className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
//         >
//           Previous
//         </button>

//         <button
//           onClick={handleNext}
//           disabled={currentQuestionIndex === questions.length - 1}
//           className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>

//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={handleSubmit}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Submit Answers
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false); // Track whether speech recognition is active
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null); // Store recognition instance
//   const [isSpeaking, setIsSpeaking] = useState(false); // Track whether the question is being spoken

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//       router.push('/login');
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true; // Enable continuous listening

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText(transcript); // Update the recorded text
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         if (isListening) {
//           recognitionInstance.start(); // Restart recognition if the user is still speaking
//         }
//       };

//       setRecognition(recognitionInstance); // Store recognition instance
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, []);

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop the recognition
//         setIsListening(false);
//         setLoading(false);
//       } else {
//         recognition.start(); // Start the recognition
//         setIsListening(true);
//         setLoading(true); // Set loading state to true
//       }
//     }
//   };

//   const handleAnswerChange = (answerText) => {
//     setQuestions((prevQuestions) =>
//       prevQuestions.map((question, index) =>
//         index === currentQuestionIndex
//           ? { ...question, answer: answerText }
//           : question
//       )
//     );
//   };

//   const handleNext = async () => {
//     const currentQuestion = questions[currentQuestionIndex];
//     const answer = currentQuestion.answer || recordedText; // Get the answer (from input or recorded text)
// console.log(answer);

//     // Submit the current answer
//     await submitAnswer(currentQuestion._id, answer);

//     // Move to the next question
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setRecordedText(''); // Clear the recorded text for the next question
//     }
//   };

//   const submitAnswer = async (questionId, answer) => {
//     const res = await fetch('/api/saveAnswer', {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email: `${user?.email}`, // Make sure the email is included here
//         questionId: questionId, // The ID of the question
//         answer: answer, // The user's answer
//       }),
//     });
  
//     if (res.ok) {
//       console.log('Answer submitted successfully');
//     } else {
//       const errorData = await res.json();
//       console.error('Error saving answer:', errorData);
//       alert('Error saving data');
//     }
//   };
  

//   // const submitAnswer = async (questionId, answer) => {
//   //   try {
//   //     const res = await fetch('/api/saveAnswer', {
//   //       method: 'PUT',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //       },
//   //       body: JSON.stringify({
//   //         email,
//   //         questionId,
//   //         answer,
//   //       }),
//   //     });
  
//   //     if (res.ok) {
//   //       console.log('Answer submitted successfully');
//   //     } else {
//   //       const errorData = await res.json();
//   //       console.error('Error saving answer:', errorData);
//   //       alert('Error saving data');
//   //     }
//   //   } catch (error) {
//   //     console.error('Error submitting answer:', error);
//   //     alert('An error occurred while saving the answer.');
//   //   }
//   // };
  

//   const speakQuestion = (questionText) => {
//     setIsSpeaking(true); // Set isSpeaking to true when the question is being spoken
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-US'; // Set language
//     utterance.pitch = 1; // Default pitch
//     utterance.rate = 1; // Default speaking rate

//     utterance.onend = () => {
//       setIsSpeaking(false); // Set isSpeaking to false once speaking is finished
//     };

//     speechSynthesis.speak(utterance); // Speak the question
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText); // Speak the current question
//     }
//   }, [currentQuestionIndex, questions]);

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Answer the Questions</h1>

//       {questions.length > 0 && (
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <label className="block text-xl font-semibold text-gray-800">
//             {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading || isSpeaking} // Disable input while listening or speaking
//             />
//             <button
//               className={`mic-button absolute right-4 ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={isSpeaking} // Disable the mic button while speaking
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={handleNext}
//           disabled={currentQuestionIndex === questions.length - 1}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false); // Track whether speech recognition is active
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null); // Store recognition instance
//   const [isSpeaking, setIsSpeaking] = useState(false); // Track whether the question is being spoken

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//       router.push('/login');
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true; // Enable continuous listening

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText((prevText) => prevText + ' ' + transcript); // Append spoken words
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         if (isListening) {
//           recognitionInstance.start(); // Restart recognition if the user is still speaking
//         }
//       };

//       setRecognition(recognitionInstance); // Store recognition instance
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, []);

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop the recognition when the mic is clicked again
//         setIsListening(false);
//         setLoading(false);
//         // Submit the answer when mic is turned off
//         const currentQuestion = questions[currentQuestionIndex];
//         const answer = recordedText; // Answer is the full recorded text
//         submitAnswer(currentQuestion._id, answer); // Submit the answer to the server
//       } else {
//         recognition.start(); // Start the recognition
//         setIsListening(true);
//         setLoading(true); // Set loading state to true
//       }
//     }
//   };

//   const submitAnswer = async (questionId, answer) => {
//     const res = await fetch('/api/saveAnswer', {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email: `${user?.email}`,
//         questionId: questionId,
//         answer: answer,
//       }),
//     });

//     if (res.ok) {
//       console.log('Answer submitted successfully');
//     } else {
//       const errorData = await res.json();
//       console.error('Error saving answer:', errorData);
//       alert('Error saving data');
//     }
//   };

//   const speakQuestion = (questionText) => {
//     setIsSpeaking(true); // Set isSpeaking to true when the question is being spoken
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-US'; // Set language
//     utterance.pitch = 1; // Default pitch
//     utterance.rate = 1; // Default speaking rate

//     utterance.onend = () => {
//       setIsSpeaking(false); // Set isSpeaking to false once speaking is finished
//     };

//     speechSynthesis.speak(utterance); // Speak the question
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText); // Speak the current question
//     }
//   }, [currentQuestionIndex, questions]);

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Answer the Questions</h1>

//       {questions.length > 0 && (
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <label className="block text-xl font-semibold text-gray-800">
//             {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading || isSpeaking} // Disable input while listening or speaking
//             />
//             <button
//               className={`mic-button absolute right-4 ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={isSpeaking} // Disable the mic button while speaking
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={() => {
//             const currentQuestion = questions[currentQuestionIndex];
//             const answer = recordedText; // Get the recorded answer
//             submitAnswer(currentQuestion._id, answer); // Submit the answer
//             setCurrentQuestionIndex(currentQuestionIndex + 1); // Move to the next question
//           }}
//           disabled={currentQuestionIndex === questions.length - 1}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false); // Track whether speech recognition is active
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null); // Store recognition instance
//   const [isSpeaking, setIsSpeaking] = useState(false); // Track whether the question is being spoken

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//       router.push('/login');
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true; // Enable continuous listening

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText((prevText) => prevText + ' ' + transcript); // Append spoken words
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         if (isListening) {
//           recognitionInstance.start(); // Restart recognition if the user is still speaking
//         } else {
//           handleNext(); // Automatically move to the next question when mic stops
//         }
//       };

//       setRecognition(recognitionInstance); // Store recognition instance
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, [isListening]);

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop the recognition when the mic is clicked again
//         setIsListening(false);
//         setLoading(false);
//         // Automatically submit the answer and move to the next question when mic is turned off
//         const currentQuestion = questions[currentQuestionIndex];
//         const answer = recordedText; // Answer is the full recorded text
//         submitAnswer(currentQuestion._id, answer); // Submit the answer to the server
//       } else {
//         recognition.start(); // Start the recognition
//         setIsListening(true);
//         setLoading(true); // Set loading state to true
//       }
//     }
//   };

//   const submitAnswer = async (questionId, answer) => {
//     const res = await fetch('/api/saveAnswer', {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email: `${user?.email}`,
//         questionId: questionId,
//         answer: answer,
//       }),
//     });

//     if (res.ok) {
//       console.log('Answer submitted successfully');
//     } else {
//       const errorData = await res.json();
//       console.error('Error saving answer:', errorData);
//       alert('Error saving data');
//     }
//   };

//   const speakQuestion = (questionText) => {
//     setIsSpeaking(true); // Set isSpeaking to true when the question is being spoken
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-US'; // Set language
//     utterance.pitch = 1; // Default pitch
//     utterance.rate = 1; // Default speaking rate

//     utterance.onend = () => {
//       setIsSpeaking(false); // Set isSpeaking to false once speaking is finished
//     };

//     speechSynthesis.speak(utterance); // Speak the question
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText); // Speak the current question
//     }
//   }, [currentQuestionIndex, questions]);

//   // Handle the "Next" button click
//   const handleNext = () => {
//     const currentQuestion = questions[currentQuestionIndex];
//     const answer = recordedText; // Get the recorded answer

//     if (answer.trim()) {
//       submitAnswer(currentQuestion._id, answer); // Submit the answer
//     }

//     // Move to the next question
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setRecordedText(''); // Clear the recorded text for the next question
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Answer the Questions</h1>

//       {questions.length > 0 && (
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <label className="block text-xl font-semibold text-gray-800">
//             {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading || isSpeaking} // Disable input while listening or speaking
//             />
//             <button
//               className={`mic-button absolute right-4 ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={isSpeaking} // Disable the mic button while speaking
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={handleNext}
//           disabled={isListening || loading || isSpeaking || currentQuestionIndex === questions.length - 1}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false); // Track whether speech recognition is active
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null); // Store recognition instance
//   const [isSpeaking, setIsSpeaking] = useState(false); // Track whether the question is being spoken

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//       router.push('/login');
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true; // Enable continuous listening

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText((prevText) => prevText + ' ' + transcript); // Append spoken words
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         if (isListening) {
//           recognitionInstance.start(); // Restart recognition if the user is still speaking
//         } else {
//           handleNext(); // Automatically move to the next question when mic stops
//         }
//       };

//       setRecognition(recognitionInstance); // Store recognition instance
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, [isListening]);

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop the recognition when the mic is clicked again
//         setIsListening(false);
//         setLoading(false);
//         // Automatically submit the answer and move to the next question when mic is turned off
//         const currentQuestion = questions[currentQuestionIndex];
//         const answer = recordedText; // Answer is the full recorded text
//         submitAnswer(currentQuestion._id, answer); 
//         handleNext(); // Submit the answer to the server
//       } else {
//         recognition.start(); // Start the recognition
//         setIsListening(true);
//         setLoading(true); // Set loading state to true
//       }
//     }
//   };

//   const submitAnswer = async (questionId, answer) => {
//     const res = await fetch('/api/saveAnswer', {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email: `${user?.email}`,
//         questionId: questionId,
//         answer: answer,
//       }),
//     });

//     if (res.ok) {
//       console.log('Answer submitted successfully');
//     } else {
//       const errorData = await res.json();
//       console.error('Error saving answer:', errorData);
//       alert('Error saving data');
//     }
//   };

//   const speakQuestion = (questionText) => {
//     setIsSpeaking(true); // Set isSpeaking to true when the question is being spoken
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-US'; // Set language
//     utterance.pitch = 1; // Default pitch
//     utterance.rate = 1; // Default speaking rate

//     utterance.onend = () => {
//       setIsSpeaking(false); // Set isSpeaking to false once speaking is finished
//     };

//     speechSynthesis.speak(utterance); // Speak the question
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText); // Speak the current question
//     }
//   }, [currentQuestionIndex, questions]);

//   // Handle the "Next" button click
//   const handleNext = () => {
//     const currentQuestion = questions[currentQuestionIndex];
//     const answer = recordedText; // Get the recorded answer

//     if (answer.trim()) {
//       submitAnswer(currentQuestion._id, answer); // Submit the answer
//     }

//     // Move to the next question
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setRecordedText(''); // Clear the recorded text for the next question
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Answer the Questions</h1>

//       {questions.length > 0 && (
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <label className="block text-xl font-semibold text-gray-800">
//             {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading || isSpeaking} // Disable input while listening or speaking
//             />
//             <button
//               className={`mic-button absolute right-4 ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={isSpeaking} // Disable the mic button while speaking
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={handleNext}
//           disabled={isListening || loading || isSpeaking || currentQuestionIndex === questions.length - 1}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false); // Track whether speech recognition is active
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null); // Store recognition instance
//   const [isSpeaking, setIsSpeaking] = useState(false); // Track whether the question is being spoken

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//       router.push('/login');
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true; // Enable continuous listening

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText((prevText) => prevText + ' ' + transcript); // Append spoken words
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         // Removed auto-next functionality
//         setIsListening(false); // Update the state to show mic is off
//         setLoading(false); // Hide the loading state when recognition ends
//       };

//       setRecognition(recognitionInstance); // Store recognition instance
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, [isListening]);

//   // const handleMicClick = () => {
//   //   if (recognition) {
//   //     if (isListening) {
//   //       recognition.stop(); // Stop the recognition when the mic is clicked again
//   //       setIsListening(false);
//   //       setLoading(false);
//   //       // Submit the answer when mic stops (but do NOT move to the next question automatically)
//   //       const currentQuestion = questions[currentQuestionIndex];
//   //       const answer = recordedText; // Answer is the full recorded text
//   //       submitAnswer(currentQuestion._id, answer);
//   //        // Submit the answer to the server
//   //        handleNext()
//   //     } else {
//   //       recognition.start(); // Start the recognition
//   //       setIsListening(true);
//   //       setLoading(true); // Set loading state to true
//   //     }
//   //   }
//   // };
//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop recognition on second click
//         setIsListening(false); // Update the state to show mic is off
//         setLoading(false); // Hide the loading state when recognition ends
  
//         // Submit the answer when mic stops
//         const currentQuestion = questions[currentQuestionIndex];
//         const answer = recordedText; // Get the recorded text as the answer
//         submitAnswer(currentQuestion._id, answer); // Submit the answer
  
//         // Move to the next question automatically after submitting the answer
//         handleNext(); // Move to the next question (calls handleNext)
//       } else {
//         recognition.start(); // Start recognition on first click
//         setIsListening(true); // Update state to show mic is listening
//         setLoading(true); // Show loading indicator while listening
//       }
//     }
//   };
  
//   const submitAnswer = async (questionId, answer) => {
//     const res = await fetch('/api/saveAnswer', {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email: `${user?.email}`,
//         questionId: questionId,
//         answer: answer,
//       }),
//     });

//     if (res.ok) {
//       console.log('Answer submitted successfully');
//     } else {
//       const errorData = await res.json();
//       console.error('Error saving answer:', errorData);
//       alert('Error saving data');
//     }
//   };

//   const speakQuestion = (questionText) => {
//     setIsSpeaking(true); // Set isSpeaking to true when the question is being spoken
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-US'; // Set language
//     utterance.pitch = 1; // Default pitch
//     utterance.rate = 1; // Default speaking rate

//     utterance.onend = () => {
//       setIsSpeaking(false); // Set isSpeaking to false once speaking is finished
//     };

//     speechSynthesis.speak(utterance); // Speak the question
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText); // Speak the current question
//     }
//   }, [currentQuestionIndex, questions]);

//   // Handle the "Next" button click
//   const handleNext = () => {
//     const currentQuestion = questions[currentQuestionIndex];
//     const answer = recordedText; // Get the recorded answer

//     if (answer.trim()) {
//       submitAnswer(currentQuestion._id, answer); // Submit the answer
//     }

//     // Move to the next question
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setRecordedText(''); // Clear the recorded text for the next question
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Answer the Questions</h1>

//       {questions.length > 0 && (
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <label className="block text-xl font-semibold text-gray-800">
//             {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading || isSpeaking} // Disable input while listening or speaking
//             />
//             <button
//               className={`mic-button absolute right-4 ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={isSpeaking} // Disable the mic button while speaking
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={handleNext}
//           disabled={isListening || loading || isSpeaking || currentQuestionIndex === questions.length - 1}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false); // Track whether speech recognition is active
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null); // Store recognition instance
//   const [isSpeaking, setIsSpeaking] = useState(false); // Track whether the question is being spoken

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//       router.push('/login');
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   // Initialize SpeechRecognition
//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true; // Enable continuous listening

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText((prevText) => prevText + ' ' + transcript); // Append spoken words
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         setIsListening(false); // Update state to show mic is off
//         setLoading(false); // Hide loading state
//       };

//       setRecognition(recognitionInstance); // Store the recognition instance
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, [currentQuestionIndex]); // Reinitialize recognition every time the question changes

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop recognition on second click
//         setIsListening(false); // Update the state to show mic is off
//         setLoading(false); // Hide the loading state when recognition ends

//         // Submit the answer when mic stops
//         const currentQuestion = questions[currentQuestionIndex];
//         const answer = recordedText; // Get the recorded text as the answer
//         submitAnswer(currentQuestion._id, answer); // Submit the answer

//         // Move to the next question automatically after submitting the answer
//         handleNext(); // Move to the next question
//       } else {
//         recognition.start(); // Start recognition on first click
//         setIsListening(true); // Update state to show mic is listening
//         setLoading(true); // Show loading indicator while listening
//       }
//     }
//   };

//   const submitAnswer = async (questionId, answer) => {
//     const res = await fetch('/api/saveAnswer', {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email: `${user?.email}`,
//         questionId: questionId,
//         answer: answer,
//       }),
//     });

//     if (res.ok) {
//       console.log('Answer submitted successfully');
//     } else {
//       const errorData = await res.json();
//       console.error('Error saving answer:', errorData);
//       alert('Error saving data');
//     }
//   };

//   const speakQuestion = (questionText) => {
//     setIsSpeaking(true); // Set isSpeaking to true when the question is being spoken
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'hi-IN'; // Set language
//     utterance.pitch = 1; // Default pitch
//     utterance.rate = 1; // Default speaking rate

//     utterance.onend = () => {
//       setIsSpeaking(false); // Set isSpeaking to false once speaking is finished
//     };

//     speechSynthesis.speak(utterance); // Speak the question
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText); // Speak the current question
//     }
//   }, [currentQuestionIndex, questions]);

//   // Handle the "Next" button click
//   const handleNext = () => {
//     const currentQuestion = questions[currentQuestionIndex];
//     const answer = recordedText; // Get the recorded answer

//     if (answer.trim()) {
//       submitAnswer(currentQuestion._id, answer); // Submit the answer
//     }

//     // Move to the next question
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setRecordedText(''); // Clear the recorded text for the next question
//     }
//   };

//   return (
//     <div className=" m-auto items-center justify-center min-h-screen bg-cover bg-center " style={{ backgroundImage: "url('/BG.jpg')" }}>
//       {/* <h1 className="text-3xl font-bold text-center mb-6">Answer the Questions</h1> */}
//       <div className=" flex justify-center  ">
//           <img id="mainImage" src="main.gif" className="w-60 h-60 text-center" alt="Shakti AI Logo" />
//         </div>
//       {questions.length > 0 && (
//         <div className=" p-4 pb-10 rounded-lg m-auto">
//           <label className="block text-xl font-semibold text-center text-white">
//             {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className=" hidden input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading || isSpeaking} // Disable input while listening or speaking
//             />
//           </div>
//           <div className='text-center mt-10 '>
//             <button
//               className={`mic-button absolute text-5xl ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={isSpeaking} // Disable the mic button while speaking
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//             </div>
//         </div>
//       )}

//       <div className="mt-6 flex hidden justify-center">
//         <button
//           onClick={handleNext}
//           disabled={isListening || loading || isSpeaking || currentQuestionIndex === questions.length - 1}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false); // Track whether speech recognition is active
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null); // Store recognition instance
//   const [isSpeaking, setIsSpeaking] = useState(false); // Track whether the question is being spoken

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//       router.push('/login');
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   // Initialize SpeechRecognition
//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true; // Enable continuous listening

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText((prevText) => prevText + ' ' + transcript); // Append spoken words
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         setIsListening(false); // Update state to show mic is off
//         setLoading(false); // Hide loading state
//       };

//       setRecognition(recognitionInstance); // Store the recognition instance
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, [currentQuestionIndex]); // Reinitialize recognition every time the question changes

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop recognition on second click
//         setIsListening(false); // Update the state to show mic is off
//         setLoading(false); // Hide the loading state when recognition ends

//         // Submit the answer when mic stops
//         const currentQuestion = questions[currentQuestionIndex];
//         const answer = recordedText; // Get the recorded text as the answer
//         submitAnswer(currentQuestion._id, answer); // Submit the answer

//         // Move to the next question automatically after submitting the answer
//         handleNext(); // Move to the next question
//       } else {
//         recognition.start(); // Start recognition on first click
//         setIsListening(true); // Update state to show mic is listening
//         setLoading(true); // Show loading indicator while listening
//       }
//     }
//   };

//   const submitAnswer = async (questionId, answer) => {
//     const res = await fetch('/api/saveAnswer', {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email: `${user?.email}`,
//         questionId: questionId,
//         answer: answer,
//       }),
//     });

//     if (res.ok) {
//       console.log('Answer submitted successfully');
//     } else {
//       const errorData = await res.json();
//       console.error('Error saving answer:', errorData);
//       alert('Error saving data');
//     }
//   };

//   const speakQuestion = (questionText) => {
//     setIsSpeaking(true); // Set isSpeaking to true when the question is being spoken
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'hi-IN'; // Set language
//     utterance.pitch = 1; // Default pitch
//     utterance.rate = 1; // Default speaking rate

//     utterance.onend = () => {
//       setIsSpeaking(false); // Set isSpeaking to false once speaking is finished
//     };

//     speechSynthesis.speak(utterance); // Speak the question
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText); // Speak the current question
//     }
//   }, [currentQuestionIndex, questions]);

//   // Handle the "Next" button click
//   const handleNext = () => {
//     const currentQuestion = questions[currentQuestionIndex];
//     const answer = recordedText; // Get the recorded answer

//     if (answer.trim()) {
//       submitAnswer(currentQuestion._id, answer); // Submit the answer
//     }

//     // Move to the next question
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setRecordedText(''); // Clear the recorded text for the next question
//     }
//   };

//   return (
//     <div className="m-auto items-center justify-center min-h-screen bg-cover bg-center " style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className="flex justify-center">
//         <img id="mainImage" src="main.gif" className="w-60 h-60 text-center" alt="Shakti AI Logo" />
//       </div>
//       {questions.length > 0 && (
//         <div className="p-4 pb-10 rounded-lg m-auto">
//           <label className="block text-xl font-semibold text-center text-white">
//             {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="hidden input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading || isSpeaking} // Disable input while listening or speaking
//             />
//           </div>
//           <div className="text-center mt-10">
//             {/* Sound wave animation (conditionally show based on isListening or isSpeaking) */}
//             {(isListening || isSpeaking) && (
//               <div className="sound-waves">
//                 <div className="wave"></div>
//                 <div className="wave"></div>
//                 <div className="wave"></div>
//               </div>
//             )}
//             <button
//               className={`mic-button absolute text-5xl ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={isSpeaking} // Disable the mic button while speaking
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex hidden justify-center">
//         <button
//           onClick={handleNext}
//           disabled={isListening || loading || isSpeaking || currentQuestionIndex === questions.length - 1}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false); // Track whether speech recognition is active
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null); // Store recognition instance
//   const [isSpeaking, setIsSpeaking] = useState(false); // Track whether the question is being spoken

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//       router.push('/login');
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email) {
//       fetchQuestions();
//     }
//   }, [email]);

//   // Initialize SpeechRecognition
//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true; // Enable continuous listening

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText((prevText) => prevText + ' ' + transcript); // Append spoken words
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         setIsListening(false); // Update state to show mic is off
//         setLoading(false); // Hide loading state
//       };

//       setRecognition(recognitionInstance); // Store the recognition instance
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, [currentQuestionIndex]); // Reinitialize recognition every time the question changes

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop recognition on second click
//         setIsListening(false); // Update the state to show mic is off
//         setLoading(false); // Hide the loading state when recognition ends

//         // Submit the answer when mic stops
//         const currentQuestion = questions[currentQuestionIndex];
//         const answer = recordedText; // Get the recorded text as the answer
//         submitAnswer(currentQuestion._id, answer); // Submit the answer

//         // Move to the next question automatically after submitting the answer
//         handleNext(); // Move to the next question
//       } else {
//         recognition.start(); // Start recognition on first click
//         setIsListening(true); // Update state to show mic is listening
//         setLoading(true); // Show loading indicator while listening
//       }
//     }
//   };

//   const submitAnswer = async (questionId, answer) => {
//     const res = await fetch('/api/saveAnswer', {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email: `${user?.email}`,
//         questionId: questionId,
//         answer: answer,
//       }),
//     });

//     if (res.ok) {
//       console.log('Answer submitted successfully');
//     } else {
//       const errorData = await res.json();
//       console.error('Error saving answer:', errorData);
//       alert('Error saving data');
//     }
//   };

//   const speakQuestion = (questionText) => {
//     setIsSpeaking(true); // Set isSpeaking to true when the question is being spoken
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-IN'; // Set language
//     utterance.pitch = 1; // Default pitch
//     utterance.rate = 1; // Default speaking rate

//     utterance.onend = () => {
//       setIsSpeaking(false); // Set isSpeaking to false once speaking is finished
//     };

//     speechSynthesis.speak(utterance); // Speak the question
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText); // Speak the current question
//     }
//   }, [currentQuestionIndex, questions]);

//   // Handle the "Next" button click
//   // const handleNext = () => {
//   //   const currentQuestion = questions[currentQuestionIndex];
//   //   const answer = recordedText.trim(); // Get the recorded answer

//   //   // Check if any word in the question exists in the answer
//   //   const questionWords = currentQuestion.questionText.split(' ').map(word => word.toLowerCase());
//   //   const answerWords = answer.split(' ').map(word => word.toLowerCase());

//   //   // Check if any word in the question is present in the answer
//   //   const isGoodAnswer = questionWords.some(word => answerWords.includes(word));

//   //   // Speak the appropriate response
//   //   const responseText = isGoodAnswer 
//   //     ? "Good, let's move to the next question" 
//   //     : "Um, okay, let's move to the next question";
    
//   //   speakResponse(responseText);

//   //   // Submit the answer
//   //   if (answer) {
//   //     submitAnswer(currentQuestion._id, answer); // Submit the answer
//   //   }

//   //   // Move to the next question
//   //   if (currentQuestionIndex < questions.length - 1) {
//   //     setCurrentQuestionIndex(currentQuestionIndex + 1);
//   //     setRecordedText(''); // Clear the recorded text for the next question
//   //   }
//   // };
//   const handleNext = () => {
//     const currentQuestion = questions[currentQuestionIndex];
//     const answer = recordedText.trim(); // Get the recorded answer
  
//     // Check if any word in the question exists in the answer
//     const questionWords = currentQuestion.questionText.split(' ').map(word => word.toLowerCase());
//     const answerWords = answer.split(' ').map(word => word.toLowerCase());
  
//     // Check if any word in the question is present in the answer
//     const isGoodAnswer = questionWords.some(word => answerWords.includes(word));
  
//     // Speak the appropriate response
//     const responseText = isGoodAnswer 
//       ? "Good, let's move to the next question" 
//       : "Um, okay, let's move to the next question";
      
//     speakResponse(responseText);
  
//     // Submit the answer
//     if (answer) {
//       submitAnswer(currentQuestion._id, answer); // Submit the answer
//     }
  
//     // Check if we have reached the last question
//     if (currentQuestionIndex === questions.length - 1) {
//       // All questions are answered, interview ended
//       speakResponse("Your interview has ended.");
//       setTimeout(() => {
//         router.push('/'); // Redirect to the index page after a short delay
//       }, 3000); // Delay to give the user time to hear the message
//     } else {
//       // Move to the next question
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setRecordedText(''); // Clear the recorded text for the next question
//     }
//   };
  
//   // Function to speak the response
//   const speakResponse = (responseText) => {
//     const utterance = new SpeechSynthesisUtterance(responseText);
//     utterance.lang = 'en-US'; // Set the language for the response
//     utterance.pitch = 1;
//     utterance.rate = 1;

//     utterance.onend = () => {
//       setIsSpeaking(false); // Update state when speaking ends
//     };

//     speechSynthesis.speak(utterance); // Speak the response
//   };

//   return (
//     <div className="m-auto items-center justify-center min-h-screen bg-cover bg-center " style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className="flex justify-center">
//         <img id="mainImage" src="main.gif" className="w-60 h-60 text-center" alt="Shakti AI Logo" />
//       </div>
//       {questions.length > 0 && (
//         <div className="p-4 pb-10 rounded-lg m-auto">
//           <label className="block text-xl font-semibold text-center text-white">
//             {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="hidden input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading || isSpeaking} // Disable input while listening or speaking
//             />
//           </div>
//           <div className="text-center mt-10">
//             {/* Sound wave animation (conditionally show based on isListening or isSpeaking) */}
//             {(isListening || isSpeaking) && (
//               <div className="sound-waves">
//                 <div className="wave"></div>
//                 <div className="wave"></div>
//                 <div className="wave"></div>
//               </div>
//             )}
//             <button
//               className={`mic-button absolute text-5xl ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={isSpeaking} // Disable the mic button while speaking
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex hidden justify-center">
//         <button
//           onClick={handleNext}
//           disabled={isListening || loading || isSpeaking || currentQuestionIndex === questions.length - 1}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;



// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//       router.push('/login');
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');
//       }
//     }
//   }, []);

//   const _id = localStorage.getItem('_id');  // Get _id from localStorage
  
//   useEffect(() => {
//     const fetchQuestions = async () => {
//       if (!email || !_id) {
//         console.error('Email or _id is missing');
//         return;
//       }

//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}&_id=${_id}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         console.log('Fetched questions:', data);
        
//         setQuestions(data);  // Set the fetched questions in state
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email && _id) {
//       fetchQuestions();
//     }
//   }, [email]);

//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true;

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText((prevText) => prevText + ' ' + transcript);
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         setIsListening(false);
//         setLoading(false);
//       };

//       setRecognition(recognitionInstance);
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, [currentQuestionIndex]);

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop();
//         setIsListening(false);
//         setLoading(false);
//         const currentQuestion = questions[currentQuestionIndex];
//         const answer = recordedText;
//         submitAnswer(currentQuestion._id, answer);
//         handleNext();
//       } else {
//         recognition.start();
//         setIsListening(true);
//         setLoading(true);
//       }
//     }
//   };

  
//   const submitAnswer = async (questionId, answer) => {
//     try {
//       const res = await fetch('/api/saveAnswer', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           _id: _id,
//           email: `${user?.email}`,  // Assuming user?.email is the email you're passing
//           questionId: questionId,
//           answer: answer,
//         }),
//       });
  
//       // Check if the request was successful
//       if (res.ok) {
//         console.log('Answer submitted successfully');
//       } else {
//         // If response not OK, get error details and show an alert
//         const errorData = await res.json();
//         console.error('Error saving answer:', errorData);
//         alert(`Error saving data: ${errorData.message}`);
//       }
//     } catch (error) {
//       // Catch network or other errors
//       console.error('Network or other error:', error);
//       alert('Network or other error occurred');
//     }
//   };
  

//   const speakQuestion = (questionText) => {
//     setIsSpeaking(true);
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-IN';
//     utterance.pitch = 1;
//     utterance.rate = 1;

//     utterance.onend = () => {
//       setIsSpeaking(false);
//     };

//     speechSynthesis.speak(utterance);
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText);
//     }
//   }, [currentQuestionIndex, questions]);

//   const handleNext = () => {
//     const currentQuestion = questions[currentQuestionIndex];
//     const answer = recordedText.trim();

//     const questionWords = currentQuestion.questionText.split(' ').map(word => word.toLowerCase());
//     const answerWords = answer.split(' ').map(word => word.toLowerCase());

//     const isGoodAnswer = questionWords.some(word => answerWords.includes(word));

//     const responseText = isGoodAnswer
//       ? "Good, let's move to the next question"
//       : "Um, okay, let's move to the next question";

//     speakResponse(responseText);

//     if (answer) {
//       submitAnswer(currentQuestion._id, answer);
//     }

//     if (currentQuestionIndex === questions.length - 1) {
      
//       speakResponse("Your interview has ended.");
//       setIsModalVisible(true);
//       localStorage.removeItem("_id"); // Show modal when interview ends
//     } else {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setRecordedText('');
//     }
//   };

//   const speakResponse = (responseText) => {
//     const utterance = new SpeechSynthesisUtterance(responseText);
//     utterance.lang = 'en-US';
//     utterance.pitch = 1;
//     utterance.rate = 1;

//     utterance.onend = () => {
//       setIsSpeaking(false);
//     };

//     speechSynthesis.speak(utterance);
//   };

//   const handleModalClose = () => {
//     setIsModalVisible(false); // Close modal
//     router.push('/'); // Redirect to index page
//   };

//   return (
//     <div className="m-auto items-center justify-center min-h-screen bg-cover bg-center " style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className="flex justify-center">
//         <img id="mainImage" src="main.gif" className="w-60 h-60 text-center" alt="Shakti AI Logo" />
//       </div>
//       {questions.length > 0 && (
//         <div className="p-4 pb-10 rounded-lg m-auto">
//           <label className="block text-xl font-semibold text-center text-white">
//             {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="hidden input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading || isSpeaking}
//             />
//           </div>
//           <div className="text-center mt-10">
//             {(isListening || isSpeaking) && (
//               <div className="sound-waves">
//                 <div className="wave"></div>
//                 <div className="wave"></div>
//                 <div className="wave"></div>
//               </div>
//             )}
//             <button
//               className={`mic-button absolute text-5xl ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={isSpeaking}
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex hidden justify-center">
//         <button
//           onClick={handleNext}
//           disabled={isListening || loading || isSpeaking || currentQuestionIndex === questions.length - 1}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>

//       {/* Modal for interview end */}
//       {isModalVisible && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg max-w-sm">
//             <h2 className="text-xl font-semibold mb-4">Your interview has ended</h2>
//             <button
//               onClick={handleModalClose}
//               className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QuestionForm;



// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
//   const [answers, setAnswers] = useState([]); // Store answers
//   const [interviewComplete, setInterviewComplete] = useState(false); // Track interview completion

//   useEffect(() => {
//     if (!localStorage.getItem('token')) {
//       router.push('/login');
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');
//       }
//     }
//   }, []);

//   const _id = localStorage.getItem('_id');  // Get _id from localStorage
  
//   useEffect(() => {
//     const fetchQuestions = async () => {
//       if (!email || !_id) {
//         console.error('Email or _id is missing');
//         return;
//       }

//       try {
//         const res = await fetch(`/api/fetchQuestions?email=${email}&_id=${_id}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         console.log('Fetched questions:', data);
        
//         setQuestions(data);  // Set the fetched questions in state
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email && _id) {
//       fetchQuestions();
//     }
//   }, [email]);

//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true;

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText((prevText) => prevText + ' ' + transcript);
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         setIsListening(false);
//         setLoading(false);
//       };

//       setRecognition(recognitionInstance);
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, [currentQuestionIndex]);

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop();
//         setIsListening(false);
//         setLoading(false);
//         const currentQuestion = questions[currentQuestionIndex];
//         const answer = recordedText;
//         setAnswers((prevAnswers) => [
//           ...prevAnswers,
//           { questionId: currentQuestion._id, answer: answer } // Store answer with question ID
//         ]);
//         submitAnswer(currentQuestion._id, answer);
//         handleNext();
//       } else {
//         recognition.start();
//         setIsListening(true);
//         setLoading(true);
//       }
//     }
//   };

//   const submitAnswer = async (questionId, answer) => {
//     try {
//       const res = await fetch('/api/saveAnswer', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           _id: _id,
//           email: `${user?.email}`,  // Assuming user?.email is the email you're passing
//           questionId: questionId,
//           answer: answer,
//         }),
//       });
  
//       // Check if the request was successful
//       if (res.ok) {
//         console.log('Answer submitted successfully');
//       } else {
//         // If response not OK, get error details and show an alert
//         const errorData = await res.json();
//         console.error('Error saving answer:', errorData);
//         alert(`Error saving data: ${errorData.message}`);
//       }
//     } catch (error) {
//       // Catch network or other errors
//       console.error('Network or other error:', error);
//       alert('Network or other error occurred');
//     }
//   };

//   const speakQuestion = (questionText) => {
//     setIsSpeaking(true);
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-IN';
//     utterance.pitch = 1;
//     utterance.rate = 1;

//     utterance.onend = () => {
//       setIsSpeaking(false);
//     };

//     speechSynthesis.speak(utterance);
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       speakQuestion(currentQuestion.questionText);
//     }
//   }, [currentQuestionIndex, questions]);

//   // const handleNext = () => {
//   //   const currentQuestion = questions[currentQuestionIndex];
//   //   const answer = recordedText.trim();

//   //   const questionWords = currentQuestion.questionText.split(' ').map(word => word.toLowerCase());
//   //   const answerWords = answer.split(' ').map(word => word.toLowerCase());

//   //   const isGoodAnswer = questionWords.some(word => answerWords.includes(word));

//   //   const responseText = isGoodAnswer
//   //     ? "Good, let's move to the next question"
//   //     : "Um, okay, let's move to the next question";

//   //   speakResponse(responseText);

//   //   if (answer) {
//   //     submitAnswer(currentQuestion._id, answer);
//   //   }

//   //   if (currentQuestionIndex === questions.length - 1) {
//   //     speakResponse("Your interview has ended.");
//   //     setInterviewComplete(true);  // Set interview as complete
//   //     setIsModalVisible(true);
//   //     localStorage.removeItem("_id"); // Show modal when interview ends
//   //     sendInterviewReport(); // Send the answers to the report API when interview ends
//   //   } else {
//   //     setCurrentQuestionIndex(currentQuestionIndex + 1);
//   //     setRecordedText('');
//   //   }
//   // };

//   // const speakResponse = (responseText) => {
//   //   const utterance = new SpeechSynthesisUtterance(responseText);
//   //   utterance.lang = 'en-US';
//   //   utterance.pitch = 1;
//   //   utterance.rate = 1;

//   //   utterance.onend = () => {
//   //     setIsSpeaking(false);
//   //   };

//   //   speechSynthesis.speak(utterance);
//   // };

//   // const sendInterviewReport = async () => {
//   //   try {
//   //     const res = await fetch('/api/report', {
//   //       method: 'POST',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //       },
//   //       body: JSON.stringify({
//   //         interviewData: answers,
        
//   //         email: user?.email,
//   //       }),
//   //     });

//   //     if (res.ok) {
//   //       console.log('Interview report sent successfully');
//   //     } else {
//   //       const errorData = await res.json();
//   //       console.error('Error sending interview report:', errorData);
//   //       alert(`Error sending report: ${errorData.message}`);
//   //     }
//   //   } catch (error) {
//   //     console.error('Error sending interview report:', error);
//   //     alert('Error occurred while sending the report.');
//   //   }
//   // };

//   const handleNext = () => {
//     const currentQuestion = questions[currentQuestionIndex];
//     const answer = recordedText.trim();
  
//     const questionWords = currentQuestion.questionText.split(' ').map(word => word.toLowerCase());
//     const answerWords = answer.split(' ').map(word => word.toLowerCase());
  
//     const isGoodAnswer = questionWords.some(word => answerWords.includes(word));
  
//     const responseText = isGoodAnswer
//       ? "Good, let's move to the next question"
//       : "Um, okay, let's move to the next question";
  
//     speakResponse(responseText);
  
//     if (answer) {
//       setAnswers((prevAnswers) => [
//         ...prevAnswers,
//         { questionId: currentQuestion._id, answer: answer } // Store the answer
//       ]);
//     }

  
//     // After answering the last question, mark the interview as complete and send the report
//     if (currentQuestionIndex === questions.length - 1) {
//       speakResponse("Your interview has ended.");
//       setInterviewComplete(true);  // Set interview as complete
//       setIsModalVisible(true);  // Show the modal when interview ends
//       localStorage.removeItem("_id");  // Remove _id from localStorage
//       sendInterviewReport();  // Send the interview report now
//     } else {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);  // Move to the next question
//       setRecordedText('');  // Clear recorded text for the next question
//     }
//   };
  
//   const sendInterviewReport = async () => {
//     try {
//       // Only send the report after the interview is complete
//       if (!interviewComplete) {
//         return;  // Don't send the report if the interview isn't completed
//       }
//   console.log(answers);
  
//       const res = await fetch('/api/report', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           interviewData: answers,  // Send all the collected answers
//           email: user?.email,       // Send the user's email
//         }),
//       });
  
//       if (res.ok) {
//         console.log('Interview report sent successfully');
//       } else {
//         const errorData = await res.json();
//         console.error('Error sending interview report:', errorData);
//         alert(`Error sending report: ${errorData.message}`);
//       }
//     } catch (error) {
//       console.error('Error sending interview report:', error);
//       alert('Error occurred while sending the report.');
//     }
//   };
  
//   const handleModalClose = () => {
//     setIsModalVisible(false); // Close modal
//     router.push('/'); // Redirect to index page
//   };

//   return (
//     <div className="m-auto items-center justify-center min-h-screen bg-cover bg-center " style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className="flex justify-center">
//         <img id="mainImage" src="main.gif" className="w-60 h-60 text-center" alt="Shakti AI Logo" />
//       </div>
//       {questions.length > 0 && (
//         <div className="p-4 pb-10 rounded-lg m-auto">
//           <label className="block text-xl font-semibold text-center text-white">
//             {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="hidden input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading || isSpeaking}
//             />
//           </div>
//           <div className="text-center mt-10">
//             {(isListening || isSpeaking) && (
//               <div className="sound-waves">
//                 <div className="wave"></div>
//                 <div className="wave"></div>
//                 <div className="wave"></div>
//               </div>
//             )}
//             <button
//               className={`mic-button absolute text-5xl ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={isSpeaking}
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex hidden justify-center">
//         <button
//           onClick={handleNext}
//           disabled={isListening || loading || isSpeaking || currentQuestionIndex === questions.length - 1}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>

//       {/* Modal for interview end */}
//       {isModalVisible && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg max-w-sm">
//             <h2 className="text-xl font-semibold mb-4">Your interview has ended</h2>
//             <button
//               onClick={handleModalClose}
//               className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QuestionForm;




// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [answers, setAnswers] = useState([]);
//   const [interviewComplete, setInterviewComplete] = useState(false);
//   const [isExitModalVisible, setIsExitModalVisible] = useState(false);

//   const goodResponses = [
//     "Alright, let's move on to the next question.",
//     "Okay, let's continue to the next one.",
//     "Let's go ahead with the next question.",
//     "Let's move on to the next question now.",
//     "Proceeding to the next question.",
//     "Let's move forward to the next one.",
//     "Next question, please.",
//     "Let's go to the next one.",
//     "Moving on to the next question.",
//     "Let's continue with the next question.",
//     "Now, let's go to the next question.",
//     "Time to proceed with the next question.",
//     "Next question, let's go.",
//     "Let's keep going with the next question.",
//     "Let's continue with the next one."
//   ];
  
//   const badResponses = [
//     "Um, okay, let's move to the next question.",
//     "Not quite, but let's move to the next question.",
//     "Hmm, not exactly, let's continue to the next question.",
//     "Well, that’s not right, but let’s go on to the next one.",
//     "Close enough, let’s move on to the next question.",
//     "It’s not perfect, but let’s proceed to the next one.",
//     "Hmm, I see where you’re going, but let’s move to the next one.",
//     "That’s not the answer we were looking for, but let’s continue.",
//     "Not quite right, but let's continue to the next question.",
//     "Almost, but we’ll keep going.",
//     "I think we missed it, let’s move on.",
//     "Hmm, not quite, but let’s keep going.",
//     "That’s a bit off, but let's move to the next one.",
//     "Not exactly what we needed, but let's continue.",
//     "Close, but not quite there, let’s move on."
//   ];
  

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       // Access localStorage only in the browser
//       const token = localStorage.getItem('token');
//       if (!token) {
//         router.push('/login');
//       } else {
//         const userFromStorage = JSON.parse(localStorage.getItem('user'));
//         if (userFromStorage) {
//           setUser(userFromStorage);
//           setEmail(userFromStorage.email || '');
//         }
//       }
//     }
//   }, []);

//   // Get _id from localStorage after the component is mounted
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const _id = localStorage.getItem('_id');
//       if (_id) {
//         setUserId(_id);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       if (!email || !userId) {
//         console.error('Email or _id is missing');
//         return;
//       }

//       try {
//         const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/fetchQuestions?email=${email}&_id=${userId}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         console.log('Fetched questions:', data);
        
//         setQuestions(data);  // Set the fetched questions in state
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email && userId) {
//       fetchQuestions();
//     }
//   }, [email, userId]);

//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true;

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText((prevText) => prevText + ' ' + transcript);
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         setIsListening(false);
//         setLoading(false);
//       };

//       setRecognition(recognitionInstance);
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, [currentQuestionIndex]);

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop();
//         setIsListening(false);
//         setLoading(false);
//         const currentQuestion = questions[currentQuestionIndex];
//         const answer = recordedText;
//         setAnswers((prevAnswers) => [
//           ...prevAnswers,
//           { questionId: currentQuestion._id, answer: answer } // Store answer with question ID
//         ]);
//         submitAnswer(currentQuestion._id, answer);
//         handleNext();
//       } else {
//         recognition.start();
//         setIsListening(true);
//         setLoading(true);
//       }
//     }
//   };

//   const submitAnswer = async (questionId, answer) => {
//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/saveAnswer`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           _id: userId,
//           email: user?.email,  // Assuming user?.email is the email you're passing
//           questionId: questionId,
//           answer: answer,
//         }),
//       });

//       if (res.ok) {
//         console.log('Answer submitted successfully');
//       } else {
//         const errorData = await res.json();
//         console.error('Error saving answer:', errorData);
//         alert(`Error saving data: ${errorData.message}`);
//       }
//     } catch (error) {
//       console.error('Network or other error:', error);
//       alert('Network or other error occurred');
//     }
//   };

//   const speakQuestion = (questionText) => {
//     setIsSpeaking(true);
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-US';
//     utterance.pitch = 1;
//     utterance.rate = 1;

//     utterance.onend = () => {
//       setIsSpeaking(false);
//     };

//     speechSynthesis.speak(utterance);
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
      
//       // Clean up the question text by removing "currentQuestion", commas, and asterisks
//       const cleanedQuestionText = currentQuestion.questionText.replace(/(currentQuestion|[,*])/g, "");
  
//       speakQuestion(cleanedQuestionText);
//     }
//   }, [currentQuestionIndex, questions]);
  
//   const handleNext = () => {
//     const currentQuestion = questions[currentQuestionIndex];
//     const answer = recordedText.trim();

//     const questionWords = currentQuestion.questionText.split(' ').map(word => word.toLowerCase());
//     const answerWords = answer.split(' ').map(word => word.toLowerCase());

//     const isGoodAnswer = questionWords.some(word => answerWords.includes(word));

//     const responseText = Math.random() > 0.15 
//   ? goodResponses[Math.floor(Math.random() * goodResponses.length)] 
//   : badResponses[Math.floor(Math.random() * badResponses.length)];

//     speakResponse(responseText);

//     if (answer) {
//       setAnswers((prevAnswers) => [
//         ...prevAnswers,
//         { questionId: currentQuestion._id, answer: answer } // Store the answer
//       ]);
//     }

//     if (currentQuestionIndex === questions.length - 1) {
     
//       speakResponse("Your interview has ended.");
//       setInterviewComplete(true);  // Set interview as complete
//       setIsModalVisible(true);  // Show the modal when interview ends
//       localStorage.removeItem("_id");  // Remove _id from localStorage
//     } else {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);  // Move to the next question
//       setRecordedText('');  // Clear recorded text for the next question
//     }
//   };

//   const speakResponse = (responseText) => {
//     const utterance = new SpeechSynthesisUtterance(responseText);
//     utterance.lang = 'en-US';
//     utterance.pitch = 1;
//     utterance.rate = 1;

//     utterance.onend = () => {
//       setIsSpeaking(false);
//     };

//     speechSynthesis.speak(utterance);
//   };

 

//   const handleModalClose = () => {
//     setIsModalVisible(false); // Close modal
//     router.push('/report'); // Redirect to index page
//   };
  
  

//   const handleBeforeUnload = (event) => {
//     if (!interviewComplete) {
//       const message = "Are you sure you want to leave? Your interview will be lost.";
//       event.returnValue = message;
//       return message;
//     }
//   };

//   const handleExitModalClose = () => {
//     setIsExitModalVisible(false);
//   };

//   const handleExitConfirmation = () => {
//     setIsExitModalVisible(false);
//     router.push('/report'); // Redirect to /report page
//   };

//   const handlePopState = () => {
//     if (!interviewComplete) {
//       setIsExitModalVisible(true);
//     }
//   };

//   useEffect(() => {
//     // Prevent the user from navigating away when interview is incomplete
//     window.history.pushState(null, document.title);
//     window.addEventListener('popstate', handlePopState);

//     return () => {
//       window.removeEventListener('popstate', handlePopState);
//     };
//   }, [interviewComplete]);

//   useEffect(() => {
//     window.addEventListener('beforeunload', handleBeforeUnload);

//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//     };
//   }, [interviewComplete]);


//   return (
//     <div className="m-auto items-center justify-center min-h-screen bg-cover bg-center " style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className="flex justify-center">
//         <img id="mainImage" src="main.gif" className="w-60 h-60 text-center" alt="Shakti AI Logo" />
//       </div>
//       {questions.length > 0 && (
//         <div className="p-4 pb-10 rounded-lg m-auto">
//           <label className="block text-xl font-semibold text-center text-white">
//             {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="hidden input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading || isSpeaking}
//             />
//           </div>
//           <div className="text-center mt-10">
//             {(isListening || isSpeaking) && (
//               <div className="sound-waves">
//                 <div className="wave"></div>
//                 <div className="wave"></div>
//                 <div className="wave"></div>
//               </div>
//             )}
//             <button
//               className={`mic-button absolute text-5xl ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={isSpeaking}
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex hidden justify-center">
//         <button
//           onClick={handleNext}
//           disabled={isListening || loading || isSpeaking || currentQuestionIndex === questions.length - 1}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>

//       {/* Modal for interview end */}
//       {isModalVisible && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg max-w-sm">
//             <h2 className="text-xl font-semibold mb-4">Your interview has ended</h2>
//             <button
//               onClick={handleModalClose}
//               className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}

// {isExitModalVisible && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg max-w-sm">
//             <h2 className="text-xl font-semibold mb-4">Are you sure you want to leave? Your interview will be lost.</h2>
//             <div className="flex justify-between">
//               <button
//                 onClick={handleExitConfirmation}
//                 className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none"
//               >
//                 Leave
//               </button>
//               <button
//                 onClick={handleExitModalClose}
//                 className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none"
//               >
//                 Stay
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QuestionForm;


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [answers, setAnswers] = useState([]);
//   const [interviewComplete, setInterviewComplete] = useState(false);
//   const [isExitModalVisible, setIsExitModalVisible] = useState(false);

//   // State to track mic activation within the 20 seconds
//   const [micTimeout, setMicTimeout] = useState(null);

//   const goodResponses = [ 
//         "Great! Let's move on to the next question.",
//         "Awesome! Let's continue to the next one",
//         "Perfect, let's go ahead with the next question.",
//         "Let's move on to the next question now and keep going strong!",
//         "Wonderful! Proceeding to the next question.",
//         "Let’s move forward to the next one with excitement!",
//         "Next question, please—let's dive right in!",
//         "Let’s go to the next one and keep the momentum going.",
//         "Moving on to the next question, excited to see what's next!",
//         "Let's continue with the next question and keep up the good work!",
//         "Now, let’s go to the next question and stay on track!",
//         "Time to proceed with the next question—let’s keep it up!",
//         "Next question, let’s go, we’re doing great!",
//         "Let’s keep going with the next question and stay positive!",
//         "Let’s continue with the next one, things are going well!"
//       ];
      
//       const badResponses = [
//         "Um, okay, let's move to the next question.",
//         "Not quite, but let's move to the next question.",
//         "Hmm, not exactly, let's continue to the next question.",
//         "Well, that’s not right, but let’s go on to the next one.",
//         "Close enough, let’s move on to the next question.",
//         "It’s not perfect, but let’s proceed to the next one.",
//         "Hmm, I see where you’re going, but let’s move to the next one.",
//         "That’s not the answer we were looking for, but let’s continue.",
//         "Not quite right, but let's continue to the next question.",
//         "Almost, but we’ll keep going.",
//         "I think we missed it, let’s move on.",
//         "Hmm, not quite, but let’s keep going.",
//         "That’s a bit off, but let's move to the next one.",
//         "Not exactly what we needed, but let's continue.",
//         "Close, but not quite there, let’s move on."
//       ];


//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       // Access localStorage only in the browser
//       const token = localStorage.getItem('token');
//       if (!token) {
//         router.push('/login');
//       } else {
//         const userFromStorage = JSON.parse(localStorage.getItem('user'));
//         if (userFromStorage) {
//           setUser(userFromStorage);
//           setEmail(userFromStorage.email || '');
//         }
//       }
//     }
//   }, []);

//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const _id = localStorage.getItem('_id');
//       if (_id) {
//         setUserId(_id);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       if (!email || !userId) {
//         console.error('Email or _id is missing');
//         return;
//       }

//       try {
//         const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/fetchQuestions?email=${email}&_id=${userId}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         console.log('Fetched questions:', data);
        
//         setQuestions(data);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email && userId) {
//       fetchQuestions();
//     }
//   }, [email, userId]);

//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true;

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText((prevText) => prevText + ' ' + transcript);
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         setIsListening(false);
//         setLoading(false);
//       };

//       setRecognition(recognitionInstance);
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, [currentQuestionIndex]);

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop();
//         setIsListening(false);
//         setLoading(false);
//         const currentQuestion = questions[currentQuestionIndex];
//         const answer = recordedText;
//         setAnswers((prevAnswers) => [
//           ...prevAnswers,
//           { questionId: currentQuestion._id, answer: answer }
//         ]);
//         submitAnswer(currentQuestion._id, answer);
//         handleNext();
//       } else {
//         recognition.start();
//         setIsListening(true);
//         setLoading(true);
//       }
//     }
//   };

//   const submitAnswer = async (questionId, answer) => {
//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/saveAnswer`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           _id: userId,
//           email: user?.email,
//           questionId: questionId,
//           answer: answer,
//         }),
//       });

//       if (res.ok) {
//         console.log('Answer submitted successfully');
//       } else {
//         const errorData = await res.json();
//         console.error('Error saving answer:', errorData);
//         alert(`Error saving data: ${errorData.message}`);
//       }
//     } catch (error) {
//       console.error('Network or other error:', error);
//       alert('Network or other error occurred');
//     }
//   };

//   const speakQuestion = (questionText) => {
//     setIsSpeaking(true);
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-US';
//     utterance.pitch = 1;
//     utterance.rate = 1;

//     utterance.onend = () => {
//       setIsSpeaking(false);
//     };

//     speechSynthesis.speak(utterance);
    
//     // Set a timer to check if the mic is activated within 20 seconds
//     const timeout = setTimeout(() => {
//       if (!isListening) {
//         speakResponse("You're too late to turn on the mic.");
//         handleNext();
//       }
//     }, 20000); // 20 seconds timeout

//     setMicTimeout(timeout);
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
      
//       // Clean up the question text by removing "currentQuestion", commas, and asterisks
//       const cleanedQuestionText = currentQuestion.questionText.replace(/(currentQuestion|[,*])/g, "");
  
//       speakQuestion(cleanedQuestionText);
//     }
//   }, [currentQuestionIndex, questions]);

//   const handleNext = () => {
//     const currentQuestion = questions[currentQuestionIndex];
//     const answer = recordedText.trim();

//     const questionWords = currentQuestion.questionText.split(' ').map(word => word.toLowerCase());
//     const answerWords = answer.split(' ').map(word => word.toLowerCase());

//     const isGoodAnswer = questionWords.some(word => answerWords.includes(word));

//     const responseText = Math.random() > 0.15 
//   ? goodResponses[Math.floor(Math.random() * goodResponses.length)] 
//   : badResponses[Math.floor(Math.random() * badResponses.length)];

//     speakResponse(responseText);

//     if (answer) {
//       setAnswers((prevAnswers) => [
//         ...prevAnswers,
//         { questionId: currentQuestion._id, answer: answer }
//       ]);
//     }

//     if (currentQuestionIndex === questions.length - 1) {
//       speakResponse("Your interview has ended.");
//       setInterviewComplete(true);
//       setIsModalVisible(true);
//       localStorage.removeItem("_id");
//     } else {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setRecordedText('');
//     }

//     // Clear the timer after moving to the next question
//     if (micTimeout) {
//       clearTimeout(micTimeout);
//       setMicTimeout(null);
//     }
//   };

//   const speakResponse = (responseText) => {
//     const utterance = new SpeechSynthesisUtterance(responseText);
//     utterance.lang = 'en-US';
//     utterance.pitch = 1;
//     utterance.rate = 1;

//     utterance.onend = () => {
//       setIsSpeaking(false);
//     };

//     speechSynthesis.speak(utterance);
//   };

//   return (
//     <div className="m-auto items-center justify-center min-h-screen bg-cover bg-center " style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className="flex justify-center">
//         <img id="mainImage" src="main.gif" className="w-60 h-60 text-center" alt="Shakti AI Logo" />
//       </div>
//       {questions.length > 0 && (
//         <div className="p-4 pb-10 rounded-lg m-auto">
//           <label className="block text-xl font-semibold text-center text-white">
//             {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="hidden input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading || isSpeaking}
//             />
//           </div>
//           <div className="text-center mt-10">
//             {(isListening || isSpeaking) && (
//               <div className="sound-waves">
//                 <div className="wave"></div>
//                 <div className="wave"></div>
//                 <div className="wave"></div>
//               </div>
//             )}
//             <button
//               className={`mic-button absolute text-5xl ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={isSpeaking}
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Modal for interview end */}
//       {isModalVisible && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg max-w-sm">
//             <h2 className="text-xl font-semibold mb-4">Your interview has ended</h2>
//             <button
//               onClick={handleModalClose}
//               className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QuestionForm;



// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// const QuestionForm = () => {
//   const router = useRouter();
//   const [questions, setQuestions] = useState([]);
//   const [email, setEmail] = useState('');
//   const [user, setUser] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState('');
//   const [isListening, setIsListening] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [recognition, setRecognition] = useState(null);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [answers, setAnswers] = useState([]);
//   const [interviewComplete, setInterviewComplete] = useState(false);
//   const [isExitModalVisible, setIsExitModalVisible] = useState(false);

//   const [micTimeout, setMicTimeout] = useState(null);
//   const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

//   const goodResponses = [
//     "Great! Let's move on to the next question.",
//     "Awesome! Let's continue to the next one",
//     "Perfect, let's go ahead with the next question.",
//     "Let's move on to the next question now and keep going strong!",
//     "Wonderful! Proceeding to the next question.",
//     "Let’s move forward to the next one with excitement!",
//     "Next question, please—let's dive right in!",
//     "Let’s go to the next one and keep the momentum going.",
//     "Moving on to the next question, excited to see what's next!",
//     "Let's continue with the next question and keep up the good work!",
//     "Now, let’s go to the next question and stay on track!",
//     "Time to proceed with the next question—let’s keep it up!",
//     "Next question, let’s go, we’re doing great!",
//     "Let’s keep going with the next question and stay positive!",
//     "Let’s continue with the next one, things are going well!"
//   ];


  
  

//   const badResponses = [
//     "Um, okay, let's move to the next question.",
//     "Not quite, but let's move to the next question.",
//     "Hmm, not exactly, let's continue to the next question.",
//     "Well, that’s not right, but let’s go on to the next one.",
//     "Close enough, let’s move on to the next question.",
//     "It’s not perfect, but let’s proceed to the next one.",
//     "Hmm, I see where you’re going, but let’s move to the next one.",
//     "That’s not the answer we were looking for, but let’s continue.",
//     "Not quite right, but let's continue to the next question.",
//     "Almost, but we’ll keep going.",
//     "I think we missed it, let’s move on.",
//     "Hmm, not quite, but let’s keep going.",
//     "That’s a bit off, but let's move to the next one.",
//     "Not exactly what we needed, but let's continue.",
//     "Close, but not quite there, let’s move on."
//   ];


 

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       // Access localStorage only in the browser

//       const token = localStorage.getItem('token');
//       if (!token) {
//         router.push('/login');
//       } else {
//         const userFromStorage = JSON.parse(localStorage.getItem('user'));
//         if (userFromStorage) {
//           setUser(userFromStorage);
//           setEmail(userFromStorage.email || '');
//         }
//       }
//     }
//   }, []);


//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const _id = localStorage.getItem('_id');
//       if (_id) {
//         setUserId(_id);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       if (!email || !userId) {
//         console.error('Email or _id is missing');
//         return;
//       }

//       try {
//         const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/fetchQuestions?email=${email}&_id=${userId}`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.statusText}`);
//         }

//         const data = await res.json();
//         console.log('Fetched questions:', data);
        

//         setQuestions(data);  // Set the fetched questions in state

//       } catch (error) {
//         console.error('Error fetching questions:', error);
//         alert('An error occurred while fetching the questions.');
//       }
//     };

//     if (email && userId) {
//       fetchQuestions();
//     }
//   }, [email, userId]);

//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = false;
//       recognitionInstance.maxAlternatives = 1;
//       recognitionInstance.continuous = true;

//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setRecordedText((prevText) => prevText + ' ' + transcript);
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Speech recognition error', event.error);
//         setIsListening(false);
//         setLoading(false);
//       };

//       recognitionInstance.onend = () => {
//         setIsListening(false);
//         setLoading(false);
//       };

//       setRecognition(recognitionInstance);
//     } else {
//       alert('Speech recognition is not supported in this browser.');
//     }
//   }, [currentQuestionIndex]);

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop();
//         setIsListening(false);
//         setLoading(false);
//         const currentQuestion = questions[currentQuestionIndex];
//         const answer = recordedText;
//         setAnswers((prevAnswers) => [
//           ...prevAnswers,

//           { questionId: currentQuestion._id, answer: answer }
//      ]);
//         submitAnswer(currentQuestion._id, answer);
//         handleNext();
//       } else {
//         recognition.start();
//         setIsListening(true);
//         setLoading(true);


//         if (micTimeout) {
//           clearTimeout(micTimeout);
//           setMicTimeout(null);
//         }

//       }
//     }
//   };

//   const submitAnswer = async (questionId, answer) => {
//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/saveAnswer`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           _id: userId,

//           email: user?.email,

//           email: user?.email,  // Assuming user?.email is the email you're passing

//           questionId: questionId,
//           answer: answer,
//         }),
//       });

//       if (res.ok) {
//         console.log('Answer submitted successfully');
//       } else {
//         const errorData = await res.json();
//         console.error('Error saving answer:', errorData);
//         alert(`Error saving data: ${errorData.message}`);
//       }
//     } catch (error) {
//       console.error('Network or other error:', error);
//       alert('Network or other error occurred');
//     }
//   };

//   const speakQuestion = (questionText) => {
//     setIsSpeaking(true);
//     const utterance = new SpeechSynthesisUtterance(questionText);
//     utterance.lang = 'en-US';
//     utterance.pitch = 1;
//     utterance.rate = 1;

//     utterance.onend = () => {
//       setIsSpeaking(false);
//     };

//     speechSynthesis.speak(utterance);


//     if (!isListening && !isAnswerSubmitted) {
//       const timeout = setTimeout(() => {
//         if (!isListening && !isAnswerSubmitted) {
//           speakResponse("You're too late to turn on the mic.");
//           handleNext();
//         }
//       }, 20000);

//       setMicTimeout(timeout);
//     }
//   };

//   useEffect(() => {
//     if (questions.length > 0) {
//       const currentQuestion = questions[currentQuestionIndex];
//       const cleanedQuestionText = currentQuestion.questionText.replace(/(currentQuestion|[,*])/g, "");
//       speakQuestion(cleanedQuestionText);
//     }
//   }, [currentQuestionIndex, questions]);

//   const handleNext = () => {
//     const currentQuestion = questions[currentQuestionIndex];
//     const answer = recordedText.trim();

//     const questionWords = currentQuestion.questionText.split(' ').map(word => word.toLowerCase());
//     const answerWords = answer.split(' ').map(word => word.toLowerCase());

//     const isGoodAnswer = questionWords.some(word => answerWords.includes(word));

//     const responseText = Math.random() > 0.15 
//       ? goodResponses[Math.floor(Math.random() * goodResponses.length)] 
//       : badResponses[Math.floor(Math.random() * badResponses.length)];

  

//     speakResponse(responseText);

//     if (answer) {
//       setAnswers((prevAnswers) => [
//         ...prevAnswers,

//         { questionId: currentQuestion._id, answer: answer } // Store the answer

//       ]);
//     }

//     if (currentQuestionIndex === questions.length - 1) {

//       speakResponse("Your interview has ended.");
//       setInterviewComplete(true);
//       setIsModalVisible(true);
//       localStorage.removeItem("_id");
//     } else {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setRecordedText('');
//       setIsAnswerSubmitted(false);
//     }

//     if (micTimeout) {
//       clearTimeout(micTimeout);
//       setMicTimeout(null);

     
//       speakResponse("Your interview has ended.");
//       setInterviewComplete(true);  // Set interview as complete
//       setIsModalVisible(true);  // Show the modal when interview ends
//       localStorage.removeItem("_id");  // Remove _id from localStorage
//     } else {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);  // Move to the next question
//       setRecordedText('');  // Clear recorded text for the next question

//     }
//   };

//   const speakResponse = (responseText) => {
//     const utterance = new SpeechSynthesisUtterance(responseText);
//     utterance.lang = 'en-US';
//     utterance.pitch = 1;
//     utterance.rate = 1;

//     utterance.onend = () => {
//       setIsSpeaking(false);
//     };

//     speechSynthesis.speak(utterance);
//   };


//   const handleModalClose = () => {
//     setIsModalVisible(false);
//     router.push('/report');
//   };

 

 
  
  


//   const handleBeforeUnload = (event) => {
//     if (!interviewComplete) {
//       const message = "Are you sure you want to leave? Your interview will be lost.";
//       event.returnValue = message;
//       return message;
//     }
//   };

//   const handleExitModalClose = () => {
//     setIsExitModalVisible(false);
//   };

//   const handleExitConfirmation = () => {
//     setIsExitModalVisible(false);
//     router.push('/report');

//      // Redirect to /report page

//   };

//   const handlePopState = () => {
//     if (!interviewComplete) {
//       setIsExitModalVisible(true);
//     }
//   };

//   useEffect(() => {

//     // Prevent the user from navigating away when interview is incomplete
//     window.history.pushState(null, document.title);
//     window.addEventListener('popstate', handlePopState);

//     return () => {
//       window.removeEventListener('popstate', handlePopState);
//     };
//   }, [interviewComplete]);

//   useEffect(() => {
//     window.addEventListener('beforeunload', handleBeforeUnload);

//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//     };
//   }, [interviewComplete]);



//   return (
//     <div className="m-auto items-center justify-center min-h-screen bg-cover bg-center " style={{ backgroundImage: "url('/BG.jpg')" }}>
//       <div className="flex justify-center">
//         <img id="mainImage" src="main.gif" className="w-60 h-60 text-center" alt="Shakti AI Logo" />
//       </div>
//       {questions.length > 0 && (
//         <div className="p-4 pb-10 rounded-lg m-auto">
//           <label className="block text-xl font-semibold text-center text-white">
//             {questions[currentQuestionIndex].questionText}
//           </label>
//           <div className="hidden input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//             <input
//               type="text"
//               id="textContent"
//               className="bg-transparent border-none text-white focus:outline-none w-full"
//               placeholder="Type Here"
//               value={recordedText}
//               onChange={(e) => setRecordedText(e.target.value)}
//               disabled={isListening || loading || isSpeaking}
//             />
//           </div>
//           <div className="text-center mt-10">
//             {(isListening || isSpeaking) && (
//               <div className="sound-waves">
//                 <div className="wave"></div>
//                 <div className="wave"></div>
//                 <div className="wave"></div>
//               </div>
//             )}
//             <button
//               className={`mic-button absolute text-5xl ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
//               onClick={handleMicClick}
//               disabled={isSpeaking}
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10">
//                 <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}


//       <div className="mt-6 flex hidden justify-center">
//         <button
//           onClick={handleNext}
//           disabled={isListening || loading || isSpeaking || currentQuestionIndex === questions.length - 1}
//           className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Next
//         </button>
//       </div>


//       {/* Modal for interview end */}
//       {isModalVisible && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg max-w-sm">
//             <h2 className="text-xl font-semibold mb-4">Your interview has ended</h2>
//             <button

          
//               onClick={handleModalClose}

//               className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}

//       {isExitModalVisible && (
//   <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//     <div className="bg-white p-6 rounded-lg max-w-sm">
//       <h2 className="text-xl font-semibold mb-4">Are you sure you want to leave? Your interview will be lost.</h2>
//       <button
//         onClick={handleExitConfirmation}
//         className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none"
//       >
//         Leave
//       </button>
//       <button
//         onClick={handleExitModalClose}
//         className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none ml-2"
//       >
//         Stay
//       </button>
//     </div>
//   </div>
// )}



// {isExitModalVisible && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg max-w-sm">
//             <h2 className="text-xl font-semibold mb-4">Are you sure you want to leave? Your interview will be lost.</h2>
//             <div className="flex justify-between">
//               <button
//                 onClick={handleExitConfirmation}
//                 className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none"
//               >
//                 Leave
//               </button>
//               <button
//                 onClick={handleExitModalClose}
//                 className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none"
//               >
//                 Stay
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default QuestionForm;


import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const QuestionForm = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordedText, setRecordedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [isExitModalVisible, setIsExitModalVisible] = useState(false);

  const [micTimeout, setMicTimeout] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  const goodResponses = [
        "Great! Let's move on to the next question.",
        "Awesome! Let's continue to the next one",
        "Perfect, let's go ahead with the next question.",
        "Let's move on to the next question now and keep going strong!",
        "Wonderful! Proceeding to the next question.",
        "Let’s move forward to the next one with excitement!",
        "Next question, please—let's dive right in!",
        "Let’s go to the next one and keep the momentum going.",
        "Moving on to the next question, excited to see what's next!",
        "Let's continue with the next question and keep up the good work!",
        "Now, let’s go to the next question and stay on track!",
        "Time to proceed with the next question—let’s keep it up!",
        "Next question, let’s go, we’re doing great!",
        "Let’s keep going with the next question and stay positive!",
        "Let’s continue with the next one, things are going well!"
      ];
    
    
      
      
    
      const badResponses = [
        "Um, okay, let's move to the next question.",
        "Not quite, but let's move to the next question.",
        "Hmm, not exactly, let's continue to the next question.",
        "Well, that’s not right, but let’s go on to the next one.",
        "Close enough, let’s move on to the next question.",
        "It’s not perfect, but let’s proceed to the next one.",
        "Hmm, I see where you’re going, but let’s move to the next one.",
        "That’s not the answer we were looking for, but let’s continue.",
        "Not quite right, but let's continue to the next question.",
        "Almost, but we’ll keep going.",
        "I think we missed it, let’s move on.",
        "Hmm, not quite, but let’s keep going.",
        "That’s a bit off, but let's move to the next one.",
        "Not exactly what we needed, but let's continue.",
        "Close, but not quite there, let’s move on."
      ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      } else {
        const userFromStorage = JSON.parse(localStorage.getItem('user'));
        if (userFromStorage) {
          setUser(userFromStorage);
          setEmail(userFromStorage.email || '');
        }
      }
    }
  }, []);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const _id = localStorage.getItem('_id');
      if (_id) {
        setUserId(_id);
      }
    }
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!email || !userId) {
        console.error('Email or _id is missing');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/fetchQuestions?email=${email}&_id=${userId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch questions: ${res.statusText}`);
        }

        const data = await res.json();
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
        alert('An error occurred while fetching the questions.');
      }
    };

    if (email && userId) {
      fetchQuestions();
    }
  }, [email, userId]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognitionInstance.lang = 'en-US';
      recognitionInstance.interimResults = false;
      recognitionInstance.maxAlternatives = 1;
      recognitionInstance.continuous = true;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setRecordedText((prevText) => prevText + ' ' + transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setLoading(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        setLoading(false);
      };

      setRecognition(recognitionInstance);
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  }, [currentQuestionIndex]);

  const handleMicClick = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
        setLoading(false);
        const currentQuestion = questions[currentQuestionIndex];
        const answer = recordedText;
        setAnswers((prevAnswers) => [
          ...prevAnswers,
          { questionId: currentQuestion._id, answer: answer }
        ]);
        submitAnswer(currentQuestion._id, answer);
        handleNext();
      } else {
        recognition.start();
        setIsListening(true);
        setLoading(true);

        if (micTimeout) {
          clearTimeout(micTimeout);
          setMicTimeout(null);
        }
      }
    }
  };

  const submitAnswer = async (questionId, answer) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/saveAnswer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: userId,
          email: user?.email,
          questionId: questionId,
          answer: answer,
        }),
      });

      if (res.ok) {
        console.log('Answer submitted successfully');
      } else {
        const errorData = await res.json();
        console.error('Error saving answer:', errorData);
        alert(`Error saving data: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Network or other error:', error);
      alert('Network or other error occurred');
    }
  };

  const speakQuestion = (questionText) => {
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.lang = 'en-US';
    utterance.pitch = 1;
    utterance.rate = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);

    if (!isListening && !isAnswerSubmitted) {
      const timeout = setTimeout(() => {
        if (!isListening && !isAnswerSubmitted) {
          speakResponse("You're too late to turn on the mic.");
          handleNext();
        }
      }, 20000);

      setMicTimeout(timeout);
    }
  };

  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      const cleanedQuestionText = currentQuestion.questionText.replace(/(currentQuestion|[,*])/g, "");
      speakQuestion(cleanedQuestionText);
    }
  }, [currentQuestionIndex, questions]);

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answer = recordedText.trim();

    const questionWords = currentQuestion.questionText.split(' ').map(word => word.toLowerCase());
    const answerWords = answer.split(' ').map(word => word.toLowerCase());

    const isGoodAnswer = questionWords.some(word => answerWords.includes(word));

    const responseText = Math.random() > 0.15 
      ? goodResponses[Math.floor(Math.random() * goodResponses.length)] 
      : badResponses[Math.floor(Math.random() * badResponses.length)];

    speakResponse(responseText);

    if (answer) {
      setAnswers((prevAnswers) => [
        ...prevAnswers,
        { questionId: currentQuestion._id, answer: answer }
      ]);
    }

    if (currentQuestionIndex === questions.length - 1) {
      speakResponse("Your interview has ended.");
      setInterviewComplete(true);
      setIsModalVisible(true);
      localStorage.removeItem("_id");
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setRecordedText('');
      setIsAnswerSubmitted(false);
    }

    if (micTimeout) {
      clearTimeout(micTimeout);
      setMicTimeout(null);
    }
  };

  const speakResponse = (responseText) => {
    const utterance = new SpeechSynthesisUtterance(responseText);
    utterance.lang = 'en-US';
    utterance.pitch = 1;
    utterance.rate = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    router.push('/report');
  };

  const handleBeforeUnload = (event) => {
    if (!interviewComplete) {
      const message = "Are you sure you want to leave? Your interview will be lost.";
      event.returnValue = message;
      return message;
    }
  };

  const handleExitModalClose = () => {
    setIsExitModalVisible(false);
  };

  const handleExitConfirmation = () => {
    setIsExitModalVisible(false);
    router.push('/report');
  };

  const handlePopState = () => {
    if (!interviewComplete) {
      setIsExitModalVisible(true);
    }
  };

  useEffect(() => {
    window.history.pushState(null, document.title);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [interviewComplete]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [interviewComplete]);

  return (
    <div className="m-auto items-center justify-center min-h-screen bg-cover bg-center " style={{ backgroundImage: "url('/BG.jpg')" }}>
      {/* Main content */}
      <div className="flex justify-center">
        <img id="mainImage" src="main.gif" className="w-60 h-60 text-center" alt="Shakti AI Logo" />
      </div>
      {questions.length > 0 && (
        <div className="p-4 pb-10 rounded-lg m-auto">
          <label className="block text-xl font-semibold text-center text-white">
            {questions[currentQuestionIndex].questionText}
          </label>
          <div className="hidden input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
            <input
              type="text"
              id="textContent"
              className="bg-transparent border-none text-white focus:outline-none w-full"
              placeholder="Type Here"
              value={recordedText}
              onChange={(e) => setRecordedText(e.target.value)}
              disabled={isListening || loading || isSpeaking}
            />
          </div>
          <div className="text-center mt-10">
            {(isListening || isSpeaking) && (
              <div className="sound-waves">
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
              </div>
            )}
            <button
              className={`mic-button absolute text-5xl ${isListening || isSpeaking ? 'text-red-500' : 'text-pink-400'}`}
              onClick={handleMicClick}
              disabled={isSpeaking}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10">
                <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex hidden justify-center">
        <button
          onClick={handleNext}
          disabled={isListening || loading || isSpeaking || currentQuestionIndex === questions.length - 1}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Next
        </button>
      </div>

      {/* Modal for interview end */}
      {isModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Your interview has ended</h2>
            <button
              onClick={handleModalClose}
              className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {isExitModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Are you sure you want to leave? Your interview will be lost.</h2>
            <div className="flex justify-between">
              <button
                onClick={handleExitConfirmation}
                className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none"
              >
                Yes, Exit
              </button>
              <button
                onClick={handleExitModalClose}
                className="px-6 py-2 bg-gray-300 text-black font-semibold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none"
              >
                No, Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionForm;
