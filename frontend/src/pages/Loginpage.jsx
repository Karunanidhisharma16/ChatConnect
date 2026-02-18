import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { motion } from 'framer-motion';

function Loginpage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      navigate('/chat');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-background text-foreground transition-colors duration-500">

      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-600/30 rounded-full blur-[120px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-600/30 rounded-full blur-[120px]"
        />
      </div>

      <div className="container mx-auto flex h-screen items-center justify-center p-4 lg:p-0 relative z-10">

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Side: Branding */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hidden lg:block space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-7xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                ChatConnect
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-md">
                Experience the next generation of messaging. Real-time, secure, and beautifully designed for improved productivity.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {['Encrypt', 'Speed', 'Cloud', 'Design'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-center space-x-2 text-sm font-medium text-indigo-200/80"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Login Form */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="glass-card rounded-3xl p-8 md:p-10 border border-white/5">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">Welcome back</h2>
                <p className="text-sm text-muted-foreground mt-2">Enter your credentials to access your account</p>
              </div>

              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mb-6 bg-red-500/10 border border-red-500/20 text-red-200 text-sm px-4 py-3 rounded-xl flex items-center"
                >
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="glass-input w-full px-5 py-3.5 rounded-2xl text-white placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</label>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="glass-input w-full px-5 py-3.5 rounded-2xl text-white placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 text-sm tracking-wide"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>New to ChatConnect? <button onClick={() => navigate('/signup')} className="text-primary hover:text-primary/80 font-semibold hover:underline transition-all">Create an account</button></p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Loginpage;
