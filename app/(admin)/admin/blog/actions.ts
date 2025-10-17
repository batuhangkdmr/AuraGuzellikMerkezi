'use server';

import BlogRepository from '@/lib/repositories/BlogRepository';
import { revalidatePath } from 'next/cache';

// ASP.NET MVC Controller benzeri Server Actions
// EF DbContext yerine Repository Pattern kullanıyoruz

// GET - Tüm blogları getir (EF: context.Blogs.ToListAsync())
export async function getBlogs() {
  try {
    const blogs = await BlogRepository.findAll();
    return { success: true, data: blogs };
  } catch (error) {
    console.error('Blog getirme hatası:', error);
    return { success: false, error: 'Bloglar getirilemedi' };
  }
}

// GET - Tek blog getir (EF: context.Blogs.FindAsync(id))
export async function getBlog(id: number) {
  try {
    const blog = await BlogRepository.findById(id);
    return { success: true, data: blog };
  } catch (error) {
    console.error('Blog getirme hatası:', error);
    return { success: false, error: 'Blog bulunamadı' };
  }
}

// POST - Yeni blog oluştur (EF: context.Blogs.Add() + SaveChanges())
export async function createBlog(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string || undefined;
    const image = formData.get('image') as string || undefined;
    const published = formData.get('published') === 'true';

    await BlogRepository.create({
      title,
      content,
      excerpt,
      image,
      published,
    });

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    
    return { success: true, message: 'Blog başarıyla oluşturuldu!' };
  } catch (error) {
    console.error('Blog oluşturma hatası:', error);
    return { success: false, error: 'Blog oluşturulamadı' };
  }
}

// PUT - Blog güncelle (EF: context.Blogs.Update() + SaveChanges())
export async function updateBlog(id: number, formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const excerptRaw = formData.get('excerpt') as string;
    const excerpt = excerptRaw?.trim() ? excerptRaw : undefined;
    const imageRaw = formData.get('image') as string;
    const image = imageRaw?.trim() ? imageRaw : null; // Boş string'i null yap (resmi kaldır)
    const published = formData.get('published') === 'true';

    await BlogRepository.update(id, {
      title,
      content,
      excerpt,
      image, // null = resmi kaldır, string = yeni resim
      published,
    });

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    
    return { success: true, message: 'Blog başarıyla güncellendi!' };
  } catch (error) {
    console.error('Blog güncelleme hatası:', error);
    return { success: false, error: 'Blog güncellenemedi' };
  }
}

// DELETE - Blog sil (EF: context.Blogs.Remove() + SaveChanges())
export async function deleteBlog(id: number) {
  try {
    await BlogRepository.delete(id);

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    
    return { success: true, message: 'Blog başarıyla silindi!' };
  } catch (error) {
    console.error('Blog silme hatası:', error);
    return { success: false, error: 'Blog silinemedi' };
  }
}

