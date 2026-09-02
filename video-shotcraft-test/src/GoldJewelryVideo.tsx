import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = (frame: number, input: [number, number], output: [number, number]) =>
  interpolate(frame, input, output, {...clamp, easing: Easing.inOut(Easing.cubic)});

const sceneOpacity = (frame: number, duration: number, fadeIn = 8, fadeOut = 8) =>
  Math.min(ease(frame, [0, fadeIn], [0, 1]), ease(frame, [duration - fadeOut, duration], [1, 0]));

const Atmosphere: React.FC<{sweep?: number; glow?: number}> = ({sweep = -400, glow = 0.14}) => (
  <>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 48% 38% at 50% 45%, rgba(139,82,22,${glow}), rgba(24,13,5,.08) 55%, transparent 76%)`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: -180,
        bottom: -180,
        left: sweep,
        width: 150,
        transform: 'rotate(9deg)',
        background: 'linear-gradient(90deg, transparent, rgba(255,225,157,.14), transparent)',
        filter: 'blur(22px)',
        mixBlendMode: 'screen',
      }}
    />
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse 76% 62% at 50% 46%, transparent 35%, rgba(0,0,0,.42) 72%, #000 100%), linear-gradient(180deg, rgba(0,0,0,.18), transparent 28%, transparent 68%, rgba(0,0,0,.72))',
      }}
    />
  </>
);

const Copy: React.FC<{children: React.ReactNode; opacity: number; kicker?: string}> = ({children, opacity, kicker}) => (
  <div
    style={{
      position: 'absolute',
      left: 70,
      right: 70,
      bottom: 108,
      textAlign: 'center',
      opacity,
      transform: `translateY(${(1 - opacity) * 10}px)`,
      fontFamily: '"Noto Serif SC", "Songti SC", "SimSun", serif',
      textShadow: '0 4px 26px #000',
    }}
  >
    {kicker ? <div style={{fontSize: 18, letterSpacing: 7, color: '#a88750', marginBottom: 15}}>{kicker}</div> : null}
    <div style={{fontSize: 54, fontWeight: 600, letterSpacing: 9, color: '#efd28a'}}>{children}</div>
  </div>
);

const StillScene: React.FC<{
  duration: number;
  startScale: number;
  endScale: number;
  startX?: number;
  endX?: number;
  startY?: number;
  endY?: number;
  origin?: string;
  copy: string;
  captionAt?: number;
  brightness?: number;
}> = ({duration, startScale, endScale, startX = 0, endX = 0, startY = 0, endY = 0, origin = '50% 49%', copy, captionAt = 14, brightness = 0.8}) => {
  const frame = useCurrentFrame();
  const progress = ease(frame, [0, duration], [0, 1]);
  const breathe = Math.sin((frame / duration) * Math.PI) * 0.006;
  const sweep = ease(frame, [duration * 0.18, duration * 0.78], [-260, 1190]);

  return (
    <AbsoluteFill style={{backgroundColor: '#020201', opacity: sceneOpacity(frame, duration), overflow: 'hidden'}}>
      <Img
        src={staticFile('gold-jewelry-approved.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transformOrigin: origin,
          transform: `translate3d(${startX + (endX - startX) * progress}px, ${startY + (endY - startY) * progress}px, 0) scale(${startScale + (endScale - startScale) * progress + breathe})`,
          filter: `brightness(${brightness}) contrast(1.28) saturate(.9) sepia(.06)`,
        }}
      />
      <Atmosphere sweep={sweep} />
      <Copy opacity={ease(frame, [captionAt, captionAt + 20], [0, 1])}>{copy}</Copy>
    </AbsoluteFill>
  );
};

const RotationScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const phase = ease(frame, [0, duration], [0, 1]);
  const settle = ease(frame, [duration - 24, duration], [0, 1]);
  const sweep = ease(frame, [18, duration - 18], [-220, 1160]);

  return (
    <AbsoluteFill style={{backgroundColor: '#010100', opacity: sceneOpacity(frame, duration, 6, 10), overflow: 'hidden'}}>
      <OffthreadVideo
        src={staticFile('turning-cylinder-demo.mp4')}
        trimBefore={150}
        trimAfter={294}
        playbackRate={1.02}
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '69% 28%',
          transformOrigin: '69% 28%',
          transform: `translate3d(${16 - phase * 24}px, ${12 - phase * 18 + settle * 4}px, 0) scale(${2.5 + Math.sin(phase * Math.PI) * 0.035})`,
          filter: 'brightness(.5) contrast(1.52) saturate(.88) sepia(.14)',
        }}
      />
      <Atmosphere sweep={sweep} glow={0.1} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 67% 28%, rgba(255,211,120,.17), transparent 15%)', mixBlendMode: 'screen'}} />
      <Copy opacity={ease(frame, [15, 34], [0, 1])} kicker="MECHANICAL MOTION">一甩，即转</Copy>
    </AbsoluteFill>
  );
};

const EndScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const inValue = ease(frame, [0, 20], [0, 1]);
  const scale = ease(frame, [0, duration], [1.1, 1.04]);
  const sweep = ease(frame, [12, 65], [-250, 1180]);
  return (
    <AbsoluteFill style={{backgroundColor: '#010100', overflow: 'hidden'}}>
      <Img
        src={staticFile('gold-jewelry-approved.png')}
        style={{width: '100%', height: '100%', objectFit: 'cover', opacity: inValue, transform: `scale(${scale})`, filter: 'brightness(.72) contrast(1.3) saturate(.88) sepia(.05)'}}
      />
      <Atmosphere sweep={sweep} glow={0.12} />
      <div style={{position: 'absolute', left: 60, right: 60, bottom: 102, opacity: inValue, textAlign: 'center', fontFamily: '"Noto Serif SC", "Songti SC", serif', textShadow: '0 4px 30px #000'}}>
        <div style={{fontSize: 57, color: '#efd28a', fontWeight: 600, letterSpacing: 8}}>黄金，也可以有机械感</div>
        <div style={{height: 1, width: 110, margin: '24px auto 20px', background: 'linear-gradient(90deg, transparent, #b9914b, transparent)'}} />
        <div style={{fontSize: 22, letterSpacing: 8, color: '#b69a67'}}>SEAN · GOLD JEWELRY</div>
      </div>
    </AbsoluteFill>
  );
};

export const GoldJewelryVideo: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
    <Html5Audio src={staticFile('jewelry-ambient-v2.wav')} volume={0.48} />
    <Sequence from={0} durationInFrames={60}>
      <StillScene duration={60} startScale={1.08} endScale={1.13} startY={18} endY={-5} copy="细节，自会说话" brightness={0.76} />
    </Sequence>
    <Sequence from={60} durationInFrames={90}>
      <StillScene duration={90} startScale={1.38} endScale={1.48} startX={-22} endX={-42} startY={72} endY={40} origin="49% 49%" copy="机械旋转结构" brightness={0.79} />
    </Sequence>
    <Sequence from={150} durationInFrames={120}>
      <RotationScene duration={120} />
    </Sequence>
    <Sequence from={270} durationInFrames={90}>
      <StillScene duration={90} startScale={1.72} endScale={1.64} startX={116} endX={88} startY={46} endY={70} origin="57% 56%" copy="细节，自会说话" brightness={0.78} />
    </Sequence>
    <Sequence from={360} durationInFrames={90}>
      <EndScene duration={90} />
    </Sequence>
  </AbsoluteFill>
);
