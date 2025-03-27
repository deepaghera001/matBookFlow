import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bg from '../assets/leafbackgorun.svg'; // Adjust path as needed
import logo from '../assets/logo.svg'; // Adjust path as needed
import { useAuthStore } from '../store/authStore';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn(email, password);
    if (!error) {
      navigate('/workflows');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="bg-black/50 w-screen h-screen flex">
        <div className="flex w-full rounded-lg">
          <div className="hidden md:flex w-1/2 bg-transparent items-center justify-center p-8">
            <div className="text-center">
              <img src={logo} alt="HighBridge" className="h-12 mb-4 mx-auto" />
              <h2 className="text-2xl text-white font-semibold">Building the Future...</h2>
              <p className="mt-2 text-white">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>
          <div className="w-full max-w-[500px] bg-white md:w-1/2 p-8 mt-[200px] rounded-xl ">
          <h1 className="text-left text-1xl font-bold text-gray-900 mb-6">
              Welcom back
            </h1>
            <h3 className="text-left text-2xl font-bold text-gray-900 mb-6">
              Log In to your Account
            </h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <div className="flex justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" /> Remember me
                </label>
                <Link to="/forgot-password" className="text-indigo-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                {loading ? 'Signing in...' : 'Log In'}
              </button>
            </form>
            <div className="text-center mt-4">
              <p className="text-gray-600">Or log in with</p>
              <div className="flex justify-center gap-4 mt-2">
                <button className="p-2 bg-gray-200 rounded-lg">Google</button>
                <button className="p-2 bg-gray-200 rounded-lg">Facebook</button>
                <button className="p-2 bg-gray-200 rounded-lg">Apple</button>
              </div>
            </div>
            <p className="text-center mt-6 text-sm">
              New User?{' '}
              <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                SIGN UP HERE
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;