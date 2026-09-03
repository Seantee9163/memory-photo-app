import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
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
const propsDir = path.join(outputDir, 'props');
const reportPath = path.join(outputDir, 'batch-report.md');
const zipPath = path.join(outputDir, 'Sean-Jewelry-Batch.zip');
const maxConcurrent = Number(process.env.MAX_CONCURRENT_RENDERS ?? 2);

if (maxConcurrent !== 2) throw new Error(`MAX_CONCURRENT_RENDERS must be 2 (received ${maxConcurrent})`);

const products = JSON.parse(await readFile(path.join(projectDir, 'batch-products.json'), 'utf8'));
if (products.length !== 3) throw new Error(`Expected exactly 3 products, received ${products.length}`);

const sha256Buffer = (buffer) => createHash('sha256').update(buffer).digest('hex');
const sha256File = async (file) => sha256Buffer(await readFile(file));
const sha256Json = (value) => sha256Buffer(Buffer.from(JSON.stringify(value)));

const mediaProvenance = async (product) => {
  const media = [
    {kind: 'image', asset: product.imageAsset},
    {kind: 'video', asset: product.videoAsset},
    {kind: 'audio', asset: product.audioAsset},
  ];

  return Promise.all(
    media.map(async ({kind, asset}) => {
      const absolutePath = path.join(projectDir, 'public', asset);
      return {
        kind,
        asset,
        path: path.relative(repoDir, absolutePath),
        sha256: await sha256File(absolutePath),
      };
    }),
  );
};

await rm(outputDir, {recursive: true, force: true});
await Promise.all([finalDir, qcDir, previewDir, propsDir].map((dir) => mkdir(dir, {recursive: true})));
await exec('node', ['scripts/prepare-approved-image.mjs'], {cwd: projectDir});

const results = new Array(products.length);
let cursor = 0;

