import https from 'https';

/**
 * Fetch a GIF URL from the waifu.pics API.
 * @param {string} type - e.g. 'hug', 'kiss', 'slap'
 * @returns {Promise<string>} The image URL
 */
export function fetchWaifuGif(type) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.waifu.pics',
      path: `/sfw/${type}`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json?.url) resolve(json.url);
          else reject(new Error('No URL in response'));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}
