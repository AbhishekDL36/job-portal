import { useParams } from 'react-router-dom';
import ChatContainer from '../components/Chat/ChatContainer';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
  const { user, loading } = useAuth();
  const { conversationId } = useParams();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Please log in to access chat</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100">
      <ChatContainer currentUser={user} selectedConversationId={conversationId} />
    </div>
  );
};

export default ChatPage;
