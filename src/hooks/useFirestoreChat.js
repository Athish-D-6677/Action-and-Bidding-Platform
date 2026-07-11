import { useEffect, useState, useCallback } from 'react';
import {
  collection, addDoc, query, orderBy, limit,
  onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export function useFirestoreChat(lotId) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!lotId) return;
    const q = query(
      collection(db, 'lot_chats', lotId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100),
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [lotId]);

  const sendMessage = useCallback(async (text, userName) => {
    if (!text?.trim() || !lotId) return;
    await addDoc(collection(db, 'lot_chats', lotId, 'messages'), {
      text: text.trim(),
      userName,
      createdAt: serverTimestamp(),
    });
  }, [lotId]);

  return { messages, sendMessage };
}
