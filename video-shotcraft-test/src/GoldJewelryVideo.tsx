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

export type GoldJewelryVideoProps = {
  productId?: string;
  productName?: string;
  category?: string;
  imageAsset?: string;
  videoAsset?: string;
  audioAsset?: string;
  heroCopy?: string;
  macroCopy?: string;
  rotationCopy?: string;
  detailCopy?: string;
  endTitle?: string;
  endSubtitle?: string;
  variant?: 'prayer-wheel' | 'heritage' | 'celebration' | string;
};

export const defaultGoldJewelryProps: Required<GoldJewelryVideoProps> = {
  productId: 'sean-jewelry-default',
  productName: '916 Gold Prayer Wheel',
  category: 'mechanical-jewelry',
  imageAsset: 'gold-jewelry-approved.png',
  videoAsset: 'turning-cylinder-demo.mp4',
  audioAsset: 'jewelry-ambient.wav',
  heroCopy: '916黄金 · 转经筒',
  macroCopy: '纹理，不只是装饰',
  rotationCopy: '一甩，即转',
  detailCopy: '活动结构 · 真实可转',
  endTitle: '匠心成金',
  endSubtitle: '转动之间，见工艺',
  variant: 'prayer-wheel',
};

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
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

type VariantProfile = {
  heroStart: number;
  heroEnd: number;
  heroX: number;
  heroY: number;
  heroPosition: string;
  heroFilter: string;
  macroStart: number;
  macroEnd: number;
  macroX: number;
  macroY: number;
  detailStart: number;
  detailEnd: number;
  detailX: number;
  detailY: number;
  rotationZoomStart: number;
  rotationZoomEnd: number;
  rotationXStart: number;
  rotationXEnd: number;
  rotationYStart: number;
  rotationYEnd: number;
  rotationPosition: string;
  rotationFilter: string;
  rotationMask: string;
  rotationGlow: string;
  copyBottom: number;
  accent: string;
};

const variantTuning = (variant: string): VariantProfile => {
  if (variant === 'heritage') {
    return {
      heroStart: 1.04,
      heroEnd: 1.16,
      heroX: -42,
      heroY: -18,
      heroPosition: '44% 38%',
      heroFilter: 'brightness(.74) contrast(1.26) saturate(.92) sepia(.26)',
      macroStart: 2.05,
      macroEnd: 1.72,
      macroX: 110,
      macroY: 42,
      detailStart: 1.52,
      detailEnd: 1.88,
      detailX: -118,
      detailY: 112,
      rotationZoomStart: 1.82,
      rotationZoomEnd: 2.08,
      rotationXStart: -92,
      rotationXEnd: 36,
      rotationYStart: 54,
      rotationYEnd: 6,
      rotationPosition: '46% 34%',
      rotationFilter: 'brightness(.56) contrast(1.42) saturate(.86) sepia(.34)',
      rotationMask: 'radial-gradient(ellipse 74% 60% at 46% 34%, #000 40%, rgba(0,0,0,.96) 61%, transparent 88%)',
      rotationGlow: 'radial-gradient(circle at 44% 28%, rgba(224,177,84,.19), transparent 20%)',
      copyBottom: 142,
      accent: '#d8b56f',
    };
  }

  if (variant === 'celebration') {
    return {
      heroStart: 1.28,
      heroEnd: 1.08,
      heroX: 62,
      heroY: 24,
      heroPosition: '64% 30%',
      heroFilter: 'brightness(.98) contrast(1.12) saturate(1.34)',
      macroStart: 1.48,
      macroEnd: 2.12,
      macroX: -150,
      macroY: 168,
      detailStart: 2.05,
      detailEnd: 1.58,
      detailX: 146,
      detailY: -36,
      rotationZoomStart: 2.7,
      rotationZoomEnd: 2.28,
      rotationXStart: 88,
      rotationXEnd: -66,
      rotationYStart: -22,
      rotationYEnd: 46,
      rotationPosition: '73% 26%',
      rotationFilter: 'brightness(.68) contrast(1.32) saturate(1.42) sepia(.08)',
      rotationMask: 'radial-gradient(ellipse 60% 55% at 72% 28%, #000 38%, rgba(0,0,0,.92) 57%, transparent 80%)',
      rotationGlow: 'radial-gradient(circle at 73% 22%, rgba(255,220,128,.35), transparent 16%)',
      copyBottom: 86,
      accent: '#f5d78b',
    };
  }

  return {
    heroStart: 1.14,
    heroEnd: 1.04,
    heroX: 0,
    heroY: 0,
    heroPosition: '50% 42%',
    heroFilter: 'brightness(.92) contrast(1.18) saturate(1.14)',
    macroStart: 1.72,
    macroEnd: 1.92,
    macroX: -30,
    macroY: 124,
    detailStart: 1.9,
    detailEnd: 1.7,
    detailX: 96,
    detailY: 78,
    rotationZoomStart: 2.42,
    rotationZoomEnd: 2.62,
    rotationXStart: 18,
    rotationXEnd: -18,
    rotationYStart: 10,
    rotationYEnd: -12,
    rotationPosition: '70% 27%',
    rotationFilter: 'brightness(.48) contrast(1.5) saturate(1.18) sepia(.16)',
    rotationMask: 'radial-gradient(ellipse 64% 57% at 64% 32%, #000 42%, rgba(0,0,0,.96) 57%, transparent 82%)',
    rotationGlow: 'radial-gradient(circle at 66% 28%, rgba(255,206,112,.28), transparent 15%)',
    copyBottom: 112,
    accent: '#f4d78b',
  };
};

