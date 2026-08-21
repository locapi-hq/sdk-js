/**
 * LocAPI JavaScript/TypeScript SDK - Example 02: Geo Search, Coordinates & Street Addresses
 *
 * This example demonstrates:
 * 1. Geo-radius filtered search (powered by Meilisearch)
 * 2. Nearby locations lookup around GPS coordinates
 * 3. Reverse geocoding (coordinates -> location entity)
 * 4. Location autocomplete with match highlighting
 * 5. Street address search, autocomplete and address reverse geocoding
 * 6. Administrative boundary retrieval (GeoJSON)
 *
 * How to run:
 *   node --env-file=examples/.env --experimental-strip-types examples/02-geo-and-addresses/index.ts
 *   or: pnpm example:geo
 */

import { LocApi, LocApiError } from '../../dist/index.js';

const apiKey = process.env.LOCAPI_API_KEY || 'demo_api_key';
const baseUrl = process.env.LOCAPI_BASE_URL || 'https://locapi.dev';

console.log('--- LocAPI JS/TS SDK: Geo & Address Services Demo ---');
console.log(`Connecting to: ${baseUrl}\n`);

const locapi = new LocApi({ apiKey, baseUrl });

async function main() {
  // Prague Old Town Square coordinates
  const pragueCenter = { lat: 50.0875, lon: 14.4213 };

  // ---------------------------------------------------------------------------
  // 1. Meilisearch Geo-Radius Search
  // ---------------------------------------------------------------------------
  console.log(`1. Geo-radius search: Finding cities within 15 km of [${pragueCenter.lat}, ${pragueCenter.lon}]...`);
  try {
    const geoResults = await locapi.locations.searchGeo({
      lat: pragueCenter.lat,
      lon: pragueCenter.lon,
      radiusMeters: 15000,
      featureClass: 'P', // Populated places (cities, towns)
      limit: 4,
    });

    console.log(`✓ Found ${geoResults.data.results.length} locations within 15 km:`);
    for (const item of geoResults.data.results) {
      console.log(`   • ${item.name} (${item.countryCode}) - Pop: ${item.population?.toLocaleString() ?? 'N/A'}`);
      console.log(`     Coordinates: [${item._geo?.lat}, ${item._geo?.lng}]`);
    }
  } catch (error) {
    handleError('Geo Search', error);
  }

  console.log('\n--------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // 2. Reverse Geocoding
  // ---------------------------------------------------------------------------
  console.log(`2. Reverse geocoding coordinates [${pragueCenter.lat}, ${pragueCenter.lon}]...`);
  try {
    const reverse = await locapi.locations.reverseGeocode({
      lat: pragueCenter.lat,
      lon: pragueCenter.lon,
      radiusMeters: 5000,
      enrichCountry: true,
    });

    if (reverse.data) {
      console.log(`✓ Resolved Location: ${reverse.data.name} (${reverse.data.countryCode})`);
      console.log(`   Admin Division: ${reverse.data.admin1Name ?? 'N/A'}, ${reverse.data.admin2Name ?? 'N/A'}`);
      console.log(`   Timezone: ${reverse.data.timezone}`);
      if (reverse.data.country) {
        console.log(`   Country Info: ${reverse.data.country.officialName} (Capital: ${reverse.data.country.capital})`);
      }
    } else {
      console.log('No location found at these coordinates.');
    }
  } catch (error) {
    handleError('Reverse Geocode', error);
  }

  console.log('\n--------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // 3. Location Autocomplete (Typeahead)
  // ---------------------------------------------------------------------------
  console.log('3. Real-time Location Autocomplete query: "Vien"...');
  try {
    const autoResults = await locapi.locations.autocomplete({
      q: 'Vien',
      limit: 3,
      highlight: true,
    });

    console.log(`✓ Autocomplete suggestions:`);
    for (const match of autoResults.data) {
      console.log(`   • ${match.name} (${match.countryCode}) [${match.featureClass}.${match.featureCode}]`);
    }
  } catch (error) {
    handleError('Location Autocomplete', error);
  }

  console.log('\n--------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // 4. Street Address Search & Autocomplete
  // ---------------------------------------------------------------------------
  console.log('4. Street-level address search: "Václavské náměstí"...');
  try {
    const addressSearch = await locapi.addresses.search({
      q: 'Václavské náměstí',
      countryCode: 'CZ',
      limit: 3,
    });

    console.log(`✓ Found ${addressSearch.data.results.length} address records:`);
    for (const addr of addressSearch.data.results) {
      console.log(`   • ${addr.formattedAddress || addr.streetName}`);
      console.log(`     Postal Code: ${addr.postalCode} | Municipality: ${addr.municipality}`);
      console.log(`     Coordinates: [${addr.latitude}, ${addr.longitude}]`);
    }
  } catch (error) {
    handleError('Address Search', error);
  }

  console.log('\n--------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // 5. Address Reverse Geocode
  // ---------------------------------------------------------------------------
  console.log(`5. Converting coordinates [${pragueCenter.lat}, ${pragueCenter.lon}] to nearest street address...`);
  try {
    const nearestAddress = await locapi.addresses.reverseGeocode({
      lat: pragueCenter.lat,
      lon: pragueCenter.lon,
      radius: 200,
    });

    if (nearestAddress.data) {
      console.log(`✓ Nearest Address: ${nearestAddress.data.formattedAddress}`);
      console.log(`   Street: ${nearestAddress.data.streetName} ${nearestAddress.data.houseNumber ?? ''}`);
      console.log(`   Distance: ${nearestAddress.data.distanceMeters ? Math.round(nearestAddress.data.distanceMeters) + ' m' : 'N/A'}`);
    } else {
      console.log('No street address found within radius.');
    }
  } catch (error) {
    handleError('Address Reverse Geocode', error);
  }

  console.log('\n--------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // 6. Administrative GeoJSON Boundaries
  // ---------------------------------------------------------------------------
  const boundaryId = 3067696; // Prague
  console.log(`6. Fetching GeoJSON administrative boundary for ID: ${boundaryId}...`);
  try {
    const boundaries = await locapi.locations.boundaries(boundaryId);
    if (boundaries.data?.geometry) {
      console.log(`✓ Boundary Geometry Type: ${boundaries.data.geometry.type}`);
      console.log(`   Coordinates Count: ${boundaries.data.geometry.coordinates?.length ?? 0} rings/polygons`);
    } else {
      console.log('Boundary geometry not available for this entity.');
    }
  } catch (error) {
    handleError('Boundaries', error);
  }
}

function handleError(context: string, error: unknown) {
  if (error instanceof LocApiError) {
    console.error(`[${context}] LocApiError (${error.statusCode}): ${error.message}`);
  } else if (error instanceof Error) {
    console.error(`[${context}] Error: ${error.message}`);
  } else {
    console.error(`[${context}] Unknown error:`, error);
  }
}

main().catch(console.error);
