import { describe, expect, it } from 'vitest';
import { mapPlaceToAddress } from './mapPlaceToAddress';

describe('mapPlaceToAddress', () => {
  it('maps Place API New fields to the compatible JSON contract', () => {
    const address = mapPlaceToAddress({
      addressComponents: [
        {
          longText: '11701',
          shortText: '11701',
          types: ['street_number'],
        },
        {
          longText: 'Elevation Point Drive',
          shortText: 'Elevation Pt Dr',
          types: ['route'],
        },
        {
          longText: 'North Carolina',
          shortText: 'NC',
          types: ['administrative_area_level_1', 'political'],
        },
        {
          longText: 'United States',
          shortText: 'US',
          types: ['country', 'political'],
        },
      ],
      displayName: 'Elevation Church - Ballantyne',
      formattedAddress: '11701 Elevation Pt Dr, Charlotte, NC 28277, USA',
      location: {
        lat: () => 35.02993,
        lng: () => -80.85573,
      },
      utcOffsetMinutes: -240,
    });

    expect(address).toMatchObject({
      administrative_area_level_1: 'NC',
      country: 'US',
      coordinates: {
        lat: 35.02993,
        lng: -80.85573,
      },
      formatted_address:
        '11701 Elevation Pt Dr, Charlotte, NC 28277, USA',
      name: 'Elevation Church - Ballantyne',
      route: 'Elevation Pt Dr',
      street_number: '11701',
      utc_offset_minutes: -240,
    });
  });

  it('handles missing optional Place fields', () => {
    expect(mapPlaceToAddress({})).toMatchObject({
      coordinates: { lat: null, lng: null },
      formatted_address: '',
      name: '',
      utc_offset_minutes: null,
    });
  });
});
