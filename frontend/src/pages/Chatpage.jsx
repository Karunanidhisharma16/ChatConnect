import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, authAPI } from '../services/api';

function Chatpage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        // Token invalid, logout
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar - User List */}
      <div className="w-1/4 bg-gray-800 border-r border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Users</h2>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
          >
            Logout
          </button>
        </div>
        
        {/* Users List */}
        <div className="overflow-y-auto h-[calc(100vh-73px)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-400">Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-400">No other users yet</div>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center p-4 cursor-pointer transition ${
                  selectedUser?._id === user._id
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-700/50'
                }`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-lg font-semibold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <p className="font-semibold text-white">{user.username}</p>
                  <p className={`text-sm ${user.isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                    {user.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-lg font-semibold text-white">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-white">{selectedUser.username}</p>
                <p className={`text-sm ${selectedUser.isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                  {selectedUser.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-900">
              <div className="text-center text-gray-400">
                <p>Start chatting with {selectedUser.username}!</p>
                <p className="text-sm mt-2">Messages coming soon... 🚀</p>
              </div>
            </div>
            
            {/* Message Input */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
                <button
                  disabled
                  className="px-6 py-2 bg-blue-600 text-white rounded-r-lg font-semibold opacity-50 cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to ChatConnect!</h2>
              <p className="text-gray-400">Select a user to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chatpage;