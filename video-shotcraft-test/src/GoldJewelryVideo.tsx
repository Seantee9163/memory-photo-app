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

export type GoldJewelryProps = {
  productId: string;
  productName: string;
  productCategory: string;
  media: {image: string; video: string};
  coreSellingPoints: [string, string];
  subtitles: [string, string, string, string, string, string];
  shotConfig: {
    heroZoom: [number, number];
    macroScale: [number, number];
    rotationCrop: string;
    accentColor: string;
    videoTrim: [number, number];
  };
};

export const defaultGoldJewelryProps: GoldJewelryProps = {
  productId: 'studio-preview',
  productName: '916 Gold Prayer Wheel',
  productCategory: 'Spinning gold pendant',
  media: {image: 'gold-jewelry-approved.png', video: 'turning-cylinder-demo.mp4'},
  coreSellingPoints: ['Hand-finished texture', 'Freely rotating centerpiece'],
  subtitles: ['916黄金 · 转经筒', '纹理，不只是装饰', '一甩，即转', '活动结构 · 真实可转', '匠心成金', '转动之间，见工艺'],
  shotConfig: {heroZoom: [1.14, 1.04], macroScale: [1.72, 1.92], rotationCrop: '70% 27%', accentColor: '#f4d78b', videoTrim: [210, 315]},
};

const tween = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

const fade = (frame: number, duration: number, edge = 10) => {
  const fadeIn = interpolate(frame, [0, edge], [0, 1], clamp);
  const fadeOut = interpolate(frame, [duration - edge, duration], [1, 0], clamp);
  return Math.min(fadeIn, fadeOut);
};

const Spotlight: React.FC<{strength?: number}> = ({strength = 1}) => (
  <>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at 50% 43%, rgba(255,196,92,.18), transparent 24%), radial-gradient(ellipse at 50% 48%, transparent 24%, rgba(0,0,0,.42) 58%, rgba(0,0,0,.94) 100%)',
        opacity: strength,
      }}
    />
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,.12), transparent 32%, transparent 67%, rgba(0,0,0,.78))',
      }}
    />
  </>
);

const BigCopy: React.FC<{children: React.ReactNode; opacity: number; bottom?: number; color: string}> = ({children, opacity, bottom = 108, color}) => (
  <div
    style={{
      position: 'absolute',
      left: 64,
      right: 64,
      bottom,
      textAlign: 'center',
      color,
      fontSize: 62,
      fontWeight: 600,
      letterSpacing: 8,
      lineHeight: 1.22,
      opacity,
      textShadow: '0 4px 28px rgba(0,0,0,.98)',
      fontFamily: '"Noto Serif SC", "Songti SC", "SimSun", serif',
    }}
  >
    {children}
  </div>
);

