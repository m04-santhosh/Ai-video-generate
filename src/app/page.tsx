'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Sparkles, Wand2, Volume2, Film, Layers, Play, CheckCircle2, ChevronRight, Github } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('reelai_user');
    if (user) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSimulatedAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const mockUser = {
        id: 'mock-user-123',
        name: authType === 'signup' ? name || 'Creator' : 'Santhosh Creator',
        email: email || 'santhosh@example.com',
        plan: 'Free',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('reelai_user', JSON.stringify(mockUser));
      setIsLoading(false);
      setShowAuthModal(false);
      router.push('/dashboard');
    }, 1200);
  };

  const handleDeveloperBypass = () => {
    const mockUser = {
      id: 'dev-user-id',
      name: 'Developer Mode',
      email: 'dev@reelai.com',
      plan: 'Pro', // Sandbox Pro access
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('reelai_user', JSON.stringify(mockUser));
    router.push('/dashboard');
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden flex flex-col font-sans">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none translate-y-1/3"></div>

      {/* Header / Navbar */}
      <header className="relative w-full z-40 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-headings font-extrabold text-2xl tracking-tight text-white">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Video className="w-5 h-5 text-white" />
          </div>
          Reel<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setAuthType('login'); setShowAuthModal(true); }}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => { setAuthType('signup'); setShowAuthModal(true); }}
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/10 transition-all hover:scale-105"
          >
            Start Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-24 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-300 tracking-wide uppercase">Next-Gen Script-to-Video Engine</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-headings font-black tracking-tight text-white mb-6 leading-tight">
            Turn Words Into{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Stunning Videos
            </span>{' '}
            Instantly
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            ReelAI matches stock visuals, synchronizes human-like voiceovers, and generates subtitles automatically. Minimizes editing effort, maximizes retention.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={() => { setAuthType('signup'); setShowAuthModal(true); }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/15 transition-all hover:-translate-y-0.5"
            >
              Generate Your First Video <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDeveloperBypass}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 font-semibold px-8 py-4 rounded-2xl transition-all"
            >
              Developer Demo Bypass <Wand2 className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8 text-left">
          {[
            {
              icon: <Wand2 className="w-6 h-6 text-indigo-400" />,
              title: "AI Script Segmentation",
              desc: "Paste script text, and OpenAI automatically splits it into logical scenes with visual keyword suggestions."
            },
            {
              icon: <Volume2 className="w-6 h-6 text-purple-400" />,
              title: "ElevenLabs Speech",
              desc: "Premium voice selections output rich narration with exact timing parameters for synchronization."
            },
            {
              icon: <Layers className="w-6 h-6 text-pink-400" />,
              title: "Timeline Video Editor",
              desc: "Preview compositions live, adjust subtitle fonts, custom colors, slide/zoom transitions, and swap media files."
            }
          ].map((feat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="glass p-8 rounded-3xl relative overflow-hidden group hover:border-slate-700/80 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Pricing/SaaS section */}
        <div className="mt-32 w-full">
          <h2 className="text-3xl md:text-5xl font-headings font-black tracking-tight text-white mb-4">
            Simple Pricing for Creators
          </h2>
          <p className="text-slate-400 mb-16 max-w-xl mx-auto">
            Choose a plan that matches your production rate. Upgrade or downgrade anytime.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="glass p-8 rounded-3xl border border-slate-900 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-400 mb-2">Free Plan</h3>
                <div className="text-3xl font-black text-white mb-6">$0 <span className="text-sm font-normal text-slate-500">/mo</span></div>
                <ul className="space-y-4 text-slate-400 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> 3 generated videos / mo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> 720p render resolution</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Visible watermark</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Basic AI voices</li>
                </ul>
              </div>
              <button 
                onClick={() => { setAuthType('signup'); setShowAuthModal(true); }}
                className="mt-8 w-full py-3 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-sm font-bold text-slate-200"
              >
                Sign Up
              </button>
            </div>

            {/* Pro Plan */}
            <div className="glass p-8 rounded-3xl border-2 border-indigo-500/40 relative glow-purple flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs uppercase px-4 py-1.5 rounded-full tracking-wider">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-indigo-400 mb-2">Pro Plan</h3>
                <div className="text-3xl font-black text-white mb-6">$29 <span className="text-sm font-normal text-slate-500">/mo</span></div>
                <ul className="space-y-4 text-slate-300 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Unlimited video creation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> 1080p rendering (HD)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> No watermark</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> ElevenLabs premium voices</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Advanced transition effects</li>
                </ul>
              </div>
              <button 
                onClick={() => { setAuthType('signup'); setShowAuthModal(true); }}
                className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all text-sm font-bold text-white shadow-lg shadow-indigo-500/20"
              >
                Go Pro Now
              </button>
            </div>

            {/* Business Plan */}
            <div className="glass p-8 rounded-3xl border border-slate-900 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-400 mb-2">Business Plan</h3>
                <div className="text-3xl font-black text-white mb-6">$79 <span className="text-sm font-normal text-slate-500">/mo</span></div>
                <ul className="space-y-4 text-slate-400 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Everything in Pro</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Up to 4K resolution exports</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Team workspaces (up to 5)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Priority rendering queue</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Dedicated support</li>
                </ul>
              </div>
              <button 
                onClick={() => { setAuthType('signup'); setShowAuthModal(true); }}
                className="mt-8 w-full py-3 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-sm font-bold text-slate-200"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            ></motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl"></div>

              <div className="mb-6 text-center">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-headings font-extrabold text-white">
                  {authType === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Start generating professional AI videos
                </p>
              </div>

              <form onSubmit={handleSimulatedAuth} className="space-y-4">
                {authType === 'signup' && (
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none mt-1 transition-all"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none mt-1 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Password</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none mt-1 transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-6"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  ) : (
                    authType === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              {/* Dev Bypass */}
              <div className="relative flex py-3 items-center mt-6">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-600 text-xs font-bold uppercase tracking-wider">or test immediately</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button 
                onClick={handleDeveloperBypass}
                className="w-full py-3 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-indigo-400 font-semibold rounded-xl text-sm transition-all"
              >
                Instant Developer Login (Bypass)
              </button>

              <div className="mt-6 text-center text-xs text-slate-500">
                {authType === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button 
                      onClick={() => setAuthType('signup')}
                      className="text-indigo-400 hover:underline font-bold"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button 
                      onClick={() => setAuthType('login')}
                      className="text-indigo-400 hover:underline font-bold"
                    >
                      Log In
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 py-8 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 ReelAI. Powered by OpenAI, ElevenLabs, and Remotion.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 flex items-center gap-1">
              <Github className="w-3.5 h-3.5" /> Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
