import https from 'https';

/**
 * Fetch a GIF URL from the nekos.best API.
 * @param {string} type - e.g. 'hug', 'kiss', 'slap'
 * @returns {Promise<string>} The image URL
 */
export function fetchNekosGif(type) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'nekos.best',
      path: `/api/v2/${type}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Inasha-Fluxer-Bot/1.0 (https://github.com/)',
      },
      timeout: 5000,
    };
    const req = https.request(options, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        return reject(new Error(`nekos.best returned status ${res.statusCode}`));
      }

      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const url = json?.results?.[0]?.url;
          if (url) resolve(url);
          else reject(new Error('No URL in response'));
        } catch (e) { reject(e); }
      });
    });
    req.on('timeout', () => req.destroy(new Error('Request to nekos.best timed out')));
    req.on('error', reject);
    req.end();
  });
}
