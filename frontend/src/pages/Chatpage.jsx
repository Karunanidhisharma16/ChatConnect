// Chatpage.jsx - Main chat interface with real-time messaging using Socket.IO
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, authAPI, messageAPI } from '../services/api';
import { socket, connectSocket, disconnectSocket, sendMessage } from '../services/socket';
import { motion, AnimatePresence } from 'framer-motion';

function Chatpage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        localStorage.setItem('userId', payload.userId);
        setCurrentUserId(payload.userId);
        connectSocket(payload.userId);
      }
    } else {
      setCurrentUserId(userId);
      connectSocket(userId);
    }

    fetchContacts();

    socket.on('receive-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('user-status', ({ userId, isOnline }) => {
      setUsers(prev => prev.map(user =>
        user._id === userId ? { ...user, isOnline } : user
      ));
    });

    return () => {
      disconnectSocket();
      socket.off('receive-message');
      socket.off('user-status');
    };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getContacts();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const response = await userAPI.searchUser(searchQuery.trim());
      setSearchResult(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setSearchError('User not found');
      } else {
        setSearchError('Error searching user');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddContact = async (userId) => {
    try {
      await userAPI.addContact(userId);
      setSearchQuery('');
      setSearchResult(null);
      fetchContacts(); // Refresh contacts list
    } catch (error) {
      console.error('Error adding contact:', error);
      alert(error.response?.data?.message || 'Error adding contact');
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await messageAPI.getMessages(userId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: selectedUser._id,
      content: newMessage,
      timestamp: new Date()
    };

    try {
      await messageAPI.sendMessage({
        receiverId: selectedUser._id,
        content: newMessage
      });

      setMessages(prev => [...prev, messageData]);
      sendMessage(currentUserId, selectedUser._id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      disconnectSocket();
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* SIDEBAR */}
      <div className="w-80 border-r border-border bg-slate-900/40 backdrop-blur-xl flex flex-col z-10">
        <div className="p-6 border-b border-border/40">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Messages
            </h1>
            <button
              onClick={handleLogout}
              className="text-xs text-muted-foreground hover:text-red-400 transition-colors uppercase tracking-wide font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="p-4 border-b border-border/40">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value.trim()) {
                  setSearchResult(null);
                  setSearchError('');
                }
              }}
              placeholder="Search username to add..."
              className="w-full glass-input px-4 py-2.5 text-sm rounded-xl text-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 border border-white/5 bg-slate-800/50 pr-10"
            />
            <button
              type="submit"
              disabled={!searchQuery.trim() || isSearching}
              className="absolute right-3 p-1.5 text-muted-foreground hover:text-white transition-colors disabled:opacity-50"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {searchQuery.trim() ? (
            <div className="pt-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Search Result</h3>
              {searchError ? (
                <div className="text-center text-red-400 text-sm p-4 bg-red-500/10 rounded-xl border border-red-500/20">{searchError}</div>
              ) : searchResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {searchResult.username.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-medium text-white">{searchResult.username}</p>
                  </div>

                  {users.some(u => u._id === searchResult._id) ? (
                    <span className="text-xs font-medium text-green-400 px-2.5 py-1 bg-green-500/10 rounded-md border border-green-500/20">Added</span>
                  ) : (
                    <button
                      onClick={() => handleAddContact(searchResult._id)}
                      className="text-xs font-semibold px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                      Add
                    </button>
                  )}
                </motion.div>
              ) : null}
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm opacity-80">
              <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>No contacts yet. Search above to add.</p>
            </div>
          ) : (
            <>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 pt-2">Your Contacts</h3>
              {users.map((user) => (
                <motion.div
                  key={user._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-4 ${selectedUser?._id === user._id
                    ? 'bg-primary/15 border border-primary/20 shadow-sm'
                    : 'hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner ${selectedUser?._id === user._id ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-slate-700'
                      }`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    {user.isOnline && (
                      <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${selectedUser?._id === user._id ? 'text-white' : 'text-slate-200'}`}>
                      {user.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col z-10 relative">
        {selectedUser ? (
          <>
            {/* CHAT HEADER */}
            <div className="h-20 px-6 border-b border-border/40 bg-slate-900/40 backdrop-blur-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                  {selectedUser.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-white">{selectedUser.username}</h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedUser.isOnline ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                    {selectedUser.isOnline ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* MESSAGES LIST */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">No messages yet</h3>
                    <p className="text-muted-foreground text-sm">Say hello to start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender === currentUserId || msg.senderId === currentUserId;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      key={idx}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-md backdrop-blur-sm ${isMe
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                        : 'bg-slate-800/80 border border-slate-700/50 text-slate-100 rounded-bl-sm'
                        }`}>
                        <p className="leading-relaxed text-[15px]">{msg.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                          {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="p-4 bg-slate-900/40 backdrop-blur-xl border-t border-border/40">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full glass-input px-6 py-4 rounded-full text-white placeholder:text-muted-foreground/60 focus:outline-none pr-14"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-2 p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
                <svg className="w-16 h-16 text-indigo-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">Welcome to ChatConnect</h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Select a conversation from the sidebar to start messaging instantly.
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div >
  );
}

export default Chatpage;