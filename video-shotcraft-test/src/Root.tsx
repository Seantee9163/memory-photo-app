import React from 'react';
import {Composition} from 'remotion';
import {defaultGoldJewelryProps, GoldJewelryVideo} from './GoldJewelryVideo';

export const VideoRoot: React.FC = () => (
  <Composition
    id="GoldJewelry15s"
    component={GoldJewelryVideo}
    defaultProps={defaultGoldJewelryProps}
    durationInFrames={450}
    fps={30}
    width={1080}
    height={1920}
  />
);
