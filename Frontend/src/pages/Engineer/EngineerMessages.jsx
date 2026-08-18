import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { cn } from '../../utils/cn';

const EngineerMessages = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchChats = async () => {
    try {
      const res = await chatService.getChats({ limit: 50 });
      const list = res?.data?.chats || res?.data || [];
      setChats(list);
      if (list.length > 0 && !activeChat) {
        setActiveChat(list[0]);
      }
    } catch (e) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
    }
  }, [activeChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (chatId) => {
    try {
      const res = await chatService.getMessages(chatId, { limit: 100 });
      setMessages(res?.data?.messages || res?.data || []);
    } catch (e) {
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || !activeChat) return;
    setSending(true);
    try {
      await chatService.sendMessage(activeChat.id, text.trim());
      setText('');
      await loadMessages(activeChat.id);
    } catch (e) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (chat) => {
    const participants = chat?.participants || [];
    return participants.find((p) => p.id !== user?.id && p.id !== user?._id)
      || participants[0];
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-slate-200 rounded-2xl" />
          <div className="h-96 bg-slate-200 rounded-4xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-navy rounded-3xl flex items-center justify-center">
          <MessageSquare className="w-7 h-7 text-gold" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-navy">Messages</h1>
          <p className="text-slate-600 font-medium">Communicate with your clients</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-3xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {chats.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-4xl bg-slate-50">
          <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-600 mb-4">No conversations yet</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            When clients contact you about a project or consultation, your conversations will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
          {/* Chat list */}
          <div className="md:col-span-1 border-r border-slate-200 max-h-[500px] overflow-y-auto">
            {chats.map((chat) => {
              const other = getOtherParticipant(chat);
              const isActive = activeChat?.id === chat.id;
              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={cn(
                    'w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors flex items-center gap-3',
                    isActive && 'bg-gold/10'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {other?.avatar ? <img src={other.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy truncate">{other?.firstName || 'Client'} {other?.lastName || ''}</p>
                    <p className="text-xs text-slate-500 truncate">{chat.lastMessage?.message || 'No messages yet'}</p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-gold text-navy rounded-full text-xs font-bold flex items-center justify-center shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Message window */}
          <div className="md:col-span-2 flex flex-col max-h-[500px]">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <p className="font-bold text-navy">
                {getOtherParticipant(activeChat)?.firstName || 'Client'} {getOtherParticipant(activeChat)?.lastName || ''}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {messages.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-10">No messages in this conversation yet.</p>
              ) : (
                messages.filter((m) => !m.isDeleted).map((msg) => {
                  const mine = String(msg.senderId?.id || msg.senderId) === String(user?.id || user?._id);
                  return (
                    <div key={msg.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        'max-w-[75%] px-4 py-2.5 rounded-3xl text-sm',
                        mine ? 'bg-navy text-white rounded-br-sm' : 'bg-white border border-slate-200 rounded-bl-sm'
                      )}>
                        <p>{msg.content}</p>
                        <p className={cn('text-[10px] mt-1', mine ? 'text-slate-300' : 'text-slate-400')}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-slate-200 flex gap-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
              <button
                onClick={handleSend}
                disabled={sending || !text.trim()}
                className="w-12 h-12 bg-gold text-navy rounded-full flex items-center justify-center hover:bg-gold/90 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineerMessages;
