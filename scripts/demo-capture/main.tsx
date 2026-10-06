import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import LocationMap from '../../src/components/LocationMap';
import { getVisibleAddressFields } from '../../src/lib/addressDisplayFields';
import { createEmptyAddress } from '../../src/lib/addressValue';
import { loadPlacesLibrary } from '../../src/lib/googleMaps';
import { mapPlaceToAddress } from '../../src/lib/mapPlaceToAddress';
import { formatUtcOffset } from '../../src/lib/utcOffset';
import type { AddressValue } from '../../src/types';
import './demo.css';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

const LISBON_ADDRESS: AddressValue = {
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
  formatted_address: 'R. Álvaro Benamor 2B, 1600-894 Lisboa, Portugal',
  coordinates: {
    lat: 38.764151,
    lng: -9.189446,
  },
  utc_offset_minutes: 60,
};

const TIMES_SQUARE_ADDRESS: AddressValue = {
  ...createEmptyAddress(),
  name: 'Times Square Church',
  street_number: '237',
  route: 'W 51st St',
  sublocality: 'Manhattan',
  locality: 'New York',
  administrative_area_level_2: 'New York County',
  administrative_area_level_1: 'NY',
  postal_code: '10019',
  postal_code_suffix: '6261',
  country: 'US',
  formatted_address: '237 W 51st St, New York, NY 10019, USA',
  coordinates: {
    lat: 40.76244,
    lng: -73.984134,
  },
  utc_offset_minutes: -240,
};

const OLLEM_ADDRESS: AddressValue = {
  ...createEmptyAddress(),
  name: 'Ollem Turismo',
  locality: 'Valada',
  administrative_area_level_3: 'Valada',
  administrative_area_level_2: 'Cartaxo',
  administrative_area_level_1: 'Santarém',
  postal_code: '2070-613',
  country: 'PT',
  formatted_address: 'Ollem Turismo, Valada, Portugal',
  coordinates: {
    lat: 39.081631,
    lng: -8.758425,
  },
  utc_offset_minutes: 60,
};

const SAMPLE_ADDRESSES = {
  lisbon: LISBON_ADDRESS,
  'times-square': TIMES_SQUARE_ADDRESS,
  ollem: OLLEM_ADDRESS,
} as const;

type SampleAddressId = keyof typeof SAMPLE_ADDRESSES;

function readInitialAddress(): AddressValue {
  const fixture = new URLSearchParams(window.location.search).get('fixture');

  if (fixture === 'times-square' || fixture === 'ollem' || fixture === 'lisbon') {
    return SAMPLE_ADDRESSES[fixture];
  }

  return LISBON_ADDRESS;
}

function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

