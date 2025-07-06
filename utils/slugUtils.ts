/**
 * Generates a SEO-friendly slug from a given string
 * Converts spaces and special characters to dashes, removes consecutive dashes,
 * and ensures the slug is URL-safe
 * 
 * @param text - The text to convert to a slug
 * @returns A SEO-friendly slug
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    // Replace spaces with dashes
    .replace(/\s+/g, '-')
    // Replace special characters with dashes
    .replace(/[^a-z0-9-]/g, '-')
    // Remove consecutive dashes
    .replace(/-+/g, '-')
    // Remove leading and trailing dashes
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates a unique slug by appending a number if the slug already exists
 * 
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
} 