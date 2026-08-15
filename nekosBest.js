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
  } catch (err) {
    if (err.cause) throw new Error(`${url} failed: ${err.message} (${err.cause.code ?? err.cause.message ?? err.cause})`);
    throw err;
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

async function fetchFromOtakuGifs(type) {
  const json = await fetchJson(`https://api.otakugifs.xyz/gif?reaction=${type}&format=gif`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!json?.url) throw new Error('otakugifs.xyz: no URL in response');
  return json.url;
}

const PROVIDERS = [
  { name: 'nekos.best', fetch: fetchFromNekosBest },
  { name: 'waifu.pics', fetch: fetchFromWaifuPics },
  { name: 'otakugifs.xyz', fetch: fetchFromOtakuGifs },
];

export async function fetchNekosGif(type) {
  const errors = [];
  for (const provider of PROVIDERS) {
    try {
      return await provider.fetch(type);
    } catch (err) {
      errors.push(`${provider.name}: ${err.message}`);
    }
  }
  throw new Error(`Failed to fetch a "${type}" GIF from all providers.\n${errors.join('\n')}`);
}
