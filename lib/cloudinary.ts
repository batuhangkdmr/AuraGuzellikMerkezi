'use server';

import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
if (
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

/**
 * Upload image to Cloudinary from base64 or file buffer
 */
export async function uploadImage(
  file: File | Buffer | string,
  folder: string = 'products'
): Promise<CloudinaryUploadResult> {
  try {
    // Convert File to buffer if needed
    let fileBuffer: Buffer;
    let fileName: string = 'image';

    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      fileName = file.name;
    } else if (typeof file === 'string') {
      // If it's a base64 string
      const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
      fileBuffer = Buffer.from(base64Data, 'base64');
    } else {
      fileBuffer = file;
    }

    // Convert buffer to base64 data URI
    const base64Image = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload(
        base64Image,
        {
          folder: `auraguzellik/${folder}`,
          resource_type: 'image',
          transformation: [
            {
              width: 1200,
              height: 1200,
              crop: 'limit',
              quality: 'auto',
              format: 'auto',
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              secure_url: result.secure_url || result.url || '',
              public_id: result.public_id || '',
              width: result.width || 0,
              height: result.height || 0,
            });
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        }
      );
    });

    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}


