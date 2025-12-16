const googleTTS = require('google-tts-api');
const https = require('https');

// Helper function to download audio buffers
function downloadAudio(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Google refused connection: ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  // 1. Setup CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    // 2. CLEANUP: Remove Markdown (*, #) so the voice doesn't read them
    // This makes it sound much more natural
    const cleanText = text
      .replace(/[*#]/g, '')     // Remove * and #
      .replace(/\s+/g, ' ')     // Remove extra spaces
      .trim();

    // 3. SPLIT: Get multiple URLs for long text (chunks < 200 chars)
    const urls = googleTTS.getAllAudioUrls(cleanText, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
      splitPunct: ',.?!' // Split intelligently at punctuation
    });

    // 4. DOWNLOAD: Fetch all audio clips in parallel
    const audioBuffers = await Promise.all(urls.map(u => downloadAudio(u.url)));

    // 5. MERGE: Combine all buffers into one long file
    const finalBuffer = Buffer.concat(audioBuffers);

    // 6. SEND
    res.setHeader('Content-Type', 'audio/mp3');
    res.send(finalBuffer);

  } catch (error) {
    console.error("Long TTS Error:", error);
    res.status(500).json({ error: error.message });
  }
};