export { LocApi, LocApiOptions } from './client.js';
export { LocApiError } from './errors.js';

// Re-export shared type shapes for consumers
export type {
  Coordinate,
  Country,
  CountryInfoResponse,
  GeoBoundaryResponse,
  DistanceMatrixResponse,
  TimezoneResponse,
  PostalCode,
  AutocompleteResponse,
  BulkLookupResponse,
  ReverseGeocodeResponse,
  MeilisearchGeoDocument
} from '@locapi/schemas';

// User-friendly type alias mapping location details
import type { MeilisearchGeoDocument } from '@locapi/schemas';
export type Location = MeilisearchGeoDocument;
export type AlternativeName = {
  id: number;
  isolanguage?: string;
  alternateName: string;
  isPreferredName?: boolean;
  isShortName?: boolean;
};
