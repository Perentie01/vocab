/**
 * Translation service - kept for potential future use
 * Currently not used as users paste English and Chinese directly
 */

export async function translateText(text: string, from: string, to: string): Promise<string> {
  try {
    const params = new URLSearchParams({
      q: text,
      langpair: `${from}|${to}`,
    });

    const response = await fetch(`https://api.mymemory.translated.net/get?${params}`);
    const data = await response.json();

    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    }

    throw new Error('Translation failed');
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}
