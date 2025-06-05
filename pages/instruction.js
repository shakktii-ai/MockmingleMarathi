import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

function Instruction() {
    const router = useRouter();
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [testPhase, setTestPhase] = useState('speaker'); // 'speaker', 'mic', 'done'
    const [testMessage, setTestMessage] = useState('Testing speaker...');
    const [micPermissionGranted, setMicPermissionGranted] = useState(false);
    const recognitionRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [collageName, setCollageName] = useState('');
    const slides = [
        {
            id: 1,
            title: "नोकरीची भूमिका समजून घ्या",
            img: '/Shawn.png',
            content: "1. नोकरीची भूमिका समजून घेणे म्हणजे त्या पदाच्या मुख्य जबाबदाऱ्या, आवश्यक कौशल्ये आणि अपेक्षा यांचा अभ्यास करणे होय. यामुळे तुम्हाला तुमचा रेज्युमे योग्य प्रकारे तयार करता येतो, मुलाखतीतील प्रश्नांना आत्मविश्वासाने उत्तर देता येतात आणि तुमच्या क्षमतेचा त्या पदाशी कसा संबंध आहे हे प्रभावीपणे दाखवता येते.",
        },
        {
            id: 2,
            img: '/Job_Discrioption.png',
            title: "पदाचे तपशील समजून घ्या",
            content: "2. नोकरीचे वर्णन काळजीपूर्वक वाचा आणि त्यातील मुख्य पात्रता, जबाबदाऱ्या, आणि अपेक्षा समजून घ्या. तुमच्या कौशल्यां आणि अनुभवांचा नोकरीच्या गरजांशी कसा सुसंगत आहे याची उदाहरणे तयार ठेवा.",
        },
        {
            id: 3,
            img: '/collages_background..png',
            title: "कॉलेजची पार्श्वभूमी समजून घ्या",
            content: "3. कॉलेजची पार्श्वभूमी समजून घेणे म्हणजे त्याचा इतिहास, ध्येय, मूल्ये, उत्पादने, सेवा आणि उद्योगातील स्थान याबद्दल जाणून घेणे होय. यामुळे तुम्ही मुलाखतीत तुमची उत्तरे योग्य प्रकारे सादर करू शकता आणि संस्थेत खरी रुची दर्शवू शकता.",
        },
        {
            id: 4,
            img: '/Self_Introduction.png',
            title: "तुमची स्वतःची ओळख मांडण्याचा सराव करा",
            content: "4. स्वतःची थोडक्यात ओळख द्या, महत्वाची कौशल्ये, अनुभव आणि यशे नमूद करा, आणि ते नोकरीच्या भूमिकेशी जोडा.",
        },
        {
            id: 5,
            img: '/Resume.png',
            title: "तुमचा रेज्युमे अपडेट करा आणि १-२ प्रती सोबत ठेवा",
            content: "5. तुमचा रेज्युमे आणि इतर अर्जाच्या कागदपत्रे अद्ययावत, नोकरीच्या अनुरूप आणि नीटनेटके असतील याची खात्री करा. तुमचा रेज्युमे आणि इतर मागवलेली दस्तऐवजच्या अनेक प्रती सोबत आणा.",
        },
        {
            id: 6,
            img: '/Yourself_Professionally.png',
            title: "प्रोफेशनलपणे स्वतःला सादर करा",
            content: "6. इंडस्ट्री आणि कॉलेज संस्कृतीनुसार योग्य ड्रेसिंग करा. ग्रूमिंग आणि स्वच्छतेकडे लक्ष द्या, सकारात्मक प्रभावासाठी.",
        },
        {
            id: 7,
            img: '/Essential_Documents.png',
            title: "आवश्यक दस्तऐवज जमा करून नीटनेटके ठेवा",
            content: "7.सर्व आवश्यक कागदपत्रे जसे की प्रमाणपत्रे, शिफारसी, आणि ओळखपत्र गोळा करा आणि नीटनेटके ठेवाः फोल्डर किंवा पोर्टफोलिओचा वापर करा जेणेकरून सर्व काही व्यवस्थित आणि सहज उपलब्ध राहील.",
        },
        {
            id: 8,
            img: '/collage_News.png',
            title: "कॉलेजच्या बातम्यांवर अपडेट रहा",
            content: "8. कॉलेजच्या अलीकडील बातम्या, यश आणि उपक्रमांचा अभ्यास करा. यामुळे कॉलेजबद्दल तुमची रुची दिसून येते आणि मुलाखतीसाठी उपयुक्त चर्चा विषय मिळू शकतात.",
        },
        {
            id: 9,
            img: '/Thoughtful_Questions.png',
            title: " तपशिलवार प्रश्न तयार करा",
            content: '9. मुलाखत घेतल्यावर विचारण्यासाठी विचारपूर्वक प्रश्नांची यादी तयार करा, जसे की “संघाला सर्वात मोठे आव्हाने कोणती आहेत?” किंवा “कॉलेजच्या संस्कृतीबद्दल थोडक्यात सांगू शकता का?”',
        },
        {
            id: 10,
            img: '/Rest_Preparation.png',
            title: " योग्य विश्रांती घ्या आणि तयारी करा",
            content: '10. मुलाखतीपूर्वी तुम्हाला पुरेशी झोप आणि तयारीसाठी वेळ मिळावा याची खात्री करा. यामुळे तुम्हाला आत्मविश्वास, एकाग्रता आणि सकारात्मक छाप देण्यासाठी तयारी होईल.',
        },
    ];

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            handleNext();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // Function to handle text-to-speech
    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.2;
        window.speechSynthesis.speak(utterance);
        return new Promise(resolve => {
            utterance.onend = resolve;
        });
    };

    // Test speaker by reading a sentence
     const testSpeaker = async () => {
        setTestMessage('स्पीकर तपासणी चालू आहे... कृपया काळजीपूर्वक ऐका');
        await speak('हा स्पीकर चाचणी संदेश आहे. जर तुम्हाला हा स्पष्टपणे ऐकू येत असेल, तर तुमचा स्पीकर व्यवस्थित कार्यरत आहे.');
        setTestMessage('स्पीकर तपासणी पूर्ण झाली आहे. मायक्रोफोन तपासण्यासाठी कृपया पुढील बटणावर क्लिक करा.');
    };

    // Test microphone by having user read a sentence
    const testMicrophone = async () => {
        setTestMessage('मायक्रोफोन तपासणी सुरू आहे. कृपया खालील वाक्य नीट उच्चारावे: "The quick brown fox jumps over the lazy dog."');
        
        // Initialize speech recognition
        recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        // Speak the test sentence
        await speak('कृपया माझ्या नंतर पुनः उच्चार करा: The quick brown fox jumps over the lazy dog.');
        
        // Start listening for user response
        recognitionRef.current.start();
        setTestMessage('आम्ही तुमचा आवाज ऐकत आहोत, कृपया बोला: "The quick brown fox jumps over the lazy dog."');
        
        return new Promise(resolve => {
            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (transcript.toLowerCase().includes('quick brown fox')) {
                    setTestMessage('मायक्रोफोन तपासणी यशस्वीरीत्या पूर्ण झाली आहे');
                    resolve(true);
                } else {
                    setTestMessage('कृपया पुन्हा प्रयत्न करा. खालील वाक्य माझ्या नंतर बोला: "The quick brown fox jumps over the lazy dog."');
                    resolve(false);
                }
            };
            
            recognitionRef.current.onerror = () => {
                setTestMessage('मायक्रोफोन एक्सेस डिनायड आहे. कृपया मायक्रोफोनसाठी परवानगी ऑन करा.');
                resolve(false);
            };
        });
    };

    // Handle test progression
    const handleNextTest = async () => {
        if (testPhase === 'speaker') {
            await testSpeaker();
            setTestPhase('mic');
        } else if (testPhase === 'mic') {
            const micWorking = await testMicrophone();
            if (micWorking) {
                setTestPhase('done');
                setTestMessage('डिव्हाइस टेस्ट पूर्ण झाल्या आहेत! आता तुम्ही मुलाखत सुरू करू शकता.');
                setIsButtonEnabled(true);
            }
        }
    };

    // Run speaker test on component mount
    useEffect(() => {
        testSpeaker();
        
        // Cleanup speech recognition on unmount
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
          router.push("/login");
        } else {
          const userFromStorage = JSON.parse(localStorage.getItem('user'));
        //   console.log(userFromStorage);
          
          if (userFromStorage) {
            
            setCollageName(userFromStorage.collageName || '');  // Initialize email here directly
          }
        }
      }, []);

    // Check API response status periodically
    useEffect(() => {
        const checkApiResponseStatus = () => {
            const responseStatus = localStorage.getItem("apiResponseStatus");
            if (responseStatus === "success") {
                setIsButtonEnabled(true);
            } else {
                setIsButtonEnabled(false);
            }
        };

        const intervalId = setInterval(checkApiResponseStatus, 1000);
        return () => clearInterval(intervalId);
    }, []);

    const handleButtonClick = async(e) => {
        // Remove apiResponseStatus from localStorage
        localStorage.removeItem("apiResponseStatus");

        router.push("/questionForm");

        try {
            // const collageName = "Dynamic Crane Engineers Pvt. Ltd.";  // You can replace this with dynamic data
        
            // 1. Attempt to get the existing collage data by collageName using GET method
            const getRes = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/isActive?collageName=${collageName}`, {
                method: 'GET',  // Use GET method to check if the collage exists
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        
            let isActive = 1;  // Default is 1 if collage doesn't exist
            let collageExists = false;
        
            if (getRes.ok) {
                const collageData = await getRes.json();
                if (collageData?.isActive !== undefined) {
                    isActive = collageData.isActive + 1;  // collage exists, increment isActive
                    collageExists = true;
                }
            }
        
            // 2. Prepare the data to be saved
            const data = { collageName, isActive };
        
            let finalRes;
        
            // 3. Use PUT if the collage already exists, else POST to create
            if (collageExists) {
                // collage exists, update with PUT method
                finalRes = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/isActive`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
            } else {
                // collage doesn't exist, create with POST method
                finalRes = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/isActive`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
            }
        
            if (!finalRes.ok) {
                const errorData = await finalRes.json();
                throw new Error(errorData?.error || "कॉलेजची माहिती जतन करण्यात अयशस्वी झाले.");
            }
        
            const finalResponse = await finalRes.json();
            if (finalResponse.success) {
                console.log("कॉलेज डेटा यशस्वीपणे अपडेट/तयार केला गेला आहे.");
            }
        } catch (error) {
            console.error("Error:", error.message);
        }
    };

    return (
        <>
            <button onClick={() => router.back()} className="absolute font-bold h-20 w-20 text-4xl top-10 left-10 text-purple-400 hover:text-purple-300">
                <img src="/2.svg" className=' top-10 left-10 ' alt="Back" />
            </button>
            <div className="absolute top-10 right-10">
                <div className="rounded-full flex items-center justify-center">
                    <img src="/logoo.png" alt="Logo" className="w-16 h-16" />
                </div>
            </div>
            <div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/BG.jpg')" }}>
                <div className="relative  max-w-xl   bg-opacity-80 rounded-xl shadow-lg sm:max-w-md md:max-w-lg">
                    <div className="m-10 mb-20 rounded-lg text-sm text-center bg-gradient-to-r from-pink-800 to-purple-900 p-2">डिव्हाइस टेस्ट</div>
                    <div className="bg-white h-44 rounded-xl shadow-lg p-6 w-96 relative">
                        {/* Header Badge */}
                        {slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                className={`transition-opacity duration-800 ease-in-out ${currentIndex === index ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                            >
                                <div className="absolute -top-5  flex  items-center">
                                    <div className="w-12 h-12 z-10 bg-white rounded-full flex items-center justify-center border-4 border-pink-800">
                                        <img src={slide.img} alt="icon" className=' rounded-full' />
                                    </div>

                                    <div className="bg-gradient-to-r from-pink-800 to-purple-900 text-white rounded-r-full px-4 py-1 -ml-2">
                                        <span className="text-sm font-semibold">{slide.title}</span>
                                    </div>
                                </div>

                                {/* Slider */}
                                <div className="relative">

                                    <p className="text-gray-700 text-center mt-8 p-0 text-sm">{slide.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 text-center">
                        <p className="mb-4">{testMessage}</p>
                        {testPhase !== 'done' && (
                            <button 
                                onClick={handleNextTest}
                                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-white"
                            >
                                {testPhase === 'speaker' ? 'पुढे जा' : 'माईक टेस्ट करा'}
                            </button>
                        )}
                    </div>

                    <div className="mt-32 text-center ">
                        <button 
                            onClick={handleButtonClick} 
                            disabled={!isButtonEnabled} 
                            className={`${isButtonEnabled ? 'bg-gradient-to-r from-pink-800 to-purple-900' : 'bg-gradient-to-r from-pink-200 to-purple-300 cursor-not-allowed'} px-4 py-2  rounded-md text-white`}
                        >
                            मी तयार आहे, सुरू करूया!
                        </button>
                    </div>
                </div>
            </div>

        </>
    );
}

export default Instruction;
