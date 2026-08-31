import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const gold = '#e8be63';
const softGold = '#fff0b0';

const Jewelry: React.FC<{frame: number}> = ({frame}) => {
  const turn = interpolate(frame, [0, 449], [-9, 14]);
  const breathe = 1 + Math.sin(frame / 32) * 0.018;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '48%',
        width: 430,
        height: 430,
        transform: `translate(-50%, -50%) rotate(${turn}deg) scale(${breathe})`,
        filter: 'drop-shadow(0 34px 24px rgba(0,0,0,.62))',
      }}
    >
      <svg viewBox="0 0 430 430" width="100%" height="100%" aria-label="Procedural gold necklace">
        <defs>
          <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c4811" />
            <stop offset=".22" stopColor="#ffe88f" />
            <stop offset=".48" stopColor="#b46b16" />
            <stop offset=".7" stopColor="#fff4b6" />
            <stop offset="1" stopColor="#8b5010" />
          </linearGradient>
          <radialGradient id="gem">
            <stop offset="0" stopColor="#fff" />
            <stop offset=".24" stopColor="#fef5ce" />
            <stop offset=".55" stopColor="#deb04c" />
            <stop offset="1" stopColor="#70400b" />
          </radialGradient>
        </defs>
        <ellipse cx="215" cy="192" rx="151" ry="170" fill="none" stroke="url(#metal)" strokeWidth="11" />
        {Array.from({length: 22}, (_, i) => {
          const angle = (Math.PI * (i + 1)) / 23;
          const x = 215 - Math.cos(angle) * 151;
          const y = 190 + Math.sin(angle) * 170;
          return <circle key={i} cx={x} cy={y} r="7" fill="url(#gem)" />;
        })}
        <path d="M215 356 C185 324 170 355 215 404 C260 355 245 324 215 356Z" fill="url(#metal)" stroke="#ffe79a" strokeWidth="3" />
        <circle cx="215" cy="370" r="16" fill="url(#gem)" />
      </svg>
    </div>
  );
};

const Copy: React.FC<{frame: number}> = ({frame}) => {
  const firstOut = interpolate(frame, [185, 220], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const secondIn = interpolate(frame, [215, 250], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const finalIn = interpolate(frame, [355, 395], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const intro = spring({frame, fps: 30, config: {damping: 18}});

  return (
    <>
      <div style={{position: 'absolute', left: 72, top: 70, letterSpacing: 7, color: gold, fontSize: 18}}>
        AURUM · TEST FILM
      </div>
      <div style={{position: 'absolute', left: 72, bottom: 86, opacity: firstOut * intro, transform: `translateY(${(1 - intro) * 28}px)`}}>
        <div style={{fontFamily: 'Georgia, serif', fontSize: 63, letterSpacing: 2}}>Crafted in light.</div>
        <div style={{color: '#c8bda7', marginTop: 14, fontSize: 20, letterSpacing: 5}}>TIMELESS  ·  18K GOLD</div>
      </div>
      <div style={{position: 'absolute', right: 70, bottom: 92, width: 390, textAlign: 'right', opacity: secondIn * (1 - finalIn)}}>
        <div style={{fontFamily: 'Georgia, serif', fontSize: 48}}>Every detail,<br />a quiet brilliance.</div>
      </div>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: `rgba(7,5,3,${finalIn * .78})`, opacity: finalIn}}>
        <div style={{fontFamily: 'Georgia, serif', fontSize: 78, letterSpacing: 11, color: softGold}}>AURUM</div>
        <div style={{fontSize: 18, letterSpacing: 8, marginTop: 18, color: '#d2bd91'}}>MADE TO ENDURE</div>
      </div>
    </>
  );
};

export const GoldJewelryVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const sweep = interpolate(frame % 150, [0, 150], [-30, 130], {easing: Easing.inOut(Easing.cubic)});
  const fade = interpolate(frame, [durationInFrames - 18, durationInFrames - 1], [1, 0], {extrapolateLeft: 'clamp'});

  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 52% 44%, #382916 0%, #120e09 42%, #050403 78%)', color: '#f7f0df', fontFamily: 'Arial, sans-serif', overflow: 'hidden', opacity: fade}}>
      <div style={{position: 'absolute', inset: -300, background: `linear-gradient(${sweep}deg, transparent 43%, rgba(255,225,157,.11) 49%, transparent 55%)`}} />
      <div style={{position: 'absolute', left: '50%', top: '48%', width: 390, height: 120, transform: 'translate(-50%, 105%)', background: 'rgba(209,158,73,.18)', filter: 'blur(42px)', borderRadius: '50%'}} />
      <Jewelry frame={frame} />
      <Copy frame={frame} />
      <div style={{position: 'absolute', inset: 26, border: '1px solid rgba(232,190,99,.25)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
