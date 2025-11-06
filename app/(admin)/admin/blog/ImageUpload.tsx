'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';
import imageCompression from 'browser-image-compression';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(value || '');
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || '');

  // Manuel file upload ile compress
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);

      // Compression options (Yüksek Kalite)
      const options = {
        maxSizeMB: 3, // Maksimum 3MB (daha yüksek = daha iyi kalite)
        maxWidthOrHeight: 1920, // Full HD çözünürlük
        useWebWorker: true,
        initialQuality: 0.85, // %85 kalite (0.7-1.0 arası)
        alwaysKeepResolution: true, // Çözünürlüğü koru
        fileType: 'image/webp' // WebP formatına çevir
      };

      console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

      // Compress the image
      const compressedFile = await imageCompression(file, options);

      console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');

      // Preview için local URL oluştur
      const localUrl = URL.createObjectURL(compressedFile);
      setPreviewUrl(localUrl);

      // Cloudinary'ye yükle
      await uploadToCloudinary(compressedFile);

      setIsCompressing(false);
    } catch (error) {
      console.error('Image compression error:', error);
      alert('Resim sıkıştırılırken hata oluştu. Lütfen tekrar deneyin.');
      setIsCompressing(false);
    }
  };

  // Cloudinary'ye yükleme
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'auraguzellikmerkezi');
    formData.append('folder', 'aura-guzellik/blogs');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dhpsjuy69/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.secure_url) {
        setImageUrl(data.secure_url);
        onChange(data.secure_url);
        setPreviewUrl(data.secure_url);
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      alert('Resim yüklenirken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // CldUploadWidget ile fallback yükleme (eski yöntem)
  const handleWidgetUpload = (result: any) => {
    const url = result.info.secure_url;
    setImageUrl(url);
    onChange(url);
    setPreviewUrl(url);
  };

  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-2">
        Blog Resmi
      </label>
      
      <div className="space-y-4">
        {previewUrl && (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Blog resmi" 
              className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-gray-200"
            />
            <button
              type="button"
              onClick={() => {
                setImageUrl('');
                onChange('');
                setPreviewUrl('');
              }}
              disabled={disabled || isCompressing}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
            >
              ✕ Kaldır
            </button>
          </div>
        )}
        
        {/* Manuel File Upload (Öncelikli - Compress ile) */}
        <div className="flex flex-col gap-3">
          <label 
            htmlFor="manual-upload"
            className={`
              flex items-center justify-center gap-2
              bg-gradient-to-r from-purple-600 to-pink-600 text-white 
              px-6 py-3 rounded-lg font-semibold
              hover:from-purple-700 hover:to-pink-700 
              transition cursor-pointer
              ${(disabled || isCompressing) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isCompressing ? (
              <>
                <span className="animate-spin">🔄</span>
                <span>Resim Hazırlanıyor...</span>
              </>
            ) : (
              <>
                <span>📸</span>
                <span>{imageUrl ? 'Resmi Değiştir (Önerilen)' : 'Resim Yükle (Önerilen)'}</span>
              </>
            )}
          </label>
          <input
            id="manual-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || isCompressing}
            className="hidden"
          />
          
          {/* Alternatif: CldUploadWidget */}
          <CldUploadWidget
            uploadPreset="auraguzellikmerkezi"
            onSuccess={handleWidgetUpload}
            options={{
              maxFiles: 1,
              resourceType: 'image',
              clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
              maxImageFileSize: 10000000,
              folder: 'aura-guzellik/blogs',
              transformation: [{
                width: 1200,
                height: 800,
                crop: 'limit',
                quality: 'auto:good',
                fetch_format: 'auto'
              }]
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                disabled={disabled || isCompressing}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 text-sm"
              >
                🌐 Cloudinary Widget ile Yükle (Alternatif)
              </button>
            )}
          </CldUploadWidget>
        </div>
        
        <input 
          type="hidden" 
          name="image" 
          value={imageUrl}
        />
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <p className="text-sm text-blue-800 font-semibold">
            ✨ Yüksek Kalite Optimizasyon Aktif!
          </p>
          <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
            <li>Büyük resimleri destekliyoruz (10MB+)</li>
            <li>Resimler maksimum 3MB'a optimize edilir (Yüksek Kalite)</li>
            <li>WebP formatına çevrilir (%85 kalite korunur)</li>
            <li>1920px Full HD çözünürlük desteklenir</li>
            <li>Görsel netlik ve detay korunur</li>
          </ul>
        </div>

        {isCompressing && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              <span>Resim optimize ediliyor, lütfen bekleyin...</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
