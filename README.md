# LocAPI SDK for JavaScript and TypeScript

The official, zero-dependency JavaScript/TypeScript client library for **LocAPI** — a modern, high-performance geolocation and geosearch service.

This SDK is written in TypeScript, compiled to both ESM and CommonJS formats, and relies purely on the native `fetch` API. It runs seamlessly in Node.js (18+), modern web browsers, Cloudflare Workers, Next.js, and other Edge environments.

---

## Features

- **TypeScript Native:** Full autocompletion and type definitions out of the box.
- **Zero Runtime Dependencies:** Built using the native global `fetch` API.
- **camelCase Inputs/Outputs:** Automatically aligns with JavaScript object naming conventions.
- **Comprehensive API Coverage:** Places, street-level addresses, reverse geocoding, postal codes, distance matrices, timezones, IP WHOIS & geolocations, health checks, and public statistics.

---

## Installation

Install the package via your preferred package manager:

```bash
# Using npm
npm install @locapi/sdk

# Using pnpm
pnpm add @locapi/sdk

# Using yarn
yarn add @locapi/sdk
```

---

## Initialization

Import and initialize the `LocApi` client. An API key is required. You can optionally specify a custom `baseUrl` for self-hosted instances or local development.

```typescript
import { LocApi } from '@locapi/sdk';

const locapi = new LocApi({
  apiKey: 'your_api_key_here',
  // Optional: defaults to https://locapi.dev
  baseUrl: 'https://locapi.dev' 
});
```

---

## Code Examples

### 1. Location Search (Database Full-Text)
Query places by name using a text search:

```typescript
try {
  const response = await locapi.locations.search({
    q: 'Prague',
    limit: 5
  });

  console.log(`Found ${response.data.length} locations:`);
  for (const location of response.data) {
    console.log(`- ${location.name} (${location.countryCode}): population ${location.population}`);
  }
} catch (error) {
  console.error('Search failed:', error);
}
```

### 2. High-Performance Geo-Search (Meilisearch)
Filter locations using coordinates and radius parameters:

```typescript
const response = await locapi.locations.searchGeo({
  lat: 50.0755,
  lon: 14.4378,
  radiusMeters: 10000, // 10km radius
  limit: 10
});
```

### 3. Autocomplete (Typeahead)
Use for real-time user-facing search inputs:

```typescript
const autocomplete = await locapi.locations.autocomplete({
  q: 'Pra',
  limit: 5,
  countryCode: 'CZ',
  highlight: true
});
```

### 4. Street-Level Address Search & Autocomplete
Search and reverse geocode physical street addresses:

```typescript
// Search addresses
const addresses = await locapi.addresses.search({
  q: 'Václavské náměstí',
  countryCode: 'CZ',
  limit: 5
});

// Real-time address autocomplete
const suggestions = await locapi.addresses.autocomplete({
  q: 'Václav',
  limit: 5,
  highlight: true
});

// Reverse geocode coordinate to nearest address
const nearestAddress = await locapi.addresses.reverseGeocode({
  lat: 50.0813,
  lon: 14.4267,
  radius: 300
});
```

### 5. Bulk Reverse Geocoding
Resolve nearest named locations for multiple coordinates in a single batch:

```typescript
const bulk = await locapi.locations.bulkLookups({
  locations: [
    { lat: 50.0755, lon: 14.4378 },
    { lat: 48.8566, lon: 2.3522 }
  ]
});
```

### 6. Postal Code Lookup
Search postal codes by prefix and country:

```typescript
const postalCodes = await locapi.postalCodes.search({
  postalCode: '11000',
  countryCode: 'CZ'
});
```

### 7. Distance Matrix calculation
Compute travel distance (meters) and duration (seconds) between multiple points:

```typescript
const matrix = await locapi.distanceMatrices.create({
  origins: [{ lat: 50.0755, lon: 14.4378 }],
  destinations: [{ lat: 49.1951, lon: 16.6068 }],
  speedKmh: 90
});
```

### 8. Timezone Lookup
Resolve the timezone and next DST transition of a coordinate:

```typescript
const tz = await locapi.timezones.get({
  lat: 50.0755,
  lon: 14.4378
});
console.log(tz.data.timezone); // "Europe/Prague"
```

### 9. Health & System Statistics
Check service health and public API performance:

```typescript
// Health checks
const health = await locapi.health.check();
const detailed = await locapi.health.detailed();

// Public performance stats
const stats = await locapi.stats.getPublicStats({ period: '7d' });
```

---

## Error Handling

The SDK throws custom `LocApiError` exceptions when the API returns an error or when a validation issue occurs.

```typescript
import { LocApi, LocApiError } from '@locapi/sdk';

try {
  await locapi.locations.get(-1); // invalid geonameid
} catch (error) {
  if (error instanceof LocApiError) {
    console.error(`API Error (Status ${error.statusCode}): ${error.message}`);
    console.log(`Error type: ${error.errorType}`); // e.g. "NOT_FOUND"
    console.log(error.issues); // Field-level validation issues if any
  } else {
    console.error('Network or unexpected error:', error);
}
```

---

## Runnable Examples & Demos

Check out the [examples/](./examples) directory for complete, runnable projects:

- **[01-basic-search](./examples/01-basic-search)**: Basic text search, fetching location by ID, alternative names, and error handling.
- **[02-geo-and-addresses](./examples/02-geo-and-addresses)**: Geo-radius queries, nearby locations, reverse geocoding, and street-level address autocomplete.
- **[03-travel-and-ip](./examples/03-travel-and-ip)**: Travel distance matrices, timezone resolution, IP WHOIS/geolocation, and health checks.
- **[04-browser-autocomplete](./examples/04-browser-autocomplete)**: Interactive browser typeahead search box built with vanilla HTML/TypeScript.

See [examples/README.md](./examples/README.md) for quick-start instructions.

