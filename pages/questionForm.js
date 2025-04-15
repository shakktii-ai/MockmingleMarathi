import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { FcSpeaker } from 'react-icons/fc';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import Head from 'next/head';

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
  const [isIphone, setIsIphone] = useState(false);

  const [micTimeout, setMicTimeout] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  const [collageName, setCollageName] = useState('');

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    } else {
      const userFromStorage = JSON.parse(localStorage.getItem('user'));
      if (userFromStorage) {
        setCollageName(userFromStorage.collageName || '');
      }
    }
  }, []);

  useEffect(() => {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setIsIphone(true);
    }
    const requestPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, sound: true });
        console.log("Microphone and sound access granted.");
      } catch (err) {
        console.error("Microphone and sound access denied:", err);
      }
    };

    requestPermissions();

    const checkStorage = () => {
      const storedNotification = localStorage.getItem("store");
      if (storedNotification) {
        console.log("setNotification(true);")
      }
    };

    checkStorage();
  }, []);

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/fetchQuestionsFormDb?email=${email}&_id=${userId}`);
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
      recognitionInstance.interimResults = true;
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

  const handleMicClick = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      try {
        recognition.stop();
        setIsListening(false);
        setLoading(true);

        setTimeout(() => {
          if (!questions.length || currentQuestionIndex >= questions.length) {
            console.error('No questions available or invalid question index');
            setLoading(false);
            return;
          }

          const currentQuestion = questions[currentQuestionIndex];
          if (!currentQuestion) {
            console.error('Current question is undefined');
            setLoading(false);
            return;
          }

          const answer = recordedText.trim();

          if (answer) {
            setAnswers((prevAnswers) => [
              ...prevAnswers,
              { questionId: currentQuestion._id, answer: answer }
            ]);
            submitAnswer(currentQuestion._id, answer);
          } else {
            speakResponse("I couldn't hear your answer. Let's try again.");
            setLoading(false);
            return;
          }

          setLoading(false);
          handleNext();
        }, 1000);
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsListening(false);
        setLoading(false);
      }
    } else {
      try {
        setRecordedText('');
        recognition.start();
        setIsListening(true);

        if (micTimeout) {
          clearTimeout(micTimeout);
          setMicTimeout(null);
        }
      } catch (error) {
        console.error('Error starting recognition:', error);
        alert('There was an error starting the speech recognition. Please try again.');
      }
    }
  }, [recognition, isListening, micTimeout, questions, currentQuestionIndex, recordedText]);

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

  const speakQuestion = useCallback((questionText) => {
    window.speechSynthesis.cancel();

    const cleanedQuestionText = questionText.replace(/(currentQuestion|[,*])/g, "").trim();

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(cleanedQuestionText);

    utterance.lang = 'en-US';
    utterance.pitch = 1;
    utterance.rate = 0.9;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.name.includes('Female') || voice.name.includes('Google') || voice.name.includes('Microsoft')
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      startMicTimeout();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      startMicTimeout();
    };

    speechSynthesis.speak(utterance);
  }, []);

  const startMicTimeout = () => {
    if (micTimeout) {
      clearTimeout(micTimeout);
      setMicTimeout(null);
    }

    const timeout = setTimeout(() => {
      if (!isListening && !isAnswerSubmitted) {
        speakResponse("You're too late to turn on the mic.");
        handleNext();
      }
    }, 20000);

    setMicTimeout(timeout);
  };

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion && currentQuestion.questionText) {
        speakQuestion(currentQuestion.questionText);
      } else {
        console.error('Question or question text is undefined');
      }
    }
  }, [currentQuestionIndex, questions, speakQuestion]);

  const handleNext = () => {
    // Safety check - make sure questions are loaded and currentQuestion exists
    if (!questions.length || currentQuestionIndex >= questions.length) {
      console.error('No questions available or invalid question index');
      return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || !currentQuestion.questionText) {
      console.error('Current question or question text is undefined');
      return;
    }
    
    const answer = recordedText.trim();

    // Process answer and question
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
      updateIsActive();
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
    updateIsActive();
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

  const updateIsActive = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/isActive?collageName=${collageName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log(data);

        const collageData = data[0];
        if (collageData) {
          let currentIsActive = collageData.isActive;
          console.log(currentIsActive);

          if (currentIsActive === null || currentIsActive === undefined) {
            console.error('Invalid isActive value:', currentIsActive);
            alert('Error: Current isActive value is invalid');
            return;
          }

          const newIsActive = currentIsActive - 1;

          const updateRes = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/isActive`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              collageName: collageName,
              isActive: newIsActive,
            }),
          });

          if (updateRes.ok) {
            console.log("Successfully updated isActive value");
          } else {
            const errorData = await updateRes.json();
            console.error('Error updating isActive:', errorData);
            alert(`Error updating isActive: ${errorData.message}`);
          }
        } else {
          console.error('Company data not found in the response');
          alert('Error: Company data not found');
        }
      } else {
        const errorData = await res.json();
        console.error('Error fetching current isActive:', errorData);
        alert(`Error fetching current isActive: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Network or other error:', error);
      alert('Error updating isActive value');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black bg-cover bg-center flex flex-col items-center justify-start pt-8" style={{ backgroundImage: "url('/BG.jpg')" }}>
      <Head>
        <title>SHAKKTII AI - Interactive Interview</title>
        <meta name="description" content="AI-powered interview platform by SHAKKTII AI" />
      </Head>

      {questions.length > 0 && (
        <div className="w-full max-w-3xl px-4 mb-6">
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-white">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
              <div
                style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500 transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center mb-8">
        <img id="mainImage" src="main.gif" className="w-60 h-60 text-center rounded-full shadow-lg" alt="Shakti AI Logo" />
      </div>

      {questions.length > 0 && (
        <div className="w-full max-w-2xl bg-gray-900 bg-opacity-70 backdrop-blur-lg p-6 rounded-xl shadow-2xl mx-4 mb-8 border border-gray-800">
          <div className="question-container mb-6">
            <h2 className="text-2xl font-bold text-center text-white mb-2">Question:</h2>
            <p className="text-xl text-center text-white px-4 py-3 rounded-lg bg-gray-800 bg-opacity-50">
              {questions[currentQuestionIndex]?.questionText || "Loading question..."}
            </p>
            {!isIphone && (
              <button
                onClick={() => questions[currentQuestionIndex]?.questionText && speakQuestion(questions[currentQuestionIndex].questionText)}
                className="mt-3 flex items-center justify-center mx-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all duration-200"
                disabled={isSpeaking}
              >
                <FcSpeaker className="mr-2 text-xl" />
                <span>Listen Again</span>
              </button>
            )}
          </div>

          <div className="recorded-text-container bg-gray-800 bg-opacity-50 rounded-lg p-4 mb-6 min-h-[100px]">
            <h3 className="text-lg font-medium text-gray-300 mb-2">Your Answer:</h3>
            <p className="text-white">{recordedText || "Your spoken answer will appear here..."}</p>
          </div>

          <div className="text-center relative">
            {(isListening || isSpeaking) && (
              <div className="sound-waves mb-4">
                <div className="wave bg-pink-500"></div>
                <div className="wave bg-indigo-500 delay-75"></div>
                <div className="wave bg-blue-500 delay-150"></div>
                <div className="wave bg-purple-500 delay-300"></div>
              </div>
            )}

            <button
              className={`mic-button relative inline-flex items-center justify-center p-4 rounded-full text-3xl ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-indigo-600 to-pink-500 hover:from-indigo-700 hover:to-pink-600'} text-white shadow-lg transform transition-all duration-300 ${isListening ? 'scale-110 animate-pulse' : ''}`}
              onClick={handleMicClick}
              disabled={isSpeaking}
            >
              {isListening ? <FaMicrophoneSlash className="w-8 h-8" /> : <FaMicrophone className="w-8 h-8" />}
              <span className="absolute -bottom-8 text-xs text-white font-medium">
                {isListening ? 'Stop Recording' : 'Start Speaking'}
              </span>
            </button>
          </div>
        </div>
      )}

      {isModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm z-50 transition-all duration-300">
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-xl max-w-md w-full border border-indigo-500 shadow-2xl transform scale-100 transition-all duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Interview Complete!</h2>
              <p className="text-gray-300">Thanks for completing your interview. Your responses have been recorded.</p>
            </div>
            <button
              onClick={handleModalClose}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-pink-600 focus:outline-none transform transition-all duration-200 hover:scale-105"
            >
              View Results
            </button>
          </div>
        </div>
      )}

      {isExitModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm z-50">
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-xl max-w-md w-full border border-red-500 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Exit Interview?</h2>
              <p className="text-gray-300">Are you sure you want to leave? Your progress will be lost and cannot be recovered.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleExitConfirmation}
                className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none transition-all duration-200"
              >
                Yes, Exit
              </button>
              <button
                onClick={handleExitModalClose}
                className="flex-1 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none transition-all duration-200"
              >
                No, Stay
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && !isListening && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
          Processing...
        </div>
      )}

      {isSpeaking && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
          AI Speaking...
        </div>
      )}
    </div>
  );
};

export default QuestionForm;