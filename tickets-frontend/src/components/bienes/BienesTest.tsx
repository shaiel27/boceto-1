import React, { useState, useCallback } from 'react';

const BienesTest: React.FC = () => {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUrl = useCallback(async (url: string) => {
    setLoading(true);
    setOutput('Cargando...');
    try {
      const start = Date.now();
      const res = await fetch(url);
      const elapsed = Date.now() - start;
      const text = await res.text();
      let formatted = '';
      try {
        const json = JSON.parse(text);
        formatted = JSON.stringify(json, null, 2);
      } catch {
        formatted = text;
      }
      setOutput(
        `HTTP ${res.status} (${elapsed}ms)\n\n${formatted.substring(0, 8000)}`
      );
    } catch (e: any) {
      setOutput('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div style={s.container}>
      <h2 style={s.h2}>Bienes API &mdash; Diagnostico</h2>
      <p style={s.p}>
        Proxy Node(:3000) &rarr; PHP(:8012/bienes) &rarr; API 192.168.5.125
      </p>

      <div style={s.buttons}>
        {[
          { label: 'Bienes limit=5', url: '/api/bienes?limit=5' },
          { label: 'Bienes pag=2', url: '/api/bienes?page=2&limit=5' },
          { label: 'Buscar computadora', url: '/api/bienes?query=computadora&limit=5' },
          { label: 'Buscar silla', url: '/api/bienes?query=silla&limit=5' },
          { label: 'Unidades', url: '/api/unidades?tabla=spg_unidadadministrativa&limit=5' },
        ].map((b) => (
          <button
            key={b.url}
            onClick={() => fetchUrl(b.url)}
            disabled={loading}
            style={s.btn}
          >
            {b.label}
          </button>
        ))}
      </div>

      <pre style={s.pre}>{output || 'Presiona un boton para hacer la consulta'}</pre>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: 'Consolas, monospace',
    padding: 24,
    background: '#0d1117',
    color: '#c9d1d9',
    minHeight: '100vh',
  },
  h2: { color: '#58a6ff', margin: '0 0 4px' },
  p: { color: '#8b949e', fontSize: 13, margin: '0 0 16px' },
  buttons: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  btn: {
    padding: '8px 16px',
    background: '#21262d',
    color: '#c9d1d9',
    border: '1px solid #30363d',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
  },
  pre: {
    background: '#161b22',
    padding: 16,
    borderRadius: 8,
    overflow: 'auto',
    maxHeight: '70vh',
    whiteSpace: 'pre-wrap',
    fontSize: 13,
    lineHeight: 1.6,
    border: '1px solid #30363d',
  },
};

export default BienesTest;