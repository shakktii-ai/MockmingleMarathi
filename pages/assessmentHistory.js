import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { MdHistory, MdAssignment } from "react-icons/md";
import { IoIosArrowBack as BackIcon } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AssessmentHistory() {
    const router = useRouter();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (!user._id) return;

            try {
                const res = await fetch(`/api/assessment/history?userId=${user._id}`);
                const data = await res.json();
                if (data.success) {
                    setHistory(data.history);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Head>
                <title>असेसमेंट इतिहास | Shakkti AI</title>
            </Head>

            <nav className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                    <button onClick={() => window.location.href = '/'} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <BackIcon className="text-xl" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-800">असेसमेंट इतिहास</h1>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-500 font-medium">इतिहास लोड होत आहे...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-slate-100">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MdAssignment className="text-4xl text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">अजून कोणतीही टेस्ट दिली नाही</h2>
                        <p className="text-slate-500 mt-2 mb-8">तुमची पहिली असेसमेंट आजच सुरू करा!</p>
                        <button
                            onClick={() => router.push("/assessment")}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            असेसमेंट सुरू करा
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((report) => (
                            <div key={report._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                                                {report.className}
                                            </span>
                                            <span className="text-slate-400 text-xs font-medium">
                                                {new Date(report.completedAt).toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800">{report.subject}</h3>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">ग्रेड</div>
                                            <div className={`text-2xl font-black ${['A+', 'A'].includes(report.grade) ? "text-green-600" :
                                                ['B+', 'B'].includes(report.grade) ? "text-indigo-600" : "text-amber-600"
                                                }`}>{report.grade}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">टक्केवारी</div>
                                            <div className="text-2xl font-black text-slate-700">{Math.round(report.percentage)}%</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                // Store this report in a temporary state or query param to view it
                                                // For simplicity, we could just navigate to a view page or open a modal
                                                // But since we want to keep it simple, let's just show basic info for now
                                                toast.info("सविस्तर रिपोर्ट लवकरच उपलब्ध होईल!");
                                            }}
                                            className="p-2 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100 text-indigo-600"
                                        >
                                            <MdAssignment className="text-2xl" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <ToastContainer />
        </div>
    );
}