const renderProduct = async (product, index) => {
  const video = path.join(finalDir, `${product.id}.mp4`);
  const preview = path.join(previewDir, `${product.id}.jpg`);
  const log = path.join(outputDir, `${product.id}.remotion.log`);
  const propsPath = path.join(propsDir, `${product.id}.json`);
  const inputMedia = await mediaProvenance(product);
  const inputConfigSha256 = sha256Json(product);
  const inputProps = {
    productId: product.id,
    productName: product.name,
    category: product.category,
    imageAsset: product.imageAsset,
    videoAsset: product.videoAsset,
    audioAsset: product.audioAsset,
    heroCopy: product.heroCopy,
    macroCopy: product.macroCopy,
    rotationCopy: product.rotationCopy,
    detailCopy: product.detailCopy,
    endTitle: product.endTitle,
    endSubtitle: product.endSubtitle,
    variant: product.variant,
  };
  const propsJson = JSON.stringify(inputProps);
  await writeFile(propsPath, `${JSON.stringify(inputProps, null, 2)}\n`);

  console.log(
    `Rendering ${product.id} with name=${JSON.stringify(product.name)} image=${product.imageAsset} ` +
      `video=${product.videoAsset} audio=${product.audioAsset} variant=${product.variant} ` +
      `props=${propsPath} inputConfigSHA256=${inputConfigSha256} ` +
      `mediaSHA256=${inputMedia.map((item) => `${item.kind}:${item.sha256}`).join(',')}`,
  );

  try {
    const rendered = await exec(
      path.join(projectDir, 'node_modules/.bin/remotion'),
      [
        'render',
        'src/index.ts',
        'GoldJewelry15s',
        video,
        '--props',
        propsJson,
        '--codec=h264',
        '--crf=18',
        '--pixel-format=yuv420p',
        '--concurrency=1',
      ],
      {cwd: projectDir, maxBuffer: 20 * 1024 * 1024},
    );
    await writeFile(log, `${rendered.stdout}\n${rendered.stderr}`);
    await exec('ffmpeg', ['-y', '-ss', '7.5', '-i', video, '-frames:v', '1', '-q:v', '2', preview]);
    const probe = await exec('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'stream=codec_name,width,height,pix_fmt:format=duration',
      '-of',
      'json',
      video,
    ]);
    const metadata = JSON.parse(probe.stdout);
    const stream = metadata.streams?.[0] ?? {};
    const duration = Number(metadata.format?.duration ?? 0);
    const outputSha256 = await sha256File(video);
    const checks = {
      fileExists: true,
      codecH264: stream.codec_name === 'h264',
      dimensions1080x1920: stream.width === 1080 && stream.height === 1920,
      pixelFormatYuv420p: stream.pix_fmt === 'yuv420p',
      duration15Seconds: Math.abs(duration - 15) <= 0.1,
      remotionRenderer: true,
    };
    const score = Math.round((Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100);
    const qc = {
      product,
      inputMedia,
      inputConfigSha256,
      inputProps: path.relative(repoDir, propsPath),
      outputMp4: path.relative(repoDir, video),
      outputSha256,
      preview: path.relative(repoDir, preview),
      remotionLog: path.relative(repoDir, log),
      renderer: 'Remotion',
      renderStatus: 'PASS',
      score,
      checks,
      duration,
    };
    await writeFile(path.join(qcDir, `${product.id}.json`), `${JSON.stringify(qc, null, 2)}\n`);
    results[index] = qc;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const qc = {
      product,
      inputMedia,
      inputConfigSha256,
      inputProps: path.relative(repoDir, propsPath),
      outputMp4: path.relative(repoDir, video),
      outputSha256: '',
      remotionLog: path.relative(repoDir, log),
      renderer: 'Remotion',
      renderStatus: 'FAIL',
      score: 0,
      error: message,
    };
    await writeFile(log, `${message}\n`);
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

const passedResults = results.filter((result) => result.renderStatus === 'PASS');
const passed = passedResults.length;
const outputHashes = passedResults.map((result) => result.outputSha256).filter(Boolean);
const uniqueOutputHashes = outputHashes.length === products.length && new Set(outputHashes).size === products.length;
const uniqueInputConfigs = new Set(results.map((result) => result.inputConfigSha256)).size === products.length;
const allQc = passed === products.length && results.every((result) => result.score >= 90);
const batchPass = passed === products.length && allQc && uniqueOutputHashes && uniqueInputConfigs;

const mediaSummary = (r) =>
  r.inputMedia
    .map((item) => `${item.kind}:${item.asset} (${item.sha256})`)
    .join('<br>');

const tableRows = results
  .map(
    (r) =>
      `| ${r.product.id} | ${r.product.name} | ${mediaSummary(r)} | ${r.inputConfigSha256} | ${r.outputMp4} | ${r.outputSha256 || '-'} | ${r.remotionLog} | ${r.renderStatus} | ${r.score} |`,
  )
  .join('\n');

const report = `# Sean Jewelry Batch Test\n\n- Batch workflow: ${batchPass ? 'PASS' : 'FAIL'}\n- True Remotion render: ${passed === products.length ? 'PASS' : 'FAIL'}\n- Products rendered: ${passed}/${products.length}\n- All QC >=90: ${allQc ? 'YES' : 'NO'}\n- Unique product input configs: ${uniqueInputConfigs ? 'PASS' : 'FAIL'}\n- Unique output SHA256 hashes: ${uniqueOutputHashes ? 'PASS' : 'FAIL'}\n- MAX_CONCURRENT_RENDERS: ${maxConcurrent}\n\n| Product ID | Product Name | Consumed media + SHA256 | Input config SHA256 | Output MP4 | Output SHA256 | Remotion log | Remotion Render | QC score |\n|---|---|---|---|---|---|---|---:|---:|\n${tableRows}\n`;
await writeFile(reportPath, report);

if (!batchPass) {
  console.error(report);
  if (!uniqueOutputHashes) console.error('Duplicate or missing output SHA256 detected. Batch FAIL.');
  if (!uniqueInputConfigs) console.error('Duplicate product input configuration detected. Batch FAIL.');
  console.error('Remotion Render = FAIL. No fallback renderer was attempted.');
  process.exitCode = 1;
} else {
  const logFiles = products.map((product) => `${product.id}.remotion.log`);
  await exec('zip', ['-r', zipPath, 'final', 'previews', 'batch-report.md', 'qc-reports', 'props', ...logFiles], {
    cwd: outputDir,
  });
  console.log(report);
  console.log(`ZIP artifact: ${zipPath}`);
}
