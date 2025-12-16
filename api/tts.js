// api/tts.js
const googleTTS = require('google-tts-api');
const https = require('https'); // Native Node.js module (no install needed)

module.exports = async function handler(req, res) {
  // 1. Setup CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    // 2. Get Google TTS URL
    // Truncate to 200 chars to respect Google's limit
    const safeText = text.substring(0, 200);
    
    const url = googleTTS.getAudioUrl(safeText, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    });

    // 3. Download and Pipe using HTTPS (Instead of fetch)
    // This prevents the "fetch is not defined" crash
    https.get(url, (stream) => {
      // Check if Google returned a valid audio stream
      if (stream.statusCode !== 200) {
        res.status(500).json({ error: `Google API returned status: ${stream.statusCode}` });
        return;
      }

      res.setHeader('Content-Type', 'audio/mp3');
      stream.pipe(res); // Send audio chunk-by-chunk to frontend
    }).on('error', (err) => {
      console.error("Download Error:", err);
      res.status(500).json({ error: 'Failed to download audio from Google' });
    });

  } catch (error) {
    console.error("General TTS Error:", error);
    res.status(500).json({ error: error.message });
  }
};