/**
 * Text-to-Speech service using Web Speech API
 */

interface SpeechOptions {
  language: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function speak(text: string, options: SpeechOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.language;
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    window.speechSynthesis.speak(utterance);
  });
}

export async function speakSequence(
  texts: Array<{ text: string; language: string; rate?: number }>,
  onProgress?: (index: number) => void
): Promise<void> {
  for (let i = 0; i < texts.length; i++) {
    const item = texts[i];
    onProgress?.(i);
    
    await speak(item.text, {
      language: item.language,
      rate: item.rate || 1,
    });

    // Add a small delay between utterances
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

export function stopSpeech(): void {
  window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
  return window.speechSynthesis.speaking;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis.getVoices();
}

export function getVoiceForLanguage(language: string): SpeechSynthesisVoice | undefined {
  const voices = getAvailableVoices();
  return voices.find(voice => voice.lang.startsWith(language));
}

export function speakText(text: string, lang: 'en' | 'zh'): void {
  const languageCode = lang === 'en' ? 'en-US' : 'zh-CN';
  speak(text, { language: languageCode }).catch(err => {
    console.error('Speech synthesis error:', err);
  });
}
