import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Import icons with no SSR to avoid window is not defined errors
const FcSpeaker = dynamic(() => import('react-icons/fc').then(mod => mod.FcSpeaker), { ssr: false });
const FaMicrophone = dynamic(() => import('react-icons/fa').then(mod => mod.FaMicrophone), { ssr: false });
const FaMicrophoneSlash = dynamic(() => import('react-icons/fa').then(mod => mod.FaMicrophoneSlash), { ssr: false });

// Add a check for window object
const isBrowser = typeof window !== 'undefined';

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
  const [micPermission, setMicPermission] = useState(null); // 'granted', 'denied', or null
  const [micWorking, setMicWorking] = useState(null); // true, false, or null
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [collageName, setCollageName] = useState('');
  const [voice, setVoice] = useState(null);
  
  // Refs
  const isSpeakingRef = useRef(false);
  const questionSpokenRef = useRef(false);
  const questionTimerRef = useRef(null);
  
  useEffect(() => {
    // Disable all speech synthesis globally - runs only on client side
    if (typeof window !== 'undefined') {
      // Only block speech synthesis if not on mobile
      if (!/Mobi|Android/i.test(navigator.userAgent)) {
        window.speechSynthesis.speak = function () {
          console.warn('[Speech Blocked] Speech synthesis call skipped.');
        };
      }
      
      // Add event listener for page visibility changes (important for mobile)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && isListening) {
          // If we come back to the tab and were listening, restart recognition
          setTimeout(() => {
            if (recognition && isListening) {
              try {
                recognition.stop();
                setTimeout(() => recognition.start(), 100);
              } catch (e) {
                console.error('Error restarting recognition after visibility change:', e);
              }
            }
          }, 1000);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [isListening, recognition]);

  // Function to handle microphone permission request
  const requestMicPermission = async () => {
    try {
      // First, stop any existing stream
      if (window.microphoneStream) {
        window.microphoneStream.getTracks().forEach(track => track.stop());
        window.microphoneStream = null;
      }
      
      // Try to get microphone access with specific constraints for mobile
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
        // Mobile-specific constraints
        video: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Store the stream globally for later use
      window.microphoneStream = stream;
      
      // Handle track ended events (important for mobile)
      stream.getAudioTracks().forEach(track => {
        track.onended = () => {
          console.log('Microphone track ended, attempting to restart...');
          if (isListening) {
            // Small delay before attempting to restart
            setTimeout(requestMicPermission, 500);
          }
        };
      });
      
      setMicPermission('granted');
      setShowPermissionModal(false);
      
      // On mobile, we don't want to reload the page as it breaks the flow
      if (!/Mobi|Android/i.test(navigator.userAgent)) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to get microphone permission:', error);
      setMicPermission('denied');
      setShowPermissionModal(true);
      
      // More user-friendly error message
      const errorMessage = error.name === 'NotAllowedError' 
        ? 'Microphone access was denied. Please allow microphone access in your browser settings and try again.'
        : 'Microphone access is required for this application. Please check your device settings and try again.';
      
      alert(errorMessage);
    }
  };
  
  // Refresh function for mic issues
  const handleRefreshPage = () => {
    window.location.reload();
  };
  // State variables are already declared at the top of the component

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
    
    // States moved to component level

    // Request microphone permissions and test if it's working
    const requestPermissions = async () => {
      try {
        // Request microphone permission first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("✅ Microphone access granted.");
        setMicPermission('granted');
        
        // Store the mic stream in a ref for later use
        window.microphoneStream = stream;
        
        // Test if the microphone is actually working by analyzing audio levels
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Check audio levels for 3 seconds to make sure mic is really working
        let checkCount = 0;
        let audioDetectedCount = 0;
        const checkMicInterval = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);
          // Check if there's any audio signal
          const audioDetected = dataArray.some(value => value > 20); // Threshold for audio detection
          
          if (audioDetected) {
            audioDetectedCount++;
          }
          
          if (audioDetectedCount >= 3) {
            console.log("✅ Microphone is working and detecting audio.");
            setMicWorking(true);
            clearInterval(checkMicInterval);
          } else if (checkCount > 15) { // 3 seconds
            // If minimal sound detected after checks
            if (audioDetectedCount > 0) {
              console.log("⚠️ Microphone is detecting minimal audio. It may be working but at low volume.");
              setMicWorking(true); // Still consider it working
            } else {
              console.warn("⚠️ No audio detected from microphone. It might be muted or not working properly.");
              setMicWorking(false);
              // Show guidance without blocking
              const shouldShowHelp = confirm("No audio detected from your microphone. Would you like to see troubleshooting tips?");
              if (shouldShowHelp) {
                showMicrophoneTroubleshooting();
              }
            }
            clearInterval(checkMicInterval);
          }
          checkCount++;
        }, 200);
        
      } catch (err) {
        console.error("❌ Microphone access denied or not available:", err);
        setMicPermission('denied');
        setShowPermissionModal(true);
      }
    };

    requestPermissions();
    
    // Function to show microphone troubleshooting guidance
    const showMicrophoneTroubleshooting = () => {
      alert(`Microphone Troubleshooting Tips:\n\n
1. Make sure your microphone is not muted in your system settings\n
2. Check if your browser has permission to access the microphone\n
3. Try using another browser like Chrome or Edge\n
4. If using headphones with a mic, try unplugging and using the built-in mic\n
5. Check Windows Sound settings to ensure the right microphone is selected as default\n
6. Speak louder or move closer to the microphone\n\n
After fixing, please refresh the page.`);
    };

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

  // Set up speech recognition with mobile-specific handling
  useEffect(() => {
    // Initialize speech recognition setup with proper reset handling
    const setupSpeechRecognition = () => {
      if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
        alert('Speech recognition is not supported in this browser.');
        return null;
      }
      
      // Check if we're on mobile
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      
      // Create a new SpeechRecognition instance
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      // Configure recognition with mobile-specific settings
      recognitionInstance.lang = 'mr-IN';
      recognitionInstance.continuous = true; // Keep listening continuously
      recognitionInstance.interimResults = true; // Get partial results
      recognitionInstance.maxAlternatives = 1;
      
      // Mobile-specific configurations
      if (isMobile) {
        console.log('Mobile device detected, applying mobile-specific settings');
        // Keep continuous mode for better stability on mobile
        recognitionInstance.continuous = true;
        // Enable interim results for better responsiveness
        recognitionInstance.interimResults = true;
        // Increase timeout for mobile devices
        recognitionInstance.maxAlternatives = 3;
        // Add a small delay between recognition restarts
        recognitionInstance.pause = false;
        
        // Add error handling for mobile-specific issues
        recognitionInstance.onerror = (event) => {
          console.error('Mobile speech recognition error:', event.error);
          
          // Handle specific mobile errors
          if (event.error === 'not-allowed') {
            setMicPermission('denied');
            setShowPermissionModal(true);
          } else if (event.error === 'audio-capture') {
            alert('No microphone was found. Please check your device settings.');
          } else if (event.error === 'network') {
            alert('Network error occurred. Please check your internet connection.');
          }
          
          // Try to recover if we're supposed to be listening
          if (isListening) {
            setTimeout(() => {
              try {
                recognitionInstance.start();
              } catch (e) {
                console.error('Failed to restart recognition after error:', e);
                setIsListening(false);
              }
            }, 1000);
          } else {
            setIsListening(false);
          }
        };
      }
      
      // Current accumulated transcript - stored outside React state for reliability
      let currentTranscript = '';
      
      // Reset state when recognition starts
      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
        if (!isAnswerSubmitted) {
          // Only reset text when actually starting a new recording
          setRecordedText('');
          currentTranscript = '';
        }
        setIsListening(true);
      };
      
      // Handle speech results
      recognitionInstance.onresult = (event) => {
        if (event.results && event.results.length > 0) {
          // Get the latest transcript - accumulate it instead of replacing
          const latestTranscript = event.results[event.results.length - 1][0].transcript;
          
          // Append latest transcript to current transcript if it's a new segment
          // This is important to prevent repetition while maintaining continuous recording
          if (event.results[event.results.length - 1].isFinal) {
            currentTranscript = currentTranscript + ' ' + latestTranscript;
          }
          
          // Create full transcript (current accumulated + latest interim result)
          const fullTranscript = currentTranscript + ' ' + 
              (event.results[event.results.length - 1].isFinal ? '' : latestTranscript);
          
          // Clean the transcript
          const cleanText = fullTranscript
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
          
          // Update UI with the accumulating transcript
          setRecordedText(cleanText);
        }
      };
      
      // Handle end of recognition with improved mobile handling
      recognitionInstance.onend = () => {
        console.log('Speech recognition service disconnected');
        
        // If we're on mobile and still supposed to be listening
        if (isMobile && isListening && !isAnswerSubmitted && !window.stopRecognitionRequested) {
          console.log('Mobile: Auto-restarting speech recognition');
          
          // Use a more robust restart mechanism for mobile
          const restartRecognition = () => {
            if (!isListening || isAnswerSubmitted || window.stopRecognitionRequested) return;
            
            try {
              // Clear any existing timeouts to prevent multiple restarts
              if (window.recognitionRestartTimeout) {
                clearTimeout(window.recognitionRestartTimeout);
              }
              
              // Add a small random delay to prevent tight loops
              const delay = 100 + Math.random() * 200; // 100-300ms
              
              window.recognitionRestartTimeout = setTimeout(() => {
                try {
                  if (recognitionInstance && isListening) {
                    recognitionInstance.start();
                    console.log('Mobile: Successfully restarted recognition');
                  }
                } catch (e) {
                  console.error('Mobile: Failed to restart recognition:', e);
                  // If restart fails, try again with a longer delay
                  if (isListening) {
                    setTimeout(restartRecognition, 1000);
                  } else {
                    setIsListening(false);
                  }
                }
              }, delay);
              
            } catch (e) {
              console.error('Mobile: Error in recognition restart logic:', e);
              setIsListening(false);
            }
          };
          
          // Start the restart process
          restartRecognition();
        } else if (!isMobile && isListening && !isAnswerSubmitted && !window.stopRecognitionRequested) {
          // Desktop handling (original behavior)
          console.log('Desktop: Auto-restarting speech recognition');
          try {
            setTimeout(() => {
              if (isListening && recognitionInstance) {
                recognitionInstance.start();
              }
            }, 100);
          } catch (e) {
            console.error('Failed to restart recognition:', e);
            setIsListening(false);
          }
        } else {
          // Normal end of listening session
          setIsListening(false);
        }
      };
      
      // Enhanced error handling specifically for speech recognition
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event);
        
        // Special handling by error type
        switch(event.error) {
          case 'no-speech':
            // This is common and expected - user didn't speak yet
            console.log('No speech detected yet, continuing to listen...');
            
            // Visually indicate we're still listening (flash the mic icon)
            const micIcon = document.querySelector('.mic-icon');
            if (micIcon) {
              micIcon.classList.add('pulse');
              setTimeout(() => micIcon.classList.remove('pulse'), 1000);
            }
            
            // Don't stop listening on no-speech errors
            break;
            
          case 'not-allowed':
          case 'audio-capture':
            // Permission or mic hardware errors - show the permission modal
            console.error('Microphone permission issue:', event.error);
            setMicPermission('denied');
            setShowPermissionModal(true);
            setIsListening(false);
            break;
            
          case 'network':
            // Network issues
            console.error('Network error affecting speech recognition');
            alert('Network issue detected. Check your internet connection and try again.');
            setIsListening(false);
            break;
            
          case 'aborted':
            // User or system aborted - often normal
            console.log('Speech recognition aborted');
            // Don't alert the user for aborted events
            break;
            
          default:
            // Other errors
            console.error('Other speech recognition error:', event.error);
            // Only stop for serious errors
            if (event.error !== 'no-speech') {
              setIsListening(false);
            }
        }
        
        // Auto-restart recognition for non-critical errors
        if (isListening && !isAnswerSubmitted && 
            event.error !== 'not-allowed' && 
            event.error !== 'audio-capture' && 
            event.error !== 'network') {
          setTimeout(() => {
            try {
              recognitionInstance.start();
              console.log('Restarted speech recognition after', event.error);
            } catch (e) {
              console.error('Failed to restart recognition after error:', e);
              setIsListening(false);
            }
          }, 300);
        }
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
    
    // CRITICAL: Set a failsafe timeout to move to next question
    // This ensures we'll move on even if speech fails
    const failsafeTimeout = setTimeout(() => {
      console.log('⚠️ FAILSAFE: Moving to next question after speech timeout');
      handleNext();
    }, 5000);
    
    // Speak the feedback with the female voice
    try {
      speakResponse(cleanFeedback, () => {
        // Clear the failsafe when speech completes normally
        clearTimeout(failsafeTimeout);
        // After speaking is complete, move to the next question
        handleNext();
      });
    } catch (error) {
      console.error('Error in speakResponse:', error);
      clearTimeout(failsafeTimeout);
      handleNext();
    }
  };
  
  const submitAnswer = async (questionId, answer) => {
    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Authentication token not found. User may need to log in again.');
        // Optional: Redirect to login or show a message
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/saveAnswer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          _id: userId,
          email: user?.email,
          questionId: questionId,
          answer: answer,
          // Include additional fields that might be expected by the external API
          user_email: user?.email, // In case the API expects this field name
          question_id: questionId, // Alternative field name
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

  const handleMicClick = useCallback(async () => {
    // Handle speech recognition start/stop
    if (!recognition) {
      alert('Speech recognition not available');
      return;
    }
    
    // Check if we're on mobile and handle permissions
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile && micPermission !== 'granted') {
      setShowPermissionModal(true);
      return;
    }

    if (isListening) {
      // STOP RECORDING
      console.log('Stopping speech recognition');
      setIsListening(false);
      setLoading(true);
      
      // Important: Set a flag to prevent auto-restart
      window.stopRecognitionRequested = true;
      
      try {
        recognition.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }

      // Process the recorded answer
      if (recordedText.trim()) {
        console.log('🔄 PROCESSING ANSWER WITH TEXT:', recordedText.substring(0, 30) + '...');
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
        
        // IMPORTANT: Set loading to false to ensure UI updates
        setLoading(false);
        
        // SUPER IMPORTANT: DIRECT QUESTION PROGRESSION
        // This is the safest approach - just move to the next question directly
        console.log('⏭️ DIRECTLY MOVING to next question');
        
        // Check if this is the last question
        if (currentQuestionIndex >= questions.length - 1) {
          console.log('🏁 LAST QUESTION - showing completion modal');
          setIsModalVisible(true);
        } else {
          // Simply increment to next question
          console.log(`⏭️ Moving from question ${currentQuestionIndex + 1} to ${currentQuestionIndex + 2}`);
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
          setTimeout(() => {
            // Reset state for next question
            setRecordedText('');
            setIsAnswerSubmitted(false);
          }, 100);
        }
      } else {
        console.log('🔄 PROCESSING EMPTY ANSWER');
        // Handle case where mic was stopped without speaking
        const noAnswerText = "No answer provided - user stopped mic";
        if (questions[currentQuestionIndex] && questions[currentQuestionIndex]._id) {
          submitAnswer(questions[currentQuestionIndex]._id, noAnswerText);
        }
        setLoading(false);
        
        // DIRECT QUESTION PROGRESSION instead of using handleNext
        // Check if this is the last question
        if (currentQuestionIndex >= questions.length - 1) {
          console.log('🏁 LAST QUESTION (no answer) - showing completion modal');
          setIsModalVisible(true);
        } else {
          // Simply increment to next question
          console.log(`⏭️ Moving from question ${currentQuestionIndex + 1} to ${currentQuestionIndex + 2} (no answer)`);
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
          setTimeout(() => {
            // Reset state for next question
            setRecordedText('');
            setIsAnswerSubmitted(false);
          }, 100);
        }
      }
    } else {
      // START RECORDING
      console.log('Starting speech recognition');
      
      // Clear the flag to allow auto-restart
      window.stopRecognitionRequested = false;
      
      // On mobile, we need to ensure we have a fresh stream
      if (isMobile && (!window.microphoneStream || window.microphoneStream.getAudioTracks().length === 0)) {
        console.log('Refreshing microphone stream for mobile');
        try {
          await requestMicPermission();
        } catch (e) {
          console.error('Failed to refresh microphone stream:', e);
          return;
        }
      }
      
      // CRITICAL: Clear the question timer when mic is activated
      // This prevents "Time's up" from interrupting while speaking
      if (questionTimerRef.current) {
        console.log('🎺 STOPPING TIMER when microphone activated');
        clearTimeout(questionTimerRef.current);
        questionTimerRef.current = null;
      }
      
      // Check if questions are available
      if (!questions.length) {
        alert('No questions loaded');
        return;
      }
      
      // Check if microphone permission is denied - show the modal
      if (micPermission === 'denied') {
        setShowPermissionModal(true);
        return;
      }

      // Clear previous text
      setRecordedText('Listening...');
      setIsListening(true);
      
      // Mobile-specific: Add a small delay and check if recognition is still active
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        setTimeout(() => {
          if (isListening && recognition && !recognition.recording) {
            console.log('Mobile: Restarting recognition after initial start');
            try {
              recognition.stop();
              setTimeout(() => {
                if (recognition && isListening) {
                  recognition.start();
                }
              }, 100);
            } catch (e) {
              console.error('Mobile: Error in restart after initial start:', e);
              // If we can't restart, move to the next question
              if (questions.length > 0 && currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prevIndex => prevIndex + 1);
                setRecordedText('');
                setIsAnswerSubmitted(false);
              } else {
                console.log('No more questions available');
                setLoading(false);
              }
            }
          }
        }, 1000); // Check after 1 second if we need to restart
      }
      
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
  queue: [],
  speaking: false,

  init() {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  },

  getBestVoice() {
    const voices = window.speechSynthesis.getVoices();

    let marathiVoice = voices.find(v => v.lang === 'mr-IN');
    if (marathiVoice) return marathiVoice;

    let hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) return hindiVoice;

    const preferredVoice = voices.find(voice =>
      (voice.name.includes('Female') && voice.name.includes('Google')) ||
      voice.name.includes('Microsoft Zira') ||
      voice.name.includes('Samantha')
    );

    if (preferredVoice) return preferredVoice;

    const femaleVoice = voices.find(voice =>
      voice.name.includes('Female') ||
      voice.name.includes('woman') ||
      voice.name.includes('Girl')
    );

    if (femaleVoice) return femaleVoice;

    return voices[0];
  },

  speakQuestion(text, onComplete) {
    const cleanText = text.replace(/(currentQuestion|[,*])/g, "").trim();
    this.speak(cleanText, {
      rate: 0.9,
      pitch: 1.0,
      onComplete: onComplete,
      priority: 'high'
    });
  },

  speakResponse(text, onComplete) {
    this.speak(text, {
      rate: 1.0,
      pitch: 1.0,
      onComplete: onComplete,
      priority: 'medium'
    });
  },

  speak(text, options = {}) {
    if (!text) return;

    const settings = {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      lang: 'mr-IN',
      onComplete: null,
      onError: null,
      priority: 'medium',
      ...options
    };

    if (this.speaking && settings.priority === 'low') {
      console.log('Already speaking, skipping low priority speech');
      return;
    }

    if (settings.priority === 'high') {
      try {
        window.speechSynthesis.cancel();
        this.queue = [];
        this.speaking = false;
      } catch (e) {}
    }

    setIsSpeaking(true);
    isSpeakingRef.current = true;
    this.speaking = true;

    try {
      // 🔇 Speech is disabled — skipping actual synthesis
      console.log('[Speech Disabled] Text:', text);

      // Simulate async completion
      setTimeout(() => {
        this.speaking = false;
        setIsSpeaking(false);
        isSpeakingRef.current = false;

        if (typeof settings.onComplete === 'function') {
          settings.onComplete();
        }
      }, 0);
    } catch (e) {
      console.error('Error in speech simulation:', e);
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
  // Direct timer function with no state checks - moved to component level for proper scoping
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
          utterance.lang = 'mr-IN';
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
  
  // Initialize the timer system with useEffect
  useEffect(() => {
    // This effect handles the timer initialization and cleanup
    console.log('Timer system initialized for question', currentQuestionIndex + 1);
    
    // Return cleanup function to clear timers when component unmounts or dependencies change
    return () => {
      if (questionTimerRef.current) {
        clearTimeout(questionTimerRef.current);
        questionTimerRef.current = null;
        console.log('Cleaned up timer for question', currentQuestionIndex);
      }
    };
  }, [currentQuestionIndex]);
  
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
      femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') && v.lang.includes('mr-IN'));
      
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
      utterance.lang = 'mr-IN';
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
      utterance.lang = 'mr-IN';
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
  
  // Initialize voice list on component mount - client-side only
  useEffect(() => {
    if (!isBrowser || !window.speechSynthesis) return;
    
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const marathiVoice = voices.find(voice => voice.lang === 'mr-IN' || voice.lang.startsWith('mr-'));
      if (marathiVoice) {
        setVoice(marathiVoice);
      } else if (voices.length > 0) {
        // Fallback to first available voice if Marathi not found
        setVoice(voices[0]);
      }
    };
    
    // Load voices immediately and when they change
    loadVoices();
    
    // Cleanup
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isBrowser]);
  
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
    // Clear the progression flag if it exists
    if (window.questionProgressionStarted) {
      window.questionProgressionStarted = false;
    }
    
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
    setLoading(false); // Ensure loading state is reset
    
    // IMPORTANT: Mark answer as submitted to prevent duplicate actions
    setIsAnswerSubmitted(true);
    
    // Use setTimeout to ensure state updates have time to process
    // This is critical for ensuring the UI updates properly
    setTimeout(() => {
      // Check if this is the last question
      if (currentQuestionIndex >= questions.length - 1) {
        console.log('🏁 REACHED LAST QUESTION - showing completion modal');
        setIsModalVisible(true);
        speakResponse("Your interview has ended. Thank you for your participation.");
        setInterviewComplete(true);
        localStorage.removeItem("_id");
        updateIsActive();
      } else {
        // Simply move to next question
        console.log(`🔄 MOVING FROM QUESTION ${currentQuestionIndex + 1} TO ${currentQuestionIndex + 2}`);
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      }
    }, 100);
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
      router.push('/report');
    } catch (error) {
      console.error('Error updating interview completion count:', error);
      // Still navigate to the report page even if there's an error
      router.push('/report');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start pt-10 pb-20 overflow-x-hidden">
      <Head>
        <title>SHAKKTII AI - संवादात्मक मुलाखत</title>
        <meta name="description" content="AI-powered interview platform by SHAKKTII AI" />
        <style jsx global>{`
          /* Pulse animation for microphone */
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          .pulse {
            animation: pulse 1s infinite;
          }
        `}</style>
      </Head>
      
      {/* Microphone Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#29064b] p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-[#e600ff] mb-4">मायक्रोफोनसाठी परवानगी आवश्यक आहे.</h2>
            <p className="text-white mb-6">
             ही मुलाखत अ‍ॅप्लिकेशन योग्यरित्या काम करण्यासाठी तुमच्या मायक्रोफोनचा प्रवेश आवश्यक आहे. कृपया पुढे जाण्यासाठी मायक्रोफोनची परवानगी द्या.
            </p>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#e600ff] mb-2">समस्या निवारण टिपा:</h3>
              <ul className="text-white list-disc pl-5 space-y-1">
                <li>तुमचा मायक्रोफोन व्यवस्थित कनेक्ट आहे का ते तपासा</li>
                <li>सिस्टम सेटिंग्जमध्ये तो म्युट नाही याची खात्री करा</li>
                <li>Google Chrome किंवा Microsoft Edge ब्राउझर वापरून पहा</li>
               <li>ब्राउझरच्या परवानगी सेटिंग्ज तपासा</li>

              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={requestMicPermission}
                className="bg-[#e600ff] hover:bg-[#ca00e3] text-white font-bold py-3 px-4 rounded-lg flex-1 transition-colors"
              >
               मायक्रोफोन वापरण्याची परवानगी द्या
              </button>
              <button
                onClick={handleRefreshPage}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg flex-1 transition-colors"
              >
                पुनः लोड करा
              </button>
            </div>
          </div>
        </div>
      )}

      {questions.length > 0 ? (
        <div className="w-full max-w-3xl px-4 mb-6">
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-white">
                  प्रश्न {currentQuestionIndex + 1} पैकी {questions.length}
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
          <p className="text-white mt-2">प्रश्न लोड होत आहेत...</p>
        </div>
      ) : (
        <div className="w-full max-w-3xl px-4 mb-6 text-center">
          <div className="bg-red-600 bg-opacity-70 text-white py-2 px-4 rounded-lg">
            <p>प्रश्न उपलब्ध नाहीत. रीफ्रेश करा किंवा सपोर्टशी संपर्क करा.</p>
          </div>
        </div>
      )}

      <div className="flex justify-center mb-8">
        <img id="mainImage" src="mock.png" className="w-60 h-60 text-center rounded-full shadow-lg" alt="Shakti AI Logo" />
      </div>

      {questions.length > 0 && (
        <div className="w-full max-w-2xl bg-gray-900 bg-opacity-70 backdrop-blur-lg p-6 rounded-xl shadow-2xl mx-4 mb-8 border border-gray-800">
          <div className="question-container mb-6">
            <h2 className="text-2xl font-bold text-center text-white mb-2">प्रश्न:</h2>
            <p className="text-xl text-center text-white px-4 py-3 rounded-lg bg-gray-800 bg-opacity-50">
              {questions[currentQuestionIndex]?.questionText || "प्रश्न लोड होत आहेत..."}
            </p>
            {/* {!isIphone && (
              <button
                onClick={() => questions[currentQuestionIndex]?.questionText && speakQuestion(questions[currentQuestionIndex].questionText)}
                className="mt-3 flex items-center justify-center mx-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all duration-200"
                disabled={isSpeaking}
              >
                <FcSpeaker className="mr-2 text-xl" />
                <span>पुन्हा ऐका</span>
              </button>
            )} */}
          </div>

          <div className=" recorded-text-container bg-gray-800 bg-opacity-50 rounded-lg p-4 mb-6 min-h-[100px]">
            <h3 className="text-lg font-medium text-gray-300 mb-2">तुमचे उत्तर:</h3>
            <p className=" text-white">
              {recordedText && recordedText !== 'Listening...' ? (
                recordedText
              ) : (
                isListening ? (
                  <span className="animate-pulse text-blue-400">ऐकत आहे...</span>
                ) : (
                  "तुमचे बोललेले उत्तर येथे दिसेल..."
                )
              )}
            </p>
            {isListening && (
              <div className="mt-2 text-xs text-blue-300">
                कृपया तुमच्या मायक्रोफोनमध्ये स्पष्टपणे बोला...
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
            
            {/* {isSpeaking && (
              <div className="text-center mb-4">
                <div className="inline-block px-3 py-1 bg-green-600 text-white text-sm rounded-full animate-pulse">
                  AI बोलत आहे...
                </div>
              </div>
            )} */}

            <button
              className={`mic-button relative inline-flex items-center justify-center p-4 rounded-full text-3xl ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-indigo-600 to-pink-500 hover:from-indigo-700 hover:to-pink-600'} text-white shadow-lg transform transition-all duration-300 ${isListening ? 'scale-110 animate-pulse' : ''}`}
              onClick={handleMicClick}
              disabled={isSpeaking}
            >
              {isListening ? <FaMicrophoneSlash className="w-8 h-8" /> : <FaMicrophone className="w-8 h-8" />}
              <span className="absolute -bottom-8 text-xs text-white font-medium">
                {isListening ? 'रेकॉर्डिंग बंद करा' : 'बोलायला सुरुवात करा'}
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
              <h2 className="text-2xl font-bold mb-2 text-white">मुलाखत पूर्ण झाली!</h2>
              <p className="text-gray-300">मुलाखत पूर्ण केल्याबद्दल धन्यवाद. तुमची उत्तरे नोंदवली गेली आहेत.</p>
            </div>
            <button
              onClick={handleInterviewComplete}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-pink-600 focus:outline-none transform transition-all duration-200 hover:scale-105"
            >
              रिझल्ट पहा
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
              <h2 className="text-2xl font-bold mb-2 text-white">मुलाखत बंद करायची आहे का ?</h2>
              <p className="text-gray-300">आपण खरोखर बाहेर पडू इच्छिता का? आपली प्रगती गमावली जाईल आणि ती पुनर्प्राप्त करता येणार नाही.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleExitConfirmation}
                className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none transition-all duration-200"
              >
                हो, बाहेर जा
              </button>
              <button
                onClick={handleExitModalClose}
                className="flex-1 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none transition-all duration-200"
              >
              नाही, इथेच राहा
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && !isListening && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
          प्रक्रिया सुरू आहे...
        </div>
      )}

      {/* {isSpeaking && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
          AI संवाद साधत आहे...
        </div>
      )} */}
    </div>
  );
};

export default QuestionForm;
