// api/tts.js
const googleTTS = require('google-tts-api');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { text } = req.body;

  try {
    // Google TTS returns a URL to the audio file
    const url = googleTTS.getAudioUrl(text, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    });

    // Fetch that audio and send it back to the user (Proxy)
    const audioResponse = await fetch(url);
    const arrayBuffer = await audioResponse.arrayBuffer();
    
    res.setHeader('Content-Type', 'audio/mp3');
    res.send(Buffer.from(arrayBuffer));

  } catch (error) {
    console.error("Google TTS Error:", error);
    res.status(500).json({ error: error.message });
  }
};