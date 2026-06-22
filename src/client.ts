import { LocApiError } from './errors.js';
import type {
  Coordinate,
  CountryInfoResponse,
  GeoBoundaryResponse,
  DistanceMatrixResponse,
  TimezoneResponse,
  PostalCode,
  AutocompleteResponse,
  MeilisearchGeoDocument,
  BulkLookupResponse,
  ReverseGeocodeResponse
} from '@locapi/schemas';

export interface LocApiOptions {
  apiKey: string;
  baseUrl?: string;
}

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const parts = Object.entries(params)
    .filter(([_, val]) => val !== undefined && val !== null)
    .map(([key, val]) => {
      if (Array.isArray(val)) {
        return val.map(v => `${encodeURIComponent(key)}[]=${encodeURIComponent(String(v))}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`;
    });
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

export class LocApi {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options: LocApiOptions) {
    if (!options.apiKey) {
      throw new Error('LocAPI: API Key is required');
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl || 'https://api.locapi.dev').replace(/\/$/, '');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    
    // Inject headers safely
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${this.apiKey}`);
    headers.set('Accept', 'application/json');
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    let response: Response;
    try {
      response = await fetch(url, { ...options, headers });
    } catch (e: any) {
      throw new Error(`LocAPI network error: ${e.message || 'Unknown network error'}`);
    }

    let data: any = {};
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      throw new LocApiError(
        data.message || `Request failed with status ${response.status}`,
        response.status,
        {
          errorType: data.errorType,
          issues: data.errors,
          meta: data.meta
        }
      );
    }

    return data as T;
  }

  // ---------------------------------------------------------------------------
  // Resource Namespaces
  // ---------------------------------------------------------------------------

  public readonly locations = {
    search: (params?: { q: string; countryCode?: string; featureClass?: string; limit?: number; page?: number }) => {
      return this.request<{ success: boolean; data: MeilisearchGeoDocument[]; meta: any }>(
        `/v1/locations${buildQueryString(params)}`
      );
    },

    get: (geonameid: number) => {
      return this.request<{ success: boolean; data: MeilisearchGeoDocument }>(
        `/v1/locations/${geonameid}`
      );
    },

    searchGeo: (params?: { q?: string; lat?: number; lon?: number; radiusMeters?: number; countryCode?: string; featureClass?: string; limit?: number }) => {
      return this.request<{ success: boolean; data: MeilisearchGeoDocument[]; meta: any }>(
        `/v1/locations/geo-search${buildQueryString(params)}`
      );
    },

    searchNearby: (params: { lat: number; lon: number; radiusMeters?: number; limit?: number }) => {
      return this.request<{ success: boolean; data: MeilisearchGeoDocument[]; meta: any }>(
        `/v1/locations/nearby${buildQueryString(params)}`
      );
    },

    reverseGeocode: (params: { lat: number; lon: number }) => {
      return this.request<ReverseGeocodeResponse>(
        `/v1/locations/reverse-geocode${buildQueryString(params)}`
      );
    },

    autocomplete: (params: { q: string; limit?: number; countryCode?: string }) => {
      return this.request<AutocompleteResponse>(
        `/v1/locations/autocomplete${buildQueryString(params)}`
      );
    },

    bulkLookups: (params: { geonameids: number[] }) => {
      return this.request<BulkLookupResponse>('/v1/locations/bulk-lookups', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },

    boundaries: (geonameid: number) => {
      return this.request<GeoBoundaryResponse>(
        `/v1/locations/${geonameid}/boundaries`
      );
    },

    alternativeNames: (geonameid: number) => {
      return this.request<{ success: boolean; data: Array<{ id: number; isolanguage?: string; alternateName: string; isPreferredName?: boolean; isShortName?: boolean }> }>(
        `/v1/locations/${geonameid}/alternative-names`
      );
    }
  };

  public readonly countries = {
    getInfo: (params: { countryCode: string }) => {
      return this.request<CountryInfoResponse>(
        `/v1/countries/info${buildQueryString(params)}`
      );
    },

    getLocations: (countryCode: string, params?: { q?: string; limit?: number }) => {
      return this.request<{ success: boolean; data: MeilisearchGeoDocument[]; meta: any }>(
        `/v1/countries/${countryCode}/locations${buildQueryString(params)}`
      );
    }
  };

  public readonly features = {
    getLocations: (featureClass: string, params?: { q?: string; limit?: number }) => {
      return this.request<{ success: boolean; data: MeilisearchGeoDocument[]; meta: any }>(
        `/v1/features/${featureClass}/locations${buildQueryString(params)}`
      );
    }
  };

  public readonly postalCodes = {
    search: (params: { q: string; countryCode?: string; limit?: number }) => {
      return this.request<{ success: boolean; data: PostalCode[]; meta: any }>(
        `/v1/postal-codes${buildQueryString(params)}`
      );
    }
  };

  public readonly distanceMatrices = {
    create: (params: { origins: Coordinate[]; destinations: Coordinate[]; speedKmh?: number }) => {
      return this.request<DistanceMatrixResponse>('/v1/distance-matrices', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    }
  };

  public readonly timezones = {
    get: (params: { lat: number; lon: number }) => {
      return this.request<TimezoneResponse>(
        `/v1/timezones${buildQueryString(params)}`
      );
    }
  };

  public readonly ipAddresses = {
    getWhois: (ip: string) => {
      return this.request<{ success: boolean; data: any }>(
        `/v1/ip-addresses/${ip}/whois-records`
      );
    },

    getGeolocation: (ip: string) => {
      return this.request<{ success: boolean; data: any }>(
        `/v1/ip-addresses/${ip}/geolocations`
      );
    }
  };
}