const Spotlight: React.FC<{strength?: number; variant?: string}> = ({strength = 1, variant = 'prayer-wheel'}) => {
  const profile = variantTuning(variant);
  const heritage = variant === 'heritage';
  const celebration = variant === 'celebration';

  return (
    <>
      <AbsoluteFill
        style={{
          background: celebration
            ? 'radial-gradient(ellipse at 68% 34%, rgba(255,221,142,.26), transparent 26%), radial-gradient(ellipse at 50% 50%, transparent 26%, rgba(0,0,0,.3) 61%, rgba(0,0,0,.86) 100%)'
            : heritage
              ? 'radial-gradient(ellipse at 42% 40%, rgba(183,129,54,.16), transparent 30%), radial-gradient(ellipse at 50% 50%, transparent 23%, rgba(0,0,0,.5) 56%, rgba(0,0,0,.96) 100%)'
              : 'radial-gradient(ellipse at 50% 43%, rgba(255,196,92,.18), transparent 24%), radial-gradient(ellipse at 50% 48%, transparent 24%, rgba(0,0,0,.42) 58%, rgba(0,0,0,.94) 100%)',
          opacity: strength,
        }}
      />
      <AbsoluteFill
        style={{
          background: heritage
            ? 'linear-gradient(180deg, rgba(42,24,4,.22), transparent 36%, transparent 64%, rgba(0,0,0,.84))'
            : celebration
              ? 'linear-gradient(180deg, rgba(255,210,110,.06), transparent 30%, transparent 64%, rgba(0,0,0,.72))'
              : 'linear-gradient(180deg, rgba(0,0,0,.12), transparent 32%, transparent 67%, rgba(0,0,0,.78))',
        }}
      />
      <AbsoluteFill style={{boxShadow: `inset 0 0 160px ${profile.accent}14`}} />
    </>
  );
};

const BigCopy: React.FC<{
  children: React.ReactNode;
  opacity: number;
  bottom?: number;
  accent?: string;
}> = ({children, opacity, bottom = 108, accent = '#f4d78b'}) => (
  <div
    style={{
      position: 'absolute',
      left: 64,
      right: 64,
      bottom,
      textAlign: 'center',
      color: accent,
      fontSize: 62,
      fontWeight: 600,
      letterSpacing: 8,
      lineHeight: 1.22,
      opacity,
      textShadow: '0 4px 28px rgba(0,0,0,.98)',
      fontFamily: '\"Noto Serif SC\", \"Songti SC\", \"SimSun\", serif',
    }}
  >
    {children}
  </div>
);

