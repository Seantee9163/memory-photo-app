import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const segment = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

export const GoldJewelryVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const reveal = segment(frame, 0, 75);
  const closeIn = segment(frame, 90, 210);
  const macroIn = segment(frame, 210, 245);
  const macroOut = segment(frame, 315, 360);
  const returnHome = segment(frame, 330, 405);
  const copyIn = segment(frame, 360, 390);

  // All camera movement is applied to the single approved photograph. The
  // product itself is never reconstructed, rotated, warped, or regenerated.
  const baseScale = 1 + 0.1 * closeIn;
  const macroScale = 1 + 0.14 * macroIn * (1 - macroOut);
  const scale = (baseScale * macroScale) * (1 - returnHome) + returnHome;
  const drift = Math.sin((frame - 90) / 34) * 8 * closeIn * (1 - macroIn);
  const macroX = 24 * macroIn * (1 - macroOut);
  const macroY = -84 * macroIn * (1 - macroOut);
  const x = (drift + macroX) * (1 - returnHome);
  const y = macroY * (1 - returnHome);

  const sweepPosition = interpolate(frame, [12, 100], [-55, 155], clamp);
  const sweepOpacity = reveal * (1 - segment(frame, 90, 125));
  const vignette = interpolate(frame, [330, 420], [0.08, 0.28], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#030201', overflow: 'hidden'}}>
      <Img
        src={staticFile('gold-jewelry-approved.png')}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: reveal,
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          transformOrigin: '52% 58%',
        }}
      />

      <AbsoluteFill
        style={{
          opacity: sweepOpacity,
          mixBlendMode: 'screen',
          background: `linear-gradient(135deg, transparent ${sweepPosition - 12}%, rgba(255,224,145,0.04) ${sweepPosition - 4}%, rgba(255,240,184,0.2) ${sweepPosition}%, rgba(255,208,104,0.04) ${sweepPosition + 5}%, transparent ${sweepPosition + 13}%)`,
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 51%, transparent 38%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          bottom: 116,
          textAlign: 'center',
          color: '#f5dda1',
          opacity: copyIn,
          transform: `translateY(${(1 - copyIn) * 10}px)`,
          textShadow: '0 2px 18px rgba(0,0,0,0.95)',
          fontFamily: '"Noto Serif SC", "Songti SC", "SimSun", serif',
        }}
      >
        <div style={{fontSize: 38, fontWeight: 500, letterSpacing: 10}}>匠心成金</div>
        <div style={{fontSize: 23, letterSpacing: 4, marginTop: 18, color: '#e7d4a7'}}>
          每一道细节，都值得被看见
        </div>
      </div>
    </AbsoluteFill>
  );
};
