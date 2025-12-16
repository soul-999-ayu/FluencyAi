// api/tts.js
import { EdgeTTS } from 'edge-tts';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, voice } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Select voice: 'en-US-AriaNeural' (Female) or 'en-US-GuyNeural' (Male)
  // You can pass this from the frontend or default it here
  const selectedVoice = voice || 'en-US-AriaNeural'; 

  try {
    const tts = new EdgeTTS({
      voice: selectedVoice,
      text: text,
    });

    const buffer = await tts.ttsPromise();

    // Send the audio file back to the browser
    res.setHeader('Content-Type', 'audio/mp3');
    res.send(buffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
}