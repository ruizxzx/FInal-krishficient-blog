import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropDone: (croppedBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropDone, onCancel, aspectRatio = 16 / 9 }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleDone = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropDone(croppedBlob);
    } catch (e) {
      console.error(e);
      alert('Error cropping image');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-3xl h-[60vh] bg-neutral-900 neo-border neo-shadow">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>
      <div className="w-full max-w-3xl mt-4 flex items-center justify-between gap-4 p-4 bg-white border-4 border-black neo-shadow">
        <div className="flex-1 flex items-center space-x-2">
          <label className="font-mono text-xs font-bold text-black uppercase shrink-0">Zoom:</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-black"
          />
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button onClick={onCancel} className="px-4 py-2 bg-neutral-200 border-2 border-black font-display font-black text-sm uppercase hover:bg-neutral-300">
            <X className="w-4 h-4 inline-block mr-1" /> Cancel
          </button>
          <button onClick={handleDone} className="px-4 py-2 bg-[var(--color-primary)] border-2 border-black font-display font-black text-sm uppercase hover:bg-[var(--color-secondary)]">
            <Check className="w-4 h-4 inline-block mr-1" /> Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
};
