/**
 */

const REQUEST_TIMEOUT_MS = 5000;

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`${url} returned status ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFromNekosBest(type) {
  const json = await fetchJson(`https://nekos.best/api/v2/${type}`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Inasha-Fluxer-Bot/1.0 (https://github.com/)',
    },
  });
  const url = json?.results?.[0]?.url;
  if (!url) throw new Error('nekos.best: no URL in response');
  return url;
}

async function fetchFromWaifuPics(type) {
  const json = await fetchJson(`https://api.waifu.pics/sfw/${type}`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!json?.url) throw new Error('waifu.pics: no URL in response');
  return json.url;
}

export async function fetchNekosGif(type) {
  try {
    return await fetchFromNekosBest(type);
  } catch (primaryErr) {
    try {
      return await fetchFromWaifuPics(type);
    } catch (fallbackErr) {
      const err = new Error(
        `Failed to fetch a "${type}" GIF from both providers. ` +
        `nekos.best: ${primaryErr.message} | waifu.pics: ${fallbackErr.message}`
      );
      err.cause = { primaryErr, fallbackErr };
      throw err;
    }
  }
}
