import { describe, expect, it } from 'vitest';
import {
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
        value: 'Finest',
      }),
    ]);
  });
});
