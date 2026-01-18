import { useState, useEffect } from 'react';
import client from '../../api/client';
import { MessageSquare, Search } from 'lucide-react';

const ChatList = ({ onSelectChat, selectedChatId, currentUserId }) => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await client.get('/messages');
      setConversations(response.data.data || []);
      setFilteredConversations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = conversations.filter((conv) => {
      const otherPerson = conv.otherPerson;
      const name = otherPerson.name?.toLowerCase() || '';
      const company = otherPerson.companyName?.toLowerCase() || '';
      const jobTitle = conv.jobId?.title?.toLowerCase() || '';

      return (
        name.includes(term) || company.includes(term) || jobTitle.includes(term)
      );
    });

    setFilteredConversations(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare size={24} />
          Messages
        </h2>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare size={48} className="mb-4 text-gray-300" />
            <p>No conversations yet</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherPerson = conversation.otherPerson;
            const isSelected = selectedChatId === conversation._id;
            const unreadCount = conversation.unreadCount || 0;

            return (
              <div
                key={conversation._id}
                onClick={() => onSelectChat(conversation._id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {otherPerson.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {otherPerson.companyName || 'Job Seeker'}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {unreadCount > 0 && (
                    <div className="ml-2 flex-shrink-0">
                      <span className="inline-block bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Last message time */}
                {conversation.lastMessage?.timestamp && (
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(conversation.lastMessage.timestamp).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
