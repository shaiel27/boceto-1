import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBienes, BienesResponse } from '../../services/bienesApi';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Wrench,
  Building,
  X,
  TicketPlus,
} from 'lucide-react';
import './BienesList.css';

const VISIBLE_COLS = ['codact', 'denact', 'denuniadm', 'fecregact'];

const COL_LABELS: Record<string, string> = {
  codact: 'Codigo',
  denact: 'Descripcion',
  denuniadm: 'Oficina',
  fecregact: 'Fecha Reg.',
};

const BienesList: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [data, setData] = useState<BienesResponse>({
    total: 0,
    page: 1,
    limit: 25,
    results: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [officeFilter, setOfficeFilter] = useState('');

  const uniqueOffices = useMemo(() => {
    const offices = new Set<string>();
    data.results.forEach((item) => {
      const name = String(item.denuniadm || '').trim();
      if (name) offices.add(name);
    });
    return Array.from(offices).sort();
  }, [data.results]);

  const filteredResults = useMemo(() => {
    if (!officeFilter) return data.results;
    return data.results.filter(
      (item) => String(item.denuniadm || '').trim() === officeFilter,
    );
  }, [data.results, officeFilter]);

  const load = useCallback(
    async (pageNum: number, q: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchBienes({
          page: pageNum,
          limit: 25,
          query: q || undefined,
        });
        if (result.error) {
          setError(result.error);
          setData({ total: 0, page: 1, limit: 25, results: [] });
        } else {
          setData(result);
        }
      } catch {
        setError('Error al conectar');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    load(page, query);
  }, [page, query, load]);

  useEffect(() => {
    setOfficeFilter('');
  }, [query, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(queryInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setQueryInput('');
    setQuery('');
    setPage(1);
  };

  const handleRefresh = () => {
    fetch('/api/bienes?action=refresh', { method: 'GET' }).catch(() => {});
    setPage(1);
  };

  const handleCreateTicket = (item: Record<string, unknown>) => {
    navigate('/new-ticket', {
      state: {
        propertyNumber: String(item.codact || ''),
        bienDescription: String(item.denact || ''),
        officeName: String(item.denuniadm || ''),
      },
    });
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));
  const startItem = (data.page - 1) * data.limit + 1;
  const endItem = Math.min(data.page * data.limit, data.total);
  const displayTotal = officeFilter ? filteredResults.length : data.total;

  const pageNumbers: number[] = [];
  const maxPagesToShow = 7;
  let startPage = Math.max(1, data.page - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="bienes-container">
      <div className="bienes-header">
        <div>
          <h2>Consulta de Bienes</h2>
          <p className="bienes-subtitle">
            <Wrench size={12} style={{ verticalAlign: 'middle' }} />{' '}
            {data.total.toLocaleString()} registros
            {query && <span style={{ color: '#f59e0b' }}> &mdash; filtrados por "{query}"</span>}
          </p>
        </div>
        <button
          type="button"
          className="bienes-refresh-btn"
          onClick={handleRefresh}
          title="Recargar datos desde la API"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <form className="bienes-search" onSubmit={handleSearch}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar por descripcion, codigo, oficina..."
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
        />
        <button type="submit">Buscar</button>
        {query && (
          <button type="button" className="bienes-clear-btn" onClick={handleClearSearch}>
            Limpiar
          </button>
        )}
      </form>

      {!loading && uniqueOffices.length > 0 && (
        <div className="bienes-office-filter">
          <Building size={16} />
          <select
            value={officeFilter}
            onChange={(e) => setOfficeFilter(e.target.value)}
          >
            <option value="">Todas las oficinas</option>
            {uniqueOffices.map((office) => (
              <option key={office} value={office}>
                {office}
              </option>
            ))}
          </select>
          {officeFilter && (
            <button
              type="button"
              className="bienes-filter-clear"
              onClick={() => setOfficeFilter('')}
              title="Quitar filtro"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="bienes-loading">
          <Loader2 size={24} className="spinner" />
          <span>Cargando...</span>
        </div>
      )}

      {error && (
        <div className="bienes-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button type="button" onClick={() => load(page, query)}>Reintentar</button>
        </div>
      )}

      {!loading && !error && filteredResults.length === 0 && (
        <div className="bienes-empty">
          No se encontraron bienes con los filtros actuales.
        </div>
      )}

      {filteredResults.length > 0 && (
        <>
          <div className="bienes-table-wrapper">
            <table className="bienes-table">
              <thead>
                <tr>
                  <th>#</th>
                  {VISIBLE_COLS.map((col) => (
                    <th key={col}>{COL_LABELS[col] ?? col}</th>
                  ))}
                  {isAdmin() && <th className="bienes-action-col">Accion</th>}
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((item, idx) => (
                  <tr key={idx}>
                    <td className="bienes-row-num">{startItem + idx}</td>
                    {VISIBLE_COLS.map((col, ci) => (
                      <td key={ci}>
                        {item[col] !== null && item[col] !== undefined && String(item[col]) !== ''
                          ? String(item[col])
                          : '-'}
                      </td>
                    ))}
                    {isAdmin() && (
                      <td className="bienes-action-col">
                        <button
                          type="button"
                          className="bienes-ticket-btn"
                          onClick={() => handleCreateTicket(item)}
                          title="Crear ticket para este bien"
                        >
                          <TicketPlus size={15} />
                          <span>Ticket</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bienes-pagination">
            <span className="bienes-pagination-info">
              {officeFilter
                ? `${filteredResults.length} resultado(s) en esta pagina`
                : `Mostrando ${startItem}-${endItem} de ${displayTotal.toLocaleString()}`}
            </span>
            <div className="bienes-pagination-buttons">
              <button
                className="bienes-page-btn"
                disabled={page <= 1}
                onClick={() => setPage(1)}
                title="Primera pagina"
              >
                1
              </button>
              <button
                className="bienes-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
              {pageNumbers.map((p) => (
                <button
                  key={p}
                  className={`bienes-page-btn ${p === data.page ? 'bienes-page-active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="bienes-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
              <button
                className="bienes-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(totalPages)}
                title="Ultima pagina"
              >
                {totalPages}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BienesList;
