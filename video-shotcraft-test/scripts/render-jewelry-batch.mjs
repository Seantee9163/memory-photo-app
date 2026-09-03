import {execFile} from 'node:child_process';
import {mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {promisify} from 'node:util';
import path from 'node:path';

const exec = promisify(execFile);
const projectDir = path.resolve(import.meta.dirname, '..');
const repoDir = path.resolve(projectDir, '..');
const outputDir = path.join(repoDir, 'batch-output');
const finalDir = path.join(outputDir, 'final');
const qcDir = path.join(outputDir, 'qc-reports');
const previewDir = path.join(outputDir, 'previews');
const reportPath = path.join(outputDir, 'batch-report.md');
const zipPath = path.join(outputDir, 'Sean-Jewelry-Batch.zip');
const maxConcurrent = Number(process.env.MAX_CONCURRENT_RENDERS ?? 2);

if (maxConcurrent !== 2) throw new Error(`MAX_CONCURRENT_RENDERS must be 2 (received ${maxConcurrent})`);

const products = JSON.parse(await readFile(path.join(projectDir, 'batch-products.json'), 'utf8'));
if (products.length !== 3) throw new Error(`Expected exactly 3 products, received ${products.length}`);

await rm(outputDir, {recursive: true, force: true});
await Promise.all([finalDir, qcDir, previewDir].map((dir) => mkdir(dir, {recursive: true})));
await exec('node', ['scripts/prepare-approved-image.mjs'], {cwd: projectDir});

const results = new Array(products.length);
let cursor = 0;

const renderProduct = async (product, index) => {
  const video = path.join(finalDir, `${product.id}.mp4`);
  const preview = path.join(previewDir, `${product.id}.jpg`);
  const log = path.join(outputDir, `${product.id}.remotion.log`);
  try {
    const rendered = await exec(
      path.join(projectDir, 'node_modules/.bin/remotion'),
      ['render', 'src/index.ts', 'GoldJewelry15s', video, '--codec=h264', '--crf=18', '--pixel-format=yuv420p', '--concurrency=1'],
      {cwd: projectDir, maxBuffer: 20 * 1024 * 1024},
    );
    await writeFile(log, `${rendered.stdout}\n${rendered.stderr}`);
    await exec('ffmpeg', ['-y', '-ss', '7.5', '-i', video, '-frames:v', '1', '-q:v', '2', preview]);
    const probe = await exec('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height,pix_fmt:format=duration', '-of', 'json', video]);
    const metadata = JSON.parse(probe.stdout);
    const stream = metadata.streams?.[0] ?? {};
    const duration = Number(metadata.format?.duration ?? 0);
    const checks = {
      fileExists: true,
      codecH264: stream.codec_name === 'h264',
      dimensions1080x1920: stream.width === 1080 && stream.height === 1920,
      pixelFormatYuv420p: stream.pix_fmt === 'yuv420p',
      duration15Seconds: Math.abs(duration - 15) <= 0.1,
      remotionRenderer: true,
    };
    const score = Math.round((Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100);
    const qc = {product, renderer: 'Remotion', renderStatus: 'PASS', score, checks, duration};
    await writeFile(path.join(qcDir, `${product.id}.json`), `${JSON.stringify(qc, null, 2)}\n`);
    results[index] = qc;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const qc = {product, renderer: 'Remotion', renderStatus: 'FAIL', score: 0, error: message};
    await writeFile(path.join(qcDir, `${product.id}.json`), `${JSON.stringify(qc, null, 2)}\n`);
    results[index] = qc;
  }
};

const worker = async () => {
  while (cursor < products.length) {
    const index = cursor++;
    await renderProduct(products[index], index);
  }
};
await Promise.all(Array.from({length: maxConcurrent}, worker));

const passed = results.filter((result) => result.renderStatus === 'PASS').length;
const allQc = passed === products.length && results.every((result) => result.score >= 90);
const report = `# Sean Jewelry Batch Test\n\n- Batch workflow: ${passed === 3 && allQc ? 'PASS' : 'FAIL'}\n- True Remotion render: ${passed === 3 ? 'PASS' : 'FAIL'}\n- Products rendered: ${passed}/3\n- All QC >=90: ${allQc ? 'YES' : 'NO'}\n- MAX_CONCURRENT_RENDERS: ${maxConcurrent}\n\n| Product | Remotion Render | QC score |\n|---|---:|---:|\n${results.map((r) => `| ${r.product.id} | ${r.renderStatus} | ${r.score} |`).join('\n')}\n`;
await writeFile(reportPath, report);

if (passed !== 3 || !allQc) {
  console.error(report);
  console.error('Remotion Render = FAIL. No fallback renderer was attempted.');
  process.exitCode = 1;
} else {
  await exec('zip', ['-r', zipPath, 'final', 'batch-report.md', 'qc-reports'], {cwd: outputDir});
  console.log(report);
  console.log(`ZIP artifact: ${zipPath}`);
}
