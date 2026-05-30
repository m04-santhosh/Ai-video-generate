import { AbsoluteFill, Video, Audio, Img, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';
import React from 'react';

export interface Subtitle {
  start: number;
  end: number;
  text: string;
}

export interface Scene {
  sceneNumber: number;
  title: string;
  narration: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  thumbnail?: string;
  audioUrl: string;
  duration: number;
  subtitles: Subtitle[];
}

export interface SubtitleStyle {
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  position: 'top' | 'middle' | 'bottom';
  showWatermark: boolean;
}

export interface RemotionCompositionProps {
  scenes: Scene[];
  aspectRatio: '16:9' | '9:16' | '1:1';
  subtitleStyle: SubtitleStyle;
  transitionType: 'Fade' | 'Slide' | 'Zoom';
}

export const MainVideo: React.FC<RemotionCompositionProps> = ({
  scenes = [],
  aspectRatio = '16:9',
  subtitleStyle = {
    fontSize: 24,
    fontFamily: 'Inter',
    textColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    position: 'bottom',
    showWatermark: true
  },
  transitionType = 'Fade'
}) => {
  const { fps } = useVideoConfig();

  // If no scenes are loaded, render a loading screen
  if (!scenes || scenes.length === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'white', fontFamily: 'sans-serif', fontSize: 24 }}>
          No scenes loaded...
        </div>
      </AbsoluteFill>
    );
  }

  // Calculate cumulative start times for each scene in frames
  let accumulatedFrames = 0;
  const scenesWithTiming = scenes.map((scene) => {
    const startFrame = accumulatedFrames;
    const durationFrames = Math.ceil((scene.duration || 5.0) * fps);
    accumulatedFrames += durationFrames;
    return {
      ...scene,
      startFrame,
      durationFrames
    };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#020617', overflow: 'hidden' }}>
      {scenesWithTiming.map((scene, idx) => {
        return (
          <Sequence
            key={scene.sceneNumber + '-' + idx}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames}
          >
            <ScenePlayer
              scene={scene}
              subtitleStyle={subtitleStyle}
              transitionType={transitionType}
              aspectRatio={aspectRatio}
            />
          </Sequence>
        );
      })}

      {/* Watermark overlay */}
      {subtitleStyle.showWatermark && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            color: 'rgba(255, 255, 255, 0.7)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontFamily: subtitleStyle.fontFamily || 'sans-serif',
            fontSize: '14px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            pointerEvents: 'none',
            zIndex: 100
          }}
        >
          AI VIDEO GEN
        </div>
      )}
    </AbsoluteFill>
  );
};

const ScenePlayer: React.FC<{
  scene: Scene & { durationFrames: number };
  subtitleStyle: SubtitleStyle;
  transitionType: 'Fade' | 'Slide' | 'Zoom';
  aspectRatio: string;
}> = ({ scene, subtitleStyle, transitionType, aspectRatio }) => {
  const frame = useCurrentFrame();
  const { durationFrames } = scene;
  const { fps } = useVideoConfig();

  // 1. Transition effect calculation
  // Apply visual transitions at the start and end of the scene
  const transitionDuration = 12; // 12 frames ~ 0.4s
  let style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute'
  };

  if (transitionType === 'Fade') {
    let opacity = 1;
    if (frame < transitionDuration) {
      opacity = frame / transitionDuration;
    } else if (frame > durationFrames - transitionDuration) {
      opacity = (durationFrames - frame) / transitionDuration;
    }
    style.opacity = opacity;
  } else if (transitionType === 'Slide') {
    let translateX = 0;
    if (frame < transitionDuration) {
      translateX = 100 * (1 - frame / transitionDuration); // slides in from right
    } else if (frame > durationFrames - transitionDuration) {
      translateX = -100 * (1 - (durationFrames - frame) / transitionDuration); // slides out to left
    }
    style.transform = `translateX(${translateX}%)`;
  } else if (transitionType === 'Zoom') {
    let scale = 1.0;
    if (frame < transitionDuration) {
      scale = 0.85 + 0.15 * (frame / transitionDuration); // zooms in from small
    } else {
      // Gentle continuous zoom out (Ken Burns effect) for premium feel
      const progress = frame / durationFrames;
      scale = 1.0 + progress * 0.08;
    }
    style.transform = `scale(${scale})`;
  }

  // 2. Find active subtitle text for current frame
  const currentTime = frame / fps;
  const activeSubtitle = scene.subtitles.find(
    (sub) => currentTime >= sub.start && currentTime <= sub.end
  );

  // Position style mapping
  const positionStyles: Record<string, React.CSSProperties> = {
    top: { top: '10%', bottom: 'auto' },
    middle: { top: '50%', transform: 'translateY(-50%)', bottom: 'auto' },
    bottom: { bottom: '10%', top: 'auto' }
  };

  return (
    <AbsoluteFill style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* Background Visual Media */}
      {scene.mediaUrl && (
        scene.mediaType === 'video' ? (
          <Video
            src={scene.mediaUrl}
            volume={0}
            style={style}
            startFrom={0}
            disablePictureInPicture
          />
        ) : (
          <Img src={scene.mediaUrl} style={style} />
        )
      )}

      {/* Voiceover audio */}
      {scene.audioUrl && (
        <Audio src={scene.audioUrl} />
      )}

      {/* Subtitles Overlay */}
      {activeSubtitle && (
        <div
          style={{
            position: 'absolute',
            left: '10%',
            right: '10%',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 50,
            pointerEvents: 'none',
            ...positionStyles[subtitleStyle.position || 'bottom']
          }}
        >
          <span
            style={{
              fontFamily: subtitleStyle.fontFamily || 'Inter, sans-serif',
              fontSize: `${subtitleStyle.fontSize || 24}px`,
              color: subtitleStyle.textColor || '#ffffff',
              backgroundColor: subtitleStyle.backgroundColor || 'rgba(0, 0, 0, 0.6)',
              padding: '8px 16px',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
              lineHeight: 1.4,
              wordBreak: 'break-word',
              // Dynamic subtitle micro-bounce animation on update
              animation: 'sub-bounce 0.15s ease-out'
            }}
          >
            {activeSubtitle.text}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};
