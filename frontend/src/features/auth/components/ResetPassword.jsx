import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        const token = searchParams.get('token');
        if (!token) {
            showToast("Invalid or missing reset token", "error");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3000/api/auth/reset-password', {
                token,
                newPassword: formData.password
            });

            showToast(response.data.message || 'Password reset successfully!', 'success');
            setIsSubmitted(true);

            setTimeout(() => {
                navigate('/sign-in');
            }, 3000);

        } catch (err) {
            showToast(err.response?.data?.message || err.message || 'Failed to reset password.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="auth-header">
                <h2>Set New Password</h2>
                <p>Please enter your new password below.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="password">New Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter new password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        aria-required="true"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        aria-required="true"
                    />
                </div>

                <button type="submit" className="auth-button" disabled={loading || isSubmitted}>
                    {loading ? 'Resetting...' : isSubmitted ? 'Password Reset' : 'Reset Password'}
                </button>
            </form>

            <div className="auth-links">
                Remember your password? <Link to="/sign-in">Log in</Link>
            </div>
        </>
    );
};

export default ResetPassword;
