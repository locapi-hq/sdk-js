/**
 * LocAPI JavaScript/TypeScript SDK - Browser Autocomplete Demo Application
 */

import { LocApi, LocApiError } from '../../dist/index.js';

const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
const endpointInput = document.getElementById('endpoint') as HTMLInputElement;
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const resultsList = document.getElementById('resultsList') as HTMLUListElement;
const statusText = document.getElementById('statusText') as HTMLSpanElement;
const latencyBadge = document.getElementById('latencyBadge') as HTMLSpanElement;
const errorBox = document.getElementById('errorBox') as HTMLDivElement;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function getClient(): LocApi {
  return new LocApi({
    apiKey: apiKeyInput.value.trim() || 'demo_key',
    baseUrl: endpointInput.value.trim() || 'https://locapi.dev',
  });
}

function showError(message: string) {
  errorBox.textContent = message;
  errorBox.style.display = 'block';
}

function clearError() {
  errorBox.textContent = '';
  errorBox.style.display = 'none';
}

async function performSearch(query: string) {
  if (!query.trim()) {
    resultsList.innerHTML = '<li class="empty-state">Start typing to see instant typeahead results</li>';
    statusText.textContent = 'Ready';
    latencyBadge.textContent = '';
    clearError();
    return;
  }

  const client = getClient();
  statusText.textContent = 'Searching...';
  clearError();

  const startTime = performance.now();

  try {
    const response = await client.locations.autocomplete({
      q: query,
      limit: 6,
      highlight: true,
    });

    const elapsed = Math.round(performance.now() - startTime);
    latencyBadge.textContent = `${elapsed} ms`;
    statusText.textContent = `Found ${response.data.length} match${response.data.length === 1 ? '' : 'es'}`;

    if (response.data.length === 0) {
      resultsList.innerHTML = '<li class="empty-state">No locations found matching query.</li>';
      return;
    }

    resultsList.innerHTML = response.data
      .map(item => `
        <li class="result-item">
          <div>
            <div class="result-name">
              <span>${item.name}</span>
              <span class="country-tag">${item.countryCode || 'N/A'}</span>
            </div>
            <div class="result-meta">
              Feature: ${item.featureClass || 'N/A'}.${item.featureCode || 'N/A'}
            </div>
          </div>
          <div class="result-right">
            <span class="pop-badge">ID: ${item.id}</span>
          </div>
        </li>
      `)
      .join('');
  } catch (err: unknown) {
    statusText.textContent = 'Error';
    latencyBadge.textContent = '';
    if (err instanceof LocApiError) {
      showError(`API Error (${err.statusCode}): ${err.message}`);
    } else if (err instanceof Error) {
      showError(`Network/Application Error: ${err.message}`);
    } else {
      showError('Unknown error occurred');
    }
  }
}

// Attach debounced event listener
searchInput.addEventListener('input', () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    performSearch(searchInput.value);
  }, 200);
});
