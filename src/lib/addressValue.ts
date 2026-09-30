import type { AddressValue, Coordinates } from '../types';

export function createEmptyAddress(): AddressValue {
  return {
    administrative_area_level_1: '',
    country: '',
    coordinates: {
      lat: null,
      lng: null,
    },
    formatted_address: '',
    locality: '',
    name: '',
    postal_code: '',
    postal_code_suffix: '',
    route: '',
    street_number: '',
    subpremise: '',
    utc_offset_minutes: null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseCoordinates(value: unknown): Coordinates {
  if (!isRecord(value)) {
    return { lat: null, lng: null };
  }

  return {
    lat: typeof value.lat === 'number' ? value.lat : null,
    lng: typeof value.lng === 'number' ? value.lng : null,
  };
}

export function parseAddressValue(value: unknown): AddressValue {
  if (typeof value === 'string') {
    if (value.trim() === '') {
      return createEmptyAddress();
    }

    try {
      return parseAddressValue(JSON.parse(value) as unknown);
    } catch {
      return createEmptyAddress();
    }
  }

  if (!isRecord(value)) {
    return createEmptyAddress();
  }

  const emptyAddress = createEmptyAddress();
  const address: AddressValue = {
    ...emptyAddress,
    coordinates: parseCoordinates(value.coordinates),
  };

  for (const [key, entry] of Object.entries(value)) {
    if (key === 'coordinates') {
      continue;
    }

    if (
      typeof entry === 'string' ||
      typeof entry === 'number' ||
      entry === null
    ) {
      address[key] = entry;
    }
  }

  return address;
}

export function getValueAtPath(
  source: Record<string, unknown>,
  path: string,
): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (!isRecord(current)) {
      return undefined;
    }

    return current[segment];
  }, source);
}

export function serializeAddressValue(value: AddressValue): string {
  return JSON.stringify(value, undefined, 2);
}
