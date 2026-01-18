import Message from '../Models/message.js';
import Conversation from '../Models/conversation.js';
import User from '../Models/user.js';

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType = 'text', interviewData } = req.body;
    const senderId = req.userId;

    if (!senderId || !conversationId || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get conversation details
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Get sender details
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine receiver and update unread count
    const isJobSeeker = conversation.jobSeekerId.toString() === senderId;
    const receiverId = isJobSeeker ? conversation.employerId : conversation.jobSeekerId;

    // Create message
    const message = new Message({
      conversationId,
      senderId,
      senderName: sender.name,
      senderType: sender.userType,
      content,
      messageType,
      interviewData: messageType === 'interview_update' ? interviewData : undefined,
    });

    await message.save();

    // Update conversation
    const unreadField = isJobSeeker ? 'unreadCount.employer' : 'unreadCount.jobSeeker';
    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: {
          content,
          senderId,
          timestamp: new Date(),
        },
        [unreadField]: 0,
        [`unreadCount.${isJobSeeker ? 'jobSeeker' : 'employer'}`]: 0,
        updatedAt: new Date(),
      },
      { new: true }
    );

    // Increment receiver's unread count
    const receiverUnreadField = isJobSeeker ? 'unreadCount.employer' : 'unreadCount.jobSeeker';
    await Conversation.findByIdAndUpdate(
      conversationId,
      { $inc: { [receiverUnreadField]: 1 } }
    );

    res.status(201).json({ message: 'Message sent', data: message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.userId;

    const skip = (page - 1) * limit;

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isJobSeeker = conversation.jobSeekerId.toString() === userId;
    const isEmployer = conversation.employerId.toString() === userId;

    if (!isJobSeeker && !isEmployer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch messages
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Reset unread count for current user
    const unreadField = isJobSeeker ? 'unreadCount.jobSeeker' : 'unreadCount.employer';
    await Conversation.findByIdAndUpdate(conversationId, {
      [unreadField]: 0,
    });

    res.status(200).json({
      message: 'Messages fetched',
      data: messages.reverse(),
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find({
      $or: [
        { jobSeekerId: userId },
        { employerId: userId },
      ],
    })
      .populate('jobSeekerId', 'name email')
      .populate('employerId', 'name email companyName')
      .populate('jobId', 'title')
      .sort({ updatedAt: -1 })
      .lean();

    const enrichedConversations = conversations.map((conv) => {
      const isJobSeeker = conv.jobSeekerId._id.toString() === userId;
      return {
        ...conv,
        otherPerson: isJobSeeker ? conv.employerId : conv.jobSeekerId,
        userType: isJobSeeker ? 'job_seeker' : 'employer',
        unreadCount: isJobSeeker ? conv.unreadCount.jobSeeker : conv.unreadCount.employer,
      };
    });

    res.status(200).json({
      message: 'Conversations fetched',
      data: enrichedConversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Start or get conversation
export const startConversation = async (req, res) => {
  try {
    const { employerId, jobSeekerId, jobId, applicationId } = req.body;
    const userId = req.userId;

    // Validate users
    if (!employerId || !jobSeekerId) {
      return res.status(400).json({ message: 'Both employer and job seeker required' });
    }

    // Check if users exist
    const employer = await User.findById(employerId);
    const jobSeeker = await User.findById(jobSeekerId);

    if (!employer || !jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify requester is one of the participants
    if (userId !== employerId && userId !== jobSeekerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find existing conversation for this specific job
    let conversation = await Conversation.findOne({
      jobSeekerId,
      employerId,
      jobId: jobId || null,
    });

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = new Conversation({
        jobSeekerId,
        employerId,
        jobId: jobId || undefined,
        applicationId: applicationId || undefined,
      });
      await conversation.save();
    }

    res.status(200).json({
      message: 'Conversation retrieved',
      data: conversation,
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete conversation
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Verify user is participant
    const isJobSeeker = conversation.jobSeekerId.toString() === userId;
    const isEmployer = conversation.employerId.toString() === userId;

    if (!isJobSeeker && !isEmployer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete conversation and its messages
    await Conversation.findByIdAndDelete(conversationId);
    await Message.deleteMany({ conversationId });

    res.status(200).json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
