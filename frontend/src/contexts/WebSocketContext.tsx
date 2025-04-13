import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

interface WebSocketContextType {
  sendMessage: (message: string) => void;
  lastMessage: any | null;
  isConnected: boolean;
  closeConnection: () => void;
  streamingContent: string;
  isStreaming: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
  userId: string;
  sessionId: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, userId, sessionId }) => {
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  const closeConnection = () => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      setIsConnected(false);
    }
  };

  useEffect(() => {
    const connect = () => {
      const wsUrl = `ws://localhost:8000/api/v1/chat/ws/${userId}/${sessionId}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'start') {
          setIsStreaming(true);
          setStreamingContent('');
        } else if (data.type === 'chunk') {
          setStreamingContent(prev => prev + data.content);
        } else if (data.type === 'end') {
          setIsStreaming(false);
          setLastMessage({ ai_message: streamingContent });
          setStreamingContent('');
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket Disconnected');
        setIsConnected(false);
        // Only attempt to reconnect if we haven't explicitly closed the connection
        if (ws.current) {
          setTimeout(connect, 5000);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setIsConnected(false);
      };
    };

    connect();

    return () => {
      closeConnection();
    };
  }, [userId, sessionId]);

  const sendMessage = (message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ message }));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  return (
    <WebSocketContext.Provider value={{ 
      sendMessage, 
      lastMessage, 
      isConnected, 
      closeConnection,
      streamingContent,
      isStreaming
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}; 