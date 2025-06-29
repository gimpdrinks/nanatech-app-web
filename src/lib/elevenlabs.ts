const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Female voice with Filipino accent

export async function synthesizeSpeech(text: string): Promise<AudioBuffer | null> {
  if (!ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not found in environment variables, using browser TTS fallback');
    // Fallback to browser's speech synthesis
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Browser TTS also failed:', error);
    }
    return null;
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioContext = new AudioContext();
    return await audioContext.decodeAudioData(audioBuffer);
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    // Fallback to browser TTS
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    } catch (fallbackError) {
      console.error('Browser TTS fallback also failed:', fallbackError);
    }
    return null;
  }
}

export function playAudio(audioBuffer: AudioBuffer) {
  try {
    const audioContext = new AudioContext();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  } catch (error) {
    console.error('Error playing audio:', error);
  }
}

export function speakText(text: string) {
  synthesizeSpeech(text).then(audioBuffer => {
    if (audioBuffer) {
      playAudio(audioBuffer);
    }
  }).catch(error => {
    console.error('Error in speakText:', error);
  });
}