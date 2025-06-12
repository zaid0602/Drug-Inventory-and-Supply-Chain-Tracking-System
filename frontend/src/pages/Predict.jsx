import React, { useState, useEffect } from 'react';
import { mlAPI } from '../services/api';

const Predict = () => {
    const [drugTypes, setDrugTypes] = useState([]);
    const [modelInfo, setModelInfo] = useState(null);
    const [selectedDrug, setSelectedDrug] = useState('');
    const [stockLevel, setStockLevel] = useState(100);
    const [days, setDays] = useState(30);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [types, info] = await Promise.all([
                    mlAPI.getDrugTypes(),
                    mlAPI.getModelInfo()
                ]);
                setDrugTypes(types);
                setModelInfo(info);
            } catch (err) {
                console.error('Error fetching initial data:', err);
                setError('Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handlePredict = async () => {
        if (!selectedDrug) {
            setError('Please select a drug type');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const result = await mlAPI.predictForecast({
                drug_type: selectedDrug,
                month: new Date().toISOString().slice(0, 7), // Current month in YYYY-MM format
                days: days,
                stock_level: stockLevel
            });
            setForecast(result);
        } catch (err) {
            console.error('Error making prediction:', err);
            setError('Failed to make prediction. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="predict-container">
            <h1>Drug Demand Prediction</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="model-info">
                {modelInfo && (
                    <>
                        <h2>Model Information</h2>
                        <p>Model Type: {modelInfo.model_type}</p>
                        <div className="feature-importance">
                            <h3>Feature Importance</h3>
                            <ul>
                                {modelInfo.feature_importance.map((feature, index) => (
                                    <li key={index}>
                                        {feature.name}: {feature.importance.toFixed(2)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}
            </div>

            <div className="prediction-form">
                <div className="form-group">
                    <label htmlFor="drugType">Drug Type:</label>
                    <select 
                        id="drugType"
                        value={selectedDrug} 
                        onChange={(e) => setSelectedDrug(e.target.value)}
                    >
                        <option value="">Select Drug Type</option>
                        {drugTypes.map(type => (
                            <option key={type.code} value={type.code}>
                                {type.name} ({type.code})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="stockLevel">Current Stock Level:</label>
                    <input
                        id="stockLevel"
                        type="number"
                        value={stockLevel}
                        onChange={(e) => setStockLevel(Number(e.target.value))}
                        min="1"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="days">Forecast Days:</label>
                    <input
                        id="days"
                        type="number"
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        min="1"
                        max="90"
                    />
                </div>

                <button 
                    onClick={handlePredict} 
                    disabled={!selectedDrug || loading}
                    className="predict-button"
                >
                    {loading ? 'Predicting...' : 'Predict Demand'}
                </button>
            </div>

            {forecast && (
                <div className="forecast-results">
                    <h2>Prediction Results</h2>
                    <div className="result-item">
                        <span className="label">Predicted Quantity:</span>
                        <span className="value">{forecast.predicted_quantity}</span>
                    </div>
                    <div className="result-item">
                        <span className="label">Confidence:</span>
                        <span className="value">{(forecast.confidence * 100).toFixed(2)}%</span>
                    </div>
                    <div className="result-item">
                        <span className="label">Average Daily Demand:</span>
                        <span className="value">{forecast.average_daily.toFixed(2)}</span>
                    </div>
                    <div className="result-item">
                        <span className="label">Date:</span>
                        <span className="value">{forecast.date}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Predict; 