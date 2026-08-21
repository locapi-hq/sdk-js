import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocApi } from '../src/client.js';
import { LocApiError } from '../src/errors.js';

describe('LocApi Client (JS/TS SDK)', () => {
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  it('initializes with correct apiKey and default baseUrl', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ success: true, data: [] }),
    });

    const client = new LocApi({ apiKey: 'test_token' });
    await client.locations.search({ q: 'Prague' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, requestInit] = fetchMock.mock.calls[0];
    
    expect(url).toBe('https://locapi.dev/v1/locations?q=Prague');
    expect(requestInit.headers.get('Locapi-Api-Key')).toBe('test_token');
    expect(requestInit.headers.get('Accept')).toBe('application/json');
  });

  it('accepts custom baseUrl option', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ success: true, data: [] }),
    });

    const client = new LocApi({ apiKey: 'test_token', baseUrl: 'http://localhost:3000/' });
    await client.locations.search({ q: 'Prague' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:3000/v1/locations?q=Prague');
  });

  it('throws LocApiError on non-200 responses with parsing', async () => {
    const errorBody = {
      message: 'The given data was invalid.',
      errorType: 'VALIDATION_FAILED',
      errors: {
        q: ['The query field is required.']
      }
    };

    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => JSON.stringify(errorBody),
    });

    const client = new LocApi({ apiKey: 'test_token' });
    
    await expect(client.locations.search({ q: '' })).rejects.toThrow(LocApiError);
    
    try {
      await client.locations.search({ q: '' });
    } catch (e: any) {
      expect(e).toBeInstanceOf(LocApiError);
      expect(e.statusCode).toBe(422);
      expect(e.errorType).toBe('VALIDATION_FAILED');
      expect(e.issues).toEqual({ q: ['The query field is required.'] });
    }
  });

  it('sends POST requests with coordinates for bulkLookups', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ success: true, data: [] }),
    });

    const client = new LocApi({ apiKey: 'test_token' });
    const coords = [
      { lat: 50.08, lon: 14.43 },
      { lat: 48.85, lon: 2.35 }
    ];
    await client.locations.bulkLookups({ locations: coords });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toBe('https://locapi.dev/v1/locations/bulk-lookups');
    expect(requestInit.method).toBe('POST');
    expect(requestInit.body).toBe(JSON.stringify({ locations: coords }));
    expect(requestInit.headers.get('Content-Type')).toBe('application/json');
  });

  it('handles address endpoints correctly', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ success: true, data: [] }),
    });

    const client = new LocApi({ apiKey: 'test_token' });
    
    // Address search
    await client.addresses.search({ q: 'Wenceslas', countryCode: 'CZ', limit: 10 });
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://locapi.dev/v1/addresses?q=Wenceslas&countryCode=CZ&limit=10',
      expect.anything()
    );

    // Address autocomplete
    await client.addresses.autocomplete({ q: 'Wenc', limit: 5, highlight: true });
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://locapi.dev/v1/addresses/autocomplete?q=Wenc&limit=5&highlight=true',
      expect.anything()
    );

    // Address reverse geocode
    await client.addresses.reverseGeocode({ lat: 50.08, lon: 14.43, radius: 200 });
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://locapi.dev/v1/addresses/reverse-geocode?lat=50.08&lon=14.43&radius=200',
      expect.anything()
    );

    // Address get by ID
    await client.addresses.get(42);
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://locapi.dev/v1/addresses/42',
      expect.anything()
    );
  });

  it('handles postalCodes.search with correct parameter names', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ success: true, data: [] }),
    });

    const client = new LocApi({ apiKey: 'test_token' });
    await client.postalCodes.search({ postalCode: '11000', countryCode: 'CZ', limit: 5 });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://locapi.dev/v1/postal-codes?postalCode=11000&countryCode=CZ&limit=5',
      expect.anything()
    );
  });

  it('handles alternativeNames with query params', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ success: true, data: [] }),
    });

    const client = new LocApi({ apiKey: 'test_token' });
    await client.locations.alternativeNames(3067696, { lang: 'cs', includeSpecial: true, limit: 50 });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://locapi.dev/v1/locations/3067696/alternative-names?lang=cs&includeSpecial=true&limit=50',
      expect.anything()
    );
  });

  it('handles health and stats endpoints', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ status: 'ok' }),
    });

    const client = new LocApi({ apiKey: 'test_token' });
    
    await client.health.check();
    expect(fetchMock).toHaveBeenLastCalledWith('https://locapi.dev/health', expect.anything());

    await client.health.detailed();
    expect(fetchMock).toHaveBeenLastCalledWith('https://locapi.dev/health/detailed', expect.anything());

    await client.health.ready();
    expect(fetchMock).toHaveBeenLastCalledWith('https://locapi.dev/health/ready', expect.anything());

    await client.stats.getPublicStats({ period: '7d' });
    expect(fetchMock).toHaveBeenLastCalledWith('https://locapi.dev/v1/public/stats?period=7d', expect.anything());
  });

  it('handles distanceMatrices.create with options', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ success: true, data: {} }),
    });

    const client = new LocApi({ apiKey: 'test_token' });
    const origins = [{ lat: 50.08, lon: 14.43 }];
    const destinations = [{ lat: 48.85, lon: 2.35 }];
    await client.distanceMatrices.create({ origins, destinations, speedKmh: 120 });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://locapi.dev/v1/distance-matrices',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ origins, destinations, speedKmh: 120 })
      })
    );
  });
});
