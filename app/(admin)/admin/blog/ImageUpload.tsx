'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(value || '');

  const handleUpload = (result: any) => {
    const url = result.info.secure_url;
    setImageUrl(url);
    onChange(url);
  };

  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-2">
        Blog Resmi
      </label>
      
      <div className="space-y-4">
        {imageUrl && (
          <div className="relative">
            <img 
              src={imageUrl} 
              alt="Blog resmi" 
              className="w-full max-w-md h-64 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                setImageUrl('');
                onChange('');
              }}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
            >
              Kaldır
            </button>
          </div>
        )}
        
        <CldUploadWidget
          uploadPreset="auraguzellikmerkezi"
          onSuccess={handleUpload}
          options={{
            maxFiles: 1,
            resourceType: 'image',
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
            maxImageFileSize: 5000000, // 5MB
            folder: 'aura-guzellik/blogs'
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              📸 {imageUrl ? 'Resmi Değiştir' : 'Resim Yükle'}
            </button>
          )}
        </CldUploadWidget>
        
        <input 
          type="hidden" 
          name="image" 
          value={imageUrl}
        />
        
        <p className="text-sm text-gray-500">
          💡 JPEG, PNG veya WEBP formatında, maksimum 5MB boyutunda resim yükleyebilirsiniz
        </p>
      </div>
    </div>
  );
}

