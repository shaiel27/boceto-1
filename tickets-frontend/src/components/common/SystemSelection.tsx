import React, { useState, useEffect } from 'react';
import { Monitor, CheckCircle, Check, Shield } from 'lucide-react';
import ApiService from '../../services/api';
import './SystemSelection.css';

interface SoftwareSystem {
  id: number;
  name: string;
  description: string | null;
  assigned_at?: string;
}

interface Props {
  onComplete: () => void;
}

const SystemSelection: React.FC<Props> = ({ onComplete }) => {
  const [allSystems, setAllSystems] = useState<SoftwareSystem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [allRes, userRes] = await Promise.all([
          ApiService.getSystems(),
          ApiService.getUserSystems(),
        ]);
        if (allRes.success && allRes.data) {
          setAllSystems(allRes.data.map((s: any) => ({
            id: s.ID_System ?? s.id,
            name: s.System_Name ?? s.name,
            description: s.Description ?? s.description ?? null,
          })));
        }
        if (userRes.success && userRes.data) {
          const assigned = new Set<number>(userRes.data.map((s: any) => s.id));
          setSelectedIds(assigned);
        }
      } catch {
        setError('Error al cargar sistemas');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const r = await ApiService.assignUserSystems(Array.from(selectedIds));
      if (r.success) {
        onComplete();
      } else {
        setError(r.message || 'Error al guardar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="sys-container">
        <div className="sys-card">
          <div className="sys-spin" />
          <p className="sys-loading">Cargando sistemas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sys-container">
      <div className="sys-card">
        <div className="sys-header-icon">
          <Monitor size={28} />
        </div>
        <h2 className="sys-title">Sistemas que utilizas</h2>
        <p className="sys-desc">
          Selecciona los sistemas de software que utilizas en tu oficina. Esto te permitirá solicitar tickets solo para los sistemas que realmente necesitas.
        </p>

        {error && (
          <div className="sys-error">
            <Shield size={14} />
            <span>{error}</span>
          </div>
        )}

        <div className="sys-list">
          {allSystems.map((sys) => {
            const isSelected = selectedIds.has(sys.id);
            return (
              <button
                key={sys.id}
                className={`sys-item ${isSelected ? 'sys-item--sel' : ''}`}
                onClick={() => toggle(sys.id)}
                type="button"
              >
                <div className={`sys-item-check ${isSelected ? 'sys-item-check--on' : ''}`}>
                  {isSelected && <Check size={14} />}
                </div>
                <div className="sys-item-body">
                  <span className="sys-item-name">{sys.name}</span>
                  {sys.description && (
                    <span className="sys-item-desc">{sys.description}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="sys-footer">
          <span className="sys-count">{selectedIds.size} sistema(s) seleccionado(s)</span>
          <button
            className="sys-submit"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <><span className="sys-spin-btn" /> Guardando...</>
            ) : (
              <><CheckCircle size={16} /> Finalizar</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSelection;
