import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_BYTES = 3.5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function saveReferenceImageToDemoFolder(file: File, merchantId: string) {
  if (file.size === 0) {
    throw new Error("A reference face photo is required.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Reference image is too large. Use a photo under 3.5 MB.");
  }

  const mime = file.type.toLowerCase();
  const ext = ALLOWED_TYPES[mime];
  if (!ext) {
    throw new Error("Upload a JPEG, PNG, or WebP photo.");
  }

  const demoDir = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "public",
    "demo",
  );
  await mkdir(demoDir, { recursive: true });

  const filename = `enrolled-${merchantId}${ext}`;
  const relativePath = `public/demo/${filename}`;
  const absolute = path.join(demoDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(absolute, bytes);

  return {
    referenceImagePath: relativePath,
    referenceImageUrl: `/demo/${filename}`,
  };
}
