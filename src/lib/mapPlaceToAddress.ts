import type { AddressValue } from '../types';
import { createEmptyAddress } from './addressValue';

type AddressComponent = {
  longText?: string | null | undefined;
  shortText?: string | null | undefined;
  types: string[];
};

export type PlaceDetails = {
  addressComponents?: AddressComponent[] | null | undefined;
  displayName?: string | null | undefined;
  formattedAddress?: string | null | undefined;
  location?: {
    lat(): number;
    lng(): number;
  } | null | undefined;
  utcOffsetMinutes?: number | null | undefined;
};

export function mapPlaceToAddress(place: PlaceDetails): AddressValue {
  const address = createEmptyAddress();

  for (const component of place.addressComponents ?? []) {
    const componentType = component.types[0];

    if (componentType) {
      address[componentType] =
        component.shortText ?? component.longText ?? '';
    }
  }

  address.name = place.displayName ?? '';
  address.formatted_address = place.formattedAddress ?? '';
  address.coordinates = {
    lat: place.location?.lat() ?? null,
    lng: place.location?.lng() ?? null,
  };
  address.utc_offset_minutes = place.utcOffsetMinutes ?? null;

  return address;
}
