# Google Places Autocomplete

A DatoCMS plugin that turns a JSON field into a Google Places address editor. Editors search for an address or venue, pick a suggestion, and the field stores structured JSON: street parts, city, region, country, postal code, venue name, formatted address, coordinates, and UTC offset.

This is a new plugin. It keeps the JSON shape of the original [DatoCMS Address Autocomplete](https://github.com/elevationchurch/datocms-plugin-adress-autocomplete) plugin (v1.2.0, by Ulises Himely / Elevation Church) so existing records can be read by the same frontend queries. It does not replace that package or its Marketplace listing.

The original plugin was built on DatoCMS Plugin SDK 0.7, Create React App, and the legacy `google.maps.places.Autocomplete` widget. This version is built on the current stack:

- DatoCMS Plugin SDK 2.5 and `datocms-react-ui` 2.5
- Vite, React 19, and TypeScript 7
- Google Place Autocomplete (New) through `PlaceAutocompleteElement`
- `@googlemaps/js-api-loader` 2 (`setOptions` and `importLibrary`)

## What editors see

**Plugin settings.** One required Google Maps API key, saved with an explicit Save button. The parameter name is `mapsAPIKey`.

**Field presentation.** The editor is available only on JSON fields, under the name **Google Places address**. Each field can choose the language Google should prefer for suggestions. That setting is stored as `{ "label": "English", "value": "en" }`.

**Record editor.** A Places lookup sits above a read-only summary: venue, street, subpremise, city, state or region, postal code, country, latitude, longitude, and UTC offset in minutes. Choosing a suggestion writes the JSON immediately. Clearing the lookup writes an empty address. **Reset to initial value** restores the address that was loaded when the record form opened and saves that value back to the field.

On focus, the lookup asks for the browser location and biases suggestions toward that area. Location access is optional; search still works if it is denied.

## Requirements

- A DatoCMS project
- A Google Cloud project with billing enabled
- **Maps JavaScript API** enabled
- **Places API (New)** enabled
- A browser API key

The legacy Places API is not enough. `PlaceAutocompleteElement` needs Places API (New).

## Google API key security

The key is used in the browser. Restrict it in Google Cloud:

1. Set the application restriction to **Websites**.
2. Allow the origin that serves the DatoCMS plugin iframe.
3. Allow the local Vite origin, such as `http://localhost:5173/*`, only while developing.
4. Restrict the key to **Maps JavaScript API** and **Places API (New)**.

Check the iframe origin in the browser network panel before locking the referrer list.

## Install and configure

1. Install **Google Places Autocomplete** in the DatoCMS project.
2. Open the plugin settings and save the Google Maps API key.
3. Create or edit a **JSON** field.
4. Under **Presentation**, set the field editor to **Google Places address**.
5. Choose the results language.

## Stored value

The field value is pretty-printed JSON:

```json
{
  "street_number": "11701",
  "route": "Elevation Pt Dr",
  "neighborhood": "Ballantyne",
  "locality": "Charlotte",
  "administrative_area_level_2": "Mecklenburg County",
  "administrative_area_level_1": "NC",
  "country": "US",
  "postal_code": "28277",
  "name": "Elevation Church - Ballantyne",
  "formatted_address": "11701 Elevation Pt Dr, Charlotte, NC 28277, USA",
  "coordinates": {
    "lat": 35.02993079999999,
    "lng": -80.8557278
  },
  "utc_offset_minutes": -240
}
```

Component values use Google's short text when it is available, so country stays `US` and a state stays `NC`. Extra component types returned by Places, such as `neighborhood`, are kept on the object even when the summary form does not show them.

## Moving a field from the original plugin

The original plugin stays installed until you change each field. To point a JSON field at this editor:

1. Install and configure this plugin with a key that has Places API (New) enabled.
2. Change the field presentation from **Address** to **Google Places address**.
3. Choose the language again. The original plugin stored the same `{ label, value }` shape.
4. Open a record that already has an address and confirm the summary fields match the saved JSON.

New selections are written in the same key names. Empty or invalid JSON is treated as a blank address.

## Billing

`PlaceAutocompleteElement` manages the autocomplete session. Each selection calls `Place.fetchFields()` for `addressComponents`, `displayName`, `formattedAddress`, `location`, and `utcOffsetMinutes`. That request closes the session and is billed under current Place Autocomplete and Place Details prices. Check Google Maps Platform pricing before production use.

## Development

Node.js 22.12 or newer and pnpm 12.8.1.

```bash
corepack enable
pnpm install
pnpm dev
```

In DatoCMS, add the local Vite URL as a private plugin. The production entry point is `dist/index.html`.

```bash
pnpm check
pnpm outdated
pnpm peers check
```

`pnpm check` runs Oxlint with warnings denied, the unit tests, the TypeScript build, and the Vite production build.

## Publishing

Version 1.0.0 publishes the `dist` folder. A published GitHub release runs the npm workflow when the `NPM_TOKEN` repository secret is set.

## License

MIT. The address JSON contract follows the original [datocms-plugin-address-autocomplete](https://github.com/elevationchurch/datocms-plugin-adress-autocomplete) plugin.
