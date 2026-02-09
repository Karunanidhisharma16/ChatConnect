// Chatpage.jsx - Main chat interface with real-time messaging using Socket.IO
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, authAPI, messageAPI } from '../services/api';
import { socket, connectSocket, disconnectSocket, sendMessage } from '../services/socket';

function Chatpage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
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
    
    fetchUsers();
    
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
  
  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
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
    <div className="flex h-screen bg-gray-900">
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Chats</h1>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-lg transition border border-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <p>No users found</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center p-4 cursor-pointer transition border-b border-gray-700/50 ${
                  selectedUser?._id === user._id
                    ? 'bg-gray-700/50'
                    : 'hover:bg-gray-700/30'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-gray-800 ${
                    user.isOnline ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                </div>
                
                <div className="ml-3 flex-1">
                  <p className="font-semibold text-white">{user.username}</p>
                  <p className="text-sm text-gray-400">
                    {user.isOnline ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                  selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
              </div>
              <div className="ml-3">
                <p className="font-semibold text-white">{selectedUser.username}</p>
                <p className="text-xs text-gray-400">
                  {selectedUser.isOnline ? 'Active now' : 'Offline'}
                </p>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-gray-900">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === currentUserId || msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        msg.sender === currentUserId || msg.senderId === currentUserId
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-700 text-white rounded-bl-none'
                      }`}>
                        <p className="break-words">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">ChatConnect</h2>
              <p className="text-gray-400">Select a user to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chatpage;