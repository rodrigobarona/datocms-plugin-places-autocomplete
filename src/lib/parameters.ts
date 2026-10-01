import type {
  FieldParameters,
  LanguageOption,
  PluginParameters,
} from '../types';
import { normalizeFieldOption } from './fieldOptions';
import { defaultLanguage } from './languages';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizePluginParameters(value: unknown): PluginParameters {
  if (!isRecord(value)) {
    return { mapsAPIKey: '' };
  }

  return {
    mapsAPIKey:
      typeof value.mapsAPIKey === 'string' ? value.mapsAPIKey.trim() : '',
  };
}

function normalizeLanguage(value: unknown): LanguageOption {
  if (
    isRecord(value) &&
    typeof value.label === 'string' &&
    typeof value.value === 'string'
  ) {
    return {
      label: value.label,
      value: value.value,
    };
  }

  return defaultLanguage;
}

export function normalizeFieldParameters(value: unknown): FieldParameters {
  if (!isRecord(value)) {
    return {
      language: defaultLanguage,
      searchSeedField: null,
    };
  }

  return {
    language: normalizeLanguage(value.language),
    searchSeedField: normalizeFieldOption(value.searchSeedField),
  };
}
