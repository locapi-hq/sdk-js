# @locapi/sdk

## 0.2.0

### Minor Changes

- feat(sdk): add support for Address search, autocomplete, and reverse geocoding
  - Added `addressSearch()`, `addressAutocomplete()`, and `addressReverseGeocode()` methods
  - Added IP geolocation and WHOIS lookup methods (`ipWhois()`, `ipGeolocation()`)
  - Added health and readiness probes (`health()`, `detailedHealth()`, `readiness()`)
  - Added public telemetry statistics method (`publicStats()`)
  - Added support for alternative names in location lookups
  - Updated typings against `@locapi/schemas`

## 0.1.0

### Minor Changes

- Initial release of the official LocAPI JavaScript & TypeScript SDK
  - Zero-dependency client built on native `fetch`
  - Dual ESM (`.js`) and CommonJS (`.cjs`) builds with full TypeScript declarations
  - Geo search, reverse geocoding, nearby places, and boundaries
  - Country metadata, timezones, postal codes, and distance matrix calculations
