import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Plus, LogOut, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useAlbums } from '../hooks/useFirebase';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const AdminDashboard = () => {
  const { user, isSuperAdmin, logout } = useAuth();
  const { albums, loading } = useAlbums(false, user?.uid); 
  const [isCreating, setIsCreating] = useState(false);
  const [newAlbum, setNewAlbum] = useState({ name: '', description: '', isPublic: false, coverUrl: '' });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newAlbum.name) return alert('El nombre es obligatorio');
    
    try {
      await addDoc(collection(db, 'albums'), {
        ...newAlbum,
        ownerId: user.uid,
        ownerName: user.displayName || user.email,
        createdAt: new Date().toISOString()
      });
      setIsCreating(false);
      setNewAlbum({ name: '', description: '', isPublic: false, coverUrl: '' });
    } catch (error) {
      alert('Error creando álbum: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este álbum? Se perderá la referencia. Asegúrate de borrar fotos primero.')) return;
    try {
      await deleteDoc(doc(db, 'albums', id));
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const toggleVisibility = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'albums', id), { isPublic: !currentStatus });
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <nav className="glass-nav">
        <h2 style={{ fontSize: '1.25rem' }}>Admin Dashboard</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isSuperAdmin && (
            <Link to="/admin/settings" className="btn btn-secondary">
              <Settings size={18} /> Ajustes Generales
            </Link>
          )}
          <button onClick={logout} className="btn" style={{ background: '#fecaca', color: '#b91c1c' }}>
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="container" style={{ padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem' }}>Mis Álbumes</h1>
          <button onClick={() => setIsCreating(!isCreating)} className="btn btn-primary">
            <Plus size={18} /> Nuevo Álbum
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleCreate} style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nombre</label>
                <input 
                  type="text" value={newAlbum.name} onChange={e => setNewAlbum({...newAlbum, name: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #d1d5db' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Cover Image URL</label>
                <input 
                  type="text" value={newAlbum.coverUrl} onChange={e => setNewAlbum({...newAlbum, coverUrl: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #d1d5db' }}
                  placeholder="Se puede agregar luego o usar la primera foto"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Descripción</label>
                <textarea 
                  value={newAlbum.description} onChange={e => setNewAlbum({...newAlbum, description: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #d1d5db' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" id="isPublic"
                  checked={newAlbum.isPublic} onChange={e => setNewAlbum({...newAlbum, isPublic: e.target.checked})}
                />
                <label htmlFor="isPublic">Hacer público directamente</label>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">Guardar</button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancelar</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="loader"></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {albums.map(album => (
              <div key={album.id} style={{ background: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ height: '180px', background: '#e5e7eb', position: 'relative' }}>
                  {album.coverUrl && (
                    <img src={album.coverUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Cover" />
                  )}
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(255,255,255,0.9)', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', color: album.isPublic ? '#15803d' : '#9ca3af' }}>
                    {album.isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
                    {album.isPublic ? 'Público' : 'Privado'}
                  </div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{album.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{album.description || 'Sin descripción'}</p>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/admin/album/${album.id}`} className="btn btn-primary" style={{ flex: 1, padding: '0.5rem 1rem' }}>Gestionar Fotos</Link>
                    <button onClick={() => toggleVisibility(album.id, album.isPublic)} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Cambiar visibilidad">
                      {album.isPublic ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                    <button onClick={() => handleDelete(album.id)} className="btn" style={{ padding: '0.5rem', border: '1px solid #fecaca', color: '#dc2626' }} title="Eliminar álbum">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
