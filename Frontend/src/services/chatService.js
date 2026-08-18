import axios from './axios';

export const chatService = {
  // Get all chats for the current user
  getChats: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`chats${query ? `?${query}` : ''}`);
    return res.data;
  },

  // Get messages within a chat
  getMessages: async (chatId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`chats/${chatId}/messages${query ? `?${query}` : ''}`);
    return res.data;
  },

  // Send a message in a chat
  sendMessage: async (chatId, content, messageType = 'text', attachments = []) => {
    const res = await axios.post(`chats/${chatId}/messages`, {
      content,
      messageType,
      attachments,
    });
    return res.data;
  },

  // Create or get a chat with another user
  create: async (participantId, type = 'direct', bookingId = null) => {
    const res = await axios.post('chats', { participantId, type, bookingId });
    return res.data;
  },

  // Mark messages as read
  markAsRead: async (chatId) => {
    const res = await axios.put(`chats/${chatId}/read`);
    return res.data;
  },

  // Delete a chat
  remove: async (chatId) => {
    const res = await axios.delete(`chats/${chatId}`);
    return res.data;
  },
};
