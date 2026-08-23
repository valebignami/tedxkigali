import { describe, expect, it } from 'vitest';
import {
  parseYouTubeId,
  youtubeEmbedUrl,
  youtubeThumbnails,
  youtubeWatchUrl,
  YOUTUBE_HELP_MESSAGE,
} from '~/lib/youtube';

const ID = 'dQw4w9WgXcQ';

describe('parseYouTubeId', () => {
  // The `?si=` parameter is what YouTube's own Share button adds, so it is the
  // shape a volunteer is most likely to paste — the first talk saved through
  // the CMS, on 23 August 2026, carried one. The rest of the list is what the
  // same button produces with "Start at" ticked, from a Short, from a live
  // recording, and from a video opened inside a playlist.
  it.each([
    `https://youtu.be/${ID}?si=GbMjsSeO8OsJ-7GW`,
    `https://youtu.be/${ID}?si=GbMjsSeO8OsJ-7GW&t=42`,
    `https://www.youtube.com/watch?v=${ID}&si=GbMjsSeO8OsJ-7GW`,
    `https://youtube.com/shorts/${ID}?si=GbMjsSeO8OsJ-7GW`,
    `https://www.youtube.com/shorts/${ID}?feature=share`,
    `https://youtube.com/live/${ID}?si=GbMjsSeO8OsJ-7GW&t=10`,
    `https://www.youtube.com/watch?v=${ID}&list=PLabc123&index=2&t=90s`,
    `https://youtu.be/${ID}?si=GbMjsSeO8OsJ-7GW&list=PLabc123`,
    `https://www.youtube.com/watch?app=desktop&v=${ID}&feature=youtu.be`,
  ])('accepts what the Share button writes: %s', (input) => {
    expect(parseYouTubeId(input)).toBe(ID);
  });

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
    // Three links a volunteer can plausibly copy that carry no single video to
    // embed. .pages.yml warns about all three in the YouTube link field's own
    // description, so the rejection is the documented behaviour, not a gap.
    'https://www.youtube.com/playlist?list=PLabc123',
    'https://music.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/?si=GbMjsSeO8OsJ-7GW',
  ])('rejects %s', (input) => {
    expect(parseYouTubeId(input)).toBeNull();
  });

  // The host check is an exact match against a list, not a suffix test. If it
  // is ever "simplified" to endsWith, these two lookalikes start parsing and
  // the site embeds a video from somebody else's server.
  it.each([
    `https://notyoutube.com/watch?v=${ID}`,
    `https://youtube.com.evil.com/watch?v=${ID}`,
    `https://evil.com/youtu.be/${ID}`,
    `https://myyoutu.be/${ID}`,
  ])('rejects the lookalike host %s', (input) => {
    expect(parseYouTubeId(input)).toBeNull();
  });
});

// docs/EDITING.md quotes this message to explain what a failed build means, so
// it has to keep saying what an editor should paste.
describe('YOUTUBE_HELP_MESSAGE', () => {
  it('is a non-empty message showing a full YouTube link', () => {
    expect(YOUTUBE_HELP_MESSAGE.trim()).not.toBe('');
    expect(YOUTUBE_HELP_MESSAGE).toContain('https://www.youtube.com/watch?v=');
    expect(YOUTUBE_HELP_MESSAGE).toMatch(/address bar/i);
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
