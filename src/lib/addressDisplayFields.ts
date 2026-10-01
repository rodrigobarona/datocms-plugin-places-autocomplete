import type { AddressValue } from '../types';

export type AddressFieldSpan = 2 | 3 | 4 | 5 | 6 | 12;

export type AddressDisplayField = {
  id: string;
  label: string;
  hint?: string;
  span: AddressFieldSpan;
  getValue: (address: AddressValue) => string;
};

function readString(address: AddressValue, key: string): string {
  const value = address[key];
  return typeof value === 'string' ? value.trim() : '';
}

function formatStreetAddress(address: AddressValue): string {
  const streetNumber = readString(address, 'street_number');
  const route = readString(address, 'route');

  if (streetNumber) {
    return `${streetNumber} ${route}`.trim();
  }

  return route;
}

function formatPostalCode(address: AddressValue): string {
  const postalCode = readString(address, 'postal_code');

  if (!postalCode) {
    return '';
  }

  const suffix = readString(address, 'postal_code_suffix');
  return suffix ? `${postalCode}-${suffix}` : postalCode;
}

const SUBLOCALITY_KEYS = [
  'sublocality_level_5',
  'sublocality_level_4',
  'sublocality_level_3',
  'sublocality_level_2',
  'sublocality_level_1',
  'sublocality',
] as const;

function formatSublocality(address: AddressValue): string {
  for (const key of SUBLOCALITY_KEYS) {
    const value = readString(address, key);

    if (value) {
      return value;
    }
  }

  return '';
}

export const ADDRESS_DISPLAY_FIELDS: AddressDisplayField[] = [
  {
    id: 'venue-name',
    label: 'Venue name',
    span: 6,
    getValue: (address) => readString(address, 'name'),
  },
  {
    id: 'street-address',
    label: 'Street address',
    span: 6,
    getValue: formatStreetAddress,
  },
  {
    id: 'subpremise',
    label: 'Subpremise',
    hint: 'Apartment, suite, or unit',
    span: 4,
    getValue: (address) => readString(address, 'subpremise'),
  },
  {
    id: 'premise',
    label: 'Premise',
    span: 4,
    getValue: (address) => readString(address, 'premise'),
  },
  {
    id: 'neighborhood',
    label: 'Neighborhood',
    span: 4,
    getValue: (address) => readString(address, 'neighborhood'),
  },
  {
    id: 'sublocality',
    label: 'Sublocality',
    span: 4,
    getValue: formatSublocality,
  },
  {
    id: 'city',
    label: 'City',
    span: 4,
    getValue: (address) => readString(address, 'locality'),
  },
  {
    id: 'ward',
    label: 'Ward',
    span: 4,
    getValue: (address) => readString(address, 'ward'),
  },
  {
    id: 'admin-area-5',
    label: 'Admin area 5',
    span: 4,
    getValue: (address) => readString(address, 'administrative_area_level_5'),
  },
  {
    id: 'admin-area-4',
    label: 'Admin area 4',
    span: 4,
    getValue: (address) => readString(address, 'administrative_area_level_4'),
  },
  {
    id: 'admin-area-3',
    label: 'District',
    span: 4,
    getValue: (address) => readString(address, 'administrative_area_level_3'),
  },
  {
    id: 'admin-area-2',
    label: 'County',
    span: 4,
    getValue: (address) => readString(address, 'administrative_area_level_2'),
  },
  {
    id: 'region',
    label: 'Region',
    span: 4,
    getValue: (address) => readString(address, 'administrative_area_level_1'),
  },
  {
    id: 'postal-code',
    label: 'Postal code',
    span: 4,
    getValue: formatPostalCode,
  },
  {
    id: 'country',
    label: 'Country',
    span: 4,
    getValue: (address) => readString(address, 'country'),
  },
];

export type VisibleAddressField = AddressDisplayField & {
  value: string;
};

export function getVisibleAddressFields(
  address: AddressValue,
): VisibleAddressField[] {
  return ADDRESS_DISPLAY_FIELDS.flatMap((field) => {
    const value = field.getValue(address);

    if (!value) {
      return [];
    }

    return [{ ...field, value }];
  });
}
