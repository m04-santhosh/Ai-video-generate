'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Video, Plus, LogOut, Film, Trash2, Copy, Play, 
  ExternalLink, Sparkles, Sliders, Volume2, Check, 
  Settings, User, Calendar, Clock, MonitorPlay, AlertCircle
} from 'lucide-react';
import { isSandbox } from '@/lib/supabase';
import { AVAILABLE_VOICES } from '@/lib/elevenlabs';

interface Project {
  id: string;
  title: string;
  script: string;
  videoStyle: string;
  voice: string;
  aspectRatio: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Creation Wizard Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [script, setScript] = useState('');
  const [videoStyle, setVideoStyle] = useState('Educational');
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM'); // Rachel default
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  
  // Voice preview state
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Generation loading state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationStepsText, setGenerationStepsText] = useState([
    'Analyzing script with OpenAI GPT...',
    'Generating and parsing scene breakdown...',
    'Searching Pexels/Pixabay stock database for matched visuals...',
    'Calling ElevenLabs for text-to-speech narration files...',
    'Aligning character captions and building scene sequences...',
    'Finalizing video editor timeline project...'
  ]);

  // Auth checking
  useEffect(() => {
    const storedUser = localStorage.getItem('reelai_user');
    if (!storedUser) {
      router.push('/');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  // Fetch projects
  useEffect(() => {
    if (!user) return;
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      if (isSandbox()) {
        const local = localStorage.getItem(`reelai_projects_${user.id}`);
        setProjects(local ? JSON.parse(local) : []);
      } else {
        const res = await fetch(`/api/projects?userId=${user.id}`);
        const data = await res.json();
        if (data.success) {
          setProjects(data.projects || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('reelai_user');
    router.push('/');
  };

  // Play Elevenlabs voices preview
  const handlePreviewVoice = (voiceId: string) => {
    // If already playing this voice, stop it
    if (previewAudio && playingVoiceId === voiceId) {
      previewAudio.pause();
      setPreviewAudio(null);
      setPlayingVoiceId(null);
      return;
    }

    if (previewAudio) {
      previewAudio.pause();
    }

    // ElevenLabs preview links or fallback soundhelix preview
    let audioUrl = '';
    if (voiceId === '21m00Tcm4TlvDq8ikWAM') audioUrl = 'https://api.elevenlabs.io/v1/voices/21m00Tcm4TlvDq8ikWAM/previews'; // Rachel
    else if (voiceId === 'AZnzlk1Xhg7KHkWDSpZs') audioUrl = 'https://api.elevenlabs.io/v1/voices/AZnzlk1Xhg7KHkWDSpZs/previews'; // Dom
    else if (voiceId === 'EXAVITQu4vr4xnSDxMaL') audioUrl = 'https://api.elevenlabs.io/v1/voices/EXAVITQu4vr4xnSDxMaL/previews'; // Bella
    else if (voiceId === 'pNInz6obpgq5paNs9W5y') audioUrl = 'https://api.elevenlabs.io/v1/voices/pNInz6obpgq5paNs9W5y/previews'; // Adam
    else audioUrl = 'https://api.elevenlabs.io/v1/voices/TxGEqn7nUccqthD99ox5/previews'; // Josh

    const audio = new Audio(audioUrl);
    setPreviewAudio(audio);
    setPlayingVoiceId(voiceId);

    audio.play().catch(() => {
      // If direct ElevenLabs endpoint blocks without auth, play standard test audio
      const backupAudio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      setPreviewAudio(backupAudio);
      backupAudio.play().catch(e => console.log('Audio playback blocked by browser', e));
    });

    audio.onended = () => {
      setPlayingVoiceId(null);
      setPreviewAudio(null);
    };
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !script) return;

    setIsGenerating(true);
    setGenerationStep(0);

    // Simulate progress updates for premium UX
    const interval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev < generationStepsText.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1800);

    try {
      // 1. Create project
      const createRes = await fetch('/api/project/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectName,
          script,
          videoStyle,
          voice: selectedVoice,
          aspectRatio,
          userId: user.id
        })
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.success) {
        throw new Error(createData.error || 'Project creation failed');
      }

      const project = createData.project;

      // 2. Split script into scenes with OpenAI
      const analyzeRes = await fetch('/api/script/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script })
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok || !analyzeData.success) {
        throw new Error(analyzeData.error || 'OpenAI analysis failed');
      }

      // 3. Generate media and voiceovers
      const generateRes = await fetch('/api/scenes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          scenes: analyzeData.scenes,
          voiceId: selectedVoice,
          videoStyle
        })
      });

      const generateData = await generateRes.json();
      if (!generateRes.ok || !generateData.success) {
        throw new Error(generateData.error || 'Scenes generation failed');
      }

      // If sandbox, store in local storage to keep state persistent
      if (isSandbox()) {
        const fullProject = {
          ...project,
          scenes: generateData.scenes,
          status: 'Completed'
        };
        const local = localStorage.getItem(`reelai_projects_${user.id}`);
        const currentProjects = local ? JSON.parse(local) : [];
        currentProjects.unshift(fullProject);
        localStorage.setItem(`reelai_projects_${user.id}`, JSON.stringify(currentProjects));
      }

      clearInterval(interval);
      setGenerationStep(generationStepsText.length - 1);
      
      // Short delay, then navigate
      setTimeout(() => {
        setIsGenerating(false);
        setShowCreateModal(false);
        router.push(`/editor/${project.id}`);
      }, 1000);

    } catch (err: any) {
      clearInterval(interval);
      setIsGenerating(false);
      alert(`Error creating video: ${err.message}`);
    }
  };

  const handleDuplicateProject = async (id: string) => {
    try {
      if (isSandbox()) {
        const local = localStorage.getItem(`reelai_projects_${user.id}`);
        if (!local) return;
        const current = JSON.parse(local) as any[];
        const target = current.find(p => p.id === id);
        if (!target) return;

        const duplicated = {
          ...target,
          id: crypto.randomUUID(),
          title: `${target.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        current.unshift(duplicated);
        localStorage.setItem(`reelai_projects_${user.id}`, JSON.stringify(current));
        setProjects(current);
      } else {
        // Real DB duplicate call (usually custom client logic or endpoint)
        // For simplicity, we can fetch, then create a new project
        const res = await fetch(`/api/project/${id}`);
        const data = await res.json();
        if (data.success) {
          const createRes = await fetch('/api/project/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `${data.project.title} (Copy)`,
              script: data.project.script,
              videoStyle: data.project.videoStyle,
              voice: data.project.voice,
              aspectRatio: data.project.aspectRatio,
              userId: user.id
            })
          });
          const createData = await createRes.json();
          if (createData.success) {
            // Save scenes
            await fetch('/api/scenes/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectId: createData.project.id,
                scenes: data.project.scenes,
                voiceId: data.project.voice,
                videoStyle: data.project.videoStyle
              })
            });
            fetchProjects();
          }
        }
      }
    } catch (err) {
      console.error('Failed to duplicate project', err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      if (isSandbox()) {
        const local = localStorage.getItem(`reelai_projects_${user.id}`);
        if (!local) return;
        const current = JSON.parse(local) as Project[];
        const updated = current.filter(p => p.id !== id);
        localStorage.setItem(`reelai_projects_${user.id}`, JSON.stringify(updated));
        setProjects(updated);
      } else {
        const res = await fetch(`/api/project/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchProjects();
        }
      }
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-headings font-extrabold text-xl tracking-tight text-white cursor-pointer" onClick={() => router.push('/dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Video className="w-4 h-4 text-white" />
          </div>
          Reel<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
              {user?.name?.[0] || 'U'}
            </div>
            <span className="text-slate-300 font-medium hidden sm:inline">{user?.name || 'User'}</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
              {isSandbox() ? 'Sandbox Mode' : user?.plan || 'Free'}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main dashboard content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-headings font-black tracking-tight text-white mb-1">Your Projects</h1>
            <p className="text-slate-400 text-sm">Create, edit and manage your AI video projects</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/10 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Create Video
          </button>
        </div>

        {/* Project display section */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 h-[200px] animate-pulse flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-6 w-2/3 bg-slate-800 rounded"></div>
                  <div className="h-4 w-5/6 bg-slate-800 rounded"></div>
                </div>
                <div className="h-8 w-1/3 bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div 
                key={proj.id}
                className="bg-slate-900 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {proj.title}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                      {proj.aspectRatio}
                    </span>
                  </div>
                  
                  <p className="text-slate-400 text-xs line-clamp-3 mb-4 leading-relaxed">
                    {proj.script}
                  </p>
                </div>

                <div className="border-t border-slate-950 pt-4 mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(proj.createdAt || proj.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDuplicateProject(proj.id)}
                      className="p-2 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg border border-slate-900 transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-2 bg-slate-950 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg border border-slate-900 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => router.push(`/editor/${proj.id}`)}
                      className="flex items-center gap-1 text-xs font-bold bg-indigo-650 hover:bg-indigo-600 text-white px-3.5 py-2 rounded-lg shadow-md transition-colors"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 bg-slate-900/20 border border-slate-900 border-dashed rounded-3xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-500 mb-6">
              <Film className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No videos yet</h2>
            <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
              Create your first project by pasting a script and letting the AI generate the stock visual sequences.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Create Video
            </button>
          </div>
        )}
      </main>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-headings font-black text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" /> New Video Script
            </h2>

            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Project Name</label>
                <input 
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Revolution of Healthcare AI"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-700 outline-none mt-1 transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Video Script</label>
                  <button
                    type="button"
                    onClick={() => setScript('Artificial Intelligence is helping doctors diagnose diseases faster and more accurately. By analyzing scans and clinical data, systems can pinpoint microscopic anomalies in seconds. This technology empowers hospitals, helping medical practitioners save lives.')}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider"
                  >
                    Insert Example Script
                  </button>
                </div>
                <textarea 
                  required
                  rows={5}
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Paste your video script here. We recommend 3-8 sentences. AI will automatically segment these into narrative scenes..."
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-700 outline-none mt-1 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Video Style Theme</label>
                  <select
                    value={videoStyle}
                    onChange={(e) => setVideoStyle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-300 outline-none mt-1 transition-all"
                  >
                    <option value="Corporate">Corporate / Clean</option>
                    <option value="Educational">Educational / Informative</option>
                    <option value="Marketing">Marketing / Advertisement</option>
                    <option value="Social Media">Social Media / Energetic</option>
                    <option value="Documentary">Documentary / Cinematic</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[
                      { value: '16:9', label: 'Landscape (16:9)', desc: 'YouTube, Web' },
                      { value: '9:16', label: 'Vertical (9:16)', desc: 'TikTok, Shorts' },
                      { value: '1:1', label: 'Square (1:1)', desc: 'Instagram' }
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setAspectRatio(item.value as any)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                          aspectRatio === item.value 
                            ? 'border-indigo-500 bg-indigo-500/5 text-white' 
                            : 'border-slate-850 bg-slate-950 text-slate-400 hover:border-slate-800'
                        }`}
                      >
                        <span className="text-xs font-bold">{item.value}</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Voice Selector card selection */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Elevenlabs Narration Voice</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                  {AVAILABLE_VOICES.map((v) => (
                    <div 
                      key={v.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        selectedVoice === v.id
                          ? 'border-indigo-500 bg-indigo-500/5'
                          : 'border-slate-850 bg-slate-950 hover:border-slate-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedVoice(v.id)}
                        className="flex-grow text-left flex items-center gap-2"
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedVoice === v.id ? 'border-indigo-500' : 'border-slate-600'}`}>
                          {selectedVoice === v.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                        </div>
                        <span className="text-xs font-semibold text-slate-200">{v.name}</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handlePreviewVoice(v.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          playingVoiceId === v.id 
                            ? 'bg-indigo-650 border-indigo-650 text-white animate-pulse'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/10 transition-colors flex items-center gap-2"
                >
                  Generate Video <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Processing Modal overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden text-center">
            {/* Pulsing glow background */}
            <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl animate-pulse pointer-events-none"></div>

            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
            </div>

            <h3 className="text-xl font-headings font-black text-white mb-2">Generating Video Timeline</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto mb-8">
              Please wait while our AI models and media databases segment, voice, and composite your content.
            </p>

            {/* Dynamic Step Display */}
            <div className="space-y-3.5 text-left max-w-xs mx-auto mb-8">
              {generationStepsText.slice(0, -1).map((stepText, idx) => {
                const isDone = generationStep > idx;
                const isActive = generationStep === idx;
                
                return (
                  <div key={idx} className="flex items-center gap-3 transition-opacity duration-300">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isDone 
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' 
                        : isActive 
                        ? 'border-indigo-400 bg-slate-950 animate-pulse text-indigo-400' 
                        : 'border-slate-800 text-slate-700 bg-slate-950'
                    }`}>
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : isActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      ) : null}
                    </div>
                    <span className={`text-xs font-semibold ${
                      isDone ? 'text-slate-400 line-through' : isActive ? 'text-indigo-400 font-bold' : 'text-slate-600'
                    }`}>
                      {stepText}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress indicator */}
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
                style={{ width: `${((generationStep + 1) / generationStepsText.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
