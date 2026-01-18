


import { useState } from "react";
import { MessageSquare, Loader } from "lucide-react";
import { useMessages } from "../../hooks/useMessages";

const StartChatButton = ({
  employerId,
  jobSeekerId,
  jobId,
  applicationId,
  currentUserId,
  otherPersonName,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { startConversation } = useMessages();


  const isEmployer = currentUserId === employerId;
  const buttonText = isEmployer
    ? `Chat with ${otherPersonName || "Applicant"}`
    : `Chat with ${otherPersonName || "Employer"}`;

  // Disable button if required IDs are missing (chat is between users, not dependent on job)
  const isDisabled = isLoading || !employerId || !jobSeekerId;

  const handleStartChat = async () => {
    if (isDisabled) {
      console.warn('Button is disabled. Missing IDs:', { employerId, jobSeekerId, jobId });
      alert('Chat button is not properly configured. Missing required information.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Starting conversation with:', { employerId, jobSeekerId, jobId, applicationId });

      const conversation = await startConversation(
        employerId,
        jobSeekerId,
        jobId,
        applicationId
      );

      console.log('Conversation response:', conversation);

      if (!conversation?._id) {
        throw new Error("Failed to create conversation - no ID returned.");
      }

      window.location.href = `/chat/${conversation._id}`;
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Failed to start chat: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={isDisabled}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
    >
      {isLoading ? <Loader size={18} className="animate-spin" /> : <MessageSquare size={18} />}
      {isLoading ? "Starting chat..." : buttonText}
    </button>
  );
};

export default StartChatButton;
