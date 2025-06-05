import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function FixInterviewTracking() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [updateAllUsers, setUpdateAllUsers] = useState(false);
  const [updatedUsers, setUpdatedUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userFromStorage = localStorage.getItem('user');
    if (!userFromStorage) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userFromStorage);
    setUser(userData);
    setEmail(userData.email || '');
  }, []);

  const handleFixTracking = async () => {
    if (!updateAllUsers && !email) {
      setMessage('Email is required for single user update');
      return;
    }

    setLoading(true);
    setMessage('');
    setSuccess(false);
    setUpdatedUsers([]);

    try {
      // Call the force update API
      const response = await fetch('/api/forceUpdateUserFields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          updateAll: updateAllUsers 
        }),
      });

      const data = await response.json();

       if (response.ok) {
        setSuccess(true);
        
        if (updateAllUsers) {
          setMessage(`${data.updatedCount} वापरकर्ता खात्यांमध्ये इंटरव्ह्यू ट्रॅकिंग फील्ड्स यशस्वीरित्या अद्ययावत करण्यात आले आहेत.`);
          setUpdatedUsers(data.updatedUsers || []);
        } else {
          setMessage('इंटरव्ह्यू ट्रॅकिंग फील्ड्स यशस्वीरित्या अद्ययावत करण्यात आले आहेत! तुमच्या खात्यात आता ' + 
            `${data.user.no_of_interviews} उपलब्ध मुलाखती आणि ` +
            `${data.user.no_of_interviews_completed} पूर्ण झालेल्या मुलाखती आहेत.`);
          
          // Update user in localStorage
          if (user) {
            const updatedUser = {
              ...user,
              no_of_interviews: data.user.no_of_interviews,
              no_of_interviews_completed: data.user.no_of_interviews_completed
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      } else {
        setMessage(`त्रुटी: ${data.error || 'इंटरव्ह्यू ट्रॅकिंग फील्ड्स अपडेट होऊ शकले नाहीत. कृपया पुन्हा प्रयत्न करा.'}`);
      }
    } catch (error) {
      setMessage(`त्रुटी: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black bg-cover bg-center flex flex-col items-center justify-start pt-16 px-4">
      <Head>
        <title>इंटरव्ह्यू ट्रॅकिंग अपडेट करा | SHAKKTII AI</title>
        <meta name="description" content="Fix interview tracking fields for user accounts" />
      </Head>
      
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full border border-indigo-500">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">अपडेट इंटरव्ह्यू ट्रॅकिंग</h1>
        
        <p className="text-gray-300 mb-6">
          जर तुमच्या खात्यात इंटरव्ह्यू ट्रॅकिंग फील्ड्स नसतील, तर ही युटिलिटी ते जोडून खाते अपडेट करेल.
        </p>
        
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <input
              id="update-all"
              type="checkbox"
              checked={updateAllUsers}
              onChange={(e) => setUpdateAllUsers(e.target.checked)}
              className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
              disabled={loading}
            />
            <label htmlFor="update-all" className="ml-2 text-sm font-medium text-gray-300">
              डेटाबेसमधील सर्व युजर्स अद्ययावत करा. (अ‍ॅडमिन पर्याय)
            </label>
          </div>
          
          {!updateAllUsers && (
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">ई-मेल:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                disabled={loading || updateAllUsers}
              />
            </div>
          )}
        </div>
        
        <button
          onClick={handleFixTracking}
          disabled={loading}
          className={`w-full py-3 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 ${
            loading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : updateAllUsers
                ? 'bg-gradient-to-r from-purple-600 to-red-500 hover:from-purple-700 hover:to-red-600 hover:scale-105'
                : 'bg-gradient-to-r from-indigo-600 to-pink-500 hover:from-indigo-700 hover:to-pink-600 hover:scale-105'
          }`}
        >
          {loading 
            ? 'अपडेट करत आहे...' 
            : updateAllUsers 
              ? 'सर्व युजर्सचे अकाउंट्स अपडेट करा' 
              : 'इंटरव्ह्यू ट्रॅकिंग फील्ड्स अपडेट करा'
          }
        </button>
        
        {message && (
          <div className={`mt-4 p-3 rounded ${success ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
            {message}
          </div>
        )}
        
        {success && !updateAllUsers && (
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/profile')}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              प्रोफाइल पहा
            </button>
          </div>
        )}
        
        {success && updateAllUsers && updatedUsers.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-2">अपडेटेड युजर्स:</h3>
            <div className="max-h-60 overflow-y-auto bg-gray-900 rounded-lg p-3">
              <table className="w-full text-sm text-gray-300">
                <thead>
                  <tr>
                    <th className="text-left p-2">नाव</th>
                    <th className="text-left p-2">ई-मेल</th>
                    <th className="text-right p-2">मुलाखती</th>
                  </tr>
                </thead>
                <tbody>
                  {updatedUsers.map((user, index) => (
                    <tr key={index} className="border-t border-gray-800">
                      <td className="p-2">{user.fullName}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2 text-right">{user.no_of_interviews_completed} / {user.no_of_interviews}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
