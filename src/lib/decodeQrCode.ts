import jsQR from "jsqr";

/**
 * Decodes a QR code from a base64/data-URI image string.
 * Returns the decoded text (PIX EMV payload) or null on failure.
 */
export async function decodeQrCode(base64OrDataUri: string): Promise<string | null> {
  try {
    const src = base64OrDataUri.startsWith("data:")
      ? base64OrDataUri
      : `data:image/png;base64,${base64OrDataUri}`;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width || 320;
        canvas.height = img.height || 320;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsQR(imageData.data, imageData.width, imageData.height);
        resolve(result?.data || null);
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  } catch {
    return null;
  }
}
