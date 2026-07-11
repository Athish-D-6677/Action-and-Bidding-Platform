import { useEffect, useState } from 'react';
import { doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase';

export function useFirestoreViewers(lotId, userId) {
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    if (!lotId || !userId) return;

    const presenceRef = doc(db, 'lot_presence', lotId, 'viewers', userId);

    // Register presence
    setDoc(presenceRef, { joinedAt: new Date().toISOString() });

    // Watch total count
    const unsub = onSnapshot(
      collection(db, 'lot_presence', lotId, 'viewers'),
      snap => setViewerCount(snap.size),
    );

    return () => {
      deleteDoc(presenceRef);
      unsub();
    };
  }, [lotId, userId]);

  return viewerCount;
}
