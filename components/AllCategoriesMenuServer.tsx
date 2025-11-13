import { getCategoryTree } from '@/app/server-actions/categoryActions';
import AllCategoriesMenu from './AllCategoriesMenu';

export default async function AllCategoriesMenuServer() {
  // Get all categories (including inactive for admin view, but we'll filter in component)
  const result = await getCategoryTree(false); // Only active categories
  const categories = result.success && result.data ? result.data : [];

  return <AllCategoriesMenu categories={categories} />;
}

