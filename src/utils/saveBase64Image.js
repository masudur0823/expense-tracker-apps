import sharp from "sharp";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function saveBase64Image(base64String) {
  if (
    typeof base64String !== "string" ||
    !base64String.startsWith("data:image")
  ) {
    return null;
  }

  const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 image format");
  }

  const buffer = Buffer.from(matches[2], "base64");

  const compressedBuffer = await sharp(buffer).webp({ quality: 75 }).toBuffer();

  const filename = `${crypto.randomBytes(16).toString("hex")}.webp`;
  const filePath = path.join(process.cwd(), "public", "uploads", filename);
  await writeFile(filePath, compressedBuffer);

  return `/uploads/${filename}`;
}

export async function saveImageAndDeleteOld(base64String, oldPath = "") {
  // If empty, delete old image and return empty string
  if (!base64String) {
    if (oldPath && oldPath.includes("/uploads")) {
      try {
        await unlink(path.join(process.cwd(), "public", oldPath));
      } catch (e) {
        console.warn("Could not delete old image:", e.message);
      }
    }
    return ""; // important: update DB to empty
  }

  if (!base64String.startsWith("data:image")) return base64String;

  const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches || matches.length !== 3) throw new Error("Invalid image data");

  const ext = "webp";
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");

  const compressedBuffer = await sharp(buffer).webp({ quality: 75 }).toBuffer();

  // Delete old file if it's a path under /uploads
  if (oldPath && oldPath.includes("/uploads")) {
    try {
      await unlink(path.join(process.cwd(), "public", oldPath));
    } catch (e) {
      console.warn("Could not delete old image:", e.message);
    }
  }

  const filename = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
  const newPath = `/uploads/${filename}`;
  const filePath = path.join(process.cwd(), "public", "uploads", filename);
  await writeFile(filePath, compressedBuffer);

  return newPath;
}
