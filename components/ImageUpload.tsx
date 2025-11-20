'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  folder?: string;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  folder = 'products',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setUploadError(`Maksimum ${maxImages} görsel yükleyebilirsiniz`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const uploadedUrls: string[] = [];

      // Cloudinary configuration
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = 'auraguzellikmerkezi'; // Unsigned upload preset

      if (!cloudName) {
        throw new Error('Cloudinary yapılandırması bulunamadı');
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setUploadError(`${file.name} bir resim dosyası değil`);
          continue;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          setUploadError(`${file.name} çok büyük (maksimum 10MB)`);
          continue;
        }

        // Upload directly to Cloudinary using unsigned upload preset
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', `auraguzellikmerkezi/${folder}`);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Yükleme başarısız' }));
          throw new Error(error.error?.message || error.error || 'Yükleme başarısız');
        }

        const result = await response.json();
        console.log('Cloudinary upload result:', result);
        
        if (result.secure_url) {
          uploadedUrls.push(result.secure_url);
          console.log('Added URL to array:', result.secure_url);
        } else {
          console.error('No secure_url in result:', result);
          throw new Error('Yükleme başarısız: URL alınamadı');
        }
      }

      // Add new URLs to images array
      if (uploadedUrls.length > 0) {
        const newImages = [...images, ...uploadedUrls];
        console.log('Updating images state. Old:', images, 'New:', newImages);
        onImagesChange(newImages);
      } else {
        console.warn('No URLs to add to images array');
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Görsel yüklenirken bir hata oluştu'
      );
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Görseller {images.length > 0 && `(${images.length}/${maxImages})`}
        </label>
        
        {uploadError && (
          <div className="mb-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {uploadError}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || images.length >= maxImages}
        />

        <button
          type="button"
          onClick={handleClick}
          disabled={uploading || images.length >= maxImages}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            uploading || images.length >= maxImages
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-blue text-white hover:bg-primary-blue-dark'
          }`}
        >
          {uploading ? 'Yükleniyor...' : '+ Görsel Yükle'}
        </button>

        {images.length >= maxImages && (
          <p className="text-sm text-gray-500 mt-1">
            Maksimum görsel sayısına ulaştınız
          </p>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-300">
                <Image
                  src={url}
                  alt={`Görsel ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                title="Kaldır"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-primary-blue text-white text-xs px-2 py-1 rounded">
                  Ana Görsel
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500">
        💡 İlk görsel ürünün ana görseli olarak kullanılacaktır. Maksimum {maxImages} görsel yükleyebilirsiniz.
      </p>
    </div>
  );
}

