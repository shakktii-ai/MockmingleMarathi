import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function RebuildProgressData() {
  const router = useRouter();
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get user ID from localStorage
    const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
    const id = userObj?._id || userObj?.id || '';
    setUserId(id);
  }, []);

  const handleRebuild = async () => {
    if (!userId) {
      setError("वापरकर्ता आयडी सापडला नाही. कृपया प्रथम लॉगिन करा.");
      return;
    }

    setIsRebuilding(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/rebuildPracticeProgress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'अज्ञात त्रुटी आली आहे.');
      }

      setResult(data);
    } catch (err) {
      console.error('प्रोग्रेस रीबिल्ड करताना एरर आली:', err);
      setError(err.message || 'प्रोग्रेस रीबिल्ड करताना एरर आली');
    } finally {
      setIsRebuilding(false);
    }
  };

  return (
    <>
      <Head>
        <title>SHAKKTII AI -प्रोग्रेसची माहिती रीबिल्ड करा</title>
      </Head>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4" 
           style={{ backgroundImage: "url('/BG.jpg')", backgroundSize: 'cover' }}>
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center text-purple-800 mb-6">
           प्रॅक्टिस प्रोग्रेसची माहिती रीबिल्ड करा
          </h1>
          
          <p className="text-gray-600 mb-6">
            हा टूल तुमच्या आधीच्या सर्व प्रॅक्टिस उत्तरांमधून तुमची प्रॅक्टिस प्रोग्रेस डेटा पुन्हा तयार करेल.
जर तुमच्या प्रोग्रेस डॅशबोर्डवर शून्ये किंवा अपूर्ण माहिती दिसत असेल तर हा पर्याय वापरा.
          </p>
          
          <div className="text-gray-700 mb-4">
            <strong>वापरकर्ता आयडी:</strong> {userId || 'Not found'}
          </div>
          
          <button
            onClick={handleRebuild}
            disabled={isRebuilding || !userId}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              isRebuilding || !userId ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            } transition-colors mb-4`}
          >
            {isRebuilding ? (
              <>
                <span className="animate-spin inline-block h-4 w-4 border-t-2 border-white rounded-full mr-2"></span>
                पुन्हा तयार करत आहे...
              </>
            ) : (
              'Rebuild Progress Data'
            )}
          </button>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {result && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
              <strong>Success!</strong> {result.message}
              <p className="mt-2">Processed {result.totalResponses} practice responses.</p>
            </div>
          )}
          
          <div className="flex justify-center mt-4">
            <button
              onClick={() => router.push('/practiceProgress')}
              className="text-purple-600 hover:text-purple-800 transition-colors"
            >
              प्रोग्रेस डॅशबोर्डकडे जा
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
