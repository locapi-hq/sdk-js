# LocAPI SDK for JavaScript and TypeScript

The official, zero-dependency JavaScript/TypeScript client library for **LocAPI** — a modern, high-performance geolocation and geosearch service.

This SDK is written in TypeScript, compiled to both ESM and CommonJS formats, and relies purely on the native `fetch` API. It runs seamlessly in Node.js (18+), modern web browsers, Cloudflare Workers, Next.js, and other Edge environments.

---

## Features

- **TypeScript Native:** Full autocompletion and type definitions out of the box.
- **Self-Contained:** Type contracts are inlined, removing the need for external schema packages.
- **Zero Runtime Dependencies:** Built using the native global `fetch` API.
- **camelCase Inputs/Outputs:** Automatically aligns with JavaScript object naming conventions.

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
  // Optional: defaults to https://api.locapi.dev
  baseUrl: 'https://api.locapi.dev' 
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
  countryCode: 'CZ'
});
```

### 4. Distance Matrix calculation
Compute travel distance (meters) and duration (seconds) between multiple points:

```typescript
const matrix = await locapi.distanceMatrices.create({
  origins: [{ lat: 50.0755, lon: 14.4378 }],
  destinations: [{ lat: 49.1951, lon: 16.6068 }],
  speedKmh: 90 // normalise speed
});
```

### 5. Timezone Lookup
Resolve the timezone and next DST transition of a coordinate:

```typescript
const tz = await locapi.timezones.get({
  lat: 50.0755,
  lon: 14.4378
});
console.log(tz.data.timezone); // "Europe/Prague"
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
}
```
