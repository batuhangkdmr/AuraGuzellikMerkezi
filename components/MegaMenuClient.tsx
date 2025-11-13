'use client';

import { Category } from '@/lib/repositories/CategoryRepository';
import MegaMenu from './MegaMenu';

interface MegaMenuClientProps {
  categories: Category[];
}

export default function MegaMenuClient({ categories }: MegaMenuClientProps) {
  return <MegaMenu categories={categories} />;
}

