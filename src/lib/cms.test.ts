import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CMS_BRANCH, CMS_OWNER, CMS_REPO, CMS_URL } from './cms';

const guide = readFileSync('docs/EDITING.md', 'utf8');

describe('the editing screen address', () => {
  it('names the repository Pages CMS actually edits', () => {
    expect(CMS_URL).toBe(
      `https://app.pagescms.org/${CMS_OWNER}/${CMS_REPO}/${CMS_BRANCH}/collection/events`,
    );
  });

  // The guide is the only thing a volunteer reads before their first save, so a
  // stale address there sends them somewhere that asks them to sign in and then
  // shows them nothing. Renaming or transferring the repository has to update
  // both, and this is what says so.
  it('is the same address the guide sends volunteers to', () => {
    const pagesCmsLinks = guide.match(/https:\/\/app\.pagescms\.org\/\S*/g) ?? [];
    for (const link of pagesCmsLinks) {
      const withoutTrailingPunctuation = link.replace(/[).,>]+$/, '');
      if (withoutTrailingPunctuation === 'https://app.pagescms.org') continue;
      expect(withoutTrailingPunctuation).toContain(`/${CMS_OWNER}/${CMS_REPO}/`);
    }
  });

  it('is reachable from the site itself, which is the address the guide leads with', () => {
    expect(guide).toMatch(/\/admin\b/);
  });
});
