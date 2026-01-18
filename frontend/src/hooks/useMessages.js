import { useState, useCallback } from 'react';
import client from '../api/client';

export const useMessages = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startConversation = useCallback(
    async (employerId, jobSeekerId, jobId = null, applicationId = null) => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔥 Sending to /messages/start:', {
          employerId,
          jobSeekerId,
          jobId,
          applicationId,
        });

        const response = await client.post(
          '/messages/start',
          {
            employerId,
            jobSeekerId,
            jobId,
            applicationId,
          }
        );

        return response.data.data || response.data;
      } catch (err) {
        console.error('startConversation error:', err);
        setError(err.response?.data?.message || 'Failed to start conversation');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (conversationId, content, messageType = 'text', interviewData = null) => {
      try {
        setLoading(true);
        setError(null);

        const response = await client.post(
          '/messages/send',
          {
            conversationId,
            content,
            messageType,
            interviewData,
          }
        );

        return response.data.data;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to send message');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchMessages = useCallback(
    async (conversationId, page = 1, limit = 50) => {
      try {
        setLoading(true);
        setError(null);

        const response = await client.get(
          `/messages/conversation/${conversationId}`,
          {
            params: { page, limit },
          }
        );

        return response.data.data;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch messages');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await client.get('/messages');

      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch conversations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(
    async (conversationId) => {
      try {
        setLoading(true);
        setError(null);

        await client.delete(`/messages/conversation/${conversationId}`);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete conversation');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    startConversation,
    sendMessage,
    fetchMessages,
    fetchConversations,
    deleteConversation,
  };
};
