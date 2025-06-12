import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Auth.css';

const Auth = ({ setIsAuthenticated }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let response;
            if (isLogin) {
                // Login Logic
                console.log('Attempting login with:', { email: formData.email });
                response = await authAPI.login({
                    email: formData.email,
                    password: formData.password
                });
            } else {
                // Register Logic
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }

                response = await authAPI.register({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    name: formData.name
                });
            }
            
            console.log('Auth response:', response);
            
            if (response && response.user) {
                console.log('Authentication successful:', response);
                // Store user info in localStorage
                localStorage.setItem('user', JSON.stringify(response.user));
                // For now, we'll use a dummy token since the server isn't providing one
                localStorage.setItem('token', 'dummy-token');
                setIsAuthenticated(true);
                console.log('Navigation to /home');
                navigate('/home');
            } else {
                console.error('Invalid response structure:', response);
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Auth error:', error);
            setError(error.response?.data?.error || error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
                    <p>Drug Inventory & Supply Chain Management</p>
                </div>

                {error && (
                    <div className="error-message">
                        {error.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose a username"
                                    minLength="3"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            minLength="6"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            className="switch-auth-button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setFormData({
                                    username: '',
                                    email: '',
                                    password: '',
                                    confirmPassword: '',
                                    name: ''
                                });
                            }}
                        >
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth; 