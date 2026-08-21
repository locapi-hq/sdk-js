/**
 * LocAPI JavaScript/TypeScript SDK - Example 03: Distance Matrix, Timezones, IP Geolocation & System Stats
 *
 * This example demonstrates:
 * 1. Computing distance matrices and travel times between multiple GPS coordinates
 * 2. Timezone resolution and DST transition inspection
 * 3. IP address geolocation and WHOIS record lookup
 * 4. Checking API cluster health and public latency metrics
 *
 * How to run:
 *   node --env-file=examples/.env --experimental-strip-types examples/03-travel-and-ip/index.ts
 *   or: pnpm example:travel
 */

import { LocApi, LocApiError } from '../../dist/index.js';

const apiKey = process.env.LOCAPI_API_KEY || 'demo_api_key';
const baseUrl = process.env.LOCAPI_BASE_URL || 'https://locapi.dev';

console.log('--- LocAPI JS/TS SDK: Travel, Timezones & Network Services Demo ---');
console.log(`Connecting to: ${baseUrl}\n`);

const locapi = new LocApi({ apiKey, baseUrl });

async function main() {
  // ---------------------------------------------------------------------------
  // 1. Distance Matrix (Origins -> Destinations)
  // ---------------------------------------------------------------------------
  console.log('1. Computing Distance Matrix for Central European Capitals...');
  try {
    const origins = [
      { lat: 50.0755, lon: 14.4378 }, // Prague
      { lat: 48.1486, lon: 17.1077 }, // Bratislava
    ];
    const destinations = [
      { lat: 48.2082, lon: 16.3738 }, // Vienna
      { lat: 47.4979, lon: 19.0402 }, // Budapest
    ];

    const matrix = await locapi.distanceMatrices.create({
      origins,
      destinations,
      speedKmh: 90, // Average driving speed for travel time estimation
    });

    console.log(`✓ Distance Matrix computed (${matrix.data.origins.length}x${matrix.data.destinations.length}):`);
    const labels = ['Prague', 'Bratislava'];
    const destLabels = ['Vienna', 'Budapest'];

    matrix.data.matrix.forEach((row, originIdx) => {
      console.log(`   From ${labels[originIdx]}:`);
      row.forEach((cell, destIdx) => {
        const distKm = Math.round(cell.distanceKm);
        const durationHrs = (cell.durationMinutes / 60).toFixed(1);
        console.log(`     -> ${destLabels[destIdx]}: ${distKm} km (~${durationHrs} h)`);
      });
    });
  } catch (error) {
    handleError('Distance Matrix', error);
  }

  console.log('\n--------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // 2. Timezone Resolution
  // ---------------------------------------------------------------------------
  const tokyoCoord = { lat: 35.6762, lon: 139.6503 };
  console.log(`2. Resolving Timezone for Tokyo [${tokyoCoord.lat}, ${tokyoCoord.lon}]...`);
  try {
    const tz = await locapi.timezones.get(tokyoCoord);
    console.log(`✓ Timezone ID: ${tz.data.timezone}`);
    console.log(`   UTC Offset: ${tz.data.gmtOffset} hours (raw: ${tz.data.rawOffset})`);
    console.log(`   Current Local Time: ${tz.data.localTime}`);
    console.log(`   Has DST: ${tz.data.dstOffset !== 0 ? 'Yes' : 'No'}`);
  } catch (error) {
    handleError('Timezone Lookup', error);
  }

  console.log('\n--------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // 3. IP Address Geolocation & WHOIS
  // ---------------------------------------------------------------------------
  const testIp = '8.8.8.8'; // Google Public DNS
  console.log(`3. Looking up Geolocation & WHOIS for IP: ${testIp}...`);
  try {
    const ipGeo = await locapi.ipAddresses.getGeolocation(testIp);
    console.log(`✓ IP Geolocation:`);
    console.log(`   Country: ${ipGeo.data.countryName} (${ipGeo.data.countryCode})`);
    console.log(`   City: ${ipGeo.data.city || 'N/A'}`);
    console.log(`   ISP/ASN: ${ipGeo.data.isp || 'N/A'} (${ipGeo.data.asn || 'N/A'})`);
    console.log(`   Coordinates: [${ipGeo.data.latitude}, ${ipGeo.data.longitude}]`);

    const ipWhois = await locapi.ipAddresses.getWhois(testIp);
    console.log(`✓ IP WHOIS Allocation:`);
    console.log(`   Net Range: ${ipWhois.data.netRange || 'N/A'}`);
    console.log(`   Org: ${ipWhois.data.orgName || 'N/A'}`);
  } catch (error) {
    handleError('IP Services', error);
  }

  console.log('\n--------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // 4. API Health & Public Stats
  // ---------------------------------------------------------------------------
  console.log('4. Checking API Health & System Metrics...');
  try {
    const health = await locapi.health.detailed();
    console.log(`✓ Service Status: ${health.status}`);
    console.log(`   Database Latency: ${health.services.database.latencyMs} ms (${health.services.database.status})`);
    console.log(`   Meilisearch Latency: ${health.services.meilisearch.latencyMs} ms (${health.services.meilisearch.status})`);
    console.log(`   Redis Cache Latency: ${health.services.cache.latencyMs} ms (${health.services.cache.status})`);

    const stats = await locapi.stats.getPublicStats({ period: '24h' });
    console.log(`✓ Public 24h Stats:`);
    console.log(`   Total Requests: ${stats.data.totalRequests?.toLocaleString() ?? 'N/A'}`);
    console.log(`   Average Response Time: ${stats.data.averageLatencyMs ?? 'N/A'} ms`);
  } catch (error) {
    handleError('Health & Stats', error);
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
