import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { ArrowLeft } from 'lucide-react';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { usePhotos } from '../hooks/useFirebase';
import ImageProtector from '../components/ImageProtector';
import '../styles/masonry.css';

const AlbumView = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const { photos, loading: photosLoading } = usePhotos(id);
  const [loadingAlbum, setLoadingAlbum] = useState(true);
  
  // Lightbox state
  const [index, setIndex] = useState(-1);
  const [loadedImages, setLoadedImages] = useState({});

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const docRef = doc(db, 'albums', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAlbum(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching album", error);
      } finally {
        setLoadingAlbum(false);
      }
    };
    fetchAlbum();
  }, [id]);

  const handleImageLoad = (imgId) => {
    setLoadedImages(prev => ({ ...prev, [imgId]: true }));
  };

  const imagesForLightbox = photos.map(p => ({ src: p.url }));

  if (loadingAlbum || photosLoading) {
    return <div className="full-center"><div className="loader"></div></div>;
  }

  if (!album) {
    return (
      <div className="container full-center text-center">
        <h2>Álbum no encontrado o es privado.</h2>
        <Link to="/" style={{ marginTop: '1rem', textDecoration: 'underline' }}>Volver al inicio</Link>
      </div>
    );
  }

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <>
      {/* Lightbox rendered conditionally when index >= 0 */}
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={imagesForLightbox}
        render={{
          slide: ({ slide }) => (
            <div className="yarl__slide_image" style={{ width: '100%', height: '100%' }}>
              <img
                src={slide.src}
                className="yarl__slide_image"
                style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                onContextMenu={e => e.preventDefault()}
                onDragStart={e => e.preventDefault()}
                alt="View"
              />
              <div 
                style={{ position: 'absolute', inset: 0, zIndex: 10 }}
                onContextMenu={e => e.preventDefault()}
                onDragStart={e => e.preventDefault()}
              />
            </div>
          )
        }}
      />

      <div className="container" style={{ padding: '2rem 1rem' }}>
        <nav style={{ marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}>
            <ArrowLeft size={20} /> Volver a Portafolio
          </Link>
        </nav>

        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{album.name}</h1>
          <p style={{ opacity: 0.7, maxWidth: '600px' }}>{album.description}</p>
        </header>

        {photos.length === 0 ? (
          <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '4rem' }}>
            <p>Este álbum no contiene fotos aún.</p>
          </div>
        ) : (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {photos.map((photo, i) => (
              <div 
                key={photo.id} 
                className="masonry-item" 
                onClick={() => setIndex(i)}
              >
                <ImageProtector
                  src={photo.url}
                  alt={`Photo ${i+1}`}
                  className={`masonry-img ${loadedImages[photo.id] ? 'loaded' : 'loading'}`}
                  onLoad={() => handleImageLoad(photo.id)}
                />
              </div>
            ))}
          </Masonry>
        )}
      </div>
    </>
  );
};

export default AlbumView;