const HeroScene: React.FC<{duration: number; imageAsset: string; copy: string; variant: string}> = ({duration, imageAsset, copy, variant}) => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, duration, 12);
  const tuning = variantTuning(variant);
  const zoom = interpolate(frame, [0, duration], [tuning.heroStart, tuning.heroEnd], clamp);
  const reveal = tween(frame, 0, 28);
  const x = interpolate(frame, [0, duration], [tuning.heroX, tuning.heroX * 0.35], clamp);
  const y = interpolate(frame, [0, duration], [tuning.heroY, tuning.heroY * 0.25], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#000', opacity}}>
      <Img
        src={staticFile(imageAsset)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: tuning.heroPosition,
          transform: `translate3d(${x}px, ${y}px, 0) scale(${zoom})`,
          filter: tuning.heroFilter,
          opacity: 0.48 + reveal * 0.52,
        }}
      />
      <Spotlight strength={0.96} variant={variant} />
      <BigCopy opacity={tween(frame, 24, 48)} accent={tuning.accent} bottom={tuning.copyBottom}>{copy}</BigCopy>
    </AbsoluteFill>
  );
};

const MacroScene: React.FC<{duration: number; imageAsset: string; copy: string; variant: string}> = ({duration, imageAsset, copy, variant}) => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, duration, 10);
  const tuning = variantTuning(variant);
  const scale = interpolate(frame, [0, duration], [tuning.macroStart, tuning.macroEnd], clamp);
  const x = interpolate(frame, [0, duration], [tuning.macroX, tuning.macroX - 46], clamp);
  const y = interpolate(frame, [0, duration], [tuning.macroY, tuning.macroY - 52], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#000', opacity}}>
      <Img
        src={staticFile(imageAsset)}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: tuning.heroPosition,
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          transformOrigin: variant === 'heritage' ? '42% 54%' : variant === 'celebration' ? '70% 36%' : '50% 46%',
          filter: tuning.heroFilter,
        }}
      />
      <Spotlight strength={0.88} variant={variant} />
      <BigCopy opacity={tween(frame, 18, 42)} bottom={tuning.copyBottom - 12} accent={tuning.accent}>{copy}</BigCopy>
    </AbsoluteFill>
  );
};

const RotationScene: React.FC<{duration: number; videoAsset: string; copy: string; variant: string}> = ({duration, videoAsset, copy, variant}) => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, duration, 8);
  const copyOpacity = tween(frame, 10, 30);
  const tuning = variantTuning(variant);
  const zoom = interpolate(frame, [0, duration], [tuning.rotationZoomStart, tuning.rotationZoomEnd], clamp);
  const driftX = interpolate(frame, [0, duration], [tuning.rotationXStart, tuning.rotationXEnd], clamp);
  const driftY = interpolate(frame, [0, duration], [tuning.rotationYStart, tuning.rotationYEnd], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#000', opacity, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: variant === 'heritage' ? -70 : 0,
          right: variant === 'celebration' ? -60 : 0,
          top: variant === 'celebration' ? -20 : 20,
          height: variant === 'heritage' ? 1440 : 1370,
          overflow: 'hidden',
          background: '#000',
          WebkitMaskImage: tuning.rotationMask,
          maskImage: tuning.rotationMask,
        }}
      >
        <OffthreadVideo
          src={staticFile(videoAsset)}
          trimBefore={210}
          trimAfter={315}
          playbackRate={variant === 'heritage' ? 0.78 : variant === 'celebration' ? 1.0 : 0.88}
          volume={0.03}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: tuning.rotationPosition,
            transform: `translate3d(${driftX}px, ${driftY}px, 0) scale(${zoom})`,
            transformOrigin: tuning.rotationPosition,
            filter: tuning.rotationFilter,
          }}
        />
        <AbsoluteFill
          style={{
            background: `${tuning.rotationGlow}, radial-gradient(ellipse at 64% 30%, transparent 17%, rgba(0,0,0,.24) 42%, rgba(0,0,0,.86) 79%)`,
            mixBlendMode: variant === 'heritage' ? 'soft-light' : 'screen',
          }}
        />
      </div>

      <AbsoluteFill
        style={{
          background:
            variant === 'celebration'
              ? 'radial-gradient(circle at 73% 20%, rgba(255,217,126,.2), transparent 19%), linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.02) 46%, rgba(0,0,0,.82) 78%, #000)'
              : variant === 'heritage'
                ? 'linear-gradient(180deg, rgba(36,20,4,.34), rgba(0,0,0,.02) 42%, rgba(0,0,0,.88) 78%, #000)'
                : 'radial-gradient(circle at 63% 24%, rgba(255,194,74,.16), transparent 18%), linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.02) 46%, rgba(0,0,0,.88) 78%, #000)',
          pointerEvents: 'none',
        }}
      />

      <BigCopy opacity={copyOpacity} bottom={tuning.copyBottom} accent={tuning.accent}>{copy}</BigCopy>
    </AbsoluteFill>
  );
};

