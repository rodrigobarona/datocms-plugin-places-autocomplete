import { describe, expect, it } from 'vitest';
import {
  extractPlainTextValue,
  normalizeFieldOption,
  toFieldOption,
} from './fieldOptions';
import { normalizeFieldParameters } from './parameters';

describe('extractPlainTextValue', () => {
  it('reads plain strings and localized string maps', () => {
    expect(extractPlainTextValue('  JNcQUOI House  ', 'en')).toBe(
      'JNcQUOI House',
    );
    expect(
      extractPlainTextValue({ en: 'House', pt: 'Casa' }, 'pt'),
    ).toBe('Casa');
    expect(extractPlainTextValue({ en: 'House' }, 'pt')).toBe('');
  });
});

describe('normalizeFieldParameters', () => {
  it('keeps an optional search seed field', () => {
    expect(
      normalizeFieldParameters({
        language: { label: 'Portuguese', value: 'pt' },
        searchSeedField: { label: 'Name (name)', value: 'name' },
      }),
    ).toEqual({
      language: { label: 'Portuguese', value: 'pt' },
      searchSeedField: { label: 'Name (name)', value: 'name' },
    });
  });

  it('defaults missing seed field to null', () => {
    expect(normalizeFieldParameters({})).toMatchObject({
      searchSeedField: null,
    });
  });
});

describe('toFieldOption', () => {
  it('only exposes string and text fields', () => {
    expect(
      toFieldOption({
        attributes: {
          label: 'Name',
          api_key: 'name',
          field_type: 'string',
        },
      }),
    ).toEqual({ label: 'Name (name)', value: 'name' });

    expect(
      toFieldOption({
        attributes: {
          label: 'Body',
          api_key: 'body',
          field_type: 'structured_text',
        },
      }),
    ).toBeNull();
  });
});

describe('normalizeFieldOption', () => {
  it('rejects empty values', () => {
    expect(normalizeFieldOption({ label: 'Name', value: '  ' })).toBeNull();
  });
});
