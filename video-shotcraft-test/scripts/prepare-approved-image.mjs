import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const encodedPath = resolve(projectRoot, 'assets/gold-jewelry-approved.png.base64');
const outputPath = resolve(projectRoot, 'public/gold-jewelry-approved.png');

const encoded = await readFile(encodedPath, 'utf8');
const approvedImage = Buffer.from(encoded.replace(/\s/g, ''), 'base64');

if (approvedImage.subarray(1, 4).toString('ascii') !== 'PNG') {
  throw new Error('The approved product image payload is not a valid PNG.');
}

await mkdir(dirname(outputPath), {recursive: true});
await writeFile(outputPath, approvedImage);
console.log(`Restored approved product image: ${outputPath}`);
