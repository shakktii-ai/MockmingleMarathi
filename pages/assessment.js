import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { IoIosArrowBack } from 'react-icons/io';
// Icons for better UI
const ChevronLeft = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRight = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const CheckCircle = () => <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default function Assessment() {
  const router = useRouter();
  
  // --- States ---
  const [step, setStep] = useState('input'); // input, loading, test, submitting, success
  const [formData, setFormData] = useState({ standard: '', subject: '' });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); 
  const [currentQIndex, setCurrentQIndex] = useState(0); // Track current question
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // --- 1. Load User & Handle Session Logic ---
  useEffect(() => {
    // A. Load User
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    // B. Smart Session Restoration
    const navEntry = typeof performance !== 'undefined' ? performance.getEntriesByType("navigation")[0] : null;
    
    if (navEntry && navEntry.type === 'reload') {
      try {
        const savedSession = localStorage.getItem('shakkti_active_session');
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          if (sessionData.step === 'test' || sessionData.step === 'submitting') {
            setFormData(sessionData.formData);
            setQuestions(sessionData.questions);
            setAnswers(sessionData.answers);
            setCurrentQIndex(sessionData.currentQIndex || 0);
            setStep('test'); 
          }
        }
      } catch (e) {
        console.error("Session restore failed", e);
        localStorage.removeItem('shakkti_active_session');
      }
    } else {
      localStorage.removeItem('shakkti_active_session');
      setStep('input');
      setQuestions([]);
      setAnswers({});
      setFormData({ standard: '', subject: '' });
    }
  }, []);

  // --- 2. Save Session (Auto-Save) ---
  useEffect(() => {
    if (step === 'test' && questions.length > 0) {
      const sessionData = { step, formData, questions, answers, currentQIndex };
      localStorage.setItem('shakkti_active_session', JSON.stringify(sessionData));
    }
  }, [step, formData, questions, answers, currentQIndex]);

  // --- Helpers ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleOptionSelect = (option) => {
    setAnswers(prev => ({ ...prev, [currentQIndex]: option }));
  };

  // *** ROBUST FETCH FUNCTION ***
  const safeFetch = async (url, payload) => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const text = await res.text(); 
      try {
        const data = JSON.parse(text);
        if (!res.ok) throw new Error(data.error || "API Error");
        return data;
      } catch (jsonError) {
        console.error("Server returned non-JSON:", text.substring(0, 100));
        throw new Error(`Server Error: API endpoint invalid.`);
      }
    } catch (error) {
      throw error;
    }
  };

  // --- 3. Start Assessment ---
  const startAssessment = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!formData.standard || !formData.subject) {
      setErrorMsg("कृपया इयत्ता आणि विषय दोन्ही भरा.");
      return;
    }

    localStorage.removeItem('shakkti_active_session');
    setAnswers({});
    setQuestions([]);
    setCurrentQIndex(0);
    setStep('loading');

    try {
      const data = await safeFetch('/api/assessment', {
        type: 'generate_questions',
        standard: formData.standard,
        subject: formData.subject
      });

      if (data.result && Array.isArray(data.result)) {
        setQuestions(data.result);
        setStep('test');
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (error) {
      console.error("Start Error:", error);
      setErrorMsg(error.message);
      setStep('input');
    }
  };

  // --- 4. Submit Assessment ---
  const submitAssessment = async () => {
    setErrorMsg('');
    
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      if(!confirm(`तुम्ही ${questions.length} पैकी फक्त ${answeredCount} सोडवले आहेत. तरीही सबमिट करायचे आहे का?`)) return;
    }

    setStep('submitting');

    try {
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;

      if (!currentUser || !currentUser.email) {
        alert("कृपया सबमिट करण्यासाठी पुन्हा लॉगिन करा.");
        router.push('/login');
        return;
      }

      const data = await safeFetch('/api/assessment', {
        type: 'evaluate_answers',
        standard: formData.standard,
        subject: formData.subject,
        questions: questions,
        userAnswers: answers, // Sends object {0: "Option A", 1: "Option C"}
        email: currentUser.email,          
        collageName: currentUser.collageName || "Individual User",
        role: currentUser.role || "Student"
      });
      
      if (data.result) {
        localStorage.removeItem('shakkti_active_session');
        setStep('success');
      }

    } catch (error) {
      console.error("Submission Error:", error);
      alert(`त्रुटी: ${error.message}`);
      setStep('test'); 
    }
  };

  // Navigation Helpers
  const nextQuestion = () => {
    if (currentQIndex < questions.length - 1) setCurrentQIndex(prev => prev + 1);
  };

  const prevQuestion = () => {
    if (currentQIndex > 0) setCurrentQIndex(prev => prev - 1);
  };

  const jumpToQuestion = (index) => {
    setCurrentQIndex(index);
  };

  // Progress Stats
  const filledCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? (filledCount / questions.length) * 100 : 0;

  return (
    <>
      <Head>
        <title>MCQ परीक्षा | Shakkti AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-purple-500/30">
        
        {/* Background Ambient Light */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]"></div>
        </div>

        {/* --- NAVBAR --- */}
        <nav className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
                
                             <IoIosArrowBack size={24} />
                           
            </div>
          </Link>
          
          {step === 'test' && (
             <div className="flex flex-col items-end">
                <div className="text-xs text-slate-400 font-medium mb-1">प्रगती</div>
                <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out"
                     style={{ width: `${progressPercent}%` }}
                   ></div>
                </div>
             </div>
          )}
        </nav>

        <main className="relative z-10 flex-grow p-4 md:p-6 flex justify-center items-start pt-8 md:pt-12">
          <div className="w-full max-w-6xl">
            
            <AnimatePresence mode="wait">
              
              {/* === STEP 1: INPUT FORM === */}
              {step === 'input' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-xl mx-auto"
                >
                  <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">MCQ सराव परीक्षा</h1>
                    {/* <p className="text-slate-400">AI द्वारे तयार केलेले 25 वस्तुनिष्ठ प्रश्न.</p> */}
                  </div>

                  {errorMsg && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-sm text-center flex items-center justify-center gap-2">
                      <span>⚠</span> {errorMsg}
                    </div>
                  )}
                  
                  <form onSubmit={startAssessment} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">तुमची इयत्ता (Class)</label>
                      <input 
                        type="text" name="standard" value={formData.standard} onChange={handleInputChange}
                        placeholder="उदा. 10वी, 12वी Science..."
                        className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">विषय (Subject)</label>
                      <input 
                        type="text" name="subject" value={formData.subject} onChange={handleInputChange}
                        placeholder="उदा. मराठी, इतिहास, जीवशास्त्र..."
                        className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-4 mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:-translate-y-0.5 transition-all"
                    >
                      परीक्षा सुरू करा &rarr;
                    </button>
                  </form>
                </motion.div>
              )}

              {/* === STEP 2 & 3: LOADING STATES === */}
              {(step === 'loading' || step === 'submitting') && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-40">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className={`absolute inset-0 border-[6px] ${step === 'loading' ? 'border-indigo-500/20' : 'border-green-500/20'} rounded-full`}></div>
                    <div className={`absolute inset-0 border-[6px] ${step === 'loading' ? 'border-t-indigo-500' : 'border-t-green-500'} rounded-full animate-spin`}></div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    {step === 'loading' ? 'प्रश्नपत्रिका तयार होत आहे...' : 'निकाल तयार करत आहोत...'}
                  </h2>
                  <p className="text-slate-400 text-lg">
                    {step === 'loading' ? 'प्रश्नपत्रिका तयार होत आहे.' : 'तुमच्या उत्तरांचे विश्लेषण चालू आहे.'}
                  </p>
                </motion.div>
              )}

              {/* === STEP 4: MCQ INTERFACE === */}
              {step === 'test' && questions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 h-full"
                >
                  
                  {/* LEFT: Question Area (Span 8 cols) */}
                  <div className="lg:col-span-8 flex flex-col">
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl flex-grow min-h-[500px] flex flex-col justify-between relative overflow-hidden">
                      
                      {/* Decoration */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

                      {/* Header */}
                      <div className="flex justify-between items-center mb-8 relative z-10">
                         <span className="text-slate-400 font-mono text-sm tracking-wider uppercase">Question {currentQIndex + 1} of {questions.length}</span>
                         <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-slate-300 border border-white/5">{formData.subject}</span>
                      </div>

                      {/* Question Text */}
                      <div className="mb-8 relative z-10">
                        <h2 className="text-xl md:text-2xl font-medium text-white leading-relaxed">
                          {questions[currentQIndex].question}
                        </h2>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        {questions[currentQIndex].options.map((option, idx) => {
                          const isSelected = answers[currentQIndex] === option;
                          return (
                            <div 
                              key={idx}
                              onClick={() => handleOptionSelect(option)}
                              className={`
                                cursor-pointer p-5 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group
                                ${isSelected 
                                  ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'}
                              `}
                            >
                              <div className={`
                                w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors
                                ${isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-600 text-slate-500 group-hover:border-slate-400'}
                              `}>
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <span className={`text-base ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                {option}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bottom Navigation */}
                      <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/5 relative z-10">
                         <button 
                           onClick={prevQuestion}
                           disabled={currentQIndex === 0}
                           className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium"
                         >
                           <ChevronLeft /> मागील (Prev)
                         </button>

                         {currentQIndex === questions.length - 1 ? (
                           <button 
                             onClick={submitAssessment}
                             className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 hover:shadow-green-900/40 hover:-translate-y-0.5 transition-all"
                           >
                             पेपर सबमिट करा <CheckCircle />
                           </button>
                         ) : (
                           <button 
                             onClick={nextQuestion}
                             className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all"
                           >
                             पुढील (Next) <ChevronRight />
                           </button>
                         )}
                      </div>

                    </div>
                  </div>

                  {/* RIGHT: Question Palette (Span 4 cols) */}
                  <div className="lg:col-span-4">
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 h-full shadow-xl">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                        प्रश्न सूची (Palette)
                      </h3>

                      <div className="grid grid-cols-5 gap-3">
                        {questions.map((_, idx) => {
                          const isAnswered = answers[idx] !== undefined;
                          const isCurrent = currentQIndex === idx;
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => jumpToQuestion(idx)}
                              className={`
                                aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all
                                ${isCurrent 
                                   ? 'ring-2 ring-white bg-indigo-600 text-white scale-110 z-10' 
                                   : isAnswered 
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}
                              `}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-8 space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/50"></div>
                          <span>सोडवलेले (Answered)</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                           <div className="w-4 h-4 rounded bg-indigo-600 ring-1 ring-white"></div>
                           <span>सध्याचा प्रश्न (Current)</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                           <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700"></div>
                           <span>बाकी (Not Visited)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}

              {/* === STEP 5: SUCCESS === */}
              {step === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900/80 backdrop-blur-2xl border border-green-500/20 p-10 md:p-16 rounded-[2.5rem] shadow-2xl text-center max-w-lg mx-auto"
                >
                  <div className="w-24 h-24 bg-gradient-to-tr from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-1 ring-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                    <CheckCircle />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">अभिनंदन!</h2>
                  <p className="text-lg text-slate-300 leading-relaxed mb-10">
                    तुमचा पेपर यशस्वीरित्या सबमिट झाला आहे. <br/>
                    {/* AI ने गुण आणि विश्लेषण तयार केले आहे. */}
                  </p>

                  <div className="flex flex-col gap-4">
                    <Link href="/assessmentReport" className="w-full">
                        <button className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-200 transition-all shadow-lg shadow-white/10">
                        माझा अहवाल पहा (View Report)
                        </button>
                    </Link>
                    <Link href="/" className="w-full">
                        <button className="w-full py-4 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold transition-all border border-slate-700 hover:bg-slate-700">
                        होम पेजवर जा
                        </button>
                    </Link>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}