function DemoApp() {
  const [address, setAddress] = useState<AddressValue>(readInitialAddress);
  const [query, setQuery] = useState(
    () => readInitialAddress().formatted_address,
  );
  const [status, setStatus] = useState('Ready');
  const captureMode = new URLSearchParams(window.location.search).has('capture');
  const visibleFields = useMemo(
    () => getVisibleAddressFields(address),
    [address],
  );
  const { lat, lng } = address.coordinates;

  async function searchAndSelect(placeQuery: string) {
    if (!API_KEY) {
      setStatus('Missing VITE_GOOGLE_MAPS_API_KEY');
      return;
    }

    setStatus(`Searching “${placeQuery}”…`);
    setQuery(placeQuery);

    try {
      const { Place } = await loadPlacesLibrary(API_KEY);
      const { places } = await Place.searchByText({
        textQuery: placeQuery,
        language: 'en',
        maxResultCount: 1,
        fields: [
          'addressComponents',
          'displayName',
          'formattedAddress',
          'location',
          'utcOffsetMinutes',
        ],
      });

      const place = places?.[0];

      if (!place) {
        setStatus(`No results for “${placeQuery}”`);
        return;
      }

      const nextAddress = mapPlaceToAddress(place);
      setAddress(nextAddress);
      setQuery(nextAddress.formatted_address || placeQuery);
      setStatus(`Selected ${nextAddress.name || placeQuery}`);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Places search failed',
      );
    }
  }

  function showSample(sampleId: SampleAddressId) {
    const sample = SAMPLE_ADDRESSES[sampleId];
    setAddress(sample);
    setQuery(sample.formatted_address);
    setStatus(`Showing ${sample.name}`);
  }

  function handleReset() {
    showSample('lisbon');
    setStatus('Reset to initial value');
  }

  (window as Window & {
    __demoSearch?: (placeQuery: string) => Promise<void>;
    __demoReset?: () => void;
  }).__demoSearch = searchAndSelect;
  (
    window as Window & {
      __demoReset?: () => void;
    }
  ).__demoReset = handleReset;

  return (
    <div className="demoShell">
      <header className="demoChrome">
        <div>
          <p className="demoEyebrow">Venue address · JSON</p>
          <h1>Location</h1>
          <p className="demoSubtitle">
            Coordinates, address, destination area, and municipality.
          </p>
        </div>
        {captureMode ? null : (
          <p className="demoStatus" data-testid="status">
            {status}
          </p>
        )}
      </header>

      <main className="demoPanel">
        <label className="demoField demoLookupField">
          <span className="demoLabel">
            Address lookup <span className="required">*</span>
          </span>
          <input
            className="demoLookup"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Start typing an address or venue name…"
            aria-label="Address lookup"
          />
          <span className="demoHint">
            Select a Google Places suggestion to save structured address data.
          </span>
        </label>

        {captureMode ? null : (
          <div className="demoActions">
            <button
              type="button"
              data-testid="sample-times-square"
              onClick={() => showSample('times-square')}
            >
              Times Square Church
            </button>
            <button
              type="button"
              data-testid="sample-ollem"
              onClick={() => showSample('ollem')}
            >
              Ollem Turismo
            </button>
            <button
              type="button"
              data-testid="search-times-square"
              onClick={() =>
                void searchAndSelect('Times Square Church New York')
              }
            >
              Search Times Square
            </button>
            <button
              type="button"
              data-testid="search-sagrada"
              onClick={() => void searchAndSelect('Sagrada Família Barcelona')}
            >
              Sagrada Família
            </button>
            <button
              type="button"
              data-testid="search-lisbon"
              onClick={() =>
                void searchAndSelect('R. Álvaro Benamor 2B Lisboa')
              }
            >
              Lisbon address
            </button>
          </div>
        )}

        {visibleFields.length > 0 ? (
          <div className="demoFields">
            {visibleFields.map((field) => (
              <label
                key={field.id}
                className={`demoField span-${field.span}`}
                data-field-id={field.id}
              >
                <span className="demoLabel">{field.label}</span>
                <input className="demoInput" disabled value={field.value} />
                {field.hint ? (
                  <span className="demoHint">{field.hint}</span>
                ) : null}
              </label>
            ))}
          </div>
        ) : null}

        <section className="demoLocation" aria-label="Location">
          {lat !== null && lng !== null ? (
            <>
              <LocationMap lat={lat} lng={lng} />
              <dl className="demoFacts">
                <div>
                  <dt>Latitude</dt>
                  <dd>{formatCoordinate(lat)}</dd>
                </div>
                <div>
                  <dt>Longitude</dt>
                  <dd>{formatCoordinate(lng)}</dd>
                </div>
                <div>
                  <dt>Time zone</dt>
                  <dd>{formatUtcOffset(address.utc_offset_minutes) || '—'}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="demoEmpty">Select a place to see it on the map.</p>
          )}
        </section>

        <button
          type="button"
          className="demoReset"
          data-testid="reset"
          onClick={handleReset}
        >
          Reset to initial value
        </button>
      </main>
    </div>
  );
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('Missing #root');
}

createRoot(container).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
);
