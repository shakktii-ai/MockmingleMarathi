import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

function Practices() {
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    if (!localStorage.getItem("token")) {
      router.push("/login");
    } else {
      // Get user info from localStorage
      const userFromStorage = JSON.parse(localStorage.getItem('user'));
      if (userFromStorage) {
        setUserName(userFromStorage.fullName || '');
      }
    }
  }, []);

  const practiceCards = [
    {
      id: 1,
      title: "पर्सनॅलिटी टेस्ट",
      description: "तुमचे पर्सनॅलिटी ट्रेट्स जाणून घ्या आणि स्ट्रेंथ्स व इम्प्रूव्हमेंट एरियाज ओळखा.",
      image: "/personality.png",
      bgColor: "from-purple-600 to-indigo-800",
      link: "/personalityTest"
    },
    {
      id: 2,
      title: "बोलण्याचा सराव",
      description: "वेगवेगळ्या डिफिकल्टी लेव्हल्सवर इंटरॲक्टिव्ह सरावाने तुमची बोलण्याची कौशल्ये सुधारवा.",
      image: "/speaking.png",
      bgColor: "from-pink-600 to-rose-800",
      link: "/speakingPractice"
    },
    {
      id: 3,
      title: "ऐकण्याचा सराव",
      description: "मार्गदर्शित ऑडिओ सराव आणि प्रत्यक्ष आयुष्यातील परिस्थितींच्या आधारे तुमची ऐकण्याची समज सुधारवा.",
      image: "/listening.png",
      bgColor: "from-blue-600 to-cyan-800",
      link: "/listeningPractice"
    },
    {
      id: 4,
      title: "वाचन आणि लेखन",
      description: "संघटित उपक्रमांद्वारे तुमची वाचन समज आणि लेखन कौशल्ये विकसित करा.",
      image: "/reading.png",
      bgColor: "from-emerald-600 to-teal-800",
      link: "/readingWritingPractice"
    }
  ];

  return (
    <>
      <Head>
        <title>SHAKKTII AI - सराव परीक्षा</title>
      </Head>
      <div className="min-h-screen bg-gray-100" style={{ backgroundColor:'black'}}>
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center text-white  transition-colors"
              >
                <img src="/2.svg" alt="Back" className="w-8 h-8 mr-2" />
                <span className="text-lg font-medium">मागे जा</span>
              </button>
            </div>
            <div className="flex items-center">
              <div className="mr-4 text-right">
                <p className="text-sm text-white">आपले स्वागत आहे,</p>
                <p className="font-semibold text-lg text-white">{userName}</p>
              </div>
              {/* <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                <img src="/logoo.png" alt="Logo" className="w-10 h-10" />
              </div> */}
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white">प्रॅक्टिस अ‍ॅसेसमेंट्स</h1>
            <p className="text-lg text-white mt-2">
              आमच्या विशेष सराव सत्रांद्वारे तुमची कौशल्ये वाढवा.
            </p>
            <button
              onClick={() => router.push('/practiceProgress')}
              className="mt-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-2 px-6 rounded-full text-md font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              तुमची प्रोग्रेस पाहा
            </button>
          </div>

          {/* Practice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {practiceCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 cursor-pointer"
                onClick={() => router.push(card.link)}
              >
                <div className={`h-32 bg-gradient-to-r ${card.bgColor} flex items-center justify-center p-6`}>
                  <img
                    src={card.image || "/default-card.png"}
                    alt={card.title}
                    className="w-24 h-24 object-contain"
                    onError={(e) => {
                      e.target.src = "/default-card.png";
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{card.description}</p>
                  <button
                    className="w-full bg-gradient-to-r from-pink-800 to-purple-900 text-white py-2 rounded-md hover:opacity-90 transition-opacity"
                  >
                    सराव सुरू करा
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Practices;
