'use client';

import { deleteBlog } from './actions';

interface DeleteButtonProps {
  blogId: number;
  blogTitle: string;
}

export default function DeleteButton({ blogId, blogTitle }: DeleteButtonProps) {
  const handleDelete = async () => {
    if (confirm(`"${blogTitle}" başlıklı blogu silmek istediğinize emin misiniz?`)) {
      const result = await deleteBlog(blogId);
      if (result.success) {
        window.location.reload();
      } else {
        alert('Blog silinemedi: ' + result.error);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800 ml-2"
    >
      Sil
    </button>
  );
}

