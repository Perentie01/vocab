/**
 * Translation service using free translation APIs
 */

const TRANSLATION_API_URL = 'https://api.mymemory.translated.net/get';

export async function translateText(text: string, from: string, to: string): Promise<string> {
  try {
    const params = new URLSearchParams({
      q: text,
      langpair: `${from}|${to}`,
    });

    const response = await fetch(`${TRANSLATION_API_URL}?${params}`);
    const data = await response.json();

    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    }

    throw new Error('Translation failed');
  } catch (error) {
    console.error('Translation error:', error);
    // Fallback: return original text if translation fails
    return text;
  }
}

export async function detectLanguage(text: string): Promise<'en' | 'zh'> {
  // Simple language detection based on character patterns
  const chineseRegex = /[\u4E00-\u9FFF]/g;
  const chineseChars = (text.match(chineseRegex) || []).length;
  const totalChars = text.length;

  // If more than 30% of characters are Chinese, consider it Chinese
  if (chineseChars / totalChars > 0.3) {
    return 'zh';
  }

  return 'en';
}

export function getTranslationLanguagePair(language: 'en' | 'zh'): { from: string; to: string } {
  return language === 'en'
    ? { from: 'en', to: 'zh-CN' }
    : { from: 'zh-CN', to: 'en' };
}
