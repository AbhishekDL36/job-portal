


import { useState, useEffect, useRef } from 'react';
import client from '../../api/client';
import { Send, Loader, ArrowLeft } from 'lucide-react';

const ChatWindow = ({ conversationId, onBack, currentUser, otherUser }) => {
   const [messages, setMessages] = useState([]);
   const [newMessage, setNewMessage] = useState('');
   const [loading, setLoading] = useState(false);
   const [sendingMessage, setSendingMessage] = useState(false);
   const messagesEndRef = useRef(null);

   // Get user ID from local storage if not available from props
   const getUserId = () => {
     if (currentUser?._id) return currentUser._id;
     if (currentUser?.id) return currentUser.id;
     
     // Fallback to localStorage
     const storedUser = localStorage.getItem('user');
     if (storedUser) {
       try {
         const user = JSON.parse(storedUser);
         return user._id || user.id;
       } catch (e) {
         console.error('Error parsing stored user:', e);
       }
     }
     return null;
   };

   const currentUserId = getUserId();

   // Debug
   useEffect(() => {
     console.log('🔍 ChatWindow Debug:', {
       conversationId,
       currentUser,
       currentUserId,
       otherUser,
     });
   }, [conversationId, currentUser, currentUserId, otherUser]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await client.get(
        `/messages/conversation/${conversationId}`
      );
      setMessages(res.data.data || []);
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      const res = await client.post('/messages/send', {
        conversationId,
        content: newMessage,
        messageType: 'text',
      });

      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Send message error:', err);
      alert('Message failed');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (time) =>
    new Date(time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDate = (time) => {
    const date = new Date(time);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString())
      return 'Yesterday';
    return date.toLocaleDateString();
  };

  let lastDate = null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
        <button
          onClick={onBack}
          className="lg:hidden p-2 hover:bg-gray-200 rounded"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h3 className="font-semibold">{otherUser?.name}</h3>
          <p className="text-sm text-gray-500">
            {otherUser?.companyName || 'Job Seeker'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="animate-spin text-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            No messages yet
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser =
              String(msg.senderId) === String(currentUserId);

            console.log('📨 Msg:', {
              senderId: String(msg.senderId),
              currentUserId: String(currentUserId),
              isCurrentUser,
              content: msg.content?.substring(0, 15),
            });

            const currentDate = formatDate(msg.createdAt);
            let showDate = false;

            if (lastDate !== currentDate) {
              showDate = true;
              lastDate = currentDate;
            }

            return (
              <div key={msg._id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                      {currentDate}
                    </span>
                  </div>
                )}

                <div
                  className={`flex w-full ${
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl shadow ${
                      isCurrentUser
                        ? 'bg-blue-500 text-white rounded-br-none ml-auto'
                        : 'bg-gray-200 text-gray-900 rounded-bl-none mr-auto'
                    }`}
                  >
                    <p className="text-sm break-words">
                      {msg.content}
                    </p>

                    <div
                      className={`text-xs mt-1 text-right ${
                        isCurrentUser
                          ? 'text-blue-100'
                          : 'text-gray-600'
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                      {isCurrentUser && msg.isRead && ' ✓✓'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>



      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t bg-gray-50"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sendingMessage}
            className="flex-1 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sendingMessage || !newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {sendingMessage ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
