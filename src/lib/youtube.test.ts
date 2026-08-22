import { describe, expect, it } from 'vitest';
import {
  parseYouTubeId,
  youtubeEmbedUrl,
  youtubeThumbnails,
  youtubeWatchUrl,
} from '~/lib/youtube';

const ID = 'dQw4w9WgXcQ';

describe('parseYouTubeId', () => {
  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://www.youtube.com/watch?v=${ID}&t=42s&list=PL123`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?t=42`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube-nocookie.com/embed/${ID}`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/live/${ID}`,
    `https://www.youtube.com/v/${ID}`,
    `youtube.com/watch?v=${ID}`,
    `  https://www.youtube.com/watch?v=${ID}  `,
    ID,
  ])('accepts %s', (input) => {
    expect(parseYouTubeId(input)).toBe(ID);
  });

  it.each([
    '',
    '   ',
    'not a url',
    'https://vimeo.com/123456',
    'https://example.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/',
    'https://www.youtube.com/watch?v=tooshort',
    'https://www.youtube.com/watch?v=waaaaaaaaaytoolong',
    'https://www.youtube.com/@tedxkigali',
  ])('rejects %s', (input) => {
    expect(parseYouTubeId(input)).toBeNull();
  });
});

describe('url builders', () => {
  it('builds a privacy-friendly autoplay embed url', () => {
    const url = new URL(youtubeEmbedUrl(ID));
    expect(url.origin).toBe('https://www.youtube-nocookie.com');
    expect(url.pathname).toBe(`/embed/${ID}`);
    expect(url.searchParams.get('autoplay')).toBe('1');
    expect(url.searchParams.get('rel')).toBe('0');
    expect(url.searchParams.get('playsinline')).toBe('1');
    expect(url.searchParams.get('modestbranding')).toBe('1');
  });

  it('builds both thumbnail urls', () => {
    expect(youtubeThumbnails(ID)).toEqual({
      primary: `https://i.ytimg.com/vi/${ID}/maxresdefault.jpg`,
      fallback: `https://i.ytimg.com/vi/${ID}/hqdefault.jpg`,
    });
  });

  it('builds the canonical watch url', () => {
    expect(youtubeWatchUrl(ID)).toBe(`https://www.youtube.com/watch?v=${ID}`);
  });
});
