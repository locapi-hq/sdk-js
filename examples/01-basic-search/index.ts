/**
 * LocAPI JavaScript/TypeScript SDK - Example 01: Basic Search & Error Handling
 *
 * This example demonstrates:
 * 1. Initializing the LocApi client with API key and baseUrl
 * 2. Performing database text searches with filters and pagination
 * 3. Fetching single location by GeoNames ID
 * 4. Fetching multilingual alternative names
 * 5. Robust error handling using LocApiError
 *
 * How to run:
 *   node --env-file=examples/.env --experimental-strip-types examples/01-basic-search/index.ts
 *   or: pnpm example:basic
 */

// In your application, import from '@locapi/sdk':
// import { LocApi, LocApiError } from '@locapi/sdk';
import { LocApi, LocApiError } from '../../dist/index.js';

// 1. Initialize client
const apiKey = process.env.LOCAPI_API_KEY || 'demo_api_key';
const baseUrl = process.env.LOCAPI_BASE_URL || 'https://locapi.dev';

console.log('--- LocAPI JS/TS SDK: Basic Search Demo ---');
console.log(`Connecting to: ${baseUrl}`);
console.log(`API Key: ${apiKey.slice(0, 4)}...${apiKey.slice(-4)}\n`);

const locapi = new LocApi({
  apiKey,
  baseUrl,
});

async function main() {
  // ---------------------------------------------------------------------------
  // Example 1: Text Search with Country Filter & Limit
  // ---------------------------------------------------------------------------
  console.log('1. Searching for locations matching "Prague"...');
  try {
    const searchResult = await locapi.locations.search({
      q: 'Prague',
      countryCode: 'CZ',
      limit: 3,
    });

    console.log(`✓ Found ${searchResult.data.length} results:`);
    for (const item of searchResult.data) {
      console.log(`   • [${item.geonameid}] ${item.name} (${item.countryCode}) - Pop: ${item.population?.toLocaleString() ?? 'N/A'}`);
      console.log(`     Coordinates: [${item._geo?.lat}, ${item._geo?.lng}] | Feature: ${item.featureClass}.${item.featureCode}`);
    }
  } catch (error) {
    handleError('Text Search', error);
  }

  console.log('\n--------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // Example 2: Retrieve Specific Location by ID
  // ---------------------------------------------------------------------------
  const geonameId = 3067696; // Prague, Czech Republic
  console.log(`2. Fetching location details for GeoNames ID: ${geonameId}...`);
  try {
    const location = await locapi.locations.get(geonameId);
    console.log(`✓ Location Name: ${location.data.name} (${location.data.asciiname})`);
    console.log(`   Country: ${location.data.countryCode} | Timezone: ${location.data.timezone}`);
    console.log(`   Coordinates: lat ${location.data._geo?.lat}, lon ${location.data._geo?.lng}`);
    console.log(`   Elevation: ${location.data.elevation ?? 'N/A'} m | Population: ${location.data.population?.toLocaleString()}`);
  } catch (error) {
    handleError('Get Location', error);
  }

  console.log('\n--------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // Example 3: Fetch Multilingual Alternative Names
  // ---------------------------------------------------------------------------
  console.log(`3. Fetching Czech & German alternative names for ID: ${geonameId}...`);
  try {
    const altNames = await locapi.locations.alternativeNames(geonameId, {
      lang: 'cs',
      limit: 5,
    });
    console.log(`✓ Found ${altNames.data?.length ?? 0} alternative name records:`);
    for (const alt of altNames.data ?? []) {
      console.log(`   • Language [${alt.isoLanguage || 'def'}]: "${alt.alternateName}" (preferred: ${alt.isPreferredName ? 'yes' : 'no'})`);
    }
  } catch (error) {
    handleError('Alternative Names', error);
  }

  console.log('\n--------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // Example 4: Demonstrating Error Handling (e.g. Non-existent location)
  // ---------------------------------------------------------------------------
  const nonExistentId = 999999999;
  console.log(`4. Testing Error Handling (Fetching invalid ID ${nonExistentId})...`);
  try {
    await locapi.locations.get(nonExistentId);
    console.log('Unexpected success!');
  } catch (error) {
    console.log('✓ Successfully caught expected error:');
    handleError('Expected Error Demo', error);
  }
}

/**
 * Helper to display structured LocApiError properties
 */
function handleError(context: string, error: unknown) {
  if (error instanceof LocApiError) {
    console.error(`[${context}] LocApiError (${error.statusCode}): ${error.message}`);
    if (error.errorType) {
      console.error(`   Error Type: ${error.errorType}`);
    }
    if (error.issues) {
      console.error(`   Field Validation Issues:`, JSON.stringify(error.issues, null, 2));
    }
  } else if (error instanceof Error) {
    console.error(`[${context}] Error: ${error.message}`);
  } else {
    console.error(`[${context}] Unknown error:`, error);
  }
}

main().catch(console.error);
