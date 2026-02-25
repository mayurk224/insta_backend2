import React, { useState } from 'react';
import { Link } from 'react-router';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3000/api/auth/forgot-password', {
                identifier: email
            });

            showToast(response.data.message || 'Reset link sent successfully!', 'success');
            setIsSubmitted(true);
        } catch (err) {
            showToast(err.response?.data?.message || err.message || 'Failed to send reset link.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="auth-header">
                <h2>Forgot Password</h2>
                <p>Enter your email address and we'll send you a link to reset your password.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        aria-required="true"
                    />
                </div>

                <button type="submit" className="auth-button" disabled={loading || isSubmitted}>
                    {loading ? 'Sending...' : isSubmitted ? 'Link Sent' : 'Send Reset Link'}
                </button>
            </form>

            <div className="auth-links">
                Remember your password? <Link to="/sign-in">Log in</Link>
            </div>
        </>
    );
};

export default ForgotPassword;
