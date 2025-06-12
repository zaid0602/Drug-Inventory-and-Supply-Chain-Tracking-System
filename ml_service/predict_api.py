import logging
from datetime import datetime
import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from joblib import load, dump
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()

# Define expected feature columns
EXPECTED_FEATURES = [
    'm01ab', 'm01ae', 'n02ba', 'n02be', 'n05b', 'n05c', 'r03', 'r06',
    'hour', 'quarter', 'day_of_year', 'fiscal_quarter', 'is_business_hours',
    'year', 'month', 'day', 'is_weekend', 'season', 'time_of_day', 'month_name'
]

class Predictor:
    def __init__(self, model_path=None):
        self.logger = logging.getLogger(__name__)
        self.model = None
        self.scaler = None
        # Use virtual environment directory for models
        venv_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_path = model_path or os.path.join(venv_dir, 'venv', 'models', 'best_model_combined.pkl')
        self.scaler_path = os.path.join(venv_dir, 'venv', 'models', 'scaler.pkl')
        
        try:
            self.load_model()
        except Exception as e:
            self.logger.error(f"Failed to load model: {str(e)}")
            raise

    def load_model(self):
        """Load the model and scaler from disk"""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found at {self.model_path}")
            
        try:
            # Load the model
            self.model = load(self.model_path)
            
            # Try to load the scaler, create a new one if it doesn't exist
            if os.path.exists(self.scaler_path):
                self.scaler = load(self.scaler_path)
                self.logger.info("Successfully loaded existing scaler")
            else:
                self.logger.warning("Scaler file not found. Creating a new default scaler.")
                self.scaler = StandardScaler()
                # Initialize scaler with default range for each feature
                dummy_data = pd.DataFrame(np.random.normal(0, 1, size=(100, len(EXPECTED_FEATURES))), columns=EXPECTED_FEATURES)
                self.scaler.fit(dummy_data)
                # Save the new scaler
                os.makedirs(os.path.dirname(self.scaler_path), exist_ok=True)
                dump(self.scaler, self.scaler_path)
                self.logger.info("Created and saved new default scaler")
                
            self.logger.info("Successfully loaded model and scaler")
        except Exception as e:
            self.logger.error(f"Error loading model or scaler: {str(e)}")
            raise

    def predict(self, input_data):
        """Make predictions using the loaded model"""
        try:
            self.logger.debug(f"Input data received: {input_data}")
            
            # Ensure all required features are present
            processed_data = {}
            for feature in EXPECTED_FEATURES:
                if feature in input_data:
                    processed_data[feature] = float(input_data[feature])
                else:
                    processed_data[feature] = 0.0  # Default value for missing features
            
            # Convert to DataFrame with correct column order
            df = pd.DataFrame([processed_data])[EXPECTED_FEATURES]
            self.logger.debug(f"Processed DataFrame: {df.to_dict('records')}")
            
            # Scale the input data
            try:
                scaled_data = self.scaler.transform(df)
                self.logger.debug(f"Scaled data shape: {scaled_data.shape}")
            except Exception as e:
                self.logger.error(f"Error during scaling: {str(e)}")
                raise ValueError(f"Error scaling input data: {str(e)}")
            
            # Make prediction
            try:
                prediction = self.model.predict(scaled_data)
                confidence = float(self.model.predict_proba(scaled_data).max())
                self.logger.debug(f"Raw prediction: {prediction[0]}, Confidence: {confidence}")
            except Exception as e:
                self.logger.error(f"Error during model prediction: {str(e)}")
                raise ValueError(f"Error making prediction: {str(e)}")
            
            result = {
                'prediction': float(prediction[0]),
                'confidence': confidence
            }
            self.logger.debug(f"Final prediction result: {result}")
            return result
            
        except Exception as e:
            self.logger.error(f"Error in predict method: {str(e)}", exc_info=True)
            raise

    def get_model_info(self):
        """Get information about the loaded model"""
        if self.model is None:
            raise ValueError("Model not loaded")
            
        return {
            'model_type': type(self.model).__name__,
            'model_path': self.model_path,
            'scaler_path': self.scaler_path,
            'features': EXPECTED_FEATURES
        }

    def _mock_predict(self, data: dict) -> dict:
        """Make mock predictions when model is not available"""
        prediction = 0.7  # 70% of stock level will be consumed
        confidence = 0.8  # 80% confidence
        
        return {
            'prediction': prediction,
            'confidence': confidence,
            'date': data.get('month', datetime.now().strftime('%Y-%m')),
            'predicted_quantity': int(prediction * float(data.get('stock_level', 100))),
            'average_daily': float(prediction * float(data.get('stock_level', 100)) / float(data.get('days', 30)))
        } 