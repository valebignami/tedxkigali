import { describe, expect, it } from 'vitest';
import { withFullStop } from '~/lib/text';

describe('withFullStop', () => {
  it('ends a sentence that does not end itself', () => {
    expect(withFullStop('x = independently organized TED event')).toBe(
      'x = independently organized TED event.',
    );
  });

  it('leaves a sentence that already ends in a full stop alone', () => {
    expect(withFullStop('x = independently organized TED event.')).toBe(
      'x = independently organized TED event.',
    );
  });

  it('leaves the other ways a sentence can end alone', () => {
    expect(withFullStop('What is TEDx?')).toBe('What is TEDx?');
    expect(withFullStop('Ideas worth spreading!')).toBe('Ideas worth spreading!');
    expect(withFullStop('and so on…')).toBe('and so on…');
  });

  it('ignores spaces the editor left at the end', () => {
    expect(withFullStop('x = an independent event   ')).toBe('x = an independent event.');
    expect(withFullStop('x = an independent event.  ')).toBe('x = an independent event.');
  });

  it('adds nothing to an empty text', () => {
    expect(withFullStop('')).toBe('');
    expect(withFullStop('   ')).toBe('');
  });
});
