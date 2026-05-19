import sharp from "sharp";
import { supabaseAdmin } from "@/lib/supabase-admin";

const PHOTOS_BUCKET = "photos";
const AVATARS_BUCKET = "avatars";

export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function savePhoto(buffer: Buffer, filename: string): Promise<string> {
  const compressed = await sharp(buffer)
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const webpFilename = filename.replace(/\.[^.]+$/, ".webp");
  const filePath = webpFilename;

  const { error } = await supabaseAdmin.storage
    .from(PHOTOS_BUCKET)
    .upload(filePath, compressed, { contentType: "image/webp", upsert: false });

  if (error) throw error;

  const { data: urlData } = supabaseAdmin.storage
    .from(PHOTOS_BUCKET)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

export async function deletePhoto(imagePath: string): Promise<void> {
  const filePath = extractStoragePath(imagePath, PHOTOS_BUCKET);
  if (!filePath) return;

  await supabaseAdmin.storage.from(PHOTOS_BUCKET).remove([filePath]);
}

export async function saveAvatar(buffer: Buffer, filename: string): Promise<string> {
  const compressed = await sharp(buffer)
    .resize({ width: 400, height: 400, fit: "cover" })
    .webp({ quality: 82 })
    .toBuffer();

  const webpFilename = filename.replace(/\.[^.]+$/, ".webp");
  const filePath = webpFilename;

  const { error } = await supabaseAdmin.storage
    .from(AVATARS_BUCKET)
    .upload(filePath, compressed, { contentType: "image/webp", upsert: true });

  if (error) throw error;

  const { data: urlData } = supabaseAdmin.storage
    .from(AVATARS_BUCKET)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

function extractStoragePath(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export function getPhotoUrl(imagePath: string): string {
  return imagePath;
}
