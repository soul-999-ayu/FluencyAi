import { MsEdgeTTS, OUTPUT_FORMAT } from 'ms-edge-tts';

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, voice } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    // 2. Initialize the TTS engine
    const tts = new MsEdgeTTS();
    
    // 3. Set Voice (Default to Aria if none provided) and Format
    await tts.setMetadata(
      voice || "en-US-AriaNeural", 
      OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
    );

    // 4. Create a stream and pipe it directly to the response
    const readable = await tts.toStream(text);
    
    res.setHeader('Content-Type', 'audio/mp3');
    readable.pipe(res);

  } catch (error) {
    console.error("TTS Generation Error:", error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
}