const DetailScene: React.FC<{duration: number; imageAsset: string; copy: string; variant: string}> = ({duration, imageAsset, copy, variant}) => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, duration, 8);
  const tuning = variantTuning(variant);
  const scale = interpolate(frame, [0, duration], [tuning.detailStart, tuning.detailEnd], clamp);
  const x = interpolate(frame, [0, duration], [tuning.detailX, tuning.detailX * 0.45], clamp);
  const y = interpolate(frame, [0, duration], [tuning.detailY, tuning.detailY * 0.5], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#000', opacity}}>
      <Img
        src={staticFile(imageAsset)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: tuning.heroPosition,
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          transformOrigin: variant === 'heritage' ? '36% 62%' : variant === 'celebration' ? '72% 44%' : '58% 59%',
          filter: tuning.heroFilter,
        }}
      />
      <Spotlight strength={0.92} variant={variant} />
      <BigCopy opacity={tween(frame, 12, 34)} bottom={tuning.copyBottom - 6} accent={tuning.accent}>{copy}</BigCopy>
    </AbsoluteFill>
  );
};

const EndScene: React.FC<{duration: number; imageAsset: string; title: string; subtitle: string; variant: string}> = ({duration, imageAsset, title, subtitle, variant}) => {
  const frame = useCurrentFrame();
  const imageIn = tween(frame, 0, 22);
  const copyIn = tween(frame, 18, 42);
  const tuning = variantTuning(variant);
  const zoom = interpolate(frame, [0, duration], [tuning.heroStart, tuning.heroEnd], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Img
        src={staticFile(imageAsset)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: tuning.heroPosition,
          opacity: imageIn,
          transform: `scale(${zoom})`,
          filter: tuning.heroFilter,
        }}
      />
      <Spotlight strength={0.97} variant={variant} />
      <div
        style={{
          position: 'absolute',
          left: 54,
          right: 54,
          bottom: variant === 'heritage' ? 154 : variant === 'celebration' ? 88 : 112,
          textAlign: 'center',
          opacity: copyIn,
          transform: `translateY(${(1 - copyIn) * 12}px)`,
          textShadow: '0 3px 28px rgba(0,0,0,.98)',
          fontFamily: '\"Noto Serif SC\", \"Songti SC\", \"SimSun\", serif',
        }}
      >
        <div style={{fontSize: 78, fontWeight: 700, letterSpacing: 12, color: tuning.accent}}>{title}</div>
        <div style={{fontSize: 38, fontWeight: 500, letterSpacing: 7, marginTop: 20, color: '#efe0b8'}}>
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const GoldJewelryVideo: React.FC<GoldJewelryVideoProps> = (inputProps) => {
  const props = {...defaultGoldJewelryProps, ...inputProps};

  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      <Html5Audio src={staticFile(props.audioAsset)} volume={0.62} />

      <Sequence from={0} durationInFrames={84}>
        <HeroScene duration={84} imageAsset={props.imageAsset} copy={props.heroCopy} variant={props.variant} />
      </Sequence>
      <Sequence from={74} durationInFrames={94}>
        <MacroScene duration={94} imageAsset={props.imageAsset} copy={props.macroCopy} variant={props.variant} />
      </Sequence>
      <Sequence from={158} durationInFrames={122}>
        <RotationScene duration={122} videoAsset={props.videoAsset} copy={props.rotationCopy} variant={props.variant} />
      </Sequence>
      <Sequence from={270} durationInFrames={84}>
        <DetailScene duration={84} imageAsset={props.imageAsset} copy={props.detailCopy} variant={props.variant} />
      </Sequence>
      <Sequence from={344} durationInFrames={106}>
        <EndScene duration={106} imageAsset={props.imageAsset} title={props.endTitle} subtitle={props.endSubtitle} variant={props.variant} />
      </Sequence>
    </AbsoluteFill>
  );
};
