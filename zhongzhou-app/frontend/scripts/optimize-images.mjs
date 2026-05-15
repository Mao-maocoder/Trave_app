import sharp from 'sharp';
import { readdir, unlink } from 'fs/promises';
import { join } from 'path';

const dir = './public/images/spots';
const files = await readdir(dir);

for (const file of files) {
  if (!file.endsWith('.png')) continue;
  if (file === 'zhongzhou_music2.png') {
    await unlink(join(dir, file));
    console.log('deleted:', file);
    continue;
  }
  const input = join(dir, file);
  const output = join(dir, file.replace('.png', '.webp'));
  await sharp(input)
    .webp({ quality: 82 })
    .toFile(output);
  console.log('converted:', file, '→', file.replace('.png', '.webp'));
}
