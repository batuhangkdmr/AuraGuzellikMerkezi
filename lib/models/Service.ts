// Service Model ve DTO'lar

export interface Service {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create DTO (Yeni hizmet eklerken)
export interface CreateServiceDto {
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  published?: boolean;
}

// Update DTO (Hizmet güncellerken)
export interface UpdateServiceDto {
  title?: string;
  content?: string;
  excerpt?: string;
  image?: string | null; // null = resmi kaldır
  published?: boolean;
}

