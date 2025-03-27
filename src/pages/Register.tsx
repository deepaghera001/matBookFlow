import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bg from '../assets/leafbackgorun.svg'; // Adjust path as needed
import logo from '../assets/logo.svg'; // Adjust path as needed
import { useAuthStore } from '../store/authStore';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(email, password);
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
          <div className="w-full max-w-[500px] bg-white md:w-1/2 p-8 mt-[200px] rounded-xl">
            <h1 className="text-left text-1xl font-bold text-gray-900 mb-6">
              Join Us
            </h1>
            <h3 className="text-left text-2xl font-bold text-gray-900 mb-6">
              Create Your Account
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
            <p className="text-center mt-6 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                Log In Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
