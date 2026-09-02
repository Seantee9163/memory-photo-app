import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(projectRoot, '..');

const encodedPath = resolve(projectRoot, 'assets/gold-jewelry-approved.png.base64');
const imageOutputPath = resolve(projectRoot, 'public/gold-jewelry-approved.png');
const sourceVideoPath = resolve(repoRoot, '转经筒2.mp4');
const videoOutputPath = resolve(projectRoot, 'public/turning-cylinder-demo.mp4');
const audioOutputPath = resolve(projectRoot, 'public/jewelry-ambient.wav');

const encoded = await readFile(encodedPath, 'utf8');
const approvedImage = Buffer.from(encoded.replace(/\s/g, ''), 'base64');

if (approvedImage.subarray(1, 4).toString('ascii') !== 'PNG') {
  throw new Error('The approved product image payload is not a valid PNG.');
}

await mkdir(dirname(imageOutputPath), {recursive: true});
await writeFile(imageOutputPath, approvedImage);
console.log(`Restored approved product image: ${imageOutputPath}`);

await copyFile(sourceVideoPath, videoOutputPath);
console.log(`Copied real rotation demo video: ${videoOutputPath}`);

const sampleRate = 44100;
const durationSeconds = 15;
const channels = 1;
const bitsPerSample = 16;
const totalSamples = sampleRate * durationSeconds;
const pcm = Buffer.alloc(totalSamples * 2);

const tone = (t, at, freq, decay, gain, harmonic = 0.22) => {
  const dt = t - at;
  if (dt < 0) return 0;
  const env = Math.exp(-dt * decay);
  return (
    Math.sin(2 * Math.PI * freq * dt) +
    harmonic * Math.sin(2 * Math.PI * freq * 2 * dt + 0.25)
  ) * env * gain;
};

const softHit = (t, at, gain) => {
  const dt = t - at;
  if (dt < 0) return 0;
  return Math.sin(2 * Math.PI * (68 - Math.min(dt, 0.4) * 38) * dt) * Math.exp(-dt * 7.5) * gain;
};

const pentatonic = [293.66, 329.63, 440.0, 493.88, 587.33];
const melody = [
  [0.55, 0, 0.032],
  [2.25, 2, 0.028],
  [4.05, 1, 0.027],
  [5.75, 3, 0.034],
  [7.2, 4, 0.042],
  [8.55, 2, 0.032],
  [10.3, 1, 0.026],
  [12.05, 3, 0.034],
  [13.4, 4, 0.03],
];

for (let i = 0; i < totalSamples; i += 1) {
  const t = i / sampleRate;
  const fadeIn = Math.min(1, t / 0.9);
  const fadeOut = Math.min(1, (durationSeconds - t) / 1.6);
  const envelope = Math.max(0, Math.min(fadeIn, fadeOut));

  const air =
    Math.sin(2 * Math.PI * 110 * t) * 0.008 +
    Math.sin(2 * Math.PI * 165 * t + 0.8) * 0.005 +
    Math.sin(2 * Math.PI * 220 * t + 1.4) * 0.003;

  let plucks = 0;
  for (const [at, noteIndex, gain] of melody) {
    plucks += tone(t, at, pentatonic[noteIndex], 4.6, gain, 0.18);
  }

  const bells =
    tone(t, 5.2, 880, 3.1, 0.026, 0.35) +
    tone(t, 8.25, 1174.66, 3.7, 0.034, 0.4) +
    tone(t, 11.45, 987.77, 3.4, 0.026, 0.32);

  const impacts =
    softHit(t, 0.15, 0.028) +
    softHit(t, 5.25, 0.038) +
    softHit(t, 8.3, 0.032) +
    softHit(t, 11.5, 0.025);

  const sample = Math.max(-1, Math.min(1, (air + plucks + bells + impacts) * envelope));
  pcm.writeInt16LE(Math.round(sample * 32767), i * 2);
}

const wavHeader = Buffer.alloc(44);
wavHeader.write('RIFF', 0);
wavHeader.writeUInt32LE(36 + pcm.length, 4);
wavHeader.write('WAVE', 8);
wavHeader.write('fmt ', 12);
wavHeader.writeUInt32LE(16, 16);
wavHeader.writeUInt16LE(1, 20);
wavHeader.writeUInt16LE(channels, 22);
wavHeader.writeUInt32LE(sampleRate, 24);
wavHeader.writeUInt32LE(sampleRate * channels * bitsPerSample / 8, 28);
wavHeader.writeUInt16LE(channels * bitsPerSample / 8, 32);
wavHeader.writeUInt16LE(bitsPerSample, 34);
wavHeader.write('data', 36);
wavHeader.writeUInt32LE(pcm.length, 40);

await writeFile(audioOutputPath, Buffer.concat([wavHeader, pcm]));
console.log(`Generated restrained eastern-luxury soundtrack: ${audioOutputPath}`);
