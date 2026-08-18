import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/axios';
import { getSocket } from '../../utils/socket';
import { Send, ArrowLeft, User, Paperclip, Image as ImageIcon, FileText, X, Check, CheckCheck, Loader2, MoreVertical, Trash2, MessageSquare } from 'lucide-react';
import { cn } from '../../utils/cn';

const ChatWindow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loadingMore, setLoadingMore] = useState(false);
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [showAttach, setShowAttach] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});

  const currentUserId = localStorage.getItem('userId');

  // Load chat info
  useEffect(() => {
    loadChat();
    loadMessages();
    initSocket();
    // NOTE: do NOT disconnect the shared socket here - it is reused by other
    // components via utils/socket.js. Just leave the room; the server cleans
    // up when the page unloads.
  }, [id]);

const initSocket = async () => {
    const s = await getSocket();
    if (!s) return;

    s.on('connect', () => {
      s.emit('join-chat', id);
    });

    s.on('new-message', (message) => {
      setMessages(prev => {
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    });

    s.on('user-typing', (data) => {
      if (data.userId !== currentUserId) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: true }));
        setTimeout(() => {
          setTypingUsers(prev => ({ ...prev, [data.userId]: false }));
        }, 3000);
      }
    });

    s.on('message-read', (data) => {
      setMessages(prev => prev.map(m =>
        m._id === data.messageId ? { ...m, readBy: [...(m.readBy || []), { userId: data.readBy }] } : m
      ));
    });

    // Track online status
    s.on('user-online', (userId) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: true }));
    });
    s.on('user-offline', (userId) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: false }));
    });

    setSocket(s);
  };

  const loadChat = async () => {
    try {
      const res = await api.get(`/chats`);
      const chats = res.data?.data?.chats || res.data?.data || [];
      const current = chats.find(c => c._id === id);
      if (current) setChat(current);
    } catch (err) {
      if (err.response?.status === 404) navigate('/user/chat');
    }
  };

  const loadMessages = async (page = 1) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await api.get(`/chats/${id}/messages?page=${page}&limit=50`);
      const data = res.data?.data || res.data;
      const msgs = data?.messages || data || [];

      if (page === 1) {
        setMessages(msgs);
      } else {
        setMessages(prev => [...msgs, ...prev]);
      }

      setPagination({
        page: data?.pagination?.page || page,
        totalPages: data?.pagination?.totalPages || 1,
        total: data?.pagination?.total || 0,
      });

      // Mark as read
      await api.put(`/chats/${id}/read`);
    } catch (err) {
      if (err.response?.status !== 401) toast.error('Failed to load messages');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => { scrollToBottom(); }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    setSending(true);
    try {
      const payload = {
        content: input.trim(),
        messageType: attachments.length > 0 ? (attachments[0].type?.startsWith('image/') ? 'image' : 'file') : 'text',
        attachments: attachments.map(a => ({
          url: a.url || a.preview,
          name: a.name,
          type: a.type,
          size: a.size,
        })),
      };

      const res = await api.post(`/chats/${id}/messages`, payload);
      const newMsg = res.data?.data || res.data;

      setMessages(prev => [...prev, newMsg]);
      setInput('');
      setAttachments([]);
      setShowAttach(false);
      scrollToBottom();
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', { chatId: id });
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      preview: URL.createObjectURL(f),
      file: f,
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    setShowAttach(false);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const loadMore = () => {
    if (pagination.page < pagination.totalPages) {
      loadMessages(pagination.page + 1);
    }
  };

  const getOtherParticipant = () => {
    if (!chat) return {};
    return chat.participants?.find(p => p._id !== currentUserId) || chat.participants?.[0] || {};
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays === 0) return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const other = getOtherParticipant();
  const isTyping = Object.values(typingUsers).some(v => v);
  const isOnline = onlineUsers[other._id];

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col bg-white rounded-4xl border border-slate-200 shadow-xl overflow-hidden max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="flex items-center gap-4 p-5 border-b border-slate-200 bg-white flex-shrink-0">
        <button onClick={() => navigate('/user/chat')} className="p-2 hover:bg-slate-100 rounded-2xl transition-all">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-navy to-slate-700 flex items-center justify-center text-white font-bold">
            {other.firstName?.charAt(0)}{other.lastName?.charAt(0)}
          </div>
          {isOnline !== undefined && (
            <div className={cn('absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
              isOnline ? 'bg-emerald-500' : 'bg-slate-400')} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-navy text-lg truncate">{other.firstName} {other.lastName}</h2>
          <p className="text-xs text-slate-400">
            {isTyping ? (
              <span className="text-emerald-500 font-medium animate-pulse">typing...</span>
            ) : isOnline !== undefined ? (
              isOnline ? <span className="text-emerald-500">Online</span> : <span className="text-slate-400">Offline</span>
            ) : (
              other.role || ''
            )}
          </p>
        </div>
        {chat?.bookingId && (
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl text-xs font-bold text-amber-700">
            Booking Chat
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50" id="chat-messages">
        {/* Load More */}
        {pagination.page < pagination.totalPages && (
          <div className="text-center">
            <button onClick={loadMore} disabled={loadingMore}
              className="text-sm text-gold font-bold hover:underline disabled:opacity-50">
              {loadingMore ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16">
            <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-navy mb-2">No messages yet</h3>
            <p className="text-slate-400">Send a message to start the conversation</p>
          </div>
        )}

        {/* Grouped Messages */}
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="flex justify-center mb-4">
              <span className="text-xs bg-white px-4 py-1.5 rounded-full text-slate-400 border border-slate-200 font-medium">{date}</span>
            </div>
            {msgs.map((msg, idx) => {
              const isMine = msg.senderId?._id === currentUserId || msg.senderId === currentUserId;
              const senderName = msg.senderId?.firstName || '';
              const hasRead = msg.readBy?.some(r => (r.userId || r) !== currentUserId);
              const isImage = msg.messageType === 'image' || msg.attachments?.some(a => a.type?.startsWith('image/'));
              const showAvatar = idx === 0 || msgs[idx - 1]?.senderId?._id !== msg.senderId?._id;

              return (
                <div key={msg._id || idx} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[75%]', !isMine && showAvatar && 'ml-0')}>
                    {!isMine && showAvatar && (
                      <p className="text-xs text-slate-400 mb-1 ml-1">{senderName}</p>
                    )}
                    <div className={cn('rounded-3xl px-5 py-3 shadow-sm',
                      isMine ? 'bg-gold text-navy rounded-br-md' : 'bg-white border border-slate-200 rounded-bl-md')}>
                      {/* Attachments */}
                      {msg.attachments?.length > 0 && (
                        <div className="space-y-2 mb-2">
                          {msg.attachments.map((att, ai) => (
                            att.type?.startsWith('image/') || att.url?.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                              <a key={ai} href={att.url} target="_blank" rel="noopener noreferrer"
                                className="block rounded-2xl overflow-hidden hover:opacity-90 transition-all">
                                <img src={att.url} alt={att.name} className="max-w-full h-auto max-h-60 object-cover" />
                              </a>
                            ) : (
                              <a key={ai} href={att.url} target="_blank" rel="noopener noreferrer"
                                className={cn('flex items-center gap-3 p-3 rounded-2xl',
                                  isMine ? 'bg-white/20' : 'bg-slate-50')}>
                                <FileText className="w-8 h-8 text-slate-400" />
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">{att.name || 'File'}</p>
                                  <p className="text-xs opacity-60">{formatFileSize(att.size)}</p>
                                </div>
                              </a>
                            )
                          ))}
                        </div>
                      )}
                      {/* Text Content */}
                      {msg.content && (
                        <p className={cn('text-sm leading-relaxed whitespace-pre-wrap', isMine ? 'text-navy' : 'text-slate-700')}>
                          {msg.content}
                        </p>
                      )}
                      {/* Timestamp & Read Receipt */}
                      <div className={cn('flex items-center gap-1 mt-1', isMine ? 'justify-end' : 'justify-start')}>
                        <span className={cn('text-xs', isMine ? 'text-navy/50' : 'text-slate-400')}>{formatDate(msg.createdAt)}</span>
                        {isMine && (
                          hasRead ? <CheckCheck className="w-4 h-4 text-blue-500" /> : <Check className="w-4 h-4 text-navy/40" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="flex gap-3 p-4 border-t border-slate-200 bg-white overflow-x-auto">
          {attachments.map((att, i) => (
            <div key={i} className="relative flex-shrink-0">
              {att.type?.startsWith('image/') ? (
                <img src={att.preview} alt="" className="w-20 h-20 object-cover rounded-2xl border border-slate-200" />
              ) : (
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <button onClick={() => removeAttachment(i)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                <X className="w-3 h-3" />
              </button>
              <p className="text-xs text-slate-400 mt-1 truncate max-w-[80px]">{att.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-200 p-4 bg-white flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-end gap-3">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={e => { setInput(e.target.value); handleTyping(); }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full p-4 pr-12 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-gold/30 resize-none bg-slate-50"
              style={{ minHeight: '52px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <button type="button" onClick={() => setShowAttach(!showAttach)}
              className="absolute right-3 bottom-3 p-2 hover:bg-slate-200 rounded-2xl transition-all">
              <Paperclip className={cn('w-5 h-5', showAttach ? 'text-gold' : 'text-slate-400')} />
            </button>
          </div>
          <button type="submit" disabled={(!input.trim() && attachments.length === 0) || sending}
            className="p-4 bg-gold text-navy rounded-3xl hover:bg-gold/90 transition-all disabled:opacity-40 shadow-lg shadow-gold/20">
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>

        {/* Attachment Options */}
        {showAttach && (
          <div className="flex gap-4 mt-4 p-4 bg-slate-50 rounded-3xl border border-slate-200">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 p-4 hover:bg-white rounded-2xl transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-slate-600">Photos</span>
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 p-4 hover:bg-white rounded-2xl transition-all">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-xs font-bold text-slate-600">Files</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;

