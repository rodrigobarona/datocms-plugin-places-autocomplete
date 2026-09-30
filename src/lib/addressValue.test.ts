import { describe, expect, it } from 'vitest';
import {
  createEmptyAddress,
  getValueAtPath,
  parseAddressValue,
  serializeAddressValue,
} from './addressValue';

describe('addressValue', () => {
  it('parses an existing JSON field value', () => {
    const value = parseAddressValue(
      JSON.stringify({
        country: 'US',
        coordinates: { lat: 35.03, lng: -80.86 },
        formatted_address: 'Charlotte, NC, USA',
      }),
    );

    expect(value.country).toBe('US');
    expect(value.coordinates).toEqual({ lat: 35.03, lng: -80.86 });
    expect(value.formatted_address).toBe('Charlotte, NC, USA');
  });

  it.each([undefined, null, '', '{invalid json}', [], 42])(
    'falls back to an empty address for %j',
    (value) => {
      expect(parseAddressValue(value)).toEqual(createEmptyAddress());
    },
  );

  it('reads nested localized field values', () => {
    const formValues = {
      address: {
        en: '{"country":"US"}',
      },
    };

    expect(getValueAtPath(formValues, 'address.en')).toBe('{"country":"US"}');
  });

  it('serializes JSON with stable indentation', () => {
    const serialized = serializeAddressValue(createEmptyAddress());

    expect(serialized).toContain('\n  "country": ""');
  });
});
