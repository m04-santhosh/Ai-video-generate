import { Player, PlayerRef } from '@remotion/player';
import React, { useEffect, useRef } from 'react';
import { MainVideo, Scene, SubtitleStyle } from './RemotionComposition';

interface RemotionVideoPlayerProps {
  scenes: Scene[];
  aspectRatio: '16:9' | '9:16' | '1:1';
  subtitleStyle: SubtitleStyle;
  transitionType: 'Fade' | 'Slide' | 'Zoom';
  currentSceneIdx: number;
}

export const RemotionVideoPlayer: React.FC<RemotionVideoPlayerProps> = ({
  scenes = [],
  aspectRatio = '16:9',
  subtitleStyle,
  transitionType = 'Fade',
  currentSceneIdx = 0
}) => {
  const playerRef = useRef<PlayerRef>(null);
  const fps = 30;

  // Calculate dimensions based on aspect ratio
  let width = 1280;
  let height = 720;

  if (aspectRatio === '9:16') {
    width = 720;
    height = 1280;
  } else if (aspectRatio === '1:1') {
    width = 1080;
    height = 1080;
  }

  // Calculate total duration in frames
  const totalDurationSeconds = scenes.reduce((sum, scene) => sum + (scene.duration || 5.0), 0);
  const durationInFrames = Math.max(30, Math.ceil(totalDurationSeconds * fps));

  // Listen for scene focus changes and seek player to the selected scene's start time
  useEffect(() => {
    if (!playerRef.current || scenes.length === 0) return;

    let startSeconds = 0;
    for (let i = 0; i < currentSceneIdx; i++) {
      startSeconds += scenes[i].duration || 5.0;
    }

    const targetFrame = Math.ceil(startSeconds * fps);
    
    // Pause player first and seek to frame
    if (playerRef.current.isPlaying()) {
      playerRef.current.pause();
    }
    playerRef.current.seekTo(targetFrame);
  }, [currentSceneIdx, scenes]);

  return (
    <div className="relative w-full h-full min-h-[350px] flex items-center justify-center bg-slate-950/50 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl backdrop-blur-md p-4">
      {scenes.length > 0 ? (
        <div 
          className="relative max-w-full max-h-[500px] shadow-2xl border border-slate-700/50 rounded-xl overflow-hidden"
          style={{
            aspectRatio: aspectRatio === '16:9' ? '16/9' : aspectRatio === '9:16' ? '9/16' : '1/1',
            height: '100%',
            maxHeight: '480px'
          }}
        >
          <Player
            ref={playerRef}
            component={MainVideo}
            durationInFrames={durationInFrames}
            fps={fps}
            compositionWidth={width}
            compositionHeight={height}
            style={{
              width: '100%',
              height: '100%'
            }}
            controls
            loop
            inputProps={{
              scenes,
              aspectRatio,
              subtitleStyle,
              transitionType
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-12 h-12 rounded-full border border-dashed border-slate-700 flex items-center justify-center animate-spin">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          </div>
          <span className="text-sm font-medium">Timeline player initializing...</span>
        </div>
      )}
    </div>
  );
};
