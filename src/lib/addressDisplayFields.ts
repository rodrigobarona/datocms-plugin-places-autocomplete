import type { AddressValue } from '../types';

export type AddressFieldSpan = 4 | 6 | 12;

export type AddressDisplayField = {
  id: string;
  label: string;
  hint?: string;
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
    getValue: (address) => readString(address, 'name'),
  },
  {
    id: 'street-address',
    label: 'Street address',
    getValue: formatStreetAddress,
  },
  {
    id: 'subpremise',
    label: 'Subpremise',
    hint: 'Apartment, suite, or unit',
    getValue: (address) => readString(address, 'subpremise'),
  },
  {
    id: 'premise',
    label: 'Premise',
    getValue: (address) => readString(address, 'premise'),
  },
  {
    id: 'neighborhood',
    label: 'Neighborhood',
    getValue: (address) => readString(address, 'neighborhood'),
  },
  {
    id: 'sublocality',
    label: 'Sublocality',
    getValue: formatSublocality,
  },
  {
    id: 'city',
    label: 'City',
    getValue: (address) => readString(address, 'locality'),
  },
  {
    id: 'ward',
    label: 'Ward',
    getValue: (address) => readString(address, 'ward'),
  },
  {
    id: 'admin-area-5',
    label: 'Admin area 5',
    getValue: (address) => readString(address, 'administrative_area_level_5'),
  },
  {
    id: 'admin-area-4',
    label: 'Admin area 4',
    getValue: (address) => readString(address, 'administrative_area_level_4'),
  },
  {
    id: 'admin-area-3',
    label: 'District',
    getValue: (address) => readString(address, 'administrative_area_level_3'),
  },
  {
    id: 'admin-area-2',
    label: 'County',
    getValue: (address) => readString(address, 'administrative_area_level_2'),
  },
  {
    id: 'region',
    label: 'Region',
    getValue: (address) => readString(address, 'administrative_area_level_1'),
  },
  {
    id: 'postal-code',
    label: 'Postal code',
    getValue: formatPostalCode,
  },
  {
    id: 'country',
    label: 'Country',
    getValue: (address) => readString(address, 'country'),
  },
];

export type VisibleAddressField = AddressDisplayField & {
  span: AddressFieldSpan;
  value: string;
};

type RowLength = 1 | 2 | 3;

const SPAN_BY_ROW_LENGTH: Record<RowLength, AddressFieldSpan> = {
  1: 12,
  2: 6,
  3: 4,
};

function rowLengths(count: number): RowLength[] {
  if (count <= 1) {
    return count === 1 ? [1] : [];
  }

  const remainder = count % 3;

  if (remainder === 0) {
    return Array.from({ length: count / 3 }, (): RowLength => 3);
  }

  if (remainder === 2) {
    return [2, ...Array.from({ length: (count - 2) / 3 }, (): RowLength => 3)];
  }

  return [2, 2, ...Array.from({ length: (count - 4) / 3 }, (): RowLength => 3)];
}

export function assignAddressFieldSpans(count: number): AddressFieldSpan[] {
  return rowLengths(count).flatMap((rowLength) =>
    Array.from({ length: rowLength }, () => SPAN_BY_ROW_LENGTH[rowLength]),
  );
}

export function getVisibleAddressFields(
  address: AddressValue,
): VisibleAddressField[] {
  const visible = ADDRESS_DISPLAY_FIELDS.flatMap((field) => {
    const value = field.getValue(address);

    if (!value) {
      return [];
    }

    return [{ ...field, value }];
  });
  const spans = assignAddressFieldSpans(visible.length);

  return visible.map((field, index) => ({
    ...field,
    span: spans[index] ?? 12,
  }));
}
