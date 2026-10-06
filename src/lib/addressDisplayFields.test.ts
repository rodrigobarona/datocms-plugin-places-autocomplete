import { describe, expect, it } from 'vitest';
import {
  assignAddressFieldSpans,
  getVisibleAddressFields,
} from './addressDisplayFields';
import { createEmptyAddress } from './addressValue';
import type { AddressValue } from '../types';

describe('getVisibleAddressFields', () => {
  it('hides empty fields and keeps standard order', () => {
    const address: AddressValue = {
      ...createEmptyAddress(),
      name: 'R. Álvaro Benamor 2B',
      street_number: '2B',
      route: 'R. Álvaro Benamor',
      locality: 'Lisboa',
      administrative_area_level_3: 'Carnide',
      administrative_area_level_2: 'Lisboa',
      administrative_area_level_1: 'Lisboa',
      postal_code: '1600-894',
      country: 'PT',
    };

    expect(
      getVisibleAddressFields(address).map((field) => ({
        id: field.id,
        label: field.label,
        value: field.value,
      })),
    ).toEqual([
      {
        id: 'venue-name',
        label: 'Venue name',
        value: 'R. Álvaro Benamor 2B',
      },
      {
        id: 'street-address',
        label: 'Street address',
        value: '2B R. Álvaro Benamor',
      },
      { id: 'city', label: 'City', value: 'Lisboa' },
      { id: 'admin-area-3', label: 'District', value: 'Carnide' },
      { id: 'admin-area-2', label: 'County', value: 'Lisboa' },
      { id: 'region', label: 'Region', value: 'Lisboa' },
      { id: 'postal-code', label: 'Postal code', value: '1600-894' },
      { id: 'country', label: 'Country', value: 'PT' },
    ]);
  });

  it('returns no rows for an empty address', () => {
    expect(getVisibleAddressFields(createEmptyAddress())).toEqual([]);
  });

  it('prefers the finest sublocality level when several are present', () => {
    const address: AddressValue = {
      ...createEmptyAddress(),
      sublocality: 'Broad',
      sublocality_level_1: 'Level 1',
      sublocality_level_3: 'Finest',
    };

    expect(getVisibleAddressFields(address)).toEqual([
      expect.objectContaining({
        id: 'sublocality',
        span: 12,
        value: 'Finest',
      }),
    ]);
  });

  it('packs a full address into the original half and third rows', () => {
    const address: AddressValue = {
      ...createEmptyAddress(),
      name: 'Times Square Church',
      street_number: '237',
      route: 'W 51st St',
      sublocality: 'Manhattan',
      locality: 'New York',
      administrative_area_level_2: 'New York County',
      administrative_area_level_1: 'NY',
      postal_code: '10019',
      postal_code_suffix: '6261',
      country: 'US',
    };

    expect(getVisibleAddressFields(address).map((field) => field.span)).toEqual(
      [6, 6, 4, 4, 4, 4, 4, 4],
    );
  });

  it('rebalances a partial address so every row is full', () => {
    const address: AddressValue = {
      ...createEmptyAddress(),
      name: 'Ollem Turismo',
      locality: 'Valada',
      administrative_area_level_3: 'Valada',
      administrative_area_level_2: 'Cartaxo',
      administrative_area_level_1: 'Santarém',
      postal_code: '2070-613',
      country: 'PT',
    };

    expect(
      getVisibleAddressFields(address).map((field) => ({
        label: field.label,
        span: field.span,
      })),
    ).toEqual([
      { label: 'Venue name', span: 6 },
      { label: 'City', span: 6 },
      { label: 'District', span: 6 },
      { label: 'County', span: 6 },
      { label: 'Region', span: 4 },
      { label: 'Postal code', span: 4 },
      { label: 'Country', span: 4 },
    ]);
  });
});

describe('assignAddressFieldSpans', () => {
  it('fills every row with two or three fields', () => {
    expect(assignAddressFieldSpans(0)).toEqual([]);
    expect(assignAddressFieldSpans(1)).toEqual([12]);
    expect(assignAddressFieldSpans(2)).toEqual([6, 6]);
    expect(assignAddressFieldSpans(3)).toEqual([4, 4, 4]);
    expect(assignAddressFieldSpans(4)).toEqual([6, 6, 6, 6]);
    expect(assignAddressFieldSpans(5)).toEqual([6, 6, 4, 4, 4]);
    expect(assignAddressFieldSpans(7)).toEqual([6, 6, 6, 6, 4, 4, 4]);
  });
});
