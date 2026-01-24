import simp from 'simply-slugy';
import transliterate from '@sindresorhus/transliterate';

export function generateSlug(text: string) {
  const latin = transliterate(text);
  return simp.slugify(latin, {
    lower: true,
    strict: true,
    trim: true,
  }) as string;
}
