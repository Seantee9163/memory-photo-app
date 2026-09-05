import {execFile} from 'node:child_process';
import {copyFile, mkdir, readFile, readdir, writeFile} from 'node:fs/promises';
import {extname, resolve} from 'node:path';
import {promisify} from 'node:util';

const exec = promisify(execFile);
const projectDir = resolve(import.meta.dirname, '..');
const repoDir = resolve(projectDir, '..');
const inboxRoot = resolve(repoDir, 'video-shotcraft-products', 'inbox');
const publicDir = resolve(projectDir, 'public');
const outputRoot = resolve(repoDir, 'batch-output');
const finalDir = resolve(outputRoot, 'final');
const propsDir = resolve(outputRoot, 'props');

const entries = await readdir(inboxRoot, {withFileTypes: true});
const requestedJobId = process.env.SHOTCRAFT_JOB_ID?.trim();
const jobDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort().reverse();
const jobId = requestedJobId || jobDirs[0];

if (!jobId) {
  throw new Error('No Video Shotcraft job was found in video-shotcraft-products/inbox.');
}

const jobDir = resolve(inboxRoot, jobId);
const job = JSON.parse(await readFile(resolve(jobDir, 'job.json'), 'utf8'));
if (!job.imagePath) throw new Error(`${jobId}: imagePath is missing.`);
if (![15, 30, 60].includes(Number(job.duration))) throw new Error(`${jobId}: duration must be 15, 30 or 60.`);
if (!['premium', 'sales', 'story', 'impact'].includes(job.style)) throw new Error(`${jobId}: invalid style.`);

const sourceImage = resolve(repoDir, job.imagePath);
const imageExt = extname(sourceImage) || '.jpg';
const imageAsset = `shotcraft-${jobId}${imageExt}`;

await mkdir(publicDir, {recursive: true});
await mkdir(finalDir, {recursive: true});
await mkdir(propsDir, {recursive: true});
await copyFile(sourceImage, resolve(publicDir, imageAsset));

const props = {
  imageAsset,
  productName: job.productName || '916 Gold Jewelry',
  style: job.style,
  copy: Array.isArray(job.copy) ? job.copy : [],
};
const propsPath = resolve(propsDir, `${jobId}.json`);
await writeFile(propsPath, `${JSON.stringify(props, null, 2)}\n`);

const composition = `Shotcraft${Number(job.duration)}s`;
const outputFile = resolve(finalDir, `${jobId}.mp4`);
const latestFile = resolve(finalDir, 'latest.mp4');

console.log(`Rendering ${jobId}: composition=${composition} style=${job.style}`);
const {stdout, stderr} = await exec(
  'npx',
  [
    'remotion',
    'render',
    'src/index.ts',
    composition,
    outputFile,
    '--codec=h264',
    '--crf=16',
    '--pixel-format=yuv420p',
    `--props=${propsPath}`,
  ],
  {
    cwd: projectDir,
    env: process.env,
    maxBuffer: 100 * 1024 * 1024,
  },
);

if (stdout) process.stdout.write(stdout);
if (stderr) process.stderr.write(stderr);
await copyFile(outputFile, latestFile);

const report = {
  jobId,
  productName: props.productName,
  duration: Number(job.duration),
  style: job.style,
  output: `batch-output/final/${jobId}.mp4`,
  latest: 'batch-output/final/latest.mp4',
  status: 'PASS',
};
await writeFile(resolve(outputRoot, 'shotcraft-job-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Video Shotcraft job completed: ${jobId}`);
