import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { useAlbums } from '../hooks/useFirebase';
import ImageProtector from '../components/ImageProtector';
import '../styles/masonry.css';

const Home = () => {
  const { albums, loading } = useAlbums(true); // publicOnly = true
  const [loadedImages, setLoadedImages] = useState({});

  if (loading) {
    return (
      <div className="full-center">
        <div className="loader"></div>
      </div>
    );
  }

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Portfolio</h1>
        <p style={{ opacity: 0.7 }}>A visual journey of captured moments.</p>
      </header>

      {albums.length === 0 ? (
        <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '4rem' }}>
          <p>No hay álbumes públicos disponibles.</p>
        </div>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {albums.map((album) => (
            <Link key={album.id} to={`/album/${album.id}`}>
              <div className="masonry-item">
                <ImageProtector
                  src={album.coverUrl}
                  alt={album.name}
                  className={`masonry-img ${loadedImages[album.id] ? 'loaded' : 'loading'}`}
                  onLoad={() => handleImageLoad(album.id)}
                />
                <div className="masonry-content">
                  <h3 className="album-title">{album.name}</h3>
                  <p className="album-meta">{album.photosCount || 0} fotos</p>
                </div>
              </div>
            </Link>
          ))}
        </Masonry>
      )}
    </div>
  );
};

export default Home;
