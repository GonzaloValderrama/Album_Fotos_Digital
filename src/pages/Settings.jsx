import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const Settings = () => {
  const { settings, updateSettings, loading } = useSettings();
  const [formData, setFormData] = useState({
    primaryColor: '#0f172a',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, sans-serif'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && settings) {
      setFormData({
        primaryColor: settings.primaryColor || '#0f172a',
        backgroundColor: settings.backgroundColor || '#ffffff',
        fontFamily: settings.fontFamily || 'Inter, sans-serif'
      });
    }
  }, [loading, settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateSettings(formData);
    setSaving(false);
    alert('Ajustes guardados con éxito.');
  };

  if (loading) return <div className="loader"></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <nav className="glass-nav">
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Volver a Dashboard
        </Link>
        <span style={{ fontWeight: 600 }}>Ajustes de Diseño</span>
      </nav>

      <main className="container" style={{ padding: '3rem 2rem', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Personalizar Álbum</h1>

        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Color Primario (Acentos, botones)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="color" 
                value={formData.primaryColor} 
                onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                style={{ width: '50px', height: '40px', padding: 0, border: 'none', cursor: 'pointer' }}
              />
              <input 
                type="text" 
                value={formData.primaryColor} 
                onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #d1d5db', flex: 1 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Color de Fondo Global</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="color" 
                value={formData.backgroundColor} 
                onChange={e => setFormData({ ...formData, backgroundColor: e.target.value })}
                style={{ width: '50px', height: '40px', padding: 0, border: 'none', cursor: 'pointer' }}
              />
              <input 
                type="text" 
                value={formData.backgroundColor} 
                onChange={e => setFormData({ ...formData, backgroundColor: e.target.value })}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #d1d5db', flex: 1 }}
              />
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Se recomienda un color claro o un oscuro suave (ej. #111827 para Dark Mode).</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Familia Tipográfica</label>
            <select 
              value={formData.fontFamily} 
              onChange={e => setFormData({ ...formData, fontFamily: e.target.value })}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #d1d5db', width: '100%' }}
            >
              <option value="'Inter', sans-serif">Inter (Moderno y Limpio)</option>
              <option value="'Outfit', sans-serif">Outfit (Geométrico y Elegante)</option>
              <option value="system-ui, sans-serif">System UI (Por Defecto Apple/Windows)</option>
              <option value="Georgia, serif">Georgia (Estilo Editorial)</option>
            </select>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '2rem 0' }} />

          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} /> {saving ? 'Guardando...' : 'Aplicar y Guardar Cambios'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default Settings;
