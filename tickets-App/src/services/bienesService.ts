import { API_BASE_URL } from '../constants/config';

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

export async function fetchBienes(
  params: BienesParams = {}
): Promise<BienesResponse> {
  const q: Record<string, string> = {};
  if (params.page !== undefined) q.page = String(params.page);
  if (params.limit !== undefined) q.limit = String(params.limit);
  if (params.query && params.query.trim()) q.query = params.query.trim();

  const qs = new URLSearchParams(q).toString();
  const url = qs ? `${API_BASE_URL}/api/bienes?${qs}` : `${API_BASE_URL}/api/bienes?limit=12`;

  try {
    const res = await fetch(url);
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
    return { total, page, limit, results: results as Bien[] };
  } catch (e: any) {
    console.warn('[bienesService] fetch error:', e?.message || e);
    return { total: 0, page: 1, limit: 12, results: [], error: 'Sin conexión' };
  }
}

export function normalizePropertyCode(code: string): string {
  const t = code.trim();
  const numOnly = /^\d+$/.test(t);
  if (numOnly) return String(Number(t));
  const prefixMatch = t.match(/^([A-Za-z]+[_-]?)(\d+)$/);
  if (prefixMatch) return prefixMatch[1] + String(Number(prefixMatch[2]));
  return t;
}

export async function findBienByCode(code: string): Promise<Bien | null> {
  const trimmed = code.trim();
  if (!trimmed) return null;
  const r = await fetchBienes({ query: trimmed, limit: 25 });
  if (r.error || r.results.length === 0) return null;
  const norm = normalizePropertyCode(trimmed);
  const exact = r.results.find(
    (b) => normalizePropertyCode(String(b.codact || '')) === norm
  );
  return exact ?? r.results[0] ?? null;
}
