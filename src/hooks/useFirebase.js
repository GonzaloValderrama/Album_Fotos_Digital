import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export const useAlbums = (publicOnly = false) => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'albums'), orderBy('createdAt', 'desc'));
    if (publicOnly) {
      q = query(collection(db, 'albums'), where('isPublic', '==', true), orderBy('createdAt', 'desc'));
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlbums(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching albums", error);
      setLoading(false);
    });

    return unsub;
  }, [publicOnly]);

  return { albums, loading };
};

export const usePhotos = (albumId) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!albumId) return;
    
    const q = query(
      collection(db, 'photos'),
      where('albumId', '==', albumId),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPhotos(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching photos", error);
      setLoading(false);
    });

    return unsub;
  }, [albumId]);

  return { photos, loading };
};
