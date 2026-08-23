import { describe, expect, it } from 'vitest';
import { missingTalkMessage, speakerTalkLink, TALKS_ARCHIVE_HREF } from '~/lib/speaker-talk';

describe('speakerTalkLink', () => {
  it('points at the talk card when the talk is published', () => {
    expect(speakerTalkLink('Aline Uwase', 'the-hills-that-listen', {
      id: 'the-hills-that-listen',
      draft: false,
    })).toEqual({ href: `${TALKS_ARCHIVE_HREF}#the-hills-that-listen` });
  });

  it('points at the archive when no talk was chosen', () => {
    expect(speakerTalkLink('Aline Uwase', undefined, undefined)).toEqual({ href: TALKS_ARCHIVE_HREF });
  });

  // "Hide from the website" is documented as safe, so a hidden talk has to keep
  // building: it simply has no card of its own to point at.
  it('points at the archive when the talk is hidden', () => {
    expect(speakerTalkLink('Aline Uwase', 'the-hills-that-listen', {
      id: 'the-hills-that-listen',
      draft: true,
    })).toEqual({ href: TALKS_ARCHIVE_HREF });
  });

  // This used to log one line and finish the build with exit 0, so the site
  // published a speaker whose talk link went nowhere and nobody was told.
  it('stops the build when the talk was deleted', () => {
    expect(() => speakerTalkLink('Aline Uwase', 'the-hills-that-listen', undefined)).toThrow(
      missingTalkMessage('Aline Uwase', 'the-hills-that-listen'),
    );
  });
});

describe('missingTalkMessage', () => {
  const message = missingTalkMessage('Aline Uwase', 'the-hills-that-listen');

  it('names the speaker the way the CMS lists them', () => {
    expect(message).toContain('Aline Uwase');
    expect(message).toContain('the-hills-that-listen');
  });

  it('gives an answer for deleting on purpose and for deleting by mistake', () => {
    expect(message).toMatch(/"Their talk"/);
    expect(message).toMatch(/add the talk back/i);
    expect(message).not.toMatch(/reference|collection|zod|undefined/i);
  });
});
