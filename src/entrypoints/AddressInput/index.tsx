import { useEffect, useRef, useState } from 'react';
import type { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import {
  Button,
  Canvas,
  FieldError,
  FieldGroup,
  FieldWrapper,
  Form,
  TextInput,
} from 'datocms-react-ui';
import LocationMap from '../../components/LocationMap';
import { getVisibleAddressFields } from '../../lib/addressDisplayFields';
import {
  createEmptyAddress,
  getValueAtPath,
  parseAddressValue,
} from '../../lib/addressValue';
import { extractPlainTextValue } from '../../lib/fieldOptions';
import { loadPlacesLibrary } from '../../lib/googleMaps';
import { mapPlaceToAddress } from '../../lib/mapPlaceToAddress';
import {
  normalizeFieldParameters,
  normalizePluginParameters,
} from '../../lib/parameters';
import { saveAddress } from '../../lib/saveAddress';
import { formatUtcOffset } from '../../lib/utcOffset';
import type { AddressValue } from '../../types';
import styles from './AddressInput.module.css';

const SPAN_CLASS: Record<2 | 3 | 4 | 5 | 6 | 12, string | undefined> = {
  2: styles.span2,
  3: styles.span3,
  4: styles.span4,
  5: styles.span5,
  6: styles.span6,
  12: styles.span12,
};

type AddressInputProps = {
  ctx: RenderFieldExtensionCtx;
};

function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

export default function AddressInput({ ctx }: AddressInputProps) {
  const [initialAddress] = useState(() =>
    parseAddressValue(getValueAtPath(ctx.formValues, ctx.fieldPath)),
  );
  const [address, setAddress] = useState<AddressValue>(initialAddress);
  const [loadError, setLoadError] = useState<string>();
  const autocompleteHostRef = useRef<HTMLDivElement>(null);
  const autocompleteElementRef =
    useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const { mapsAPIKey } = normalizePluginParameters(
    ctx.plugin.attributes.parameters,
  );
  const { language, searchSeedField } = normalizeFieldParameters(
    ctx.parameters,
  );
  const seedText = searchSeedField
    ? extractPlainTextValue(ctx.formValues[searchSeedField.value], ctx.locale)
    : '';

  useEffect(() => {
    const host = autocompleteHostRef.current;

    if (!host || !mapsAPIKey) {
      return;
    }

    const autocompleteHost = host;
    let cancelled = false;
    let element: google.maps.places.PlaceAutocompleteElement | undefined;
    const initialLookupValue =
      initialAddress.formatted_address ||
      (searchSeedField
        ? extractPlainTextValue(
            ctx.formValues[searchSeedField.value],
            ctx.locale,
          )
        : '');

    async function mountAutocomplete() {
      try {
        const { PlaceAutocompleteElement } =
          await loadPlacesLibrary(mapsAPIKey);

        if (cancelled) {
          return;
        }

        element = new PlaceAutocompleteElement({
          description: 'Search for an address or venue',
          disabled: ctx.disabled,
          placeholder: 'Start typing an address or venue name…',
          requestedLanguage: language.value,
          value: initialLookupValue,
        });
        autocompleteElementRef.current = element;

        const handleSelect = async (
          event: google.maps.places.PlacePredictionSelectEvent,
        ) => {
          try {
            const place = event.placePrediction.toPlace();

            await place.fetchFields({
              fields: [
                'addressComponents',
                'displayName',
                'formattedAddress',
                'location',
                'utcOffsetMinutes',
              ],
            });

            const nextAddress = mapPlaceToAddress(place);
            setAddress(nextAddress);
            await saveAddress(ctx, nextAddress);
          } catch {
            ctx.alert(
              'Google Places could not load details for that selection.',
            );
          }
        };

        const handleInput = () => {
          if (element?.value === '') {
            const emptyAddress = createEmptyAddress();
            setAddress(emptyAddress);
            void saveAddress(ctx, emptyAddress);
          }
        };

        const handleGoogleError = () => {
          ctx.alert(
            'Google Places returned an error. Check the API key, enabled APIs, and referrer restrictions.',
          );
        };

        const requestLocationBias = () => {
          navigator.geolocation?.getCurrentPosition(
            ({ coords }) => {
              if (element) {
                element.locationBias = {
                  center: {
                    lat: coords.latitude,
                    lng: coords.longitude,
                  },
                  radius: Math.max(coords.accuracy, 1_000),
                };
              }
            },
            () => undefined,
            {
              maximumAge: 300_000,
              timeout: 5_000,
            },
          );
        };

        element.addEventListener('gmp-select', handleSelect);
        element.addEventListener('gmp-error', handleGoogleError);
        element.addEventListener('input', handleInput);
        element.addEventListener('focus', requestLocationBias, { once: true });
        autocompleteHost.replaceChildren(element);
        setLoadError(undefined);
      } catch {
        if (!cancelled) {
          setLoadError(
            'Google Places could not load. Check the API key and Google Cloud configuration.',
          );
        }
      }
    }

    void mountAutocomplete();

    return () => {
      cancelled = true;
      autocompleteElementRef.current = null;
      element?.remove();
    };
  }, [
    ctx,
    ctx.disabled,
    initialAddress.formatted_address,
    language.value,
    mapsAPIKey,
    searchSeedField?.value,
  ]);

  useEffect(() => {
    const element = autocompleteElementRef.current;

    if (!element) {
      return;
    }

    const addressIsEmpty = !address.formatted_address;

    if (addressIsEmpty && seedText && element.value !== seedText) {
      element.value = seedText;
    }
  }, [address.formatted_address, seedText]);

  const { lat, lng } = address.coordinates;
  const visibleFields = getVisibleAddressFields(address);

  async function handleReset() {
    if (autocompleteElementRef.current) {
      autocompleteElementRef.current.value = initialAddress.formatted_address;
    }
    setAddress(initialAddress);
    await saveAddress(ctx, initialAddress);
  }

  return (
    <Canvas ctx={ctx}>
      <Form>
        <FieldGroup>
          <FieldWrapper
            id="address-lookup"
            label="Address lookup"
            hint="Select a Google Places suggestion to save structured address data."
            required
          >
            {mapsAPIKey ? (
              <div
                ref={autocompleteHostRef}
                className={styles.autocompleteHost}
              />
            ) : (
              <FieldError>
                Configure a Google Maps API key in the plugin settings.
              </FieldError>
            )}
            {loadError ? <FieldError>{loadError}</FieldError> : null}
          </FieldWrapper>
        </FieldGroup>

        {visibleFields.length > 0 ? (
          <FieldGroup className={styles.addressComponents!}>
            {visibleFields.map((field) => (
              <div
                key={field.id}
                className={SPAN_CLASS[field.span] ?? styles.span12}
              >
                <FieldWrapper
                  id={field.id}
                  label={field.label}
                  hint={field.hint}
                >
                  <TextInput disabled value={field.value} />
                </FieldWrapper>
              </div>
            ))}
          </FieldGroup>
        ) : null}

        <section className={styles.location} aria-label="Location">
          {lat !== null && lng !== null ? (
            <>
              <LocationMap lat={lat} lng={lng} />
              <dl className={styles.locationFacts}>
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
                  <dd className={styles.timeZone}>
                    {formatUtcOffset(address.utc_offset_minutes) || '—'}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className={styles.locationEmpty}>
              Select a place to see it on the map.
            </p>
          )}
        </section>

        <Button
          type="button"
          buttonType="muted"
          disabled={ctx.disabled}
          onClick={() => void handleReset()}
        >
          Reset to initial value
        </Button>
      </Form>
    </Canvas>
  );
}
