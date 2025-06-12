import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import logo from '../../assets/gruglogo.png';

const Home = () => {
    return (
        <div className="home-container">
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-header">
                        <img src={logo} alt="Drug logo" className="hero-logo" />
                        <h1>Drug Inventory & Supply Chain Tracking</h1>
                    </div>
                    <p className="hero-description">
                        Streamline your pharmaceutical inventory management with our 
                        advanced tracking system. Monitor stock levels, predict demand, 
                        and optimize your supply chain with ML-powered insights.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/inventory" className="primary-button">
                            View Inventory
                        </Link>
                        <Link to="/upload" className="secondary-button">
                            Add New Drug
                        </Link>
                    </div>
                </div>
                <div className="hero-stats">
                    <div className="stat-card">
                        <h3>Total Drugs</h3>
                        <p className="stat-number">500+</p>
                        <p className="stat-description">Unique medications</p>
                    </div>
                    <div className="stat-card">
                        <h3>Suppliers</h3>
                        <p className="stat-number">50+</p>
                        <p className="stat-description">Trusted partners</p>
                    </div>
                    <div className="stat-card">
                        <h3>Accuracy</h3>
                        <p className="stat-number">70%</p>
                        <p className="stat-description">Tracking precision</p>
                    </div>
                </div>
            </div>
            <div className="features-section">
                <h2>Key Features</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Real-time Tracking</h3>
                        <p>Monitor your inventory levels in real-time with automated updates</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3>Smart Search</h3>
                        <p>Find any drug instantly with our intelligent search system</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📈</div>
                        <h3>ML Predictions</h3>
                        <p>Predict demand and optimize stock levels using machine learning</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Quick Actions</h3>
                        <p>Perform common tasks with one-click actions</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home; 