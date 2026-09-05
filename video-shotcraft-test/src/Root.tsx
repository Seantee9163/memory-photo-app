import React from 'react';
import {Composition} from 'remotion';
import {defaultGoldJewelryProps, GoldJewelryVideo} from './GoldJewelryVideo';
import {defaultShotcraftStudioProps, ShotcraftStudioVideo} from './ShotcraftStudioVideo';

export const VideoRoot: React.FC = () => (
  <>
    <Composition
      id="GoldJewelry15s"
      component={GoldJewelryVideo}
      defaultProps={defaultGoldJewelryProps}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="Shotcraft15s"
      component={ShotcraftStudioVideo}
      defaultProps={defaultShotcraftStudioProps}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="Shotcraft30s"
      component={ShotcraftStudioVideo}
      defaultProps={defaultShotcraftStudioProps}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="Shotcraft60s"
      component={ShotcraftStudioVideo}
      defaultProps={defaultShotcraftStudioProps}
      durationInFrames={1800}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
