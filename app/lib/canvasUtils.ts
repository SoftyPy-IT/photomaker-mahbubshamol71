/**
 * Canvas utility functions for photo frame operations
 */

// Clear the canvas with a transparent background
export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void => {
  ctx.clearRect(0, 0, width, height);
};

// Create a circular clipping mask
export const createCircularMask = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
): void => {
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.clip();
};

// Create a square clipping mask
export const createSquareMask = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
): void => {
  ctx.beginPath();
  ctx.rect(centerX - size / 2, centerY - size / 2, size, size);
  ctx.clip();
};

/**
 * Draws an image on the canvas with scale and position
 * Handles aspect ratio centering automatically
 */
export const drawTransformImage = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  centerX: number,
  centerY: number,
  targetSize: number, // The size of the mask area
  zoom: number,
  offsetX: number,
  offsetY: number,
): void => {
  const scale = zoom / 100;

  // Calculate initial scale to cover the targetSize
  const imageAspect = image.width / image.height;
  let drawWidth, drawHeight;

  if (imageAspect > 1) {
    // Landscape
    drawHeight = targetSize;
    drawWidth = targetSize * imageAspect;
  } else {
    // Portrait or Square
    drawWidth = targetSize;
    drawHeight = targetSize / imageAspect;
  }

  // Apply zoom
  drawWidth *= scale;
  drawHeight *= scale;

  // Calculate top-left to center the image + apply user offset
  const x = centerX - drawWidth / 2 + offsetX;
  const y = centerY - drawHeight / 2 + offsetY;

  ctx.drawImage(image, x, y, drawWidth, drawHeight);
};

// Draw a frame image on top
export const drawFrame = (
  ctx: CanvasRenderingContext2D,
  frameImage: HTMLImageElement,
  width: number,
  height: number,
): void => {
  ctx.drawImage(frameImage, 0, 0, width, height);
};

// Export canvas as PNG data URL
export const exportCanvasAsPNG = (canvas: HTMLCanvasElement): string => {
  return canvas.toDataURL("image/png");
};

// Download the exported image
export const downloadImage = (
  dataUrl: string,
  filename: string = "framed-photo.png",
): void => {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
