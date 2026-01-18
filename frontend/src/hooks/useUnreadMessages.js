import { useState, useEffect, useRef } from 'react';
import client from '../api/client';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    let interval;
    let timeoutId;

    const fetchUnreadCount = async () => {
      try {
        const response = await client.get('/messages');
        const conversations = response.data.data || [];
        
        // Sum up unread messages from all conversations
        const totalUnread = conversations.reduce((sum, conv) => {
          return sum + (conv.unreadCount || 0);
        }, 0);
        
        if (isMountedRef.current) {
          setUnreadCount(totalUnread);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    // Initial fetch
    fetchUnreadCount();
    
    // Check for new messages every 10 seconds
    interval = setInterval(fetchUnreadCount, 10000);
    
    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { unreadCount };
};
