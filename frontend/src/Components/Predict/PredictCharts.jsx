import React from 'react';
import './Predict.css';

const PredictCharts = ({ predictions }) => {
    // Add error boundary
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        if (hasError) {
            console.error('Error in PredictCharts component');
        }
    }, [hasError]);

    const formatDate = (dateString) => {
        try {
            // Expected format: YYYY-MM-DD
            const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
            const date = new Date(year, month - 1, day); // month is 0-based in JS
            return date.toLocaleString('default', { 
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString; // Return original string if parsing fails
        }
    };

    if (hasError) {
        return (
            <div className="error-container">
                <h3>Something went wrong displaying the data.</h3>
                <button onClick={() => setHasError(false)}>Try Again</button>
            </div>
        );
    }

    try {
        if (!predictions) {
            return (
                <div className="charts-container">
                    <p>No data available to display.</p>
                </div>
            );
        }

        const prediction = predictions[0];
        const confidence = prediction.confidence || 0.85; // Default confidence if not provided

        return (
            <div className="charts-container">
                {predictions && predictions.length > 0 && (
                    <div className="chart-section">
                        <h2>Prediction Results</h2>
                        <div className="prediction-cards">
                            <div className="prediction-card main-prediction">
                                <div className="prediction-header">
                                    <h3>Demand Forecast</h3>
                                    <div className="confidence-indicator">
                                        <div 
                                            className="confidence-bar"
                                            style={{ width: `${confidence * 100}%` }}
                                        />
                                        <span className="confidence-text">
                                            {(confidence * 100).toFixed(1)}% Confidence
                                        </span>
                                    </div>
                                </div>
                                <div className="prediction-details">
                                    <div className="prediction-stat">
                                        <span className="stat-label">Predicted Demand</span>
                                        <span className="stat-value">{Math.round(prediction.predicted_quantity)} units</span>
                                    </div>
                                    <div className="prediction-stat">
                                        <span className="stat-label">Daily Average</span>
                                        <span className="stat-value">{prediction.average_daily?.toFixed(2) || 'N/A'} units/day</span>
                                    </div>
                                    <div className="prediction-stat">
                                        <span className="stat-label">Prediction Period</span>
                                        <span className="stat-value">{prediction.days} days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('Error rendering PredictCharts:', error);
        setHasError(true);
        return null;
    }
};

export default PredictCharts; 