# LocAPI JavaScript/TypeScript SDK Examples

This directory contains functional, ready-to-run code examples and demonstrations showcasing how to use the official `@locapi/sdk` library in different environments (Node.js, TypeScript, and modern web browsers).

---

## Quick Start

### 1. Configure Environment

Copy the example environment file and set your LocAPI API key (you can obtain or generate keys in the [LocAPI Console](https://locapi.net/console)):

```bash
cp .env.example .env
```

Edit `.env`:
```ini
LOCAPI_API_KEY=your_api_key_here
LOCAPI_BASE_URL=https://locapi.dev
```

---

## Available Examples

### 1. Basic Text Search & Error Handling (`01-basic-search`)
Demonstrates core operations:
- Client initialization with custom options (`apiKey`, `baseUrl`).
- Database full-text location search with country filtering and limits (`locapi.locations.search`).
- Single location lookup by GeoNames ID (`locapi.locations.get`).
- Multilingual alternative name retrieval (`locapi.locations.alternativeNames`).
- Catching and inspecting `LocApiError` (status code, error type, validation issues).

**Run:**
```bash
node --env-file=examples/.env --experimental-strip-types examples/01-basic-search/index.ts
# or from packages/sdk-js root:
pnpm example:basic
```

---

### 2. Geo Search, Coordinates & Street Addresses (`02-geo-and-addresses`)
Demonstrates spatial and address features:
- High-performance Meilisearch geo-radius search around GPS coordinates (`locapi.locations.searchGeo`).
- Finding nearest locations (`locapi.locations.searchNearby`).
- Reverse geocoding GPS coordinates to administrative entities (`locapi.locations.reverseGeocode`).
- Real-time location typeahead autocomplete (`locapi.locations.autocomplete`).
- Street-level address search (`locapi.addresses.search`) and address autocomplete (`locapi.addresses.autocomplete`).
- Reverse geocoding to the nearest physical street address (`locapi.addresses.reverseGeocode`).
- Retrieving GeoJSON administrative boundaries (`locapi.locations.boundaries`).

**Run:**
```bash
node --env-file=examples/.env --experimental-strip-types examples/02-geo-and-addresses/index.ts
# or from packages/sdk-js root:
pnpm example:geo
```

---

### 3. Travel Matrix, Timezones, IP Geolocation & Health (`03-travel-and-ip`)
Demonstrates utility, routing, and network features:
- Multi-origin to multi-destination distance matrix calculation with speed estimation (`locapi.distanceMatrices.create`).
- Timezone lookup with daylight saving time (DST) data (`locapi.timezones.get`).
- IP address geolocation and WHOIS network allocation (`locapi.ipAddresses.getGeolocation`, `locapi.ipAddresses.getWhois`).
- Service health diagnostics and latency metrics (`locapi.health.detailed`, `locapi.stats.getPublicStats`).

**Run:**
```bash
node --env-file=examples/.env --experimental-strip-types examples/03-travel-and-ip/index.ts
# or from packages/sdk-js root:
pnpm example:travel
```

---

### 4. Interactive Browser Autocomplete (`04-browser-autocomplete`)
A standalone client-side web application showing how `@locapi/sdk` works directly in modern web browsers:
- Interactive input box with debounced real-time typeahead queries.
- Response time latency measurement and error handling.
- Rich results rendering (name, country, coordinates, feature class).

**Run with any local HTTP server (or Vite):**
```bash
# Using Python built-in server:
python3 -m http.server 8080 --directory examples/04-browser-autocomplete

# Or with npx serve / vite:
npx serve examples/04-browser-autocomplete
```
Then open `http://localhost:8080` in your browser.

---

## How to Import in Your Own Project

Install the package:
```bash
npm install @locapi/sdk
# or
pnpm add @locapi/sdk
```

Initialize and use:
```typescript
import { LocApi, LocApiError } from '@locapi/sdk';

const locapi = new LocApi({
  apiKey: process.env.LOCAPI_API_KEY!,
});

try {
  const result = await locapi.locations.search({ q: 'Prague' });
  console.log(result.data);
} catch (error) {
  if (error instanceof LocApiError) {
    console.error(`API Error [${error.statusCode}]: ${error.message}`);
  }
}
```
