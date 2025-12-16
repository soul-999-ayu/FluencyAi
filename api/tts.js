// Change 'ms-edge-tts' to 'msedge-tts'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, voice } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(
      voice || "en-US-AriaNeural", 
      OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
    );

    const readable = await tts.toStream(text);
    res.setHeader('Content-Type', 'audio/mp3');
    readable.pipe(res);

  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
}