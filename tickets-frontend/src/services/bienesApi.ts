const BIENES_URL = '/api/bienes';
const MEM_TTL = 300_000; // 5 min general queries
const LOOKUP_TTL = 1_800_000; // 30 min code lookups (descriptions don't change)

const memCache = new Map<string, { data: BienesResponse; ts: number }>();

function memKey(params: BienesParams): string {
  return `${params.page ?? ''}|${params.limit ?? ''}|${params.query ?? ''}`;
}

export function clearBienesCache(): void {
  memCache.clear();
  lookupCache.clear();
}

const lookupCache = new Map<string, { data: Record<string, unknown> | null; ts: number }>();

export async function findBienByCode(code: string): Promise<Record<string, unknown> | null> {
  const trimmed = (code || '').trim();
  if (!trimmed) return null;

  const normKey = normalizePropertyCode(trimmed);
  const cached = lookupCache.get(normKey);
  if (cached && Date.now() - cached.ts < LOOKUP_TTL) {
    return cached.data;
  }

  const r = await fetchBienes({ query: trimmed, limit: 25 });
  if (r.error || r.results.length === 0) {
    lookupCache.set(normKey, { data: null, ts: Date.now() });
    return null;
  }
  const norm = normalizePropertyCode(trimmed);
  const exact = r.results.find(
    (it: any) => normalizePropertyCode(String(it.codact || '')) === norm
  );
  const result = (exact ?? r.results[0] ?? null) as Record<string, unknown> | null;
  lookupCache.set(normKey, { data: result, ts: Date.now() });
  return result;
}

export function normalizePropertyCode(code: string): string {
  const t = (code || '').trim();
  const numOnly = /^\d+$/.test(t);
  if (numOnly) return String(Number(t));
  const prefixMatch = t.match(/^([A-Za-z]+[_-]?)(\d+)$/);
  if (prefixMatch) return prefixMatch[1] + String(Number(prefixMatch[2]));
  return t;
}

export interface BienesResponse {
  total: number;
  page: number;
  limit: number;
  results: Record<string, unknown>[];
  error?: string;
}

export interface BienesParams {
  page?: number;
  limit?: number;
  query?: string;
}

export async function fetchBienes(
  params: BienesParams = {}
): Promise<BienesResponse> {
  const key = memKey(params);
  const cached = memCache.get(key);
  if (cached && Date.now() - cached.ts < MEM_TTL) {
    return cached.data;
  }

  const p: Record<string, string> = {};

  if (params.page !== undefined) p.page = String(params.page);
  if (params.limit !== undefined) p.limit = String(params.limit);
  if (params.query && params.query.trim()) p.query = params.query.trim();

  const qs = new URLSearchParams(p).toString();
  const url = qs ? `${BIENES_URL}?${qs}` : `${BIENES_URL}?limit=12`;

  const res = await fetch(url);
  const text = await res.text();

  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try { const err = JSON.parse(text); if (err.message) msg = err.message; } catch {}
    return { total: 0, page: 1, limit: 12, results: [], error: msg };
  }

  try {
    const data = JSON.parse(text);
    if (data.success === false) {
      return { total: 0, page: 1, limit: 12, results: [], error: data.message || 'Error del servidor' };
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
    const result = { total, page, limit, results };
    if (results.length > 0) {
      memCache.set(key, { data: result, ts: Date.now() });
    }
    return result;
  } catch {
    return { total: 0, page: 1, limit: 12, results: [], error: 'Respuesta no es JSON valido' };
  }
}