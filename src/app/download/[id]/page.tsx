'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, Download, Link2, Monitor, Calendar, Clock,
  FileVideo, Sparkles, Check, Film
} from 'lucide-react';
import { isSandbox } from '@/lib/supabase';
import confetti from 'canvas-confetti';

type Params = Promise<{ id: string }>;

interface ExportItem {
  id: string;
  projectId: string;
  video_url: string;
  resolution: string;
  file_size?: string;
  duration?: number;
  created_at: string;
}

function DownloadContent({ params }: { params: Params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: projectId } = use(params);
  const exportId = searchParams.get('exportId');

  const [user, setUser] = useState<any>(null);
  const [projectTitle, setProjectTitle] = useState('My AI Video');
  
  // Active render details
  const [videoUrl, setVideoUrl] = useState('https://cdn.pixabay.com/video/2023/11/04/187760-880942502_large.mp4');
  const [resolution, setResolution] = useState('1920x1080');
  const [fileSize, setFileSize] = useState('28.8 MB');
  const [duration, setDuration] = useState(15.2);
  const [createdAt, setCreatedAt] = useState(new Date().toISOString());

  const [exportsList, setExportsList] = useState<ExportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load user session and fetch export
  useEffect(() => {
    const storedUser = localStorage.getItem('reelai_user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    loadExportDetails(parsedUser.id);
  }, [projectId, exportId]);

  // Throw confetti on successful render finish
  useEffect(() => {
    if (!isLoading) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });
    }
  }, [isLoading]);

  const loadExportDetails = async (userId: string) => {
    setIsLoading(true);
    try {
      if (isSandbox()) {
        // Load project info
        const localProj = localStorage.getItem(`reelai_projects_${userId}`);
        if (localProj) {
          const foundProj = JSON.parse(localProj).find((p: any) => p.id === projectId);
          if (foundProj) {
            setProjectTitle(foundProj.title);
          }
        }

        // Load export details
        const listKey = `reelai_exports_${userId}`;
        const localExports = localStorage.getItem(listKey);
        if (localExports) {
          const list = JSON.parse(localExports) as ExportItem[];
          setExportsList(list.filter(e => e.projectId === projectId || (e as any).project_id === projectId));
          
          // Select target export
          const activeExport = list.find(e => e.id === exportId) || list[0];
          if (activeExport) {
            setVideoUrl(activeExport.video_url);
            setResolution(activeExport.resolution);
            setFileSize(activeExport.file_size || '25.0 MB');
            setDuration(activeExport.duration || 15.0);
            setCreatedAt(activeExport.created_at);
          }
        }
      } else {
        // Real DB queries: Fetch project details & exports
        const projRes = await fetch(`/api/project/${projectId}`);
        const projData = await projRes.json();
        if (projData.success && projData.project) {
          setProjectTitle(projData.project.title);
          // Normally we query the exports table
          const listKey = `reelai_exports_${userId}`; // Fallback storage checks
          const local = localStorage.getItem(listKey);
          if (local) {
            const list = JSON.parse(local) as ExportItem[];
            const active = list.find(e => e.id === exportId);
            if (active) {
              setVideoUrl(active.video_url);
              setResolution(active.resolution);
              setFileSize(active.file_size || '28.8 MB');
              setDuration(active.duration || 15.0);
              setCreatedAt(active.created_at);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load export data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = () => {
    // Open the download URL directly or fetch the file to trigger download dialog
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_render.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <span className="text-sm font-semibold text-slate-400">Loading export details...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header bar */}
      <header className="border-b border-slate-900 bg-slate-950 px-6 py-4 flex items-center justify-between z-30 shrink-0 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-400">Export Completed</span>
            </div>
            <h1 className="text-base font-bold text-white leading-none mt-0.5">
              {projectTitle}
            </h1>
          </div>
        </div>

        <button 
          onClick={() => router.push('/dashboard')}
          className="text-xs font-semibold text-slate-400 hover:text-white"
        >
          Back to Dashboard
        </button>
      </header>

      {/* Main Download Grid Layout */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Video Player Display (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-850 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="aspect-video w-full rounded-2xl bg-slate-950 border border-slate-900 overflow-hidden relative shadow-inner">
              <video 
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> Success Message
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your AI Video composition was successfully rendered, synchronized, and compiled. Click the buttons on the right to download the final MP4 file or share the render result page with team members.
            </p>
          </div>
        </div>

        {/* Action Panel / Metadata (1 col) */}
        <div className="space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl"></div>
            
            <h3 className="font-headings font-extrabold text-lg text-white mb-6">Video Assets File</h3>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-850">
                <span className="text-slate-500 flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5" /> Resolution</span>
                <span className="font-semibold text-slate-350">{resolution}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-850">
                <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Duration</span>
                <span className="font-semibold text-slate-350">{duration.toFixed(1)} seconds</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-850">
                <span className="text-slate-500 flex items-center gap-1.5"><FileVideo className="w-3.5 h-3.5" /> File Size</span>
                <span className="font-semibold text-slate-350">{fileSize}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-850">
                <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Created Date</span>
                <span className="font-semibold text-slate-350">{new Date(createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white rounded-2xl shadow-lg shadow-indigo-500/10 transition-colors"
              >
                <Download className="w-4 h-4" /> Download MP4 Video
              </button>
              
              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center justify-center gap-2 py-3.5 border rounded-2xl text-xs font-bold transition-all ${
                  copiedLink 
                    ? 'bg-green-500/10 border-green-500/35 text-green-400'
                    : 'bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-300'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Link Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5" /> Copy Shareable Link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Export Renders History list */}
          {exportsList.length > 1 && (
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-indigo-400" /> Export History
              </h4>

              <div className="space-y-3">
                {exportsList.map((item, idx) => {
                  const isActive = item.id === exportId;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => {
                        if (isActive) return;
                        router.push(`/download/${projectId}?exportId=${item.id}`);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isActive 
                          ? 'border-indigo-500/50 bg-indigo-500/5 cursor-default'
                          : 'border-slate-850 hover:border-slate-800 bg-slate-950/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-350">Render #{exportsList.length - idx}</p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/15">
                        {item.resolution}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function DownloadCenter({ params }: { params: Params }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <span className="text-sm font-semibold text-slate-400">Loading export details...</span>
      </div>
    }>
      <DownloadContent params={params} />
    </Suspense>
  );
}

