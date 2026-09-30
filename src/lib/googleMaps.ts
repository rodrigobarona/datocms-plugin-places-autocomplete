import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let configuredApiKey: string | undefined;
let placesLibraryPromise: Promise<google.maps.PlacesLibrary> | undefined;

export function loadPlacesLibrary(
  apiKey: string,
): Promise<google.maps.PlacesLibrary> {
  if (configuredApiKey && configuredApiKey !== apiKey) {
    return Promise.reject(
      new Error('The Google Maps API key changed after the API was loaded.'),
    );
  }

  if (!placesLibraryPromise) {
    configuredApiKey = apiKey;
    setOptions({
      key: apiKey,
      v: 'weekly',
    });
    placesLibraryPromise = importLibrary('places');
  }

  return placesLibraryPromise;
}
