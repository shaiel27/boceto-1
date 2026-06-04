const BIENES_URL = '/api/bienes';

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
    return { total, page, limit, results };
  } catch {
    return { total: 0, page: 1, limit: 12, results: [], error: 'Respuesta no es JSON valido' };
  }
}