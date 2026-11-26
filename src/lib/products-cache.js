// Shared in-memory cache and request deduplicator for storefront product & banner API calls.
// Eliminates redundant /api/products & /api/banners network requests within a browsing session
// while keeping route transitions instantaneous.

const MEMORY_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cachedFullProducts = null;
let fullFetchedAt = 0;
let inFlightFull = null;

let cachedSubsetProducts = null;
let subsetFetchedAt = 0;
let inFlightSubset = null;

let cachedBanners = null;
let bannersFetchedAt = 0;
let inFlightBanners = null;

export async function getCachedProducts({ limit = 1000 } = {}) {
  const now = Date.now();

  if (cachedFullProducts && now - fullFetchedAt < MEMORY_TTL_MS) {
    return limit < cachedFullProducts.length
      ? cachedFullProducts.slice(0, limit)
      : cachedFullProducts;
  }

  // Serve smaller limit slices from subset cache if already loaded
  if (
    limit < 1000 &&
    cachedSubsetProducts &&
    cachedSubsetProducts.length >= limit &&
    now - subsetFetchedAt < MEMORY_TTL_MS
  ) {
    return cachedSubsetProducts.slice(0, limit);
  }

  if (limit < 1000) {
    if (!inFlightSubset) {
      inFlightSubset = fetch(`/api/products?limit=${limit}`)
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          cachedSubsetProducts = list;
          subsetFetchedAt = Date.now();
          return list;
        })
        .finally(() => {
          inFlightSubset = null;
        });
    }
    const list = await inFlightSubset;
    return list.slice(0, limit);
  }

  if (!inFlightFull) {
    inFlightFull = fetch('/api/products')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        cachedFullProducts = list;
        fullFetchedAt = Date.now();
        return list;
      })
      .finally(() => {
        inFlightFull = null;
      });
  }

  return inFlightFull;
}

export async function getCachedBanners() {
  const now = Date.now();
  if (cachedBanners && now - bannersFetchedAt < MEMORY_TTL_MS) {
    return cachedBanners;
  }

  if (!inFlightBanners) {
    inFlightBanners = fetch('/api/banners')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        cachedBanners = list;
        bannersFetchedAt = Date.now();
        return list;
      })
      .finally(() => {
        inFlightBanners = null;
      });
  }

  return inFlightBanners;
}

export function invalidateProductsCache() {
  cachedFullProducts = null;
  fullFetchedAt = 0;
  cachedSubsetProducts = null;
  subsetFetchedAt = 0;
}
