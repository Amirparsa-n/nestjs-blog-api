import slugify from 'simply-slugy';

export function generateSlug(text: string) {
  return slugify.slugify(text) as string;
}
