export const isArabic = (t?: string | null) => !!t && /[\u0600-\u06FF]/.test(t);

export function getLangDir(...texts: Array<string | null | undefined>) {
  const sample = texts.filter(Boolean).join(' ');
  const ar = isArabic(sample);
  return { lang: ar ? 'ar' : 'en', dir: ar ? 'rtl' : 'ltr' } as const;
}
