import { describe, expect, it } from 'vitest';
import {
  getPublicMobileTabHref,
  parsePublicMobileTabValue,
  resolvePublicMobileTabFromHash,
  resolvePublicMobileTabFromLocation,
} from '@/features/routes/public/home/mobile-tab-routing';

describe('Public mobile tab URL routing helpers', () => {
  it('parses canonical query tab values and Turkish aliases', () => {
    expect(parsePublicMobileTabValue('start')).toBe('start');
    expect(parsePublicMobileTabValue('basla')).toBe('start');
    expect(parsePublicMobileTabValue('preview')).toBe('preview');
    expect(parsePublicMobileTabValue('onizle')).toBe('preview');
    expect(parsePublicMobileTabValue('features')).toBe('features');
    expect(parsePublicMobileTabValue('ozellikler')).toBe('features');
    expect(parsePublicMobileTabValue('screens')).toBe('screens');
    expect(parsePublicMobileTabValue('ekranlar')).toBe('screens');
    expect(parsePublicMobileTabValue(['features', 'start'])).toBe('features');
    expect(parsePublicMobileTabValue('unknown')).toBeNull();
    expect(parsePublicMobileTabValue(undefined)).toBeNull();
  });

  it('resolves section and tab hash anchors accurately', () => {
    expect(resolvePublicMobileTabFromHash('#nasil-calisir')).toBe('start');
    expect(resolvePublicMobileTabFromHash('#omurlu-parcalar')).toBe('preview');
    expect(resolvePublicMobileTabFromHash('#ozellikler')).toBe('features');
    expect(resolvePublicMobileTabFromHash('#ekranlar')).toBe('screens');
    expect(resolvePublicMobileTabFromHash('#sss')).toBe('screens');
    expect(resolvePublicMobileTabFromHash('onizle')).toBe('preview');
    expect(resolvePublicMobileTabFromHash('#invalid')).toBeNull();
  });

  it('prioritizes query parameters over hash fallback and defaults to start', () => {
    expect(
      resolvePublicMobileTabFromLocation('?tab=preview', '#ekranlar'),
    ).toBe('preview');
    expect(resolvePublicMobileTabFromLocation('', '#ozellikler')).toBe(
      'features',
    );
    expect(resolvePublicMobileTabFromLocation('', '')).toBe('start');
  });

  it('builds clean tab hrefs while preserving unrelated query params', () => {
    expect(getPublicMobileTabHref('start')).toBe('/');
    expect(getPublicMobileTabHref('preview')).toBe('/?tab=preview');
    expect(getPublicMobileTabHref('features')).toBe('/?tab=features');
    expect(getPublicMobileTabHref('screens')).toBe('/?tab=screens');
    expect(getPublicMobileTabHref('features', '?utm=home&tab=preview')).toBe(
      '/?utm=home&tab=features',
    );
    expect(getPublicMobileTabHref('start', '?utm=home&tab=features')).toBe(
      '/?utm=home',
    );
  });
});
