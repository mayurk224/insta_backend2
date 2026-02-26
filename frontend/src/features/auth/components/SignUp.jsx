import React, { useState } from 'react';
import { Link } from 'react-router';
import { useToast } from '../../../context/ToastContext';
import '../styles/auth.scss';
import { useAuth } from '../hooks/useAuth';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useToast();
  const { loading, handleSignUp } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await handleSignUp(formData);

      showToast(response.message || 'Account created successfully!', 'success');
      setIsSubmitted(true);

    } catch (err) {
      showToast(err.message || 'Signup failed. Please try again.', 'error');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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

        <button type="submit" className="auth-button" disabled={loading || isSubmitted}>
          {loading ? 'Signing Up...' : isSubmitted ? 'Account Created' : 'Sign Up'}
        </button>
      </form>

      <div className="auth-links">
        Already have an account? <Link to="/sign-in">Log in</Link>
      </div>
    </>
  );
};

export default SignUp;