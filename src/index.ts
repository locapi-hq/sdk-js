export { LocApi, type LocApiOptions } from './client.js';
export { LocApiError } from './errors.js';

// Re-export shared type shapes for consumers
export type {
  Coordinate,
  Country,
  CountryInfoResponse,
  GeoBoundaryResponse,
  DistanceMatrixResponse,
  DistanceMatrixCell,
  TimezoneResponse,
  TimezoneTransition,
  PostalCode,
  AutocompleteResponse,
  BulkLookupResponse,
  BulkLookupResultItem,
  BulkLookupInputItem,
  ReverseGeocodeResponse,
  ReverseGeocodeData,
  MeilisearchGeoDocument,
  Address,
  AddressAutocompleteResult,
  AddressAutocompleteResponse,
  AddressSearchResponse,
  AddressReverseGeocodeResponse,
  HealthResponse,
  HealthServiceProbe,
  DetailedHealthResponse,
  ReadinessResponse,
  PublicStatsResponse,
  StatsTimeframe,
  AlternativeName,
  AlternativeNamesResponse,
  IpWhois,
  IpWhoisResponse,
  IpGeolocation,
  IpGeolocationResponse,
} from '@locapi/schemas';

// User-friendly type alias mapping location details
import type { MeilisearchGeoDocument } from '@locapi/schemas';
export type Location = MeilisearchGeoDocument;
