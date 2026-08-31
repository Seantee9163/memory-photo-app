import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const gold = '#e8be63';
const softGold = '#fff0b0';

/**
 * The product layer is deliberately an image only. Never replace it with SVG,
 * canvas, CSS geometry, or another procedural approximation.
 */
const Product: React.FC<{frame: number}> = ({frame}) => {
  const turn = interpolate(frame, [0, 449], [-4, 5]);
  const scale = interpolate(frame, [0, 449], [0.92, 1.08], {
    easing: Easing.inOut(Easing.cubic),
  });
  const highlightX = interpolate(frame % 150, [0, 150], [-45, 145]);

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '47%',
        width: 940,
        height: 940,
        transform: `translate(-50%, -50%) rotate(${turn}deg) scale(${scale})`,
        filter: 'drop-shadow(0 42px 32px rgba(0,0,0,.62))',
      }}
    >
      <Img
        src={staticFile('product.png')}
        style={{width: '100%', height: '100%', objectFit: 'contain'}}
        alt="Real jewelry product"
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(105deg, transparent ${highlightX - 8}%, rgba(255,244,205,.42) ${highlightX}%, transparent ${highlightX + 8}%)`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
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
      <div style={{position: 'absolute', left: 72, top: 92, letterSpacing: 7, color: gold, fontSize: 18}}>AURUM · PRODUCT FILM</div>
      <div style={{position: 'absolute', left: 72, bottom: 132, opacity: firstOut * intro, transform: `translateY(${(1 - intro) * 28}px)`}}>
        <div style={{fontFamily: 'Georgia, serif', fontSize: 72, letterSpacing: 2}}>Crafted in light.</div>
        <div style={{color: '#c8bda7', marginTop: 14, fontSize: 20, letterSpacing: 5}}>TIMELESS · 18K GOLD</div>
      </div>
      <div style={{position: 'absolute', right: 70, bottom: 142, width: 600, textAlign: 'right', opacity: secondIn * (1 - finalIn)}}>
        <div style={{fontFamily: 'Georgia, serif', fontSize: 56}}>Every detail,<br />a quiet brilliance.</div>
      </div>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: `rgba(7,5,3,${finalIn * .84})`, opacity: finalIn}}>
        <div style={{fontFamily: 'Georgia, serif', fontSize: 92, letterSpacing: 11, color: softGold}}>AURUM</div>
        <div style={{fontSize: 20, letterSpacing: 8, marginTop: 18, color: '#d2bd91'}}>MADE TO ENDURE</div>
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
      <Product frame={frame} />
      <Copy frame={frame} />
      <div style={{position: 'absolute', inset: 30, border: '1px solid rgba(232,190,99,.25)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
