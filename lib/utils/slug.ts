/**
 * Convert Turkish characters to English equivalents
 */
function turkishToEnglish(text: string): string {
  const turkishChars: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
  };

  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, (char) => turkishChars[char] || char);
}

/**
 * Generate a URL-friendly slug from a text string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug (lowercase, with hyphens instead of spaces)
 * 
 * @example
 * generateSlug("Pembe Ruj Seti - 5 Adet") // "pembe-ruj-seti-5-adet"
 * generateSlug("Çanta & Çanta Modelleri") // "canta-canta-modelleri"
 */
export function generateSlug(text: string): string {
  if (!text) return '';

  // Convert Turkish characters to English
  let slug = turkishToEnglish(text);

  // Convert to lowercase
  slug = slug.toLowerCase();

  // Replace spaces and special characters with hyphens
  slug = slug.replace(/[^\w\s-]/g, ''); // Remove special characters except word chars, spaces, and hyphens
  slug = slug.replace(/[\s_]+/g, '-'); // Replace spaces and underscores with hyphens
  slug = slug.replace(/--+/g, '-'); // Replace multiple hyphens with a single hyphen
  slug = slug.replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens

  return slug;
}

