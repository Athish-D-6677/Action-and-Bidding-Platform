import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useDispatch } from 'react-redux';
import { applyBidUpdate, prependBid } from '../store';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws';

export function useAuctionSocket(lotId) {
  const dispatch = useDispatch();
  const clientRef = useRef(null);

  const connect = useCallback(() => {
    if (!lotId) return;
    const token = localStorage.getItem('pp_token');

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(`/topic/lot/${lotId}`, msg => {
          const data = JSON.parse(msg.body);
          dispatch(applyBidUpdate(data));
          if (data.eventType === 'BID_PLACED') {
            dispatch(prependBid({
              amount: data.currentBid,
              bidderName: data.leadingBidderName,
              bidType: 'MANUAL',
              createdAt: new Date().toISOString(),
            }));
          }
        });
        if (token) {
          client.subscribe('/user/queue/notifications', msg => {
            console.log('Notification:', JSON.parse(msg.body));
          });
        }
      },
      onStompError: frame => console.error('STOMP error', frame),
    });

    client.activate();
    clientRef.current = client;
  }, [lotId, dispatch]);

  useEffect(() => {
    connect();
    return () => { clientRef.current?.deactivate(); };
  }, [connect]);

  const sendBid = useCallback((amount, deviceFingerprint) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/bid.place',
        body: JSON.stringify({ lotId, amount, deviceFingerprint }),
      });
    }
  }, [lotId]);

  return { sendBid };
}
