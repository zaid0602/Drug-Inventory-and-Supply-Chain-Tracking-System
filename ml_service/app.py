import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import logging
from dotenv import load_dotenv
import pandas as pd
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
logger.info("Loading environment variables...")
load_dotenv()

# Initialize Flask app
logger.info("Initializing Flask application...")
app = Flask(__name__)
CORS(app)

# Initialize model and preprocessor
logger.info("Initializing model and preprocessor...")
model_path = os.path.join(os.path.dirname(__file__), 'models', 'best_model_combined.pkl')

try:
    logger.info(f"Loading model from: {model_path}")
    model = joblib.load(model_path)
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error initializing model or preprocessor: {str(e)}")
    raise

# Drug types data with additional information
DRUG_TYPES = [
    { 'code': 'M01AB', 'name': 'Anti-inflammatory and antirheumatic products (Acetic acid derivatives)' },
    { 'code': 'M01AE', 'name': 'Anti-inflammatory and antirheumatic products (Propionic acid derivatives)' },
    { 'code': 'N02BA', 'name': 'Other analgesics and antipyretics (Salicylic acid derivatives)' },
    { 'code': 'N02BE/B', 'name': 'Other analgesics and antipyretics (Pyrazolones and Anilides)' },
    { 'code': 'N05B', 'name': 'Psycholeptics drugs (Anxiolytic)' },
    { 'code': 'N05C', 'name': 'Psycholeptics drugs (Hypnotics and sedatives)' },
    { 'code': 'R03', 'name': 'Drugs for obstructive airway diseases' },
    { 'code': 'R06', 'name': 'Antihistamines for systemic use' }
]

DRUG_TYPE_CODES = [drug['code'].replace('/', '') for drug in DRUG_TYPES]

@app.route('/drugs/types', methods=['GET'])
def get_drug_types():
    try:
        return jsonify(DRUG_TYPES)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/model/info', methods=['GET'])
def get_model_info():
    try:
        # Get feature names from preprocessor
        feature_names = model.named_steps['preprocessor'].get_feature_names_out()
        
        # Get feature importance for each drug type
        importances = []
        for i, drug_type in enumerate(DRUG_TYPE_CODES):
            base_model = model.named_steps['model'].estimators_[i]
            importance = base_model.feature_importances_
            for feat, imp in zip(feature_names, importance):
                importances.append({
                    'name': f"{feat} ({drug_type})",
                    'importance': float(imp)
                })
        
        # Sort by importance
        importances.sort(key=lambda x: x['importance'], reverse=True)
        
        return jsonify({
            'model_type': 'MultiOutput GradientBoostingRegressor',
            'feature_importance': importances[:10]  # Return top 10 most important features
        })
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/predict/forecast', methods=['POST'])
def predict_forecast():
    try:
        data = request.get_json()
        logger.info(f"Received prediction request with data: {data}")
        
        # Validate required fields
        required_fields = ['drug_type', 'date', 'days', 'stock_level']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Prepare the input data for the model
        try:
            # Parse the full date (YYYY-MM-DD)
            try:
                date = datetime.strptime(data['date'], '%Y-%m-%d')
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

            # Calculate end date based on prediction period
            days = int(data['days'])
            end_date = date + timedelta(days=days)
            
            # Create input features for both start and end dates
            dates = [date, end_date]
            predictions_list = []
            
            for current_date in dates:
                input_features = {
                    'Year': float(current_date.year),
                    'Month': float(current_date.month),
                    'Hour': 12.0,  # Default to noon
                    'quarter': float((current_date.month - 1) // 3 + 1),
                    'day_of_year': float(current_date.timetuple().tm_yday),
                    'is_weekend': float(current_date.weekday() >= 5),  # 5 and 6 are Saturday and Sunday
                    'prediction_days': float(days)  # Add prediction period as a feature
                }
                
                # Convert to DataFrame
                input_df = pd.DataFrame([input_features])
                logger.info(f"Prepared input features for {current_date}: {input_features}")
                
                # Make prediction using the model
                prediction = model.predict(input_df)
                predictions_list.append(prediction[0])
            
            # Get the index of the requested drug type
            drug_type = data['drug_type'].upper().replace('/', '')
            try:
                drug_index = DRUG_TYPE_CODES.index(drug_type)
            except ValueError:
                return jsonify({'error': f'Invalid drug type: {data["drug_type"]}'}), 400
            
            # Calculate average prediction between start and end dates
            start_pred = float(predictions_list[0][drug_index])
            end_pred = float(predictions_list[1][drug_index])
            avg_prediction = (start_pred + end_pred) / 2
            
            # Calculate quantities
            stock_level = float(data['stock_level'])
            predicted_quantity = int(avg_prediction * stock_level)
            average_daily = predicted_quantity / days
            
            # Format the response with proper date
            response = {
                'prediction': avg_prediction,
                'date': date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'predicted_quantity': predicted_quantity,
                'average_daily': average_daily,
                'drug_type': drug_type,
                'days': days
            }
            
            logger.info(f"Final response: {response}")
            return jsonify(response)
            
        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}", exc_info=True)
            return jsonify({'error': f'Error making prediction: {str(e)}'}), 500
            
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    try:
        port = int(os.getenv('ML_SERVICE_PORT', 5003))
        logger.info(f"Starting Flask application on port {port}...")
        app.run(host='0.0.0.0', port=port, debug=True)
    except Exception as e:
        logger.error(f"Error starting Flask application: {str(e)}", exc_info=True)
        raise 