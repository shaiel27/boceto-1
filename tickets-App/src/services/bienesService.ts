import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

const MEM_TTL = 300_000;
const LOOKUP_TTL = 1_800_000;
const STORAGE_KEY = 'bienes_lookup_v1';
const MAX_STORAGE_ENTRIES = 200;

const memCache = new Map<string, { data: BienesResponse; ts: number }>();
const lookupCache = new Map<string, { data: Bien | null; ts: number }>();

let storageLoaded = false;
let storagePromise: Promise<void> | null = null;

async function loadStorageCache(): Promise<void> {
  if (storageLoaded) return;
  if (storagePromise) return storagePromise;
  storagePromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          const now = Date.now();
          let count = 0;
          for (const e of data) {
            if (e && e.k && now - (e.ts || 0) < LOOKUP_TTL) {
              lookupCache.set(e.k, { data: e.d ?? null, ts: e.ts || 0 });
              count++;
            }
          }
          if (count > 0) console.log(`[bienesService] loaded ${count} cached lookups`);
        }
      }
    } catch {}
    storageLoaded = true;
    storagePromise = null;
  })();
  return storagePromise;
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
function schedulePersist(): void {
  if (persistTimer) return;
  persistTimer = setTimeout(async () => {
    persistTimer = null;
    try {
      const entries: { k: string; d: Bien | null; ts: number }[] = [];
      lookupCache.forEach((v, k) => entries.push({ k, d: v.data, ts: v.ts }));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_STORAGE_ENTRIES)));
    } catch {}
  }, 2000);
}

export function clearBienesCache(): void {
  memCache.clear();
  lookupCache.clear();
  AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
}

export interface Bien {
  codact: string;
  denact: string;
  denuniadm: string;
  coduniadm?: string;
  fecregact?: string;
  [key: string]: unknown;
}

export interface BienesResponse {
  total: number;
  page: number;
  limit: number;
  results: Bien[];
  error?: string;
}

export interface BienesParams {
  page?: number;
  limit?: number;
  query?: string;
}

function memKey(params: BienesParams): string {
  return `${params.page ?? ''}|${params.limit ?? ''}|${params.query ?? ''}`;
}

const FETCH_TIMEOUT = 8000;

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

export async function fetchBienes(
  params: BienesParams = {},
): Promise<BienesResponse> {
  const key = memKey(params);
  const cached = memCache.get(key);
  if (cached && Date.now() - cached.ts < MEM_TTL) {
    return cached.data;
  }

  const q: Record<string, string> = {};
  if (params.page !== undefined) q.page = String(params.page);
  if (params.limit !== undefined) q.limit = String(params.limit);
  if (params.query && params.query.trim()) q.query = params.query.trim();

  const qs = new URLSearchParams(q).toString();
  const url = qs ? `${API_BASE_URL}/api/bienes?${qs}` : `${API_BASE_URL}/api/bienes?limit=12`;

  try {
    const res = await fetchWithTimeout(url, FETCH_TIMEOUT);
    const text = await res.text();
    if (!res.ok) {
      let msg = `Error ${res.status}`;
      try {
        const err = JSON.parse(text);
        if (err.message) msg = err.message;
      } catch {}
      console.warn('[bienesService] HTTP', res.status, url, msg);
      return { total: 0, page: 1, limit: 12, results: [], error: msg };
    }
    const data = JSON.parse(text);
    if (data.success === false) {
      return {
        total: 0,
        page: 1,
        limit: 12,
        results: [],
        error: data.message || 'Error del servidor',
      };
    }
    if (data.error && !data.data && !data.success) {
      return { total: 0, page: 1, limit: 12, results: [], error: data.error };
    }
    const results = (Array.isArray(data.data) ? data.data : null)
      ?? (Array.isArray(data.results) ? data.results : null)
      ?? (Array.isArray(data) ? data : []);
    const total = Number(data.total_filas ?? data.total ?? results.length);
    const page = Number(data.page ?? params.page ?? 1);
    const limit = Number(data.limit ?? params.limit ?? 12);
    const result = { total, page, limit, results: results as Bien[] };
    if (results.length > 0) {
      memCache.set(key, { data: result, ts: Date.now() });
    }
    return result;
  } catch (e: any) {
    console.warn('[bienesService] fetch error:', e?.message || e);
    return { total: 0, page: 1, limit: 12, results: [], error: 'Sin conexión' };
  }
}

export function normalizePropertyCode(code: string): string {
  const t = code.trim();
  if (/^\d+$/.test(t)) return String(Number(t));
  const m = t.match(/^([A-Za-z]+[_-]?)(\d+)$/);
  if (m) return m[1] + String(Number(m[2]));
  return t;
}

/** Search bienes returning just the results array (for dropdown / multi-match display). */
export async function searchBienes(
  query: string,
  limit: number = 8,
): Promise<Bien[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const r = await fetchBienes({ query: trimmed, limit });
  if (r.error || r.results.length === 0) return [];
  return r.results;
}

/**
 * Look up a bien by code. Checks in-memory cache → AsyncStorage → network.
 * Persisted to AsyncStorage for instant results across app restarts.
 */
export async function findBienByCode(code: string): Promise<Bien | null> {
  const trimmed = code.trim();
  if (!trimmed) return null;

  const normKey = normalizePropertyCode(trimmed);

  // Layer 1: in-memory cache (instant)
  const mem = lookupCache.get(normKey);
  if (mem && Date.now() - mem.ts < LOOKUP_TTL) {
    return mem.data;
  }

  // Layer 2: AsyncStorage (fast local read, no network)
  if (!storageLoaded) {
    await loadStorageCache();
    const fromStorage = lookupCache.get(normKey);
    if (fromStorage && Date.now() - fromStorage.ts < LOOKUP_TTL) {
      return fromStorage.data;
    }
  }

  // Layer 3: network fetch
  const r = await fetchBienes({ query: trimmed, limit: 25 });
  if (r.error || r.results.length === 0) {
    lookupCache.set(normKey, { data: null, ts: Date.now() });
    schedulePersist();
    return null;
  }
  const norm = normalizePropertyCode(trimmed);
  const exact = r.results.find(
    (b) => normalizePropertyCode(String(b.codact || '')) === norm,
  );
  const result = exact ?? r.results[0] ?? null;
  lookupCache.set(normKey, { data: result, ts: Date.now() });
  schedulePersist();
  return result;
}

/** Pre-warm: load storage cache. Call on login / app start. */
export function prewarmBienesCache(): void {
  loadStorageCache();
}