const HeroScene: React.FC<{duration: number; props: GoldJewelryProps}> = ({duration, props}) => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, duration, 12);
  const zoom = interpolate(frame, [0, duration], props.shotConfig.heroZoom, clamp);
  const reveal = tween(frame, 0, 28);

  return (
    <AbsoluteFill style={{backgroundColor: '#000', opacity}}>
      <Img
        src={staticFile(props.media.image)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${zoom})`,
          filter: `brightness(${0.48 + reveal * 0.5}) contrast(1.14) saturate(1.12)`,
        }}
      />
      <Spotlight strength={0.96} />
      <BigCopy color={props.shotConfig.accentColor} opacity={tween(frame, 24, 48)}>{props.subtitles[0]}</BigCopy>
    </AbsoluteFill>
  );
};

const MacroScene: React.FC<{duration: number; props: GoldJewelryProps}> = ({duration, props}) => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, duration, 10);
  const scale = interpolate(frame, [0, duration], props.shotConfig.macroScale, clamp);
  const x = interpolate(frame, [0, duration], [-30, -74], clamp);
  const y = interpolate(frame, [0, duration], [124, 72], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#000', opacity}}>
      <Img
        src={staticFile(props.media.image)}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          transformOrigin: '50% 46%',
          filter: 'brightness(.94) contrast(1.18) saturate(1.14)',
        }}
      />
      <Spotlight strength={0.88} />
      <BigCopy color={props.shotConfig.accentColor} opacity={tween(frame, 18, 42)} bottom={96}>{props.subtitles[1]}</BigCopy>
    </AbsoluteFill>
  );
};

const RotationScene: React.FC<{duration: number; props: GoldJewelryProps}> = ({duration, props}) => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, duration, 8);
  const copy = tween(frame, 10, 30);
  const zoom = interpolate(frame, [0, duration], [2.42, 2.62], clamp);
  const driftX = interpolate(frame, [0, duration], [18, -18], clamp);
  const driftY = interpolate(frame, [0, duration], [10, -12], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#000', opacity, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 20,
          height: 1370,
          overflow: 'hidden',
          background: '#000',
          WebkitMaskImage: 'radial-gradient(ellipse 64% 57% at 64% 32%, #000 42%, rgba(0,0,0,.96) 57%, transparent 82%)',
          maskImage: 'radial-gradient(ellipse 64% 57% at 64% 32%, #000 42%, rgba(0,0,0,.96) 57%, transparent 82%)',
        }}
      >
        <OffthreadVideo
          src={staticFile(props.media.video)}
          trimBefore={props.shotConfig.videoTrim[0]}
          trimAfter={props.shotConfig.videoTrim[1]}
          playbackRate={0.88}
          volume={0.03}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: props.shotConfig.rotationCrop,
            transform: `translate3d(${driftX}px, ${driftY}px, 0) scale(${zoom})`,
            transformOrigin: '70% 27%',
            filter: 'brightness(.48) contrast(1.5) saturate(1.18) sepia(.16)',
          }}
        />
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(circle at 66% 28%, rgba(255,206,112,.28), transparent 15%), radial-gradient(ellipse at 64% 30%, transparent 17%, rgba(0,0,0,.28) 39%, rgba(0,0,0,.9) 77%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 63% 24%, rgba(255,194,74,.16), transparent 18%), linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.02) 46%, rgba(0,0,0,.88) 78%, #000)',
          pointerEvents: 'none',
        }}
      />

      <BigCopy color={props.shotConfig.accentColor} opacity={copy} bottom={112}>{props.subtitles[2]}</BigCopy>
    </AbsoluteFill>
  );
};

const DetailScene: React.FC<{duration: number; props: GoldJewelryProps}> = ({duration, props}) => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, duration, 8);
  const scale = interpolate(frame, [0, duration], [1.9, 1.7], clamp);
  const x = interpolate(frame, [0, duration], [170, 96], clamp);
  const y = interpolate(frame, [0, duration], [60, 90], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#000', opacity}}>
      <Img
        src={staticFile(props.media.image)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          transformOrigin: '58% 59%',
          filter: 'brightness(.92) contrast(1.18) saturate(1.18)',
        }}
      />
      <Spotlight strength={0.92} />
      <BigCopy color={props.shotConfig.accentColor} opacity={tween(frame, 12, 34)} bottom={100}>{props.subtitles[3]}</BigCopy>
    </AbsoluteFill>
  );
};

const EndScene: React.FC<{duration: number; props: GoldJewelryProps}> = ({duration, props}) => {
  const frame = useCurrentFrame();
  const imageIn = tween(frame, 0, 22);
  const copyIn = tween(frame, 18, 42);
  const zoom = interpolate(frame, [0, duration], [1.12, 1.04], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Img
        src={staticFile(props.media.image)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: imageIn,
          transform: `scale(${zoom})`,
          filter: 'brightness(.74) contrast(1.15) saturate(1.12)',
        }}
      />
      <Spotlight strength={0.97} />
      <div
        style={{
          position: 'absolute',
          left: 54,
          right: 54,
          bottom: 112,
          textAlign: 'center',
          opacity: copyIn,
          transform: `translateY(${(1 - copyIn) * 12}px)`,
          textShadow: '0 3px 28px rgba(0,0,0,.98)',
          fontFamily: '"Noto Serif SC", "Songti SC", "SimSun", serif',
        }}
      >
        <div style={{fontSize: 78, fontWeight: 700, letterSpacing: 12, color: props.shotConfig.accentColor}}>{props.subtitles[4]}</div>
        <div style={{fontSize: 38, fontWeight: 500, letterSpacing: 7, marginTop: 20, color: '#efe0b8'}}>
          {props.subtitles[5]}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const GoldJewelryVideo: React.FC<GoldJewelryProps> = (props) => {
  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      <Html5Audio src={staticFile('jewelry-ambient.wav')} volume={0.62} />

      <Sequence from={0} durationInFrames={84}>
        <HeroScene duration={84} props={props} />
      </Sequence>
      <Sequence from={74} durationInFrames={94}>
        <MacroScene duration={94} props={props} />
      </Sequence>
      <Sequence from={158} durationInFrames={122}>
        <RotationScene duration={122} props={props} />
      </Sequence>
      <Sequence from={270} durationInFrames={84}>
        <DetailScene duration={84} props={props} />
      </Sequence>
      <Sequence from={344} durationInFrames={106}>
        <EndScene duration={106} props={props} />
      </Sequence>
    </AbsoluteFill>
  );
};
