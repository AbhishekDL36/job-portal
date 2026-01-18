import { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import client from '../../api/client';

const ChatContainer = ({ currentUser, selectedConversationId: initialConversationId }) => {
  const [selectedConversationId, setSelectedConversationId] = useState(initialConversationId || null);
  const [conversations, setConversations] = useState([]);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch conversations to get conversation details
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await client.get('/messages');
        setConversations(response.data.data || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  const selectedConversation = conversations.find(
    (conv) => conv._id === selectedConversationId
  );

  const otherUser = selectedConversation?.otherPerson;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat List - visible on desktop or mobile when no chat is selected */}
      <div
        className={`${
          isMobileView && selectedConversationId
            ? 'hidden'
            : 'w-full lg:w-80 lg:border-r lg:border-gray-200'
        }`}
      >
        <ChatList
          onSelectChat={setSelectedConversationId}
          selectedChatId={selectedConversationId}
          currentUserId={currentUser?._id}
        />
      </div>

      {/* Chat Window - visible on desktop or mobile when chat is selected */}
      {selectedConversationId && (
        <div
          className={`${
            isMobileView ? 'w-full' : 'flex-1'
          } flex flex-col`}
        >
          <ChatWindow
            conversationId={selectedConversationId}
            onBack={() => setSelectedConversationId(null)}
            currentUser={currentUser}
            otherUser={otherUser}
          />
        </div>
      )}

      {/* Empty state on desktop when no chat is selected */}
      {!isMobileView && !selectedConversationId && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
