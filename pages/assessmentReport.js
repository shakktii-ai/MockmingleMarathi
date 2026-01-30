import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import ReactMarkdown from 'react-markdown';
import { IoIosArrowBack } from 'react-icons/io';
// --- ICONS ---
const Icons = {
  Document: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Chart: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>,
  Close: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Print: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6a2 2 0 012-2zm9-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
};

// --- COMPONENT: ANIMATED SCORE CIRCLE ---
const ScoreCircle = ({ obtained, total, size = "md" }) => {
  // Safe calculation to avoid NaN
  const safeTotal = total || 1; 
  const safeObtained = obtained || 0;
  const percentage = Math.round((safeObtained / safeTotal) * 100);
  
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color Logic
  let colorClass = "text-red-500";
  if (percentage >= 80) colorClass = "text-emerald-400";
  else if (percentage >= 60) colorClass = "text-blue-400";
  else if (percentage >= 40) colorClass = "text-yellow-400";

  const sizeClass = size === "lg" ? "w-32 h-32" : "w-16 h-16";
  const fontSize = size === "lg" ? "text-3xl" : "text-sm";
  const strokeSize = size === "lg" ? "3" : "3";

  return (
    <div className={`relative flex items-center justify-center ${sizeClass}`}>
      {/* Background Track */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
        <circle
          className="text-slate-800"
          strokeWidth={strokeSize}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="20"
          cy="20"
        />
        {/* Progress Line */}
        <circle
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeWidth={strokeSize}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="20"
          cy="20"
        />
      </svg>
      
      {/* Centered Text */}
      <div className={`absolute flex flex-col items-center ${colorClass}`}>
        <span className={`${fontSize} font-black`}>{percentage}%</span>
        {size === 'lg' && (
           <span className="text-xs text-slate-400 font-medium mt-1">{safeObtained}/{safeTotal}</span>
        )}
      </div>
    </div>
  );
};

export default function AssessmentReport() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/login'); 
        return;
      }
      
      const user = JSON.parse(userStr);
      const res = await fetch(`/api/assessment?email=${user.email}`);
      const data = await res.json();

      if (data.reports) {
        // Sort by newest first
        setReports(data.reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER: Get Score Data ---
  // Handles both new (DB fields) and old (Regex extraction) formats
  const getScoreData = (report) => {
    // 1. Try DB Fields (New System)
    if (report.score !== undefined && report.totalQuestions !== undefined) {
        return { obtained: report.score, total: report.totalQuestions };
    }
    
    // 2. Fallback Regex (Old System)
    const match = report.reportAnalysis?.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      return { obtained: parseInt(match[1]), total: parseInt(match[2]) };
    }
    
    return { obtained: 0, total: 100 }; // Default
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('mr-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate Average Percentage
  const avgScore = reports.length > 0 
    ? Math.round(reports.reduce((acc, curr) => {
        const { obtained, total } = getScoreData(curr);
        return acc + ((obtained / total) * 100);
      }, 0) / reports.length)
    : 0;

  return (
    <>
      <Head>
        <title>माझे अहवाल | Shakkti AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30 relative overflow-x-hidden">
        
        {/* Background Ambient */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]"></div>
        </div>

        {/* --- NAVBAR --- */}
        <nav className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
         <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
                
                             <IoIosArrowBack size={24} />
                           
            </div>
          </Link>
          <Link href="/assessment">
            <button className="px-5 py-2 bg-white text-slate-900 rounded-lg text-sm font-bold shadow-lg hover:bg-slate-200 transition-all flex items-center gap-2">
               <span>+</span> नवीन चाचणी
            </button>
          </Link>
        </nav>

        <main className="relative z-10 max-w-7xl mx-auto p-6 md:p-12">
          
          {/* --- HEADER SECTION --- */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
                <h1 className="text-4xl font-black mb-3 text-white">माझे प्रगती अहवाल</h1>
                <p className="text-slate-400 text-lg max-w-2xl">
                    तुमच्या मागील सर्व चाचण्या, गुण आणि AI ने केलेले सखोल विश्लेषण येथे पहा.
                </p>
            </div>
            
            {/* Quick Stats */}
            {!loading && reports.length > 0 && (
                <div className="flex gap-4">
                    <div className="bg-slate-900/50 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                            <Icons.Document /> एकूण चाचण्या
                        </div>
                        <div className="text-2xl font-black text-white">{reports.length}</div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                            <Icons.Chart /> सरासरी गुण
                        </div>
                        <div className={`text-2xl font-black ${avgScore >= 70 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            {avgScore}%
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* --- GRID OR EMPTY STATE --- */}
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4].map(i => (
                    <div key={i} className="h-64 bg-slate-900/50 rounded-3xl animate-pulse border border-white/5"></div>
                ))}
             </div>
          ) : reports.length === 0 ? (
             <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 bg-slate-900/30 rounded-[2.5rem] border border-white/5 border-dashed"
             >
                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner">📝</div>
                <h3 className="text-2xl font-bold text-white">कोणतेही अहवाल सापडले नाहीत</h3>
                <p className="text-slate-400 mt-2 mb-8 max-w-md text-center">
                    तुम्ही अद्याप कोणतीही चाचणी दिली नाही. तुमची पहिली चाचणी देऊन सुरुवात करा.
                </p>
                <Link href="/assessment">
                    <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1">
                        पहिली चाचणी द्या &rarr;
                    </button>
                </Link>
             </motion.div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => {
                    const score = getScoreData(report);
                    // Preview text: remove markdown symbols for clean card view
                    const previewText = report.reportAnalysis
                        ? report.reportAnalysis.replace(/[#*_`]/g, '').substring(0, 110) + '...'
                        : "No analysis available.";

                    return (
                        <motion.div 
                            key={report._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedReport(report)}
                            className="group bg-slate-900/60 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] hover:border-indigo-500/30 hover:bg-slate-800/80 transition-all cursor-pointer shadow-xl hover:shadow-indigo-900/10 relative overflow-hidden flex flex-col h-full"
                        >
                            {/* Card Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/0 rounded-bl-[4rem] -mr-4 -mt-4 transition-all group-hover:from-indigo-500/20"></div>

                            {/* Header: Date & Title */}
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="flex-1 pr-4">
                                    <span className="inline-block px-3 py-1 bg-white/5 text-slate-400 text-xs font-bold rounded-lg mb-3">
                                        {formatDate(report.createdAt)}
                                    </span>
                                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1" title={report.subject}>
                                        {report.subject}
                                    </h3>
                                    <div className="text-xs text-slate-500 mt-1">{report.role || 'Student'}</div>
                                </div>
                                <ScoreCircle obtained={score.obtained} total={score.total} />
                            </div>

                            {/* Content Body */}
                            <div className="flex-grow relative z-10">
                                <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 h-full">
                                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                                        {previewText}
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 flex justify-between items-center border-t border-white/5 pt-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</span>
                                </div>
                                <span className="text-sm font-bold text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                    अहवाल पहा &rarr;
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
             </div>
          )}

          {/* --- MODAL FOR DETAILED REPORT --- */}
          <AnimatePresence>
            {selectedReport && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-xl"
                    onClick={() => setSelectedReport(null)}
                >
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 30 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-slate-900 w-full max-w-4xl max-h-[85vh] flex flex-col rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-slate-950 p-6 md:p-8 border-b border-white/10 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-6">
                                <div className="hidden md:block">
                                    <ScoreCircle 
                                        obtained={getScoreData(selectedReport).obtained} 
                                        total={getScoreData(selectedReport).total} 
                                        size="lg" 
                                    />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-white">{selectedReport.subject}</h2>
                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/20">
                                            AI Analysis
                                        </span>
                                        <span className="text-slate-400 font-medium text-sm flex items-center gap-1">
                                            📅 {formatDate(selectedReport.createdAt)}
                                        </span>
                                        <span className="md:hidden text-slate-200 font-bold text-sm">
                                           Score: {getScoreData(selectedReport).obtained}/{getScoreData(selectedReport).total}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedReport(null)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all group"
                            >
                                <Icons.Close />
                            </button>
                        </div>

                        {/* Modal Content (Scrollable) */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/50 p-6 md:p-10">
                            <div className="prose prose-invert prose-lg max-w-none">
                                <ReactMarkdown
                                    components={{
                                        // Custom Styling for Markdown Elements
                                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 border-b border-white/10 pb-4 mb-6" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-lg font-bold text-indigo-300 mt-6 mb-2" {...props} />,
                                        p: ({node, ...props}) => <p className="text-slate-300 leading-relaxed mb-4" {...props} />,
                                        ul: ({node, ...props}) => <ul className="space-y-3 my-4 pl-1" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-2 text-slate-300 my-4 marker:text-indigo-500 marker:font-bold" {...props} />,
                                        li: ({node, ordered, ...props}) => ordered ? <li className="pl-2" {...props} /> : (
                                            <li className="flex gap-3 text-slate-300">
                                                <span className="text-indigo-500 mt-1.5 text-xs">●</span>
                                                <span className="leading-relaxed">{props.children}</span>
                                            </li>
                                        ),
                                        strong: ({node, ...props}) => <strong className="font-bold text-white bg-white/5 px-1 rounded mx-0.5" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 bg-indigo-500/10 p-4 rounded-r-xl my-6 italic text-slate-200" {...props} />,
                                        code: ({node, inline, ...props}) => inline 
                                            ? <code className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-700" {...props} />
                                            : <div className="bg-slate-950 p-4 rounded-xl border border-white/10 my-4 overflow-x-auto"><code className="text-sm font-mono text-slate-300" {...props} /></div>
                                    }}
                                >
                                    {selectedReport.reportAnalysis}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-white/10 bg-slate-950 shrink-0 flex justify-end gap-3">
                            <button 
                                onClick={() => window.print()} 
                                className="px-5 py-3 border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all flex items-center gap-2"
                            >
                                <Icons.Print /> प्रिंट करा
                            </button>
                            <button 
                                onClick={() => setSelectedReport(null)}
                                className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold transition-all"
                            >
                                बंद करा
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </>
  );
}