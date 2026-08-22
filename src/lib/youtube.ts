const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

const ALLOWED_HOSTS = new Set([
  'youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
]);

const PATH_PREFIXES = /^\/(?:embed|shorts|live|v)\/([^/?#]+)/;

/** Message shown to editors when a YouTube link cannot be understood. */
export const YOUTUBE_HELP_MESSAGE =
  'YouTube link not recognised. Copy the full link from your browser address bar, for example https://www.youtube.com/watch?v=dQw4w9WgXcQ';

function asId(candidate: string | null | undefined): string | null {
  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

/** Accepts every common YouTube link shape (and a bare video id). */
export function parseYouTubeId(input: string): string | null {
  const raw = (input ?? '').trim();
  if (raw === '') return null;
  if (VIDEO_ID.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^(?:www|m)\./, '');
  if (!ALLOWED_HOSTS.has(host)) return null;

  if (host === 'youtu.be') return asId(url.pathname.slice(1).split('/')[0]);

  const fromQuery = asId(url.searchParams.get('v'));
  if (fromQuery) return fromQuery;

  return asId(url.pathname.match(PATH_PREFIXES)?.[1]);
}

export function youtubeEmbedUrl(id: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function youtubeThumbnails(id: string): { primary: string; fallback: string } {
  return {
    // maxresdefault does not exist for every video: the card falls back to
    // hqdefault, which YouTube always generates.
    primary: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    fallback: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
