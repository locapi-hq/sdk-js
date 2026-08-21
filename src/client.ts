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
  ReverseGeocodeResponse,
  Address,
  AddressAutocompleteResult,
  AddressReverseGeocodeResponse,
  HealthResponse,
  DetailedHealthResponse,
  ReadinessResponse,
  PublicStatsResponse,
  StatsTimeframe,
  AlternativeNamesResponse,
  IpWhoisResponse,
  IpGeolocationResponse,
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
    this.baseUrl = (options.baseUrl || 'https://locapi.dev').replace(/\/$/, '');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    
    // Inject headers safely
    const headers = new Headers(options.headers);
    headers.set('Locapi-Api-Key', this.apiKey);
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
    search: (params?: { q: string; country?: string; countryCode?: string; limit?: number; page?: number }) => {
      const queryParams: Record<string, any> = { ...params };
      if (queryParams.countryCode && !queryParams.country) {
        queryParams.country = queryParams.countryCode;
        delete queryParams.countryCode;
      }
      return this.request<{ success: boolean; data: MeilisearchGeoDocument[]; meta: any }>(
        `/v1/locations${buildQueryString(queryParams)}`
      );
    },

    get: (geonameid: number) => {
      return this.request<{ success: boolean; data: MeilisearchGeoDocument }>(
        `/v1/locations/${geonameid}`
      );
    },

    searchGeo: (params?: {
      q?: string;
      lat?: number;
      lon?: number;
      latitude?: number;
      longitude?: number;
      radius?: number;
      radiusMeters?: number;
      countryCode?: string;
      featureClass?: string;
      limit?: number;
      offset?: number;
      enrichCountry?: boolean;
    }) => {
      const queryParams: Record<string, any> = { ...params };
      if (queryParams.lat !== undefined && queryParams.latitude === undefined) {
        queryParams.latitude = queryParams.lat;
        delete queryParams.lat;
      }
      if (queryParams.lon !== undefined && queryParams.longitude === undefined) {
        queryParams.longitude = queryParams.lon;
        delete queryParams.lon;
      }
      if (queryParams.radiusMeters !== undefined && queryParams.radius === undefined) {
        queryParams.radius = queryParams.radiusMeters;
        delete queryParams.radiusMeters;
      }
      return this.request<{ success: boolean; data: { results: MeilisearchGeoDocument[] }; meta: any }>(
        `/v1/locations/geo-search${buildQueryString(queryParams)}`
      );
    },

    searchNearby: (params: {
      lat?: number;
      lon?: number;
      latitude?: number;
      longitude?: number;
      radius?: number;
      radiusMeters?: number;
      q?: string;
      limit?: number;
      enrichCountry?: boolean;
    }) => {
      const queryParams: Record<string, any> = { ...params };
      if (queryParams.lat !== undefined && queryParams.latitude === undefined) {
        queryParams.latitude = queryParams.lat;
        delete queryParams.lat;
      }
      if (queryParams.lon !== undefined && queryParams.longitude === undefined) {
        queryParams.longitude = queryParams.lon;
        delete queryParams.lon;
      }
      if (queryParams.radiusMeters !== undefined && queryParams.radius === undefined) {
        queryParams.radius = queryParams.radiusMeters;
        delete queryParams.radiusMeters;
      }
      return this.request<{ success: boolean; data: { results: MeilisearchGeoDocument[] }; meta: any }>(
        `/v1/locations/nearby${buildQueryString(queryParams)}`
      );
    },

    reverseGeocode: (params: {
      lat: number;
      lon: number;
      radius?: number;
      radiusMeters?: number;
      enrichCountry?: boolean;
    }) => {
      const queryParams: Record<string, any> = { ...params };
      if (queryParams.radiusMeters !== undefined && queryParams.radius === undefined) {
        queryParams.radius = queryParams.radiusMeters;
        delete queryParams.radiusMeters;
      }
      return this.request<ReverseGeocodeResponse>(
        `/v1/locations/reverse-geocode${buildQueryString(queryParams)}`
      );
    },

    autocomplete: (params: {
      q: string;
      limit?: number;
      countryCode?: string;
      featureClass?: string;
      highlight?: boolean;
    }) => {
      return this.request<AutocompleteResponse>(
        `/v1/locations/autocomplete${buildQueryString(params)}`
      );
    },

    bulkLookups: (params: { locations: Coordinate[] }) => {
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

    alternativeNames: (geonameid: number, params?: {
      lang?: string;
      includeSpecial?: boolean;
      limit?: number;
      offset?: number;
    }) => {
      return this.request<AlternativeNamesResponse>(
        `/v1/locations/${geonameid}/alternative-names${buildQueryString(params)}`
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
      return this.request<{ success: boolean; data: { results: MeilisearchGeoDocument[] }; meta: any }>(
        `/v1/countries/${countryCode}/locations${buildQueryString(params)}`
      );
    }
  };

  public readonly features = {
    getLocations: (featureClass: string, params?: { q?: string; limit?: number }) => {
      return this.request<{ success: boolean; data: { results: MeilisearchGeoDocument[] }; meta: any }>(
        `/v1/features/${featureClass}/locations${buildQueryString(params)}`
      );
    }
  };

  public readonly addresses = {
    search: (params: {
      q: string;
      countryCode?: string;
      postalCode?: string;
      municipality?: string;
      limit?: number;
      offset?: number;
    }) => {
      return this.request<{ success: boolean; data: { results: Address[] }; meta: any }>(
        `/v1/addresses${buildQueryString(params)}`
      );
    },

    autocomplete: (params: {
      q: string;
      limit?: number;
      countryCode?: string;
      highlight?: boolean;
    }) => {
      return this.request<{ success: boolean; data: { results: AddressAutocompleteResult[] }; meta: any }>(
        `/v1/addresses/autocomplete${buildQueryString(params)}`
      );
    },

    reverseGeocode: (params: {
      lat: number;
      lon: number;
      radius?: number;
    }) => {
      return this.request<AddressReverseGeocodeResponse>(
        `/v1/addresses/reverse-geocode${buildQueryString(params)}`
      );
    },

    get: (id: number) => {
      return this.request<{ success: boolean; data: Address }>(
        `/v1/addresses/${id}`
      );
    }
  };

  public readonly postalCodes = {
    search: (params: {
      postalCode: string;
      countryCode: string;
      limit?: number;
      offset?: number;
    }) => {
      return this.request<{ success: boolean; data: PostalCode[]; meta: any }>(
        `/v1/postal-codes${buildQueryString(params)}`
      );
    }
  };

  public readonly distanceMatrices = {
    create: (params: {
      origins: Coordinate[];
      destinations: Coordinate[];
      speedKmh?: number;
      speedMph?: number;
    }) => {
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
      return this.request<IpWhoisResponse>(
        `/v1/ip-addresses/${ip}/whois-records`
      );
    },

    getGeolocation: (ip: string) => {
      return this.request<IpGeolocationResponse>(
        `/v1/ip-addresses/${ip}/geolocations`
      );
    }
  };

  public readonly health = {
    check: () => {
      return this.request<HealthResponse>('/health');
    },

    detailed: () => {
      return this.request<DetailedHealthResponse>('/health/detailed');
    },

    ready: () => {
      return this.request<ReadinessResponse>('/health/ready');
    }
  };

  public readonly stats = {
    getPublicStats: (params?: { period?: StatsTimeframe }) => {
      return this.request<PublicStatsResponse>(
        `/v1/public/stats${buildQueryString(params)}`
      );
    }
  };
}
