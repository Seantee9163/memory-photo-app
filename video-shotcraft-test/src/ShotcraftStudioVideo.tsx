import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export type ShotcraftStyle = 'premium' | 'sales' | 'story' | 'impact';

export type ShotcraftStudioProps = {
  imageAsset: string;
  productName?: string;
  style?: ShotcraftStyle;
  copy?: string[];
};

export const defaultShotcraftStudioProps: ShotcraftStudioProps = {
  imageAsset: 'gold-jewelry-approved.png',
  productName: '916 Gold Jewelry',
  style: 'premium',
  copy: ['一眼，是黄金', '再近一点，是工艺', '光落下，细节才出现', '916黄金 · 手工质感', 'YXY Jewellery'],
};

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const profiles: Record<ShotcraftStyle, {accent: string; bg: string; contrast: string; tracking: number}> = {
  premium: {
    accent: '#f4d78b',
    bg: 'radial-gradient(circle at 50% 24%, rgba(244,215,139,.14), transparent 30%), linear-gradient(180deg,#0b0b0b,#000)',
    contrast: 'brightness(.92) contrast(1.18) saturate(1.1)',
    tracking: 8,
  },
  sales: {
    accent: '#ffd66b',
    bg: 'radial-gradient(circle at 50% 20%, rgba(255,214,107,.18), transparent 34%), linear-gradient(180deg,#111,#020202)',
    contrast: 'brightness(.98) contrast(1.22) saturate(1.2)',
    tracking: 4,
  },
  story: {
    accent: '#e9cf9a',
    bg: 'radial-gradient(circle at 34% 18%, rgba(233,207,154,.13), transparent 35%), linear-gradient(180deg,#15110b,#020202)',
    contrast: 'brightness(.84) contrast(1.12) saturate(.92) sepia(.08)',
    tracking: 5,
  },
  impact: {
    accent: '#fff0b8',
    bg: 'radial-gradient(circle at 60% 20%, rgba(255,240,184,.21), transparent 31%), linear-gradient(180deg,#080808,#000)',
    contrast: 'brightness(.92) contrast(1.38) saturate(1.24)',
    tracking: 10,
  },
};

const Scene: React.FC<{
  imageAsset: string;
  text: string;
  index: number;
  duration: number;
  style: ShotcraftStyle;
}> = ({imageAsset, text, index, duration, style}) => {
  const frame = useCurrentFrame();
  const p = profiles[style];
  const enter = interpolate(frame, [0, Math.min(18, duration * 0.18)], [0, 1], clamp);
  const leave = interpolate(frame, [Math.max(0, duration - 18), duration], [1, 0], clamp);
  const opacity = Math.min(enter, leave);
  const zoomStart = index % 2 === 0 ? 1.04 : 1.28;
  const zoomEnd = index % 2 === 0 ? 1.22 : 1.08;
  const zoom = interpolate(frame, [0, duration], [zoomStart, zoomEnd], clamp);
  const driftX = interpolate(frame, [0, duration], [index % 2 === 0 ? -28 : 34, index % 2 === 0 ? 24 : -20], clamp);
  const driftY = interpolate(frame, [0, duration], [index === 2 ? 34 : -18, index === 2 ? -28 : 22], clamp);
  const textY = interpolate(frame, [0, Math.min(28, duration * 0.28)], [32, 0], clamp);

  return (
    <AbsoluteFill style={{background: p.bg, overflow: 'hidden', opacity}}>
      <Img
        src={staticFile(imageAsset)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: index === 1 ? '46% 42%' : index === 3 ? '56% 48%' : '50% 45%',
          transform: `translate3d(${driftX}px, ${driftY}px, 0) scale(${zoom})`,
          filter: p.contrast,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,.18) 0%, transparent 30%, transparent 58%, rgba(0,0,0,.88) 100%), radial-gradient(ellipse at 50% 45%, transparent 24%, rgba(0,0,0,.2) 58%, rgba(0,0,0,.72) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 64,
          right: 64,
          bottom: index === 4 ? 190 : 150,
          color: p.accent,
          textAlign: 'center',
          fontSize: index === 4 ? 70 : 58,
          lineHeight: 1.25,
          fontWeight: 650,
          letterSpacing: p.tracking,
          opacity: interpolate(frame, [8, 28], [0, 1], clamp),
          transform: `translateY(${textY}px)`,
          textShadow: '0 4px 28px rgba(0,0,0,.95)',
          fontFamily: '"Noto Serif SC", "Songti SC", "SimSun", serif',
        }}
      >
        {text}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 70,
          textAlign: 'center',
          color: 'rgba(255,255,255,.56)',
          fontSize: 20,
          letterSpacing: 5,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        YXY JEWELLERY · VIDEO SHOTCRAFT
      </div>
    </AbsoluteFill>
  );
};

export const ShotcraftStudioVideo: React.FC<ShotcraftStudioProps> = ({
  imageAsset,
  productName = '916 Gold Jewelry',
  style = 'premium',
  copy = [],
}) => {
  const {durationInFrames} = useVideoConfig();
  const fallback = [
    productName,
    '细节，近看才真正出现',
    '光影移动，工艺留下',
    '916黄金 · 手工质感',
    'YXY Jewellery',
  ];
  const lines = Array.from({length: 5}, (_, i) => copy[i] || fallback[i]);
  const base = Math.floor(durationInFrames / 5);
  const starts = [0, base, base * 2, base * 3, base * 4];
  const durations = [base, base, base, base, durationInFrames - base * 4];

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {starts.map((from, index) => (
        <Sequence key={index} from={from} durationInFrames={durations[index]}>
          <Scene
            imageAsset={imageAsset}
            text={lines[index]}
            index={index}
            duration={durations[index]}
            style={style}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
