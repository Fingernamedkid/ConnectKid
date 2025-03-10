import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import jwtDecode from 'jwt-decode';
import { Alert } from 'react-native';
import { Platform } from 'react-native';
import { getIdFromJwt } from '../lib/axios';
const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children, userid, token }) => {
  const [ws, setWs] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const initWebSocket = async () => {
      const userid = await getIdFromJwt();
      if (!token && !userid) return;
  
      const ws = new WebSocket(`wss://connectkid-8798464258f9.herokuapp.com/?token=${token}`);
  
      ws.onopen = () => {
        console.log('Connected to WebSocket server');
      };
  
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);
        if (message.type === 'message') {
          Alert.alert(`Notification: ${message.content}`);
          if (Platform.OS === 'web') {
            alert(`Notification: ${message.content}`);
          }
        } else if (message.type === 'alert') {
          Alert.alert(`Alert: ${message.content}`);
          if (Platform.OS === 'web') {
            alert(`Alert: ${message.content} `);
          }
        }
      };
  
      ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
      };
  
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
  
      setWs(ws);
  
      const handleAppStateChange = (nextAppState) => {
        if (nextAppState.match(/inactive|background/)) {
          ws.close();
        }
        setAppState(nextAppState);
      };
  
      const subscription = AppState.addEventListener('change', handleAppStateChange);
  
      return () => {
        ws.close();
        subscription.remove();
      };
    };
  
    initWebSocket(); // Appelle la fonction asynchrone
  
  }, [token, appState]);
  

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);