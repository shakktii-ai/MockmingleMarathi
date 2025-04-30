import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { FcSpeaker } from 'react-icons/fc';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import Head from 'next/head';

const QuestionForm = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordedText, setRecordedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isExitModalVisible, setIsExitModalVisible] = useState(false);
  const [isIphone, setIsIphone] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [micTimeout, setMicTimeout] = useState(null);
  const [silenceTimeout, setSilenceTimeout] = useState(null);
  const [answers, setAnswers] = useState([]);
  // Use a ref instead of state to avoid re-renders
  const isSpeakingRef = useRef(false);
  const questionSpokenRef = useRef(false);

  const [collageName, setCollageName] = useState('');

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    } else {
      const userFromStorage = JSON.parse(localStorage.getItem('user'));
      if (userFromStorage) {
        setCollageName(userFromStorage.collageName || '');
        setUser(userFromStorage);
        setUserEmail(userFromStorage.email || '');
      }
    }
  }, []);

  useEffect(() => {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setIsIphone(true);
    }
    
    // Request microphone permissions and test if it's working
    const requestPermissions = async () => {
      try {
        // Request microphone permission first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone access granted.");
        
        // Test if the microphone is actually working by analyzing audio levels
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Check audio levels for 2 seconds to make sure mic is really working
        let checkCount = 0;
        const checkMicInterval = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);
          // Check if there's any audio signal
          const audioDetected = dataArray.some(value => value > 20); // Threshold for audio detection
          
          if (audioDetected) {
            console.log("Microphone is working and detecting audio.");
            clearInterval(checkMicInterval);
          } else if (checkCount > 10) {
            // If no sound detected after 10 checks (about 2 seconds)
            console.warn("No audio detected from microphone. It might be muted or not working properly.");
            clearInterval(checkMicInterval);
          }
          checkCount++;
        }, 200);
        
      } catch (err) {
        console.error("Microphone access denied or not available:", err);
        alert("This application requires microphone access to function properly. Please enable microphone access and reload the page.");
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
    "Let's move forward to the next one with excitement!",
    "Next question, please, let's dive right in!",
    "Let's go to the next one and keep the momentum going.",
    "Moving on to the next question, excited to see what's next!",
    "Let's continue with the next question and keep up the good work!",
    "Now, let's go to the next question and stay on track!",
    "Time to proceed with the next question, let's keep it up!",
    "Next question, let's go, we're doing great!",
    "Let's keep going with the next question and stay positive!",
    "Let's continue with the next one, things are going well!"
  ];

  const badResponses = [
    "Um, okay, let's move to the next question.",
    "Not quite, but let's move to the next question.",
    "Hmm, not exactly, let's continue to the next question.",
    "Well, that's not right, but let's go on to the next one.",
    "Close enough, let's move on to the next question.",
    "It's not perfect, but let's proceed to the next one.",
    "Hmm, I see where you're going, but let's move to the next one.",
    "That's not the answer we were looking for, but let's continue.",
    "Not quite right, but let's continue to the next question.",
    "Almost, but we'll keep going.",
    "I think we missed it, let's move on.",
    "Hmm, not quite, but let's keep going.",
    "That's a bit off, but let's move to the next one.",
    "Not exactly what we needed, but let's continue.",
    "Close, but not quite there, let's move on."
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
        setLoading(true); // Show loading state while fetching
        const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/fetchQuestionsFormDb?email=${email}&_id=${userId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch questions: ${res.statusText}`);
        }

        const data = await res.json();
        // Check if data is valid and has questions
        if (Array.isArray(data) && data.length > 0) {
          console.log(`Successfully fetched ${data.length} questions`);
          setQuestions(data);
          // Always start with the first question (index 0)
          console.log('Starting with question index: 0');
          setCurrentQuestionIndex(0);
        } else {
          console.error('No questions were returned from the API');
          alert('No questions were found. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        alert('An error occurred while fetching the questions.');
      } finally {
        setLoading(false);
      }
    };

    if (email && userId) {
      fetchQuestions();
    }
  }, [email, userId]);

  // Set up speech recognition with a simple, reliable approach
  useEffect(() => {
    // Initialize speech recognition setup with proper reset handling
    const setupSpeechRecognition = () => {
      if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
        alert('Speech recognition is not supported in this browser.');
        return null;
      }
      
      // Create a new SpeechRecognition instance
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      // Configure recognition
      recognitionInstance.lang = 'en-US';
      recognitionInstance.continuous = true; // Keep listening continuously
      recognitionInstance.interimResults = true; // Get partial results
      
      // Reset state when recognition starts
      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
        setRecordedText(''); // Reset recorded text
        setIsListening(true);
      };
      
      // Handle speech results
      recognitionInstance.onresult = (event) => {
        if (event.results && event.results.length > 0) {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          
          // Clean the transcript
          const cleanText = transcript
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
          
          setRecordedText(cleanText);
        }
      };
      
      // Handle end of recognition
      recognitionInstance.onend = () => {
        console.log('Speech recognition service disconnected');
        setIsListening(false);
        
        // Reset state for next question
        if (!isAnswerSubmitted) {
          // If answer wasn't submitted, reset recognition
          setIsListening(false);
          setRecordedText('');
        }
      };
      
      // Handle errors
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
        
        // Reset recognition on error
        if (event.error === 'no-speech') {
          console.log('No speech detected, waiting for speech...');
          return;
        }
        
        // Try to restart recognition after a short delay
        setTimeout(() => {
          try {
            recognitionInstance.start();
          } catch (e) {
            console.error('Failed to restart recognition:', e);
          }
        }, 500);
      };
      
      return recognitionInstance;
    };
    
    // Clean up any existing instance
    if (recognition) {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.onstart = null;
        recognition.stop();
        recognition.abort();
      } catch (e) {
        console.error('Error cleaning up recognition:', e);
      }
    }
    
    // Create new recognition instance
    const newRecognition = setupSpeechRecognition();
    setRecognition(newRecognition);
    
    return () => {
      // Clean up on unmount
      if (recognition) {
        try {
          recognition.onresult = null;
          recognition.onerror = null;
          recognition.onend = null;
          recognition.onstart = null;
          recognition.stop();
          recognition.abort();
        } catch (e) {
          console.error('Error cleaning up recognition on unmount:', e);
        }
      }
    };
  }, [isAnswerSubmitted]);

  // Helper function to speak a feedback response before moving on
  const speakFeedbackAndMoveOn = () => {
    // Choose a response randomly (70% good responses, 30% bad responses)
    const useGoodResponse = Math.random() < 0.7;
    const responses = useGoodResponse ? goodResponses : badResponses;
    const feedbackText = responses[Math.floor(Math.random() * responses.length)];
    
    // Clean up any special characters that might cause issues with speech
    const cleanFeedback = feedbackText.replace(/[\u2014\u2013\u201C\u201D\u2018\u2019`*()\[\]{}|\\^<>]/g, '');
    
    console.log('🗣️ SPEAKING FEEDBACK:', cleanFeedback);
    
    // Speak the feedback with the female voice
    speakResponse(cleanFeedback, () => {
      // After speaking is complete, move to the next question
      handleNext();
    });
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

  const handleMicClick = useCallback(() => {
    // Handle speech recognition start/stop
    if (!recognition) {
      alert('Speech recognition not available');
      return;
    }

    if (isListening) {
      // STOP RECORDING
      console.log('Stopping speech recognition');
      setIsListening(false);
      setLoading(true);
      
      try {
        recognition.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }

      // Process the recorded answer
      if (recordedText.trim()) {
        // Store the answer
        const currentAnswers = [...answers];
        currentAnswers[currentQuestionIndex] = recordedText;
        setAnswers(currentAnswers);
        
        // Submit the answer to the server
        if (questions[currentQuestionIndex] && questions[currentQuestionIndex]._id) {
          submitAnswer(questions[currentQuestionIndex]._id, recordedText);
        } else {
          console.error('Question ID not found for submission');
        }
        
        // Reset recorded text
        setRecordedText('');
        
        // Mark answer as submitted
        setIsAnswerSubmitted(true);
        
        // Speak feedback and move to next question
        speakFeedbackAndMoveOn();
      } else {
        // Handle case where mic was stopped without speaking
        const noAnswerText = "No answer provided - user stopped mic";
        submitAnswer(questions[currentQuestionIndex]._id, noAnswerText);
        setLoading(false);
        
        // Move to next question
        if (currentQuestionIndex >= questions.length - 1) {
          console.log('This was the last question - showing completion modal');
          setIsModalVisible(true);
        } else {
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
          setRecordedText('');
          setIsAnswerSubmitted(false);
        }
      }
    } else {
      // START RECORDING
      console.log('Starting speech recognition');
      
      // CRITICAL: Clear the question timer when mic is activated
      // This prevents "Time's up" from interrupting while speaking
      if (questionTimerRef.current) {
        console.log('🎤 STOPPING TIMER when microphone activated');
        clearTimeout(questionTimerRef.current);
        questionTimerRef.current = null;
      }
      
      // Check if questions are available
      if (!questions.length) {
        alert('No questions loaded');
        return;
      }
      
      // Clear previous text
      setRecordedText('Listening...');
      setIsListening(true);
      
      // Set a timeout for speech recognition if user turns on mic but doesn't speak (Scenario 3)
      const silenceTimeout = setTimeout(() => {
        if (isListening && (recordedText === 'Listening...' || !recordedText.trim())) {
          console.log('SCENARIO 3: No speech detected after turning on mic - stopping and moving to next question');
          
          // First stop the recognition
          try {
            recognition.stop();
          } catch (e) {
            console.error('Error stopping recognition:', e);
          }
          
          setIsListening(false);
          setLoading(true);
          
          // Create a message about the timeout
          const noSpeechMessage = "I didn't hear any speech after you turned on the microphone. Moving to the next question.";
          speakResponse(noSpeechMessage);
          
          // Save this as the answer and move to next question
          setTimeout(() => {
            if (questions.length > 0 && currentQuestionIndex < questions.length) {
              const currentQuestion = questions[currentQuestionIndex];
              
              if (currentQuestion && currentQuestion._id) {
                // Store the answer
                const noAnswerText = "No answer provided - no speech detected";
                submitAnswer(currentQuestion._id, noAnswerText);
              }
              
              setLoading(false);
              
              // Check if this is the last question
              if (currentQuestionIndex >= questions.length - 1) {
                console.log('This was the last question - showing completion modal');
                setIsModalVisible(true);
              } else {
                setCurrentQuestionIndex(prevIndex => prevIndex + 1);
                setRecordedText('');
                setIsAnswerSubmitted(false);
              }
            } else {
              console.error('No valid questions to process in silence timeout');
              setLoading(false);
            }
          }, 3000);
        }
      }, 15000); // 15 seconds of silence after turning on mic
      
      // Store the silence timeout ID
      setSilenceTimeout(silenceTimeout);
      
      // Verify microphone access
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          // Start recognition after confirming mic access
          try {
            recognition.start();
            console.log('Speech recognition started');
          } catch (e) {
            console.error('Error starting recognition:', e);
            setIsListening(false);
            setRecordedText('');
            alert('Error starting speech recognition. Please try again.');
          }
        })
        .catch(err => {
          console.error('Microphone access denied:', err);
          setIsListening(false);
          setRecordedText('');
          alert('Microphone access is required for speech recognition.');
        });
    }
  }, [recognition, isListening, questions, currentQuestionIndex, recordedText, speakFeedbackAndMoveOn]);

  /**
   * Speech Synthesis System
   * A centralized module for handling all speech synthesis in the application
   */
  
  // Central speech utility that handles all speech with improved reliability
  const speechManager = {
    // Speech queue to prevent interruptions
    queue: [],
    speaking: false,
    
    // Initialize the speech service
    init() {
      // Pre-load voices for better selection
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
    },
    
    // Get the best available voice
    getBestVoice() {
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find a high-quality female voice first
      const preferredVoice = voices.find(voice => 
        (voice.name.includes('Female') && voice.name.includes('Google')) ||
        voice.name.includes('Microsoft Zira') ||
        voice.name.includes('Samantha')
      );
      
      if (preferredVoice) return preferredVoice;
      
      // Fall back to any female voice
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('woman') ||
        voice.name.includes('Girl')
      );
      
      if (femaleVoice) return femaleVoice;
      
      // Use the default voice if no preference found
      return voices[0];
    },
    
    // Speak a question with appropriate parameters
    speakQuestion(text, onComplete) {
      const cleanText = text.replace(/(currentQuestion|[,*])/g, "").trim();
      this.speak(cleanText, {
        rate: 0.9,
        pitch: 1.0,
        onComplete: onComplete,
        priority: 'high'
      });
    },
    
    // Speak a response with appropriate parameters
    speakResponse(text, onComplete) {
      this.speak(text, {
        rate: 1.0,
        pitch: 1.0,
        onComplete: onComplete,
        priority: 'medium'
      });
    },
    
    // Main speech function with advanced options
    speak(text, options = {}) {
      if (!text) return;
      
      // Default options
      const settings = {
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        lang: 'en-US',
        onComplete: null,
        onError: null,
        priority: 'medium', // 'high', 'medium', 'low'
        ...options
      };
      
      // Don't queue if already speaking and this is low priority
      if (this.speaking && settings.priority === 'low') {
        console.log('Already speaking, skipping low priority speech');
        return;
      }
      
      // Cancel all speech if this is high priority
      if (settings.priority === 'high') {
        try {
          window.speechSynthesis.cancel();
          this.queue = [];
          this.speaking = false;
        } catch (e) {}
      }
      
      // Set speaking indicators
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      this.speaking = true;
      
      try {
        // Create utterance with all settings
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = settings.volume;
        utterance.lang = settings.lang;
        
        // Try to set a good voice
        const voice = this.getBestVoice();
        if (voice) {
          utterance.voice = voice;
        }
        
        // Completion handler
        utterance.onend = () => {
          this.speaking = false;
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          
          if (typeof settings.onComplete === 'function') {
            settings.onComplete();
          }
        };
        
        // Error handler
        utterance.onerror = (err) => {
          console.error('Speech synthesis error:', err);
          this.speaking = false;
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          
          if (typeof settings.onError === 'function') {
            settings.onError(err);
          } else if (typeof settings.onComplete === 'function') {
            // Fall back to completion handler if error handler not provided
            settings.onComplete();
          }
        };
        
        // Actually speak the text
        window.speechSynthesis.speak(utterance);
        
        // Failsafe - if speech doesn't complete in 10 seconds, force reset
        setTimeout(() => {
          if (this.speaking) {
            console.log('Speech timeout reached, forcing completion');
            this.speaking = false;
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            
            if (typeof settings.onComplete === 'function') {
              settings.onComplete();
            }
          }
        }, 10000);
        
      } catch (e) {
        console.error('Error in speech synthesis:', e);
        this.speaking = false;
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        
        if (typeof settings.onError === 'function') {
          settings.onError(e);
        } else if (typeof settings.onComplete === 'function') {
          settings.onComplete();
        }
      }
    }
  };
  
  // Initialize speech manager
  useEffect(() => {
    speechManager.init();
  }, []);
  
  // Simplified speak functions that use the manager
  const speakResponse = (text, onComplete) => {
    // Use the speech manager
    if (!text) return;
    
    // Clean the text of any special characters including programming symbols
    const cleanText = text.replace(/[\u2014\u2013\u201C\u201D\u2018\u2019`*()\[\]{}|\\^<>]/g, '');
    
    // Create the utterance directly for better voice control
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.volume = 1.0;
      
      // Set female voice if available
      const femaleVoice = getFemaleVoice();
      if (femaleVoice) utterance.voice = femaleVoice;
      
      // Set completion callback
      if (onComplete) {
        utterance.onend = onComplete;
      }
      
      // Speak
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Error speaking response:', e);
      if (onComplete) onComplete();
    }
  };
  
  const speakQuestionText = (text, onComplete) => {
    speechManager.speakQuestion(text, onComplete);
  };

  // ======== DIRECT TIMER SYSTEM ========
  // This is a completely new timer implementation with no dependencies on other code
  // Global question timer
  const questionTimerRef = useRef(null);

  // EXTREMELY SIMPLIFIED TIMER SYSTEM
  // This system only cares about:
  // 1. When a question is spoken → Start 20-second timer
  // 2. If mic is turned on → Cancel timer
  // 3. If timer expires → Go to next question
  
  // Direct timer function with no state checks
  const startQuestionTimer = () => {
    console.log('⏱️ STARTING 20-SECOND TIMER for question', currentQuestionIndex + 1);
    
    // Always clear any existing timer first
    if (questionTimerRef.current) {
      clearTimeout(questionTimerRef.current);
      questionTimerRef.current = null;
    }
    
    // Set a pure timeout that will execute after 20 seconds
    const timerId = setTimeout(() => {
      // When timer finishes, log the state
      console.log('⏱️ 20-SECOND TIMER EXPIRED for question', currentQuestionIndex + 1);
      console.log('⏱️ Current state: isListening =', isListening);
      
      // ONLY check if mic is active - that's all that matters
      if (!isListening) {
        console.log('⏱️ AUTO-PROGRESSING: Timer expired');
        
        // Force update UI state
        setIsAnswerSubmitted(true);
        setRecordedText('No answer provided - timed out');
        
        // Stop any ongoing listening
        if (isListening && recognition) {
          try {
            recognition.stop();
            setIsListening(false);
          } catch (e) {}
        }
        
        // Save the timeout answer
        if (questions.length > 0 && currentQuestionIndex < questions.length) {
          const currentQuestion = questions[currentQuestionIndex];
          if (currentQuestion && currentQuestion._id) {
            submitAnswer(currentQuestion._id, "No answer provided - timed out");
          }
        }
        
        // Cancel any previous speech before announcing
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
        
        // Announce timeout with proper speech handling
        try {
          // First, cancel any previous speech
          forceStopAllSpeech();
          
          // Choose from a variety of timeout messages
          const timeoutMessages = [
            "Time's up. Let's move to the next question.",
            "We've run out of time. Moving to the next question.",
            "Let's continue to the next question since time is up.",
            "Time's up for this question. Let's proceed to the next one."
          ];
          
          const timeoutMessage = timeoutMessages[Math.floor(Math.random() * timeoutMessages.length)];
          console.log('⏱️ SPEAKING TIMEOUT MESSAGE:', timeoutMessage);
          
          const utterance = new SpeechSynthesisUtterance(timeoutMessage);
          utterance.lang = 'en-US';
          utterance.volume = 1.0;
          
          // Set female voice if available
          const femaleVoice = getFemaleVoice();
          if (femaleVoice) utterance.voice = femaleVoice;
          
          // Add unique ID to track this specific utterance
          utterance.timeoutId = Date.now().toString();
          
          utterance.onend = () => {
            console.log('⏱️ TIMEOUT SPEECH COMPLETED');
            // Move to next question after speech ends
            moveToNextQuestion();
          };
          
          utterance.onerror = () => {
            console.log('⏱️ TIMEOUT SPEECH ERROR');
            // Move to next question even if speech fails
            moveToNextQuestion();
          };
          
          // Start speaking with a small delay to ensure cancellation is complete
          setTimeout(() => {
            window.speechSynthesis.speak(utterance);
          }, 100);
          
          // Failsafe: If speech doesn't trigger callbacks, still move on
          setTimeout(moveToNextQuestion, 3000);
        } catch (e) {
          // If speech fails completely, just move on
          console.error('⏱️ CANNOT SPEAK TIMEOUT MESSAGE:', e);
          moveToNextQuestion();
        }
      } else {
        console.log('⏱️ NOT AUTO-PROGRESSING: User has activated mic');
      }
    }, 20000); // 20 seconds
    
    // Store the timer ID in a ref so it persists across renders
    questionTimerRef.current = timerId;
    return timerId;
  }
  
  // SIMPLIFIED function to move to next question
  const moveToNextQuestion = () => {
    console.log('⏱️ MOVING TO NEXT QUESTION from', currentQuestionIndex);
    
    // Stop any ongoing speech before changing questions
    forceStopAllSpeech();
    
    // Clear any existing timer
    if (questionTimerRef.current) {
      clearTimeout(questionTimerRef.current);
      questionTimerRef.current = null;
    }
    
    // Stop any ongoing listening
    if (isListening) {
      try {
        if (recognition) {
          recognition.stop();
        }
        setIsListening(false);
      } catch (e) {}
    }
    
    if (currentQuestionIndex >= questions.length - 1) {
      // This was the last question
      setIsModalVisible(true);
    } else {
      // Simply move to the next question
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
    }
  };
  


  // ======== QUESTION CHANGE HANDLER ========
  // Handles both initial load and subsequent question changes
  // SIMPLIFIED question change handler - pure focus on mic and timer
  useEffect(() => {
    console.log('🔄 QUESTION INDEX CHANGED TO', currentQuestionIndex);
    
    // ===== COMPLETE RESET =====
    // Reset all timers
    if (questionTimerRef.current) {
      clearTimeout(questionTimerRef.current);
      questionTimerRef.current = null;
    }
    
    if (micTimeout) {
      clearTimeout(micTimeout);
      setMicTimeout(null);
    }
    
    if (silenceTimeout) {
      clearTimeout(silenceTimeout);
      setSilenceTimeout(null);
    }
    
    // Reset all speech
    forceStopAllSpeech();
    
    // Reset all listening
    if (isListening) {
      try {
        if (recognition) {
          recognition.stop();
        }
        setIsListening(false);
      } catch (e) {}
    }
    
    // Reset all state
    setIsAnswerSubmitted(false);
    const resetTimerId = setTimeout(() => {
      if (isAnswerSubmitted) {
        console.log('🔄 SECONDARY RESET of isAnswerSubmitted for question', currentQuestionIndex + 1);
        setIsAnswerSubmitted(false);
      }
    }, 100);
    
    // Stop any ongoing listening
    if (isListening) {
      try {
        if (recognition) {
          recognition.stop();
        }
        setIsListening(false);
      } catch (e) {}
    }
    
    // Only process if we have questions
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      
      if (currentQuestion && currentQuestion.questionText) {
        console.log(`🔄 LOADING QUESTION ${currentQuestionIndex + 1}:`, 
                    currentQuestion.questionText.substring(0, 30) + '...');
        
        // Reset all state related to this question
        setRecordedText('');
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        
        // Stop any recognition
        try {
          if (isListening && recognition) {
            recognition.stop();
            setIsListening(false);
          }
        } catch (e) {}
        
        // Clear all timers
        if (questionTimerRef.current) {
          clearTimeout(questionTimerRef.current);
          questionTimerRef.current = null;
        }
        
        // Store the question text locally to prevent state changes affecting it
        const questionText = currentQuestion.questionText;
        console.log('🗣️ WILL SPEAK QUESTION SOON:', questionText.substring(0, 30) + '...');
        
        // Wait for a short time to let previous cleanup complete
        setTimeout(() => {
          try {
            // Final check before speaking
            if (isAnswerSubmitted) {
              console.log('🔄 FINAL RESET of isAnswerSubmitted before speaking');
              setIsAnswerSubmitted(false);
            }
            
            // Force stop any previous speech
            try {
              window.speechSynthesis.cancel();
            } catch (e) {
              console.error('Error canceling speech:', e);
            }
            
            // Speak the CURRENT question with the stored questionText
            if (currentQuestionIndex === questions.indexOf(currentQuestion)) {
              console.log('🗣️ DEFINITELY SPEAKING QUESTION', currentQuestionIndex + 1);
              // Try primary speech system
              try {
                speakQuestion(questionText);
              } catch (e) {
                console.error('PRIMARY SPEECH FAILED:', e);
                // If that fails, try the emergency direct speech
                speakDirectly(questionText);
              }
            } else {
              console.log('🔄 NOT SPEAKING - QUESTION INDEX CHANGED');
              // Question index changed while we were waiting, do nothing
            }
          } catch (e) {
            console.error('CRITICAL ERROR SPEAKING QUESTION:', e);
            // If speech fails, at least start the timer
            startTimerDirectly();
          }
        }, 500);
      }
    }
  }, [questions, currentQuestionIndex]);
  
  // ======== QUESTION SPEAKING HANDLER ========
  // COMPLETELY REBUILT SPEECH SYSTEM to prevent repetition
  // This system ensures proper speech queue management and prevents duplicate speech
  const speechQueue = useRef([]);
  const currentlySpeakingText = useRef('');

  // Simple function to get female voice
  const getFemaleVoice = () => {
    try {
      const voices = window.speechSynthesis.getVoices();
      let femaleVoice = null;
      
      // Try to find a female voice in this order
      // 1. English US female voice
      femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') && v.lang.includes('en-US'));
      
      // 2. Any female voice
      if (!femaleVoice) femaleVoice = voices.find(v => v.name.toLowerCase().includes('female'));
      
      // 3. Microsoft Zira (known female voice)
      if (!femaleVoice) femaleVoice = voices.find(v => v.name.includes('Zira'));
      
      // 4. Common female voice names
      if (!femaleVoice) {
        const femaleNames = ['samantha', 'karen', 'lisa', 'amy', 'victoria'];
        for (const name of femaleNames) {
          const match = voices.find(v => v.name.toLowerCase().includes(name));
          if (match) {
            femaleVoice = match;
            break;
          }
        }
      }
      
      if (femaleVoice) {
        console.log('🔈 Using female voice:', femaleVoice.name);
      }
      
      return femaleVoice;
    } catch (e) {
      console.error('Error getting voices:', e);
      return null;
    }
  };

  // SIMPLIFIED DIRECT SPEECH FUNCTION - completely reliable
  const speakDirectly = (text) => {
    // Clean the text of any special characters including programming symbols
    const cleanText = text.replace(/[\u2014\u2013\u201C\u201D\u2018\u2019`*()\[\]{}|\\^<>]/g, '');
    
    // Basic fallback speech - directly use the Web Speech API with minimal processing
    console.log('🔊 EMERGENCY DIRECT SPEECH:', cleanText.substring(0, 30) + '...');
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create a simple utterance
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.volume = 1.0;
      
      // Set female voice if available
      const femaleVoice = getFemaleVoice();
      if (femaleVoice) utterance.voice = femaleVoice;
      
      // Speak immediately
      window.speechSynthesis.speak(utterance);
      
      // Start timer after a fixed delay
      setTimeout(() => {
        startTimerDirectly();
      }, 5000);
      
      return true;
    } catch (e) {
      console.error('🔊 EMERGENCY SPEECH FAILED:', e);
      return false;
    }
  };

  // Main function to speak the current question with guaranteed execution
  const speakQuestion = (questionText) => {
    console.log(`🗣️ PREPARING TO SPEAK QUESTION ${currentQuestionIndex + 1}`);
    
    // First, completely clear any speech
    forceStopAllSpeech();
    
    // Always clear any existing timers before speaking
    if (questionTimerRef.current) {
      clearTimeout(questionTimerRef.current);
      questionTimerRef.current = null;
    }
    
    // Enhanced cleaning for question text
    let cleanedText = "";
    if (questionText) {
      // First remove code-specific characters and patterns
      cleanedText = questionText
        .replace(/\`\`\`[\s\S]*?\`\`\`/g, '') // Remove code blocks
        .replace(/\`[^\`]*\`/g, '') // Remove inline code
        .replace(/\*\*|__|\*|_|\~/g, '') // Remove markdown formatting
        .replace(/[\u2014\u2013\u201C\u201D\u2018\u2019`*()\[\]{}|\\^<>]/g, '') // Remove special chars
        .replace(/(currentQuestion)/g, '') // Remove specific words
        .trim();
    }
    if (!cleanedText) {
      console.error('🗣️ EMPTY QUESTION TEXT - SKIPPING SPEECH');
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      startQuestionTimer();
      return;
    }
    
    // Mark as speaking
    setIsSpeaking(true);
    isSpeakingRef.current = true;
    
    // Store the current question text to prevent repeats
    currentlySpeakingText.current = cleanedText;
    
    // Always reset isAnswerSubmitted when speaking a question
    if (isAnswerSubmitted) {
      setIsAnswerSubmitted(false);
    }
    
    try {
      console.log(`🗣️ SPEAKING QUESTION ${currentQuestionIndex + 1}:`, cleanedText.substring(0, 50) + '...');
      
      // Create the utterance
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.volume = 1.0;
      
      // Set female voice if available
      const femaleVoice = getFemaleVoice();
      if (femaleVoice) utterance.voice = femaleVoice;
      
      // Store unique ID to prevent duplicate callbacks
      const speechId = Date.now().toString();
      utterance.speechId = speechId;
      
      // When speech ends, start the timer
      utterance.onend = () => {
        // Verify this is still the current speech
        if (utterance.speechId !== speechId) {
          console.log('🗣️ Ignoring speech end event for old utterance');
          return;
        }
        
        console.log('🗣️ FINISHED SPEAKING QUESTION, STARTING TIMER');
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        currentlySpeakingText.current = '';
        
        // Double-check isAnswerSubmitted is false before starting timer
        if (isAnswerSubmitted) {
          console.log('🗣️ FORCE RESETTING isAnswerSubmitted before starting timer');
          setIsAnswerSubmitted(false);
        }
        
        // Start the timer AFTER speech completes
        startQuestionTimer();
      };
      
      // If speech fails, still start the timer
      utterance.onerror = (e) => {
        console.log('🗣️ SPEECH ERROR, STARTING TIMER ANYWAY', e);
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        currentlySpeakingText.current = '';
        startQuestionTimer();
      };
      
      // Speak with a 50ms delay to ensure the speech queue is properly cleared
      setTimeout(() => {
        // Before speaking, cancel any previous speech one more time
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
        
        // Start speaking
        window.speechSynthesis.speak(utterance);
        
        // FAILSAFE: If speech doesn't trigger callbacks, force start the timer
        setTimeout(() => {
          if (isSpeakingRef.current && currentlySpeakingText.current === cleanedText) {
            console.log('🗣️ SPEECH TIMEOUT, FORCING TIMER START');
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            currentlySpeakingText.current = '';
            startQuestionTimer();
          }
        }, 8000);
      }, 150);
    } catch (e) {
      // If the main speech system fails, try the emergency direct speech
      console.error('🗣️ MAIN SPEECH SYSTEM ERROR:', e);
      
      // Try emergency direct speech
      if (speakDirectly(cleanedText)) {
        console.log('🗣️ EMERGENCY SPEECH ACTIVATED');
      } else {
        // If even that fails, just start the timer
        console.error('🗣️ ALL SPEECH SYSTEMS FAILED');
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        currentlySpeakingText.current = '';
        startQuestionTimer();
      }
    }
  };
  
  // Initialize voice list on component mount
  useEffect(() => {
    // Load voices
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          console.log('🔈 Loaded', voices.length, 'voices');
          const femaleVoice = getFemaleVoice();
          if (femaleVoice) {
            console.log('🔈 Selected female voice:', femaleVoice.name);
          }
        }
      };
      
      // Try loading voices immediately
      loadVoices();
      
      // Set up event for when voices change
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);
  
  // Fully stop all speech and clear all queues
  const forceStopAllSpeech = () => {
    // Cancel ongoing speech synthesis
    try {
      console.log('🛑 FORCEFULLY STOPPING ALL SPEECH');
      window.speechSynthesis.cancel();
      speechQueue.current = [];
      currentlySpeakingText.current = '';
    } catch (e) {
      console.error('Error stopping speech:', e);
    }
    
    // Reset speaking state
    setIsSpeaking(false);
    isSpeakingRef.current = false;
  };

  // SIMPLIFIED version - focused only on moving to next question
  const handleNext = () => {
    console.log('⏭️ HANDLING NEXT QUESTION');
    
    // Reset ALL state - simple and direct
    if (questionTimerRef.current) {
      clearTimeout(questionTimerRef.current);
      questionTimerRef.current = null;
    }
    
    if (micTimeout) {
      clearTimeout(micTimeout);
      setMicTimeout(null);
    }
    
    if (silenceTimeout) {
      clearTimeout(silenceTimeout);
      setSilenceTimeout(null);
    }
    
    // Stop ANY speech
    forceStopAllSpeech();
    
    // Stop ANY listening
    if (isListening && recognition) {
      try {
        recognition.stop();
        setIsListening(false);
      } catch (e) {
        console.error('Error stopping recognition in handleNext:', e);
      }
    }
    
    // Clean up state
    setRecordedText('');
    
    // IMPORTANT: Mark answer as submitted to prevent duplicate actions
    setIsAnswerSubmitted(true);
    
    // Check if this is the last question
    if (currentQuestionIndex >= questions.length - 1) {
      setIsModalVisible(true);
      speakResponse("Your interview has ended. Thank you for your participation.");
      setInterviewComplete(true);
      localStorage.removeItem("_id");
      updateIsActive();
    } else {
      // Simply move to next question
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
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

  // Function to handle when user confirms exiting the interview
  // This will also count it as a completed interview
  const handleExitConfirmation = async () => {
    setIsExitModalVisible(false);
    
    try {
      // First, initialize the interview fields if they don't exist
      const initResponse = await fetch(`${process.env.NEXT_PUBLIC_HOST || ''}/api/initializeInterviewFields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
        }),
      });

      if (!initResponse.ok) {
        console.error('Failed to initialize interview fields');
      } else {
        const data = await initResponse.json();
        console.log('Interview fields initialized:', data.message);
      }

      // Mark the interview as completed even though user exited early
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST || ''}/api/updateInterviewCount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          action: 'complete',
        }),
      });

      if (!response.ok) {
        console.error('Failed to update interview completion count');
      } else {
        const data = await response.json();
        console.log('Interview marked as completed even though exited early');
        
        // Update the user data in localStorage with the updated counts
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          no_of_interviews: data.no_of_interviews,
          no_of_interviews_completed: data.no_of_interviews_completed
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error handling exit confirmation:', error);
    }
    
    // Continue with navigation and updating active status
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

  // Function to update the interview completion count when an interview is finished
  const handleInterviewComplete = async () => {
    try {
      // First, initialize the interview fields if they don't exist
      const initResponse = await fetch(`${process.env.NEXT_PUBLIC_HOST || ''}/api/initializeInterviewFields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
        }),
      });

      if (!initResponse.ok) {
        console.error('Failed to initialize interview fields');
      } else {
        const data = await initResponse.json();
        console.log('Interview fields initialized:', data.message);
      }

      // Now update the interview completion count
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST || ''}/api/updateInterviewCount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          action: 'complete',
        }),
      });

      if (!response.ok) {
        console.error('Failed to update interview completion count');
      } else {
        const data = await response.json();
        console.log('Interview completion count updated successfully');
        
        // Update the user data in localStorage with the updated counts
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          no_of_interviews: data.no_of_interviews,
          no_of_interviews_completed: data.no_of_interviews_completed
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Navigate to the report page
      router.push('/oldreport');
    } catch (error) {
      console.error('Error updating interview completion count:', error);
      // Still navigate to the report page even if there's an error
      router.push('/oldreport');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black bg-cover bg-center flex flex-col items-center justify-start pt-8" style={{ backgroundImage: "url('/BG.jpg')" }}>
      <Head>
        <title>SHAKKTII AI - Interactive Interview</title>
        <meta name="description" content="AI-powered interview platform by SHAKKTII AI" />
      </Head>

      {questions.length > 0 ? (
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
      ) : loading ? (
        <div className="w-full max-w-3xl px-4 mb-6 text-center">
          <div className="animate-pulse flex space-x-4 justify-center">
            <div className="h-3 bg-gray-400 rounded w-3/4"></div>
          </div>
          <p className="text-white mt-2">Loading questions...</p>
        </div>
      ) : (
        <div className="w-full max-w-3xl px-4 mb-6 text-center">
          <div className="bg-red-600 bg-opacity-70 text-white py-2 px-4 rounded-lg">
            <p>No questions available. Please try refreshing the page or contact support.</p>
          </div>
        </div>
      )}

      <div className="flex justify-center mb-8">
        <img id="mainImage" src="mock.png" className="w-60 h-60 text-center rounded-full shadow-lg" alt="Shakti AI Logo" />
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

          <div className="hidden recorded-text-container bg-gray-800 bg-opacity-50 rounded-lg p-4 mb-6 min-h-[100px]">
            <h3 className="text-lg font-medium text-gray-300 mb-2">Your Answer:</h3>
            <p className=" text-white">
              {recordedText && recordedText !== 'Listening...' ? (
                recordedText
              ) : (
                isListening ? (
                  <span className="animate-pulse text-blue-400">Listening...</span>
                ) : (
                  "Your spoken answer will appear here..."
                )
              )}
            </p>
            {isListening && (
              <div className="mt-2 text-xs text-blue-300">
                Speak clearly into your microphone...
              </div>
            )}
          </div>

          <div className="text-center relative">
            {isListening && (
              <div className="sound-waves mb-4">
                <div className="wave bg-pink-500"></div>
                <div className="wave bg-indigo-500 delay-75"></div>
                <div className="wave bg-blue-500 delay-150"></div>
                <div className="wave bg-purple-500 delay-300"></div>
              </div>
            )}
            
            {isSpeaking && (
              <div className="text-center mb-4">
                <div className="inline-block px-3 py-1 bg-green-600 text-white text-sm rounded-full animate-pulse">
                  AI Speaking...
                </div>
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
              onClick={handleInterviewComplete}
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