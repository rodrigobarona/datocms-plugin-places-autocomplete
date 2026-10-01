import { describe, expect, it } from 'vitest';
import { formatUtcOffset } from './utcOffset';

describe('formatUtcOffset', () => {
  it('describes the gap from the viewer’s time zone', () => {
    expect(formatUtcOffset(60, 0)).toBe('1 hour ahead (UTC +1)');
    expect(formatUtcOffset(120, 0)).toBe('2 hours ahead (UTC +2)');
    expect(formatUtcOffset(-240, 0)).toBe('4 hours behind (UTC -4)');
    expect(formatUtcOffset(0, 60)).toBe('1 hour behind (UTC +0)');
  });

  it('says when the place matches the viewer', () => {
    expect(formatUtcOffset(60, 60)).toBe('Same time zone (UTC +1)');
    expect(formatUtcOffset(0, 0)).toBe('Same time zone (UTC +0)');
  });

  it('keeps minutes for partial-hour offsets', () => {
    expect(formatUtcOffset(330, 60)).toBe('4 hours 30 minutes ahead (UTC +5:30)');
    expect(formatUtcOffset(90, 60)).toBe('30 minutes ahead (UTC +1:30)');
    expect(formatUtcOffset(-210, 0)).toBe('3 hours 30 minutes behind (UTC -3:30)');
  });

  it('returns an empty string without an offset', () => {
    expect(formatUtcOffset(null, 0)).toBe('');
  });
});
