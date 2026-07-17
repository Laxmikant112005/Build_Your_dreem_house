import React, { useState } from 'react';
import { MessageCircle, Send, User, Bot, Clock, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const mockConversations = [
  {
    id: 1,
    user: 'Rajesh Kumar',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'When will the blueprint be ready?',
    time: '2 min ago',
    unread: 3
  },
  {
    id: 2,
    user: 'Priya Sharma',
    avatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: 'Thanks for the update!',
    time: '1 hr ago',
    unread: 0
  },
  {
    id: 3,
    user: 'Amit Patel',
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Please send cost breakdown',
    time: 'Yesterday',
    unread: 1
  }
];

const mockMessages = {
  1: [
    { id: 1, sender: 'Rajesh', message: 'Hi, when will the blueprint be ready?', time: '10:25 AM', type: 'user' },
    { id: 2, sender: 'You', message: 'By Friday evening. Will send preview tomorrow.', time: '10:28 AM', type: 'engineer' },
    { id: 3, sender: 'Rajesh', message: 'Perfect, thanks!', time: '10:30 AM', type: 'user' }
  ],
  2: [
    { id: 1, sender: 'Priya', message: 'Thanks for the update on materials!', time: '9:15 AM', type: 'user' },
    { id: 2, sender: 'You', message: 'Steel and cement arriving tomorrow.', time: '9:20 AM', type: 'engineer' }
  ]
};

const EngineerMessages = () => {
  const { user } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [currentMessages, setCurrentMessages] = useState(mockMessages[1] || []);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);

  const sendMessage = () => {
    if (newMessage.trim()) {
      setCurrentMessages(prev => [...prev, {
        id: Date.now(),
        sender: user?.name || 'You',
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'engineer'
      }]);
      setNewMessage('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({ name: file.name, type: file.type, data: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex bg-slate-50">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 bg-navy text-white p-3 rounded-xl shadow-2xl"
        onClick={() => setShowSidebar(true)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div className={cn(
        "w-80 bg-white border-r border-slate-200 shadow-xl fixed lg:relative lg:translate-x-0 z-40 h-full overflow-y-auto transform transition-transform duration-300",
        showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-navy flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            Messages
          </h2>
          <p className="text-slate-600 text-sm">All conversations</p>
        </div>

        <div className="divide-y divide-slate-200">
          {mockConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setSelectedConversation(conv);
                setCurrentMessages(mockMessages[conv.id] || []);
                setShowSidebar(false);
              }}
              className="w-full p-5 hover:bg-slate-50 transition-colors flex items-center gap-4 first:border-t"
            >
              <img src={conv.avatar} alt={conv.user} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200" />
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-navy truncate">{conv.user}</h3>
                  {conv.unread > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold min-w-[1.5rem] flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate">{conv.lastMessage}</p>
              </div>
              <div className="text-xs text-slate-400 text-right min-w-[4rem]">
                {conv.time}
              </div>
            </button>
          ))}
        </div>

        {showSidebar && (
          <button 
            className="lg:hidden absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl"
            onClick={() => setShowSidebar(false)}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <img src={selectedConversation?.avatar} alt={selectedConversation?.user} className="w-12 h-12 rounded-2xl ring-2 ring-slate-200" />
            <div>
              <h3 className="font-bold text-navy text-xl">{selectedConversation?.user}</h3>
              <span className="text-sm text-slate-500">Online</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white">
          {currentMessages.map((msg) => (
            <div key={msg.id} className={cn(
              "flex gap-3",
              msg.type === 'engineer' ? 'justify-end' : 'justify-start'
            )}>
              <div className={cn(
                "max-w-xs lg:max-w-md p-4 rounded-3xl shadow-lg",
                msg.type === 'engineer' 
                  ? "bg-navy text-white rounded-br-sm" 
                  : "bg-white border border-slate-200 rounded-bl-sm"
              )}>
                <p className="text-sm leading-relaxed">{msg.message}</p>
                {msg.attachment && (
                  <div className="mt-3">
                    {msg.attachment.type.startsWith('image/') ? (
                      <img src={msg.attachment.data} alt={msg.attachment.name} className="w-48 h-32 object-cover rounded" />
                    ) : (
                      <a href={msg.attachment.data} download={msg.attachment.name} className="text-sm text-slate-200 underline">{msg.attachment.name}</a>
                    )}
                  </div>
                )}
                <p className="text-xs opacity-75 mt-2 text-right">{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-slate-200 p-6">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="w-full p-4 pr-36 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-gold/20 focus:border-gold transition-all shadow-sm resize-none"
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <input type="file" id="chat-attach" className="hidden" onChange={handleFileChange} />
                <label htmlFor="chat-attach" className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4l3 7 4-14 3 7h4" /></svg>
                </label>
                <button onClick={() => {
                  if (!newMessage.trim() && !attachment) return;
                  setCurrentMessages(prev => [...prev, {
                    id: Date.now(),
                    sender: user?.name || 'You',
                    message: newMessage,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: 'engineer',
                    attachment
                  }]);
                  setNewMessage('');
                  setAttachment(null);
                }} className="p-2 rounded-full bg-gold text-navy hover:scale-110 transition-transform">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerMessages;

