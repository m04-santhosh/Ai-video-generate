export interface AudioGenerationResult {
  audioUrl: string;
  duration: number;
}

const elevenlabsKey = process.env.ELEVENLABS_API_KEY || '';

export const isElevenLabsSandbox = () => {
  return !elevenlabsKey || elevenlabsKey.includes('mock');
};

export const AVAILABLE_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Female)', previewUrl: 'https://api.elevenlabs.io/v1/voices/21m00Tcm4TlvDq8ikWAM/previews' },
  { id: 'AZnzlk1Xhg7KHkWDSpZs', name: 'Dom (Male)', previewUrl: 'https://api.elevenlabs.io/v1/voices/AZnzlk1Xhg7KHkWDSpZs/previews' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Female)', previewUrl: 'https://api.elevenlabs.io/v1/voices/EXAVITQu4vr4xnSDxMaL/previews' },
  { id: 'pNInz6obpgq5paNs9W5y', name: 'Adam (Male)', previewUrl: 'https://api.elevenlabs.io/v1/voices/pNInz6obpgq5paNs9W5y/previews' },
  { id: 'TxGEqn7nUccqthD99ox5', name: 'Josh (Male)', previewUrl: 'https://api.elevenlabs.io/v1/voices/TxGEqn7nUccqthD99ox5/previews' }
];

export async function generateSpeech(text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM'): Promise<AudioGenerationResult> {
  const wordCount = text.split(/\s+/).length;
  // Estimate speaking duration: ~150 words per minute (~2.5 words per second)
  const estimatedDuration = Math.max(2.0, parseFloat((wordCount / 2.5).toFixed(1)));

  if (isElevenLabsSandbox()) {
    console.log(`ElevenLabs in Sandbox Mode. Generating real human voice via Google TTS fallback for: "${text}"`);
    
    // Google Translate TTS is free, public, and provides real human speech MP3s.
    // Truncate to 180 characters to comply with Google Translate TTS limits.
    const cleanText = text.substring(0, 180);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
    
    return {
      audioUrl: googleTtsUrl,
      duration: estimatedDuration
    };
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenlabsKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS request failed: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const filename = `voice-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
    
    return {
      audioUrl: filename,
      duration: estimatedDuration
    };
  } catch (err) {
    console.error('ElevenLabs Audio Generation Error, falling back to Google TTS:', err);
    // Fall back to Google TTS instead of music track
    const cleanText = text.substring(0, 180);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
    return {
      audioUrl: googleTtsUrl,
      duration: estimatedDuration
    };
  }
}
