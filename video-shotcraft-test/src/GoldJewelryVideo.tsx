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

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const tween = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

const fade = (frame: number, duration: number, edge = 12) => {
  const fadeIn = interpolate(frame, [0, edge], [0, 1], clamp);
  const fadeOut = interpolate(frame, [duration - edge, duration], [1, 0], clamp);
  return Math.min(fadeIn, fadeOut);
};

const GoldAtmosphere: React.FC<{strength?: number}> = ({strength = 1}) => (
  <>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 18% 18%, rgba(255,188,64,.22), transparent 26%), radial-gradient(circle at 82% 76%, rgba(204,118,20,.16), transparent 30%), linear-gradient(180deg, rgba(8,4,1,.08), rgba(0,0,0,.62))',
        mixBlendMode: 'screen',
        opacity: 0.5 * strength,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at 50% 48%, transparent 34%, rgba(0,0,0,.2) 62%, rgba(0,0,0,.72) 100%)',
        opacity: 0.92,
      }}
    />
  </>
);

const HeroScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, duration, 14);
  const zoom = interpolate(frame, [0, duration], [1.08, 1], clamp);
  const reveal = tween(frame, 0, 30);

  return (
    <AbsoluteFill style={{backgroundColor: '#030201', opacity}}>
      <Img
        src={staticFile('gold-jewelry-approved.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${zoom})`,
          filter: `brightness(${0.58 + reveal * 0.42}) contrast(1.06) saturate(1.08)`,
        }}
      />
      <GoldAtmosphere strength={0.9} />
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 88,
          color: '#e9c56d',
          fontSize: 18,
          letterSpacing: 8,
          opacity: tween(frame, 18, 44) * 0.9,
        }}
      >
        916 GOLD · CRAFT IN MOTION
      </div>
    </AbsoluteFill>
  );
};

const MacroScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, duration, 12);
  const scale = interpolate(frame, [0, duration], [1.28, 1.42], clamp);
  const x = interpolate(frame, [0, duration], [-20, -66], clamp);
  const y = interpolate(frame, [0, duration], [46, 6], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#050301', opacity}}>
      <Img
        src={staticFile('gold-jewelry-approved.png')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          transformOrigin: '50% 47%',
          filter: 'brightness(.88) contrast(1.12) saturate(1.12)',
        }}
      />
      <GoldAtmosphere strength={0.65} />
      <div
        style={{
          position: 'absolute',
          left: 76,
          bottom: 114,
          color: '#f3dc9e',
          fontSize: 30,
          letterSpacing: 7,
          textShadow: '0 2px 16px #000',
          opacity: tween(frame, 18, 44),
        }}
      >
        纹理，不只是装饰
      </div>
    </AbsoluteFill>
  );
};

const RotationScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, duration, 10);
  const accent = tween(frame, 12, 36);

  return (
    <AbsoluteFill style={{backgroundColor: '#020100', opacity, overflow: 'hidden'}}>
      <OffthreadVideo
        src={staticFile('turning-cylinder-demo.mp4')}
        trimBefore={210}
        trimAfter={315}
        playbackRate={0.9}
        volume={0.12}
        style={{
          position: 'absolute',
          inset: -60,
          width: 'calc(100% + 120px)',
          height: 'calc(100% + 120px)',
          objectFit: 'cover',
          filter: 'blur(28px) brightness(.24) saturate(1.35) sepia(.35)',
          transform: 'scale(1.18)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 64,
          right: 64,
          top: 126,
          bottom: 152,
          borderRadius: 34,
          overflow: 'hidden',
          border: '1px solid rgba(238,190,84,.45)',
          boxShadow: '0 28px 90px rgba(0,0,0,.72), inset 0 0 40px rgba(255,190,80,.08)',
          backgroundColor: '#080401',
        }}
      >
        <OffthreadVideo
          src={staticFile('turning-cylinder-demo.mp4')}
          trimBefore={210}
          trimAfter={315}
          playbackRate={0.9}
          volume={0.06}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(.78) contrast(1.16) saturate(1.22) sepia(.18)',
          }}
        />
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,.18), transparent 28%, transparent 70%, rgba(0,0,0,.46)), radial-gradient(circle at 70% 30%, rgba(255,184,60,.14), transparent 34%)',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 86,
          top: 92,
          color: '#e9c56d',
          fontSize: 17,
          letterSpacing: 7,
          opacity: accent,
        }}
      >
        REAL MECHANICAL MOTION
      </div>
      <div
        style={{
          position: 'absolute',
          left: 86,
          bottom: 88,
          color: '#f5dda1',
          fontSize: 34,
          letterSpacing: 8,
          textShadow: '0 2px 18px rgba(0,0,0,.95)',
          opacity: accent,
        }}
      >
        一甩，即转
      </div>
    </AbsoluteFill>
  );
};

const DetailScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, duration, 10);
  const scale = interpolate(frame, [0, duration], [1.5, 1.36], clamp);
  const x = interpolate(frame, [0, duration], [120, 46], clamp);
  const y = interpolate(frame, [0, duration], [-16, 18], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#030201', opacity}}>
      <Img
        src={staticFile('gold-jewelry-approved.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          transformOrigin: '58% 58%',
          filter: 'brightness(.78) contrast(1.16) saturate(1.16)',
        }}
      />
      <GoldAtmosphere strength={0.82} />
      <div
        style={{
          position: 'absolute',
          right: 72,
          top: 112,
          width: 360,
          textAlign: 'right',
          color: '#edd08a',
          opacity: tween(frame, 12, 36),
        }}
      >
        <div style={{fontSize: 20, letterSpacing: 5}}>活动结构</div>
        <div style={{fontSize: 42, letterSpacing: 5, marginTop: 10, color: '#fff0bd'}}>细节会动</div>
      </div>
    </AbsoluteFill>
  );
};

const EndScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const imageIn = tween(frame, 0, 26);
  const copyIn = tween(frame, 24, 54);
  const zoom = interpolate(frame, [0, duration], [1.03, 1], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#020100'}}>
      <Img
        src={staticFile('gold-jewelry-approved.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: imageIn,
          transform: `scale(${zoom})`,
          filter: 'brightness(.58) contrast(1.09) saturate(1.08)',
        }}
      />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.02), rgba(0,0,0,.58))'}} />
      <GoldAtmosphere strength={0.55} />
      <div
        style={{
          position: 'absolute',
          left: 88,
          right: 88,
          bottom: 122,
          textAlign: 'center',
          color: '#f5dda1',
          opacity: copyIn,
          transform: `translateY(${(1 - copyIn) * 12}px)`,
          textShadow: '0 2px 20px rgba(0,0,0,.95)',
          fontFamily: '"Noto Serif SC", "Songti SC", "SimSun", serif',
        }}
      >
        <div style={{fontSize: 44, fontWeight: 500, letterSpacing: 11}}>匠心成金</div>
        <div style={{fontSize: 23, letterSpacing: 4, marginTop: 18, color: '#e7d4a7'}}>
          转动之间，见工艺
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const GoldJewelryVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#020100', overflow: 'hidden'}}>
      <Html5Audio src={staticFile('jewelry-ambient.wav')} volume={0.8} />

      <Sequence from={0} durationInFrames={90}>
        <HeroScene duration={90} />
      </Sequence>
      <Sequence from={78} durationInFrames={102}>
        <MacroScene duration={102} />
      </Sequence>
      <Sequence from={168} durationInFrames={117}>
        <RotationScene duration={117} />
      </Sequence>
      <Sequence from={273} durationInFrames={87}>
        <DetailScene duration={87} />
      </Sequence>
      <Sequence from={348} durationInFrames={102}>
        <EndScene duration={102} />
      </Sequence>
    </AbsoluteFill>
  );
};
