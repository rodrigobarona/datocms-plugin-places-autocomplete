export type Coordinates = {
  lat: number | null;
  lng: number | null;
};

export type AddressValue = {
  [key: string]: Coordinates | number | string | null | undefined;
  administrative_area_level_1: string;
  country: string;
  coordinates: Coordinates;
  formatted_address: string;
  locality: string;
  name: string;
  postal_code: string;
  postal_code_suffix: string;
  route: string;
  street_number: string;
  subpremise: string;
  utc_offset_minutes: number | null;
};

export type PluginParameters = {
  mapsAPIKey: string;
};

export type LanguageOption = {
  label: string;
  value: string;
};

export type FieldParameters = {
  language: LanguageOption;
  /** API key of a string/text field used to seed an empty Places lookup */
  searchSeedField: LanguageOption | null;
};
