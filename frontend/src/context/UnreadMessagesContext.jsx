import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const UnreadMessagesContext = createContext();

export function UnreadMessagesProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await client.get('/messages');
        const conversations = response.data.data || [];
        
        // Sum up unread messages
        const totalUnread = conversations.reduce((sum, conv) => {
          return sum + (conv.unreadCount || 0);
        }, 0);
        
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    // Fetch immediately
    fetchUnreadCount();

    // Then poll every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <UnreadMessagesContext.Provider value={{ unreadCount }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext);
  if (!context) {
    throw new Error('useUnreadMessages must be used within UnreadMessagesProvider');
  }
  return context;
}
