import React, { useState } from 'react';
import { Link } from 'react-router';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../hooks/useAuth';

const ForgotPassword = () => {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { showToast } = useToast();
    const { handleForgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const response = await handleForgotPassword({ identifier });

            showToast(response?.message || 'Reset link sent successfully!', 'success');
            setIsSubmitted(true);
        } catch (err) {
            showToast(err?.message || 'Failed to send reset link.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="auth-header">
                <h2>Forgot Password</h2>
                <p>Enter your email address or username and we'll send you a link to reset your password.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="identifier">Email Address or Username</label>
                    <input
                        type="text"
                        id="identifier"
                        name="identifier"
                        placeholder="you@example.com or username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
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
