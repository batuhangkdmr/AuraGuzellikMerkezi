import { getCategoryTree } from '@/app/server-actions/categoryActions';
import MegaMenuClient from './MegaMenuClient';

export default async function MegaMenuServer() {
  // Get only active categories for public menu
  const result = await getCategoryTree(false); // Only active categories
  const categories = result.success && result.data ? result.data : [];

  return <MegaMenuClient categories={categories} />;
}

