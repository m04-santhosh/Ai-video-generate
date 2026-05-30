import { registerRoot, Composition } from 'remotion';
import { MainVideo } from './RemotionComposition';
import React from 'react';

export const RemotionVideoRoot: React.FC = () => {
  return React.createElement(Composition, {
    id: "MainVideo",
    component: MainVideo as any,
    durationInFrames: 300,
    fps: 30,
    width: 1920,
    height: 1080,
    defaultProps: {
      scenes: [],
      aspectRatio: '16:9' as const,
      subtitleStyle: {
        fontSize: 24,
        fontFamily: 'Inter',
        textColor: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        position: 'bottom' as const,
        showWatermark: true
      },
      transitionType: 'Fade' as const
    }
  });
};

registerRoot(RemotionVideoRoot);
