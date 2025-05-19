// import "@/styles/globals.css";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import AdminNav from "@/components/adminNav";
// import Navbar from "@/components/navbar";

// export default function App({ Component, pageProps }) {
//   const [user, setUser] = useState({ value: null });
//   const router = useRouter();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       setUser({ value: token });
//     }
//   }, [router.query]);

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setUser({ value: null });
//     router.push('/');
//   };

//   const isAdminRoute = router.pathname.startsWith('/admin');

//   return (
//     <>
//       {isAdminRoute ? (
//         <div className="flex min-h-screen bg-cover" style={{ backgroundImage: "url('/bg.jpg')" }}>
//           <AdminNav />
//           <Component {...pageProps} user={user} Logout={logout} />
//         </div>
//       ) : (
//         <>
//           <Navbar user={user} Logout={logout} /> {/* 👈 Regular navbar for non-admin pages */}
//           <Component {...pageProps} user={user} Logout={logout} />
//         </>
//       )}
//     </>
//   );
// }

import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminNav from "@/components/adminNav";
import Navbar from "@/components/navbar";

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState({ value: null });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser({ value: token, ...JSON.parse(userData) });
      } catch (err) {
        console.error("Failed to parse user data", err);
        setUser({ value: null });
      }
    } else {
      setUser({ value: null });
    }
  }, [router.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser({ value: null });
    router.push("/");
  };

  const isAdminRoute = router.pathname.startsWith("/admin");
const isDashboardRoute = router.pathname.startsWith("/");
  return (
    <>
      {isAdminRoute ? (
        <div className="flex min-h-screen bg-cover" style={{ backgroundImage: "url('/bg.jpg')" }}>
          <AdminNav />
          <Component {...pageProps} user={user} Logout={logout} />
        </div>
      ) : (
        <>
        
        {isDashboardRoute && <Navbar user={user} Logout={logout} />}
      
          <Component {...pageProps} user={user} Logout={logout} />
        </>
      )}
    </>
  );
}
