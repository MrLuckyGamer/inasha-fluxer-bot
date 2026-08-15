const REQUEST_TIMEOUT_MS = 5000;

export async function fetchReactionGif(type) {
  const url = `https://api.otakugifs.xyz/gif?reaction=${type}&format=gif`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`otakugifs.xyz returned status ${res.status}`);

    const json = await res.json();
    if (!json?.url) throw new Error('otakugifs.xyz: no URL in response');
    return json.url;
  } catch (err) {
    if (err.cause) throw new Error(`otakugifs.xyz failed: ${err.message} (${err.cause.code ?? err.cause.message ?? err.cause})`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
