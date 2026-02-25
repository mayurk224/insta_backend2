import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';

const SignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/sign-in', {
        identifier: formData.identifier,
        password: formData.password
      }, {
        withCredentials: true
      });

      showToast(response.data.message || 'Signed in successfully!', 'success');

      // Navigate to the user's feed or home page. For now, redirect to `/`
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Sign in failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-header">
        <h2>Welcome Back</h2>
        <p>Log in to your account to continue.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="identifier">Email address or Username</label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            placeholder="you@example.com"
            value={formData.identifier}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>

      <div className="auth-links">
        Don't have an account? <Link to="/sign-up">Sign up</Link>
      </div>
    </>
  );
}

export default SignIn;