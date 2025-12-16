// api/tts.js
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

module.exports = async function handler(req, res) {
  // 1. Allow CORS (Optional, but good for debugging)
  res.setHeader('Access-Control-Allow-Origin', '*');

  // 2. Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, voice } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  console.log(`Generating TTS for: "${text.substring(0, 20)}..."`);

  try {
    // 3. Initialize TTS
    const tts = new MsEdgeTTS();
    
    // 4. Set Metadata (Using hardcoded string to avoid import issues)
    await tts.setMetadata(
      voice || "en-US-AriaNeural", 
      "audio-24khz-96kbitrate-mono-mp3"
    );

    // 5. Create Stream
    const readable = await tts.toStream(text);
    
    // 6. Pipe to response
    res.setHeader('Content-Type', 'audio/mp3');
    readable.pipe(res);

  } catch (error) {
    console.error("CRITICAL TTS ERROR:", error);
    // Send detailed error back to browser for easier debugging
    res.status(500).json({ 
        error: 'TTS Generation Failed', 
        details: error.message 
    });
  }
};