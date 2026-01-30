import { useEffect, useState } from 'react';
import { FaYoutube, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/router';

const Suggestion = () => {
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [videosByDate, setVideosByDate] = useState({});

  useEffect(() => {

    const fetchRecommendations = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const userEmail = user?.email;
      console.log(userEmail);
      try {
        const response = await fetch('/api/youtube', {
          method: 'GET',
          headers: {
            'user-email': userEmail
          }
        });

        const data = await response.json();
        if (data.success && data.data.length > 0) {
          // Group videos by date
          const groupedVideos = {};

          data.data.forEach(entry => {
            if (entry.recommendations && Array.isArray(entry.recommendations)) {
              const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              if (!groupedVideos[date]) {
                groupedVideos[date] = [];
              }

              entry.recommendations.forEach(recommendation => {
                groupedVideos[date].push({
                  ...recommendation,
                  createdAt: entry.createdAt
                });
              });
            }
          });

          // Sort dates in descending order (newest first)
          const sortedGroups = {};
          Object.keys(groupedVideos)
            .sort((a, b) => new Date(b) - new Date(a))
            .forEach(key => {
              sortedGroups[key] = groupedVideos[key];
            });

          setVideosByDate(sortedGroups);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchRecommendations();
  }, []);

  const extractVideoId = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.searchParams.get("v") || parsedUrl.pathname.split("/").pop();
    } catch (err) {
      return null;
    }
  };

  const renderYoutubeRecommendations = () => {
    if (loadingVideos) {
      return (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-300">उपयुक्त व्हिडिओ शिफारसी शोधत आहे...</p>
        </div>
      );
    }

    if (!videosByDate || Object.keys(videosByDate).length === 0) {
      return (
        // <div className="text-center py-8">
        //   <p className="text-gray-400">सध्या कोणतीही व्हिडिओ शिफारस उपलब्ध नाही.</p>
        // </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <div className="mt-8 p-6 bg-gray-800 rounded-lg">
        <h2 className="flex items-center text-2xl font-bold mb-6 text-red-500">
          <FaYoutube className="mr-2" /> कौशल्यानुसार शिफारस केलेले व्हिडिओ
        </h2>

        {Object.entries(videosByDate).map(([date, groups]) => (
          <div key={date} className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
              {date}
            </h2>
            {groups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-8">
                <h3 className="text-xl text-white font-semibold mb-4">{group.skill}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.videos.map((video, videoIndex) => {
                    const videoId = extractVideoId(video.url);
                    return (
                      <div
                        key={videoIndex}
                        className="bg-gray-700 rounded-lg overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl"
                      >
                        <div className="aspect-w-16 aspect-h-9">
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-white line-clamp-2 mb-1">{video.title}</h4>
                          <p className="text-gray-400 text-sm">{group.skill} Video</p>
                          <p className="text-gray-500 text-xs mt-2">
                            Added: {new Date(video.createdAt || Date.now()).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-6">
      <div className="container mx-auto max-w-7xl">
        <button
          onClick={() => window.location.href = '/'}
          className="flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          डॅशबोर्डवर परत जा
        </button>
        <h1 className="text-3xl font-bold mb-8 text-center">कौशल्य-आधारित व्हिडिओ सुधारणा</h1>
        {renderYoutubeRecommendations()}
      </div>
    </div>
  );
};

export default Suggestion;
