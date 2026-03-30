import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePhotos, useAlbums } from '../hooks/useFirebase';
import { db, storage } from '../firebase/config';
import { doc, getDoc, collection, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { ArrowLeft, Trash2, Copy, UploadCloud, CheckCircle } from 'lucide-react';

const AdminAlbumView = () => {
  const { id: albumId } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const { photos, loading: photosLoading } = usePhotos(albumId);
  const { albums } = useAlbums(false); // needed for replicate
  
  const [uploading, setUploading] = useState(false);
  const [progressFiles, setProgressFiles] = useState({});
  const [replicateTo, setReplicateTo] = useState('');

  useEffect(() => {
    const fetchAlbum = async () => {
      const docSnap = await getDoc(doc(db, 'albums', albumId));
      if (docSnap.exists()) setAlbum(docSnap.data());
      else navigate('/admin');
    };
    fetchAlbum();
  }, [albumId, navigate]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setUploading(true);
    let firstUrl = null;

    for (const file of files) {
      const fileId = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `photos/${albumId}/${fileId}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setProgressFiles(prev => ({ ...prev, [file.name]: 0 }));

      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgressFiles(prev => ({ ...prev, [file.name]: progress }));
          },
          (error) => {
            console.error("Upload error", error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            if (!firstUrl) firstUrl = downloadURL;
            
            await addDoc(collection(db, 'photos'), {
              albumId,
              url: downloadURL,
              storagePath: uploadTask.snapshot.ref.fullPath,
              createdAt: new Date().toISOString()
            });
            resolve();
          }
        );
      });
    }

    // Auto update cover photo if not set
    if (!album.coverUrl && firstUrl) {
      await updateDoc(doc(db, 'albums', albumId), { coverUrl: firstUrl });
      setAlbum({ ...album, coverUrl: firstUrl });
    }

    setProgressFiles({});
    setUploading(false);
  };

  const handleDeletePhoto = async (photo) => {
    if (!window.confirm("¿Estás seguro de eliminar esta foto?")) return;
    try {
      // 1. Detelete from Firestore
      await deleteDoc(doc(db, 'photos', photo.id));
      
      // Option: we might skip deleting from storage if the photo was replicated elsewhere.
      // For simplicity in this iteration, we always delete the storage object 
      // EXCEPT that replication shares paths, so deleting storage drops the photo in other albums too.
      // We will only delete Firestore doc here to be safe with replicated paths, 
      // unless we implement path-counting logic.
      
      // await deleteObject(ref(storage, photo.storagePath));
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleReplicate = async (photo) => {
    if (!replicateTo) return alert('Selecciona un álbum destino');
    if (replicateTo === albumId) return alert('Selecciona un álbum distinto al actual');

    try {
      await addDoc(collection(db, 'photos'), {
        albumId: replicateTo,
        url: photo.url,
        storagePath: photo.storagePath, // reuse same storage path
        createdAt: new Date().toISOString()
      });
      alert('Foto replicada exitosamente');
    } catch (error) {
      alert("Error replicando foto");
    }
  };

  if (!album) return <div className="loader"></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <nav className="glass-nav">
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Volver a Dashboard
        </Link>
        <span style={{ fontWeight: 600 }}>Cargando a: {album.name}</span>
      </nav>

      <main className="container" style={{ padding: '3rem 2rem' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center', boxShadow: 'var(--shadow-sm)', marginBottom: '3rem', border: '2px dashed #d1d5db' }}>
          <UploadCloud size={48} color="var(--primary-color)" style={{ margin: '0 auto 1rem' }} />
          <h3>Sube tus fotografías</h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Arrastra y suelta imágenes, o haz clic para seleccionar (Mass upload soportado)</p>
          
          <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
            <span>Elegir Archivos</span>
            <input type="file" multiple accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>

        {Object.keys(progressFiles).length > 0 && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '3rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Subiendo...</h4>
            {Object.entries(progressFiles).map(([filename, progress]) => (
              <div key={filename} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span>{filename}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary-color)', transition: 'width 0.2s' }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Global Replication Tool */}
        <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Destino para Replicar (Elige un álbum)</label>
            <select 
              value={replicateTo} 
              onChange={e => setReplicateTo(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #d1d5db', minWidth: '250px' }}
            >
              <option value="">-- Seleccionar --</option>
              {albums.filter(a => a.id !== albumId).map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', maxWidth: '400px' }}>
            Selecciona un álbum destino arriba. Luego, haz clic en el ícono de <Copy size={14}/> en cualquier foto de abajo para clonarla sin gastar espacio extra en Storage.
          </p>
        </div>

        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Fotos en {album.name}</h3>

        {photosLoading ? (
          <div className="loader"></div>
        ) : photos.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No hay fotografías en este álbum.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {photos.map(photo => (
              <div key={photo.id} style={{ position: 'relative', background: '#e5e7eb', borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '1/1' }}>
                <img src={photo.url} alt="Admin View" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', opacity: 0, transition: 'opacity 0.2s' }} 
                     onMouseOver={e => e.currentTarget.style.opacity = 1} 
                     onMouseOut={e => e.currentTarget.style.opacity = 0}
                >
                  <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleReplicate(photo)}
                      title="Replicar a Álbum Destino"
                      style={{ background: 'white', color: '#111827', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeletePhoto(photo)}
                      title="Borrar de este álbum"
                      style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}
                    >
                      <Trash2 size={16} />
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

export default AdminAlbumView;
