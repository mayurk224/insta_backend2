import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';
import '../styles/auth.scss';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/sign-up', formData);

      showToast(response.data.message || 'Account created successfully!', 'success');

      setTimeout(() => {
        navigate('/sign-in');
      }, 3000);

    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Signup failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-header">
        <h2>Create an Account</h2>
        <p>Join us today! Please fill in your details below.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="John Doe"
            value={formData.username}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      <div className="auth-links">
        Already have an account? <a href="/sign-in">Log in</a>
      </div>
    </>
  );
};

export default SignUp;