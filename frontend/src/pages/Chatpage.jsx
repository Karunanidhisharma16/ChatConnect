import { useNavigate } from 'react-router-dom';

function Chatpage() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Chat Page</h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <p className="text-xl text-gray-300">
            Success! You're logged in!
          </p>
          <p className="text-gray-400 mt-4">
            This is a protected page. Only authenticated users can see this.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Chatpage;