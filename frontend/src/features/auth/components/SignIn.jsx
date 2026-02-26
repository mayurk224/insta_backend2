import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../hooks/useAuth';

const SignIn = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const { showToast } = useToast();
  const { loading, handleSignIn } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await handleSignIn(formData);

      showToast(response.message || 'Signed in successfully!', 'success');

    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Sign in failed. Please try again.', 'error');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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

        <div className="forgot-password-div">
          <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
        </div>

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