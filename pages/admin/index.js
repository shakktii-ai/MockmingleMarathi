

import { useState, useEffect } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { useRouter } from 'next/router';


export default function Index() {

  const router = useRouter();
  // State to hold the active test count, loading state, and total users
  const [activeTests, setActiveTests] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCompleteTest, setTotalCompleteTest] = useState(0);


  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/admin/login");
    } else {
      const userFromStorage = JSON.parse(localStorage.getItem('user'));
      if (userFromStorage) {
        setUser(userFromStorage);

      }
    }
  }, []);


  useEffect(() => {
    const collageName = 'SPPU'; // Example company name

    const fetchActiveTests = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/isActive?collageName=${collageName}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const collageData = data[0];
        if (collageData && collageData.isActive !== undefined) {
          return collageData.isActive;
        }
      }
      return 0; // Default value in case of error
    };

    const fetchTotalUsers = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/totalUsers?collageName=${collageName}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.totalUsers !== undefined) {
          return data.totalUsers;
        }
      }
      return 0; // Default value in case of error
    };

    const fetchCompletedTestReports = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/getReportByCollageName?collageName=${collageName}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.reports && Array.isArray(data.reports)) {
          return data.reports.length;
        }
      }
      return 0; // Default value in case of error
    };

    // Fetch all data concurrently
    const fetchData = async () => {
      try {
        const [activeTestsData, totalUsersData, completedTestData] = await Promise.all([
          fetchActiveTests(),
          fetchTotalUsers(),
          fetchCompletedTestReports(),
        ]);

        // Set the state once all data is fetched
        setActiveTests(activeTestsData);
        setTotalUsers(totalUsersData);
        setTotalCompleteTest(completedTestData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setActiveTests(0);
        setTotalUsers(0);
        setTotalCompleteTest(0);
      }
    };

    fetchData();
  }, []);

  return (
    <>

      <main className="flex-1 p-8 bg-[#6c57ec] bg-opacity-20 m-20 rounded-xl">
        <div className="bg-white text-center flex items-center justify-around gap-4 p-4 rounded-lg">
          <div>
            <h2 className="text-4xl font-bold text-purple-700">एकूण वापरकर्ते</h2>
            <h2 className="text-xl">नोंदणीकृत विद्यार्थ्यांची संख्या</h2>
          </div>
          {/* Displaying the fetched total users */}
          <div className='bg-purple-200 p-5 rounded-full'>
            <p className="text-center rounded-lg  text-4xl  text-purple-700 font-bold">{totalUsers}</p>
          </div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-3 md:grid-cols-2 gap-4 bg-white mt-20 rounded-xl p-4">
          <div className="m-2">
            <h2 className="text-purple-700 font-bold text-lg">सक्रिय चाचण्या</h2>
            <div className="bg-purple-200 rounded-2xl p-4 w-64 shadow-md">
              <div className="flex items-center gap-4 mt-3">
                <div className="w-20 h-16">


                  <h2 className="text-center mt-2 text-4xl text-purple-700 font-bold">
                    {activeTests}
                  </h2>

                </div>
                <div>
                  <p className="text-gray-700 font-semibold">सक्रिय चाचणी</p>
                  <p className="text-purple-600 text-sm">सुरू असलेल्या चाचण्या</p>
                </div>
              </div>
            </div>
          </div>

          <div className="m-2">
            <h2 className="text-purple-700 font-bold text-lg">पूर्ण झालेल्या चाचण्या</h2>
            <div className="bg-purple-200 rounded-2xl p-4 w-64 shadow-md">
              <div className="flex items-center gap-4 mt-3">
                <div className="w-20 h-16">
                  <h2 className="text-center mt-2 text-4xl text-purple-700 font-bold">
                    {totalCompleteTest}
                  </h2>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">पूर्ण झालेल्या चाचण्या</p>
                  <p className="text-purple-600 text-sm">आतापर्यंत पूर्ण झालेल्या एकूण चाचण्या</p>
                </div>
              </div>
            </div>
          </div>


        </div>
      </main>
    </>
  );
}
