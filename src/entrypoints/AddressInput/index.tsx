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
import {
  createEmptyAddress,
  getValueAtPath,
  parseAddressValue,
} from '../../lib/addressValue';
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
  const { language } = normalizeFieldParameters(ctx.parameters);

  useEffect(() => {
    const host = autocompleteHostRef.current;

    if (!host || !mapsAPIKey) {
      return;
    }

    const autocompleteHost = host;
    let cancelled = false;
    let element: google.maps.places.PlaceAutocompleteElement | undefined;

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
          value: initialAddress.formatted_address,
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
  ]);

  const { lat, lng } = address.coordinates;

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

        <FieldGroup className={styles.addressComponents!}>
          <FieldWrapper id="venue-name" label="Venue name">
            <TextInput disabled value={address.name} />
          </FieldWrapper>
          <FieldWrapper id="street-address" label="Street address">
            <TextInput
              disabled
              value={
                address.street_number
                  ? `${address.street_number} ${address.route}`.trim()
                  : address.route
              }
            />
          </FieldWrapper>
          <FieldWrapper
            id="subpremise"
            label="Subpremise"
            hint="Apartment, suite, or unit"
          >
            <TextInput disabled value={address.subpremise} />
          </FieldWrapper>
          <FieldWrapper id="city" label="City">
            <TextInput disabled value={address.locality} />
          </FieldWrapper>
          <FieldWrapper id="state" label="State or region">
            <TextInput
              disabled
              value={address.administrative_area_level_1}
            />
          </FieldWrapper>
          <FieldWrapper id="postal-code" label="Postal code">
            <TextInput
              disabled
              value={
                address.postal_code
                  ? `${address.postal_code}${
                      address.postal_code_suffix
                        ? `-${address.postal_code_suffix}`
                        : ''
                    }`
                  : ''
              }
            />
          </FieldWrapper>
          <FieldWrapper id="country" label="Country">
            <TextInput disabled value={address.country} />
          </FieldWrapper>
        </FieldGroup>

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
