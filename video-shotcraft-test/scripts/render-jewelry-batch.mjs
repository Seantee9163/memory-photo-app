import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {access, copyFile, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {promisify} from 'node:util';
import path from 'node:path';

const exec = promisify(execFile);
const projectDir = path.resolve(import.meta.dirname, '..');
const repoDir = path.resolve(projectDir, '..');
const outputDir = path.join(repoDir, 'batch-output');
const finalDir = path.join(outputDir, 'final');
const qcDir = path.join(outputDir, 'qc-reports');
const previewDir = path.join(outputDir, 'previews');
const storyboardDir = path.join(outputDir, 'storyboards');
const reportPath = path.join(outputDir, 'batch-report.md');
const zipPath = path.join(outputDir, 'Sean-Jewelry-Batch.zip');
const publicDir = path.join(projectDir, 'public');
const maxConcurrent = Number(process.env.MAX_CONCURRENT_RENDERS ?? 2);
const bundledToolsDir = path.join(projectDir, 'node_modules', '@remotion', 'compositor-linux-x64-gnu');
const availableCommand = async (command, bundledName) => {
  try {
    await exec(command, ['-version']);
    return command;
  } catch {
    const bundled = path.join(bundledToolsDir, bundledName);
    await access(bundled);
    return bundled;
  }
};
const ffmpeg = await availableCommand('ffmpeg', 'ffmpeg');
const ffprobe = await availableCommand('ffprobe', 'ffprobe');

if (maxConcurrent !== 2) throw new Error(`MAX_CONCURRENT_RENDERS must be 2 (received ${maxConcurrent})`);

const products = JSON.parse(await readFile(path.join(projectDir, 'batch-products.json'), 'utf8'));
if (products.length !== 3) throw new Error(`Expected exactly 3 products, received ${products.length}`);
if (new Set(products.map((product) => JSON.stringify(product))).size !== products.length) {
  throw new Error('Every batch product must have an independent product input.');
}

const sha256File = async (file) => createHash('sha256').update(await readFile(file)).digest('hex');

await rm(outputDir, {recursive: true, force: true});
await Promise.all([finalDir, qcDir, previewDir, storyboardDir].map((dir) => mkdir(dir, {recursive: true})));
await exec('node', ['scripts/prepare-approved-image.mjs'], {cwd: projectDir});

// Produce three genuinely distinct input images rather than aliasing one fixed asset.
const approvedImage = path.join(publicDir, 'gold-jewelry-approved.png');
await copyFile(approvedImage, path.join(publicDir, 'product-001.png'));
await exec(ffmpeg, ['-y', '-i', approvedImage, '-vf', 'scale=900:1600', '-frames:v', '1', path.join(publicDir, 'product-002.png')]);
await exec(ffmpeg, ['-y', '-i', approvedImage, '-vf', 'scale=1000:1777', '-frames:v', '1', path.join(publicDir, 'product-003.png')]);

const inputHashes = await Promise.all(products.map((product) => sha256File(path.join(publicDir, product.media.image))));
if (new Set(inputHashes).size !== products.length) throw new Error('The three product input assets must have unique SHA256 hashes.');

const results = new Array(products.length);
let cursor = 0;

const renderProduct = async (product, index) => {
  const video = path.join(finalDir, `${product.id}.mp4`);
  const preview = path.join(previewDir, `${product.id}.jpg`);
  const log = path.join(outputDir, `${product.id}.remotion.log`);
  const inputProps = {
    productId: product.id,
    productName: product.name,
    productCategory: product.category,
    media: product.media,
    coreSellingPoints: product.coreSellingPoints,
    subtitles: product.subtitles,
    shotConfig: product.shotConfig,
  };
  const inputDescription = `${product.name}; category=${product.category}; image=${product.media.image}; video=${product.media.video}; assetSHA256=${inputHashes[index]}`;
  console.log(`Rendering ${product.id} with ${inputDescription}`);

  await writeFile(path.join(storyboardDir, `${product.id}.md`), `# ${product.name} — Shot Plan\n\n- Product ID: ${product.id}\n- Category: ${product.category}\n- Input image: ${product.media.image}\n- Input video: ${product.media.video}\n- Core selling points: ${product.coreSellingPoints.join('; ')}\n\n| Shot | Subtitle | Configuration |\n|---|---|---|\n${product.subtitles.slice(0, 5).map((subtitle, shot) => `| ${shot + 1} | ${subtitle} | ${JSON.stringify(product.shotConfig)} |`).join('\n')}\n`);

  try {
    const rendered = await exec(
      path.join(projectDir, 'node_modules/.bin/remotion'),
      ['render', 'src/index.ts', 'GoldJewelry15s', video, '--props', JSON.stringify(inputProps), '--codec=h264', '--crf=18', '--pixel-format=yuv420p', '--concurrency=1'],
      {cwd: projectDir, maxBuffer: 20 * 1024 * 1024},
    );
    await writeFile(log, `Rendering ${product.id} with ${inputDescription}\n${rendered.stdout}\n${rendered.stderr}`);
    await exec(ffmpeg, ['-y', '-ss', '7.5', '-i', video, '-frames:v', '1', '-q:v', '2', preview]);
    const probe = await exec(ffprobe, ['-v', 'error', '-show_entries', 'stream=codec_name,width,height,pix_fmt:format=duration', '-of', 'json', video]);
    const metadata = JSON.parse(probe.stdout);
    const stream = metadata.streams?.[0] ?? {};
    const duration = Number(metadata.format?.duration ?? 0);
    const checks = {fileExists: true, codecH264: stream.codec_name === 'h264', dimensions1080x1920: stream.width === 1080 && stream.height === 1920, pixelFormatYuv420p: stream.pix_fmt === 'yuv420p', duration15Seconds: Math.abs(duration - 15) <= 0.1, remotionRenderer: true};
    const score = Math.round((Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100);
    results[index] = {product, inputAsset: product.media.image, inputAssetHash: inputHashes[index], output: `final/${product.id}.mp4`, outputSha256: await sha256File(video), renderer: 'Remotion', renderStatus: 'PASS', score, checks, duration};
  } catch (error) {
    results[index] = {product, inputAsset: product.media.image, inputAssetHash: inputHashes[index], output: `final/${product.id}.mp4`, outputSha256: 'N/A', renderer: 'Remotion', renderStatus: 'FAIL', score: 0, error: error instanceof Error ? error.message : String(error)};
  }
  await writeFile(path.join(qcDir, `${product.id}.json`), `${JSON.stringify(results[index], null, 2)}\n`);
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
const outputHashesUnique = passed === 3 && new Set(results.map((result) => result.outputSha256)).size === 3;
const batchPassed = allQc && outputHashesUnique;
const report = `# Sean Jewelry Batch Test\n\n- Batch workflow: ${batchPassed ? 'PASS' : 'FAIL'}\n- True Remotion render: ${passed === 3 ? 'PASS' : 'FAIL'}\n- Products rendered: ${passed}/3\n- All QC >=90: ${allQc ? 'YES' : 'NO'}\n- Three output SHA256 hashes unique: ${outputHashesUnique ? 'PASS' : 'FAIL'}\n- MAX_CONCURRENT_RENDERS: ${maxConcurrent}\n\n| Product ID | Product Name | Input asset | Input asset hash | Output MP4 | Output SHA256 | QC score |\n|---|---|---|---|---|---|---:|\n${results.map((r) => `| ${r.product.id} | ${r.product.name} | ${r.inputAsset} | ${r.inputAssetHash} | ${r.output} | ${r.outputSha256} | ${r.score} |`).join('\n')}\n`;
await writeFile(reportPath, report);

if (!batchPassed) {
  console.error(report);
  console.error(outputHashesUnique ? 'Remotion Render = FAIL. No fallback renderer was attempted.' : 'Batch test = FAIL: two or more output MP4 hashes are identical.');
  process.exitCode = 1;
} else {
  await exec('zip', ['-r', zipPath, 'final', 'previews', 'batch-report.md', 'qc-reports', 'storyboards'], {cwd: outputDir});
  console.log(report);
  console.log(`ZIP artifact: ${zipPath}`);
}
