// Entity Model (EF Entity benzeri)
export interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlogDto {
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  published?: boolean;
}

export interface UpdateBlogDto {
  title?: string;
  content?: string;
  excerpt?: string;
  image?: string | null; // null = resmi kaldır
  published?: boolean;
}

