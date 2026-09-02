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

const bell = (t, at, freq, decay, gain) => {
  const dt = t - at;
  if (dt < 0) return 0;
  return Math.sin(2 * Math.PI * freq * dt) * Math.exp(-dt * decay) * gain;
};

for (let i = 0; i < totalSamples; i += 1) {
  const t = i / sampleRate;
  const fadeIn = Math.min(1, t / 0.7);
  const fadeOut = Math.min(1, (durationSeconds - t) / 1.8);
  const envelope = Math.max(0, Math.min(fadeIn, fadeOut));

  const drone =
    Math.sin(2 * Math.PI * 55 * t) * 0.07 +
    Math.sin(2 * Math.PI * 82.5 * t + 0.5) * 0.035 +
    Math.sin(2 * Math.PI * 110 * t + 1.2) * 0.018;
  const pulse = Math.sin(2 * Math.PI * 0.18 * t) * 0.015;
  const chimes =
    bell(t, 2.85, 880, 3.2, 0.08) +
    bell(t, 5.95, 1174.66, 3.8, 0.09) +
    bell(t, 9.35, 1318.51, 4.0, 0.075) +
    bell(t, 12.15, 987.77, 3.2, 0.07);

  const sample = Math.max(-1, Math.min(1, (drone + pulse + chimes) * envelope));
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
console.log(`Generated original ambient soundtrack: ${audioOutputPath}`);
