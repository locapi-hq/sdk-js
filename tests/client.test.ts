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
    
    expect(url).toBe('https://api.locapi.dev/v1/locations?q=Prague');
    expect(requestInit.headers.get('Authorization')).toBe('Bearer test_token');
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

  it('sends POST requests with correct body details', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ success: true, data: [] }),
    });

    const client = new LocApi({ apiKey: 'test_token' });
    await client.locations.bulkLookups({ geonameids: [123, 456] });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.locapi.dev/v1/locations/bulk-lookups');
    expect(requestInit.method).toBe('POST');
    expect(requestInit.body).toBe(JSON.stringify({ geonameids: [123, 456] }));
    expect(requestInit.headers.get('Content-Type')).toBe('application/json');
  });
});
