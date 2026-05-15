import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "photos");

export async function savePhoto(
  buffer: Buffer,
  filename: string
): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });

  // Compress: resize to max 2000px wide, convert to webp, quality 80
  const compressed = await sharp(buffer)
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const webpFilename = filename.replace(/\.[^.]+$/, ".webp");
  const filePath = path.join(UPLOAD_DIR, webpFilename);
  await writeFile(filePath, compressed);
  return `/uploads/photos/${webpFilename}`;
}

export async function deletePhoto(imagePath: string): Promise<void> {
  const filename = imagePath.replace("/uploads/photos/", "");
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    await unlink(filePath);
  } catch {
    // File may already be deleted
  }
}

export function getPhotoUrl(imagePath: string): string {
  return imagePath;
}

export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const AVATAR_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

export async function saveAvatar(
  buffer: Buffer,
  filename: string
): Promise<string> {
  await mkdir(AVATAR_DIR, { recursive: true });

  const compressed = await sharp(buffer)
    .resize({ width: 400, height: 400, fit: "cover" })
    .webp({ quality: 82 })
    .toBuffer();

  const webpFilename = filename.replace(/\.[^.]+$/, ".webp");
  const filePath = path.join(AVATAR_DIR, webpFilename);
  await writeFile(filePath, compressed);
  return `/uploads/avatars/${webpFilename}`;
}
