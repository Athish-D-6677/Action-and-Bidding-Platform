import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export function useFirebaseStorage() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = useCallback((file, lotDraftId) => {
    return new Promise((resolve, reject) => {
      const path = `lot-photos/${lotDraftId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);

      setUploading(true);
      setProgress(0);

      task.on(
        'state_changed',
        snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        err => { setUploading(false); reject(err); },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          setUploading(false);
          setProgress(0);
          resolve(url);
        },
      );
    });
  }, []);

  return { uploadPhoto, uploading, progress };
}
