import React, { useState, useEffect } from 'react';
import { mlAPI } from '../../services/api';
import PredictCharts from './PredictCharts';
import './Predict.css';

const Predict = () => {
    const [formData, setFormData] = useState({
        drugType: '',
        date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        days: '30',
        stockLevel: '100'
    });
    const [drugTypes, setDrugTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [predictions, setPredictions] = useState(null);

    useEffect(() => {
        console.log('Predict component mounted');
        fetchDrugTypes();
    }, []);

    const fetchDrugTypes = async () => {
        try {
            console.log('Fetching drug types...');
            const response = await mlAPI.getDrugTypes();
            console.log('Drug types response:', response);
            setDrugTypes(response);
        } catch (err) {
            console.error('Error fetching drug types:', err);
            setError('Failed to load drug types. Please try again later.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log('Form field changed:', name, value);
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPredictions(null);

        try {
            console.log('Submitting prediction request...');
            const requestData = {
                drug_type: formData.drugType,
                date: formData.date,
                days: parseInt(formData.days),
                stock_level: parseInt(formData.stockLevel)
            };
            console.log('Request data:', requestData);

            const response = await mlAPI.predictForecast(requestData);
            console.log('Prediction response:', response);
            
            // Format prediction data for charts
            const predictionData = {
                ...response,
                date: new Date(response.date + '-01').toLocaleString('default', { 
                    month: 'short',
                    year: 'numeric'
                })
            };
            
            setPredictions([predictionData]);
        } catch (err) {
            console.error('Error making prediction:', err);
            setError('Failed to generate prediction. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    console.log('Render state:', {
        drugTypes,
        predictions,
        loading,
        error
    });

    return (
        <div className="predict-container">
            <h1>Drug Demand Prediction</h1>
            <div className="content-wrapper">
                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="drugType">Drug Type</label>
                            <select
                                id="drugType"
                                name="drugType"
                                value={formData.drugType}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            >
                                <option value="">Select a drug type</option>
                                {drugTypes.map((drug) => (
                                    <option key={drug.code} value={drug.code}>
                                        {drug.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="date">Prediction Date</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="days">Prediction Period (Days)</label>
                            <select
                                id="days"
                                name="days"
                                value={formData.days}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            >
                                <option value="30">30 Days</option>
                                <option value="60">60 Days</option>
                                <option value="90">90 Days</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="stockLevel">Stock Level</label>
                            <input
                                type="number"
                                id="stockLevel"
                                name="stockLevel"
                                value={formData.stockLevel}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                min="1"
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading ? 'Generating Prediction...' : 'Generate Prediction'}
                        </button>
                    </form>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                </div>

                {predictions && (
                    <div className="results-container">
                        <PredictCharts predictions={predictions} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Predict;