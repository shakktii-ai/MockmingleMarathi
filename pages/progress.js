import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Line, Radar, Bar } from 'react-chartjs-2';
import InterviewProgress from '../components/InterviewProgress';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadarController,
  RadialLinearScale
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  RadarController,
  Title,
  Tooltip,
  Legend
);

export default function Progress() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState('latest');
  const [sortedReports, setSortedReports] = useState([]);
  const [comparisonDates, setComparisonDates] = useState({ first: null, second: null });
  const [showComparison, setShowComparison] = useState(false);
  const [interviewStats, setInterviewStats] = useState({
    no_of_interviews: 1,
    no_of_interviews_completed: 0,
  });
  const router = useRouter();

  const getSelectedReport = () => {
    if (!sortedReports.length) return null;
    if (selectedInterview === 'latest') {
      return sortedReports[sortedReports.length - 1];
    }
    return sortedReports[parseInt(selectedInterview)];
  };

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(user);
    const email = userData.email;
    setUserEmail(email);

    // Set interview stats from user data
    setInterviewStats({
      no_of_interviews: userData.no_of_interviews || 1,
      no_of_interviews_completed: userData.no_of_interviews_completed || 0,
    });

    fetchReports(email);
    fetchUserData(email);
  }, []);

  // Fetch the latest user data to get up-to-date interview stats
  const fetchUserData = async (email) => {
    if (!email) return;

    try {
      const response = await fetch(`/api/editStudentProfile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          updatedData: {}
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          // Update local storage with latest user data
          localStorage.setItem('user', JSON.stringify(data.user));

          // Update interview stats
          setInterviewStats({
            no_of_interviews: data.user.no_of_interviews || 1,
            no_of_interviews_completed: data.user.no_of_interviews_completed || 0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchReports = async (email) => {
    if (!email) return;

    try {
      const response = await fetch(`/api/getAllReports?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        // Generate some mock data with multiple job roles if needed for development
        // Uncomment this code to add mock data for testing multiple roles
        /*
        const mockRoles = ['Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer'];
        const mockData = [...data];
        // Add more mock data with different roles if there's only one role
        if (new Set(data.map(r => r.role)).size <= 1) {
          for (let i = 0; i < 3; i++) {
            const roleToCopy = mockRoles[i % mockRoles.length];
            data.forEach(item => {
              mockData.push({
                ...item,
                role: roleToCopy,
                date: new Date(item.date).toISOString()
              });
            });
          }
        }
        setReports(mockData);
        */

        // Regular code path - use this for production
        setReports(data);
        console.log('Fetched reports:', data); // Debug log
        console.log('Unique roles found:', [...new Set(data.map(r => r.role))]); // Debug roles

        // Sort reports by date and update sortedReports
        const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        setSortedReports(sorted);
      } else {
        setReports([]);
        setSortedReports([]);
        console.error('Expected array of reports but got:', typeof data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!Array.isArray(reports) || reports.length === 0) {
      return {
        scoreData: {
          labels: [],
          datasets: []
        },
        radarData: {
          labels: [],
          datasets: []
        },
        roleData: {
          labels: [],
          datasets: []
        }
      };
    }

    const labels = sortedReports.map(report => {
      const date = new Date(report.date).toLocaleDateString();
      return date;
    });

    // Define score categories and their colors
    const scoreCategories = [
      { key: 'technical_proficiency', label: 'Technical Proficiency', color: 'rgb(255, 99, 132)' },
      { key: 'communication', label: 'Communication', color: 'rgb(54, 162, 235)' },
      { key: 'decision_making', label: 'Decision Making', color: 'rgb(255, 206, 86)' },
      { key: 'confidence', label: 'Confidence', color: 'rgb(75, 192, 192)' },
      { key: 'language_fluency', label: 'Language Fluency', color: 'rgb(153, 102, 255)' }
    ];

    // Prepare line chart datasets for each score category
    const datasets = scoreCategories.map(category => ({
      label: category.label,
      data: sortedReports.map(report => (report.scores?.[category.key] || 0) * 1), // Keep as score out of 10
      borderColor: category.color,
      backgroundColor: category.color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
      tension: 0.1
    }));

    // Prepare radar chart data for selected reports
    const radarData = {
      labels: scoreCategories.map(cat => cat.label),
      datasets: [getSelectedReport()].filter(Boolean).map((report, index) => {
        const hue = (index * 137.5) % 360;
        const color = `hsl(${hue}, 70%, 50%)`;
        const date = new Date(report.date).toLocaleDateString();

        return {
          label: `Interview ${sortedReports.findIndex(r => r.date === report.date) + 1} (${date})`,
          data: scoreCategories.map(cat => (report.scores?.[cat.key] || 0) * 1),
          backgroundColor: `hsla(${hue}, 70%, 50%, 0.2)`,
          borderColor: color,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: color
        };
      })
    };

    // Prepare role-based data
    // Handle job roles explicitly - extract both role and jobRole fields
    const roles = [...new Set(reports.map(r => r.role || r.jobRole || 'Unknown'))];
    console.log('Roles for chart:', roles); // Debug roles

    // Ensure we have role names (handle empty strings or undefined)
    const cleanedRoles = roles.map(role => role || 'Unknown Role').filter(Boolean);

    // Generate a wider range of colors for potentially many roles
    const generateColors = (count) => {
      const colors = [];
      for (let i = 0; i < count; i++) {
        const hue = (i * 137.5) % 360; // Golden ratio to distribute colors evenly
        colors.push(`hsla(${hue}, 70%, 60%, 0.6)`);
      }
      return colors;
    };

    const roleData = {
      labels: cleanedRoles,
      datasets: [{
        label: 'Average Score by Role',
        data: cleanedRoles.map(role => {
          // Match against either role or jobRole fields
          const roleReports = reports.filter(r =>
            (r.role === role) ||
            (r.jobRole === role) ||
            (role === 'Unknown Role' && (!r.role && !r.jobRole))
          );

          if (roleReports.length === 0) return 0;

          // Calculate average score for this role
          const totalScore = roleReports.reduce((acc, curr) => acc + (curr.scores?.overall || 0), 0);
          const avgScore = totalScore / roleReports.length;
          return Math.round(avgScore); // Keep as score out of 50
        }),
        backgroundColor: generateColors(cleanedRoles.length)
      }]
    };

    return {
      scoreData: {
        labels,
        datasets
      },
      radarData,
      roleData
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold">रिपोर्ट्स लोड होत आहेत</div>
      </div>
    );
  }

  const chartData = prepareChartData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 relative">
          <button
            onClick={() => window.location.href = '/'}
            className="absolute left-6 top-6 flex items-center text-gray-600 hover:text-purple-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">मागे</span>
          </button>
          <h1 className="text-3xl font-bold text-center text-gray-800">मुलाखतीचा प्रोग्रेस अहवाल</h1>
          {userEmail && (
            <p className="text-center text-gray-600 mt-2">
              प्रोग्रेस दाखवत आहे: <span className="font-semibold">{userEmail}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg col-span-2 transition-all duration-300 hover:shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">गुणांचा सखोल अभ्यास</h2>
                <p className="text-sm text-gray-500 mt-1">तुमच्या कौशल्यांतील बदल आणि सुधारणा ट्रॅक करा</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {reports.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 px-3 py-1 rounded-lg text-xs font-medium flex items-center shadow-sm">
                    <span className="text-gray-700">लेटेस्ट मुलाखती:</span>
                    <span className="text-gray-900 ml-1">{new Date(reports[reports.length - (reports.length - 1)].date).toLocaleDateString()}</span>
                  </div>
                )}
                {reports.length > 0 && reports[reports.length - 1].role && (
                  <div className="bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg text-xs font-medium flex items-center shadow-sm">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
                    <span className="text-blue-700">{reports[reports.length - 1].role}</span>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg text-xs font-medium text-blue-700 shadow-sm">
                  एकूण: {reports.length} मुलाखती
                </div>
              </div>
            </div>

            <div className="mb-5">
              <div className="grid grid-cols-5 gap-4 mb-4">
                {chartData.scoreData.datasets.map((dataset, index) => {
                  const recentScore = dataset.data[dataset.data.length - 1] || 0;
                  const previousScore = dataset.data.length > 1 ? dataset.data[dataset.data.length - 2] : recentScore;
                  const improvement = recentScore - previousScore;
                  const improvementPercent = previousScore ? (improvement / previousScore * 100).toFixed(1) : 0;

                  return (
                    <div
                      key={dataset.label}
                      className="text-center p-3 rounded-lg border"
                      style={{ borderColor: dataset.borderColor, backgroundColor: dataset.backgroundColor }}
                    >
                      <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: dataset.borderColor }}>
                        {dataset.label}
                      </div>
                      <div className="text-2xl font-bold mt-1">{recentScore}/10</div>
                      <div className={`text-xs mt-1 ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}
                        ({improvement >= 0 ? '+' : ''}{improvementPercent}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Line
              data={chartData.scoreData}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                      callback: function (value) {
                        return value + '/10';
                      }
                    },
                    title: {
                      display: true,
                      text: 'Score (out of 10)'
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `${context.dataset.label}: ${context.raw}/10`;
                      },
                      title: function (tooltipItems) {
                        return `Interview: ${tooltipItems[0].label}`;
                      }
                    }
                  },
                  legend: {
                    position: 'bottom',
                    onClick: function () { }, // Disable hiding datasets on click
                    labels: {
                      boxWidth: 15,
                      padding: 15,
                      usePointStyle: true,
                      pointStyle: 'circle'
                    }
                  }
                },
                elements: {
                  line: {
                    tension: 0.3,  // Smoother curves
                    borderWidth: 3
                  },
                  point: {
                    radius: 4,
                    hoverRadius: 6
                  }
                }
              }}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg col-span-2 md:col-span-1 transition-all duration-300 hover:shadow-xl">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">परफॉर्मन्स अ‍ॅनालिसिस</h2>
                <div className="flex items-center gap-3">
                  <select
                    className="form-select rounded-md border-gray-300 shadow-sm text-sm py-1"
                    value={selectedInterview}
                    onChange={(e) => setSelectedInterview(e.target.value)}
                  >
                    <option value="latest">लेटेस्ट मुलाखती</option>
                    {sortedReports.map((report, index) => (
                      <option key={report.date} value={index}>
                        Iमुलाखती {index + 1} ({new Date(report.date).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="aspect-w-3 aspect-h-2 max-w-2xl mx-auto">

              <Radar
                data={chartData.radarData}
                options={{
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 10,
                      ticks: {
                        stepSize: 2,
                        callback: function (value) {
                          return value + '/10';
                        }
                      },
                      pointLabels: {
                        font: {
                          size: 12,
                          weight: 'bold'
                        }
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: 12,
                        padding: 10,
                        font: {
                          size: 11
                        }
                      }
                    },
                    title: {
                      display: true,
                      text: 'All Interview Performances',
                      padding: {
                        bottom: 10
                      }
                    }
                  },
                  elements: {
                    line: {
                      borderWidth: 2
                    },
                    point: {
                      radius: 3,
                      hoverRadius: 5
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg col-span-2 md:col-span-1 transition-all duration-300 hover:shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">	जॉब रोलनुसार गुण</h2>
              <div className="text-sm text-gray-500">
                {reports.length}  एकूण मुलाखती
              </div>
            </div>
            <div className="h-80"> {/* Added fixed height container */}
              <Bar
                data={chartData.roleData}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 50,
                      title: {
                        display: true,
                        text: 'Overall Interview Score'
                      },
                      ticks: {
                        callback: function (value) {
                          return value + '/50';
                        }
                      }
                    },
                    x: {
                      ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        title: function (context) {
                          return `Role: ${context[0].label}`;
                        },
                        label: function (context) {
                          return `Average Score: ${context.raw}/50`;
                        }
                      }
                    }
                  },
                  maintainAspectRatio: false
                }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg col-span-2 transition-all duration-300 hover:shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">मुलाखतींची तुलना करा</h2>
                <p className="text-sm text-gray-500 mt-1">गुणांची तुलना करण्यासाठी दोन मुलाखत तारखा निवडा</p>
              </div>
              {showComparison && (
                <button
                  onClick={() => {
                    setComparisonDates({ first: null, second: null });
                    setShowComparison(false);
                  }}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                >
                  Clear Comparison
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">पहिली मुलाखत:</label>
                <select
                  className="w-full form-select rounded-md border-gray-300 shadow-sm"
                  value={comparisonDates.first !== null ? comparisonDates.first : ''}
                  onChange={(e) => {
                    const value = e.target.value !== '' ? parseInt(e.target.value) : null;
                    setComparisonDates(prev => ({ ...prev, first: value }));
                  }}
                >
                  <option value="">मुलाखतीची तारीख निवडा...</option>
                  {sortedReports.map((report, index) => (
                    <option key={`first-${report.date}`} value={index}>
                      मुलाखत {index + 1} ({new Date(report.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">दुसरी मुलाखत:</label>
                <select
                  className="w-full form-select rounded-md border-gray-300 shadow-sm"
                  value={comparisonDates.second !== null ? comparisonDates.second : ''}
                  onChange={(e) => {
                    const value = e.target.value !== '' ? parseInt(e.target.value) : null;
                    setComparisonDates(prev => ({ ...prev, second: value }));
                  }}
                >
                  <option value="">मुलाखतीची तारीख निवडा...</option>
                  {sortedReports.map((report, index) => (
                    <option key={`second-${report.date}`} value={index}>
                      मुलाखत {index + 1} ({new Date(report.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    if (comparisonDates.first !== null && comparisonDates.second !== null) {
                      setShowComparison(true);
                    }
                  }}
                  disabled={comparisonDates.first === null || comparisonDates.second === null}
                  className={`w-full px-4 py-2 rounded-md text-white font-medium ${comparisonDates.first !== null && comparisonDates.second !== null ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} transition-colors`}
                >
                  मुलाखतींची तुलना करा
                </button>
              </div>
            </div>

            {showComparison && comparisonDates.first !== null && comparisonDates.second !== null && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  मुलाखत {comparisonDates.first + 1} आणि मुलाखत {comparisonDates.second + 1} यांची तुलना
                </h3>

                <div className="grid grid-cols-5 gap-4 mb-6">
                  {chartData.scoreData.datasets.map((dataset, i) => {
                    const firstScore = dataset.data[comparisonDates.first] || 0;
                    const secondScore = dataset.data[comparisonDates.second] || 0;
                    const difference = secondScore - firstScore;
                    const percentChange = firstScore ? (difference / firstScore * 100).toFixed(1) : 0;

                    return (
                      <div key={`comp-${dataset.label}`} className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-center mb-2" style={{ color: dataset.borderColor }}>
                          {dataset.label}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="text-gray-600">मुलाखत {comparisonDates.first + 1}:</div>
                          <div className="font-bold">{firstScore}/10</div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="text-gray-600">मुलाखत {comparisonDates.second + 1}:</div>
                          <div className="font-bold">{secondScore}/10</div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500">अपडेट:</div>
                            <div className={`font-bold text-sm ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {difference > 0 ? '+' : ''}{difference.toFixed(1)}
                              ({difference >= 0 ? '+' : ''}{percentChange}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-700 mb-3">एकूण प्रोग्रेस</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">मुलाखत {comparisonDates.first + 1} एकूण गुण:</div>
                      <div className="text-2xl font-bold">
                        {sortedReports[comparisonDates.first]?.scores?.overall || 0}/50
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">मुलाखत {comparisonDates.second + 1} एकूण गुण:</div>
                      <div className="text-2xl font-bold">
                        {sortedReports[comparisonDates.second]?.scores?.overall || 0}/50
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg col-span-2 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">सविस्तर विश्लेषण</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg transition-all duration-300 hover:shadow-md">
                <div className="text-lg font-semibold text-gray-700">एकूण मुलाखती</div>
                <div className="text-3xl text-blue-600 font-bold mt-2">{reports.length}</div>
                <div className="text-sm text-gray-500 mt-1">पूर्ण झालेले सेशन्स</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg transition-all duration-300 hover:shadow-md">
                <div className="text-lg font-semibold text-gray-700">एकूण गुण</div>
                <div className="text-3xl text-green-600 font-bold mt-2">
                  {reports.length > 0 ? ((reports.reduce((acc, curr) => acc + (curr.scores?.overall || 0), 0) / reports.length)).toFixed(1) : '0.0'}/50
                </div>
                <div className="text-sm text-gray-500 mt-1">सरासरी परफॉर्मन्स</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg transition-all duration-300 hover:shadow-md">
                <div className="text-lg font-semibold text-gray-700">युनिक रोल्स</div>
                <div className="text-3xl text-purple-600 font-bold mt-2">
                  {new Set(reports.map(r => r.role)).size}
                </div>
                <div className="text-sm text-gray-500 mt-1">वेगवेगळ्या पोझिशन्स</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg transition-all duration-300 hover:shadow-md">
                <div className="text-lg font-semibold text-gray-700">सर्वोत्तम परफॉर्मन्स</div>
                <div className="text-3xl text-orange-600 font-bold mt-2">
                  {reports.length > 0 ? (() => {
                    // Extract all scores properly and find the maximum
                    const scores = reports.map(r => {
                      // Make sure we have a valid score
                      const score = r.scores?.overall;
                      return typeof score === 'number' && !isNaN(score) ? score : 0;
                    });

                    console.log('सर्व गुण जास्तीत जास्त गणनेसाठी:', scores); // Debug all scores
                    const maxScore = Math.max(...scores);
                    return maxScore;
                  })() : 0}/50
                </div>
                <div className="text-sm text-gray-500 mt-1">सर्वाधिक गुण</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
