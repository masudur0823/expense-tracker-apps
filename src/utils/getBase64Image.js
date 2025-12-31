import path from "path";
import sharp from "sharp";

// only works on backend

// 🔄 Convert image (webp/png/jpg) to base64 PNG
const getBase64Image = async (relativePath) => {
  try {
    const filePath = path.join(process.cwd(), "public", relativePath);
    const buffer = await sharp(filePath).png().toBuffer(); // force PNG format
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error("Image conversion failed:", error.message);
    return null;
  }
};

export default getBase64Image;
