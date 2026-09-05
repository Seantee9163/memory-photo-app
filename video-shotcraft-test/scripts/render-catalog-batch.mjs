import {execFile} from 'node:child_process';
import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import {extname, resolve} from 'node:path';
import {promisify} from 'node:util';

const exec = promisify(execFile);
const projectDir = resolve(import.meta.dirname, '..');
const repoDir = resolve(projectDir, '..');
const productsRoot = resolve(repoDir, 'video-shotcraft-products');
const catalogPath = resolve(productsRoot, 'catalog.json');
const publicDir = resolve(projectDir, 'public');
const batchProductsPath = resolve(projectDir, 'batch-products.json');

const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
if (!Array.isArray(catalog.products) || catalog.products.length < 1) {
  throw new Error('video-shotcraft-products/catalog.json has no products.');
}

await mkdir(publicDir, {recursive: true});

const variantByIndex = ['prayer-wheel', 'heritage', 'celebration'];
const categoryByIndex = ['mechanical-jewelry', 'heritage-jewelry', 'celebration-jewelry'];
const batchProducts = [];

for (const [index, item] of catalog.products.entries()) {
  if (item.imageStatus !== 'READY' || item.videoStatus !== 'READY') {
    throw new Error(`${item.id} is not READY for both image and video.`);
  }

  const config = JSON.parse(await readFile(resolve(productsRoot, item.config), 'utf8'));
  const sourceImage = resolve(productsRoot, item.image);
  const sourceVideo = resolve(productsRoot, item.video);
  const imageExt = extname(sourceImage) || '.jpg';
  const videoExt = extname(sourceVideo) || '.mp4';
  const imageAsset = `${item.id}-image${imageExt}`;
  const videoAsset = `${item.id}-video${videoExt}`;

  await copyFile(sourceImage, resolve(publicDir, imageAsset));
  await copyFile(sourceVideo, resolve(publicDir, videoAsset));

  const subtitles = Array.isArray(config.subtitles) ? config.subtitles : [];
  batchProducts.push({
    id: item.id,
    name: config.name || item.name || item.id,
    category: categoryByIndex[index] || 'gold-jewelry',
    imageAsset,
    videoAsset,
    audioAsset: 'jewelry-ambient.wav',
    heroCopy: subtitles[0] || '916黄金 · 匠心之作',
    macroCopy: subtitles[1] || '细节，近看更动人',
    rotationCopy: subtitles[2] || '光影流转',
    detailCopy: subtitles[3] || '工艺，在每一处可见',
    endTitle: subtitles[4] || '匠心成金',
    endSubtitle: subtitles[5] || '把珍贵，留在身边',
    variant: variantByIndex[index] || 'prayer-wheel',
  });
}

await writeFile(batchProductsPath, `${JSON.stringify(batchProducts, null, 2)}\n`);
console.log(`Prepared ${batchProducts.length} real products from video-shotcraft-products/catalog.json`);
for (const product of batchProducts) {
  console.log(`${product.id}: image=${product.imageAsset} video=${product.videoAsset} variant=${product.variant}`);
}

await exec('node', ['scripts/render-jewelry-batch.mjs'], {
  cwd: projectDir,
  env: {...process.env, MAX_CONCURRENT_RENDERS: process.env.MAX_CONCURRENT_RENDERS || '2'},
  maxBuffer: 50 * 1024 * 1024,
});

console.log('Real catalog batch render completed.');
