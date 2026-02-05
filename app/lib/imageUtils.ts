/**
 * Image utility functions for loading and processing
 */

// Load an image from a file
export const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
};

// Load an image from a URL
export const loadImageFromUrl = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image from URL"));

    img.src = url;
  });
};

// Get image dimensions
export const getImageDimensions = (
  image: HTMLImageElement,
): { width: number; height: number } => {
  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
  };
};

// Check if image is square-ish (good for circular cropping)
export const isImageSuitableForCircular = (
  image: HTMLImageElement,
): boolean => {
  const { width, height } = getImageDimensions(image);
  const aspectRatio = width / height;
  return aspectRatio >= 0.8 && aspectRatio <= 1.25; // Allow some tolerance
};
