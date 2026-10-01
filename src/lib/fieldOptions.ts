export type FieldOption = {
  label: string;
  value: string;
};

export function extractPlainTextValue(
  value: unknown,
  locale: string,
): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as Record<string, unknown>)[locale] === 'string'
  ) {
    return ((value as Record<string, unknown>)[locale] as string).trim();
  }

  return '';
}

export function normalizeFieldOption(value: unknown): FieldOption | null {
  if (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as Record<string, unknown>).label === 'string' &&
    typeof (value as Record<string, unknown>).value === 'string' &&
    (value as FieldOption).value.trim() !== ''
  ) {
    return {
      label: (value as FieldOption).label,
      value: (value as FieldOption).value,
    };
  }

  return null;
}

export function isSeedableFieldType(fieldType: string): boolean {
  return fieldType === 'string' || fieldType === 'text';
}

export function toFieldOption(field: {
  attributes: { label: string; api_key: string; field_type: string };
}): FieldOption | null {
  if (!isSeedableFieldType(field.attributes.field_type)) {
    return null;
  }

  return {
    label: `${field.attributes.label} (${field.attributes.api_key})`,
    value: field.attributes.api_key,
  };
}
