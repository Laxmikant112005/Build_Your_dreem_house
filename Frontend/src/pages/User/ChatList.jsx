import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/axios';
import { getSocket } from '../../utils/socket';
import { MessageSquare, Search, Plus, User, Loader2, ChevronRight, Circle, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

const ChatList = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [showNewChat, setShowNewChat] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/chats?page=${pagination.page}&limit=20`);
      const data = res.data?.data || res.data;
      setChats(data?.chats || data || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data?.pagination?.totalPages || 1,
      }));
    } catch (err) {
      console.error('Failed to load chats:', err);
      if (err.response?.status !== 401) toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [pagination.page]);

  useEffect(() => { loadChats(); }, [loadChats]);

// Real-time socket listener for chat updates
  useEffect(() => {
    let socket = null;
    let cancelled = false;
    (async () => {
      socket = await getSocket();
      if (!socket || cancelled) return;
      socket.on('chat-update', (data) => {
        setChats(prev => {
          const existing = prev.findIndex(c => c._id === data.chatId);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = { ...updated[existing], lastMessage: data.lastMessage, updatedAt: new Date().toISOString() };
            updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            return updated;
          }
          return prev;
        });
      });
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSearchUsers = async (query) => {
    setSearchUser(query);
    if (query.length < 2) { setUsers([]); return; }
    try {
      setLoadingUsers(true);
      const res = await api.get(`/users/search?q=${query}&role=engineer`);
      setUsers(res.data?.data || []);
    } catch (err) {
      // silent fail
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const res = await api.post('/chats', { participantId: userId });
      const chat = res.data?.data || res.data;
      setShowNewChat(false);
      navigate(`/user/chat/${chat._id || chat.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start conversation');
    }
  };

  const getOtherParticipant = (chat) => {
    const currentUserId = localStorage.getItem('userId');
    return chat.participants?.find(p => p._id !== currentUserId) || chat.participants?.[0] || {};
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const filtered = chats.filter(chat => {
    if (!search) return true;
    const other = getOtherParticipant(chat);
    const name = `${other.firstName || ''} ${other.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-black text-navy mb-1">Messages</h1>
          <p className="text-slate-500">Chat with engineers and project teams</p>
        </div>
        <button
          onClick={() => setShowNewChat(true)}
          className="btn-gold px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" /> New Chat
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-gold/30 transition-all"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-4xl border border-slate-200">
            <MessageSquare className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-navy mb-2">{search ? 'No conversations found' : 'No conversations yet'}</h3>
            <p className="text-slate-500 mb-6">
              {search ? 'Try a different search term' : 'Start a new chat with an engineer'}
            </p>
            {!search && (
              <button onClick={() => setShowNewChat(true)} className="btn-gold px-8 py-4 rounded-2xl font-bold inline-flex items-center gap-2">
                <Plus className="w-5 h-5" /> Start a Conversation
              </button>
            )}
          </div>
        ) : (
          filtered.map(chat => {
            const other = getOtherParticipant(chat);
            const unread = chat.unreadCount || 0;
            return (
              <button
                key={chat._id}
                onClick={() => navigate(`/user/chat/${chat._id}`)}
                className="w-full bg-white rounded-3xl border border-slate-200 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-navy to-slate-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {other.firstName?.charAt(0) || <User className="w-6 h-6" />}
                      {other.lastName?.charAt(0)}
                    </div>
                    {chat.type === 'booking' && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center border-2 border-white">
                        <Clock className="w-3 h-3 text-navy" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-navy truncate">
                        {other.firstName} {other.lastName}
                        {other.role && <span className="text-xs text-slate-400 ml-2 font-normal">({other.role})</span>}
                      </h3>
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{formatDate(chat.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-slate-500 truncate flex-1">
                        {chat.lastMessage?.message || 'No messages yet'}
                      </p>
                      {unread > 0 && (
                        <span className="flex-shrink-0 bg-gold text-navy text-xs font-bold px-2.5 py-1 rounded-full min-w-[24px] text-center">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-gold transition-colors flex-shrink-0" />
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-slate-200">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl font-bold text-sm disabled:opacity-40 hover:bg-slate-50 transition-all"
          >
            Previous
          </button>
          <span className="px-4 py-2.5 text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl font-bold text-sm disabled:opacity-40 hover:bg-slate-50 transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowNewChat(false)}>
          <div className="bg-white rounded-4xl p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-navy mb-6">New Conversation</h3>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={searchUser}
                onChange={e => handleSearchUsers(e.target.value)}
                placeholder="Search engineers by name..."
                className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30"
              />
            </div>
            {loadingUsers ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>
            ) : users.length === 0 && searchUser.length >= 2 ? (
              <p className="text-center text-slate-400 py-8">No engineers found</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {users.map(u => (
                  <button
                    key={u._id}
                    onClick={() => handleStartChat(u._id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-navy text-white flex items-center justify-center font-bold">
                      {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-navy">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-slate-400">{u.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchUser.length < 2 && (
              <p className="text-center text-slate-400 text-sm py-4">Type at least 2 characters to search</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;

