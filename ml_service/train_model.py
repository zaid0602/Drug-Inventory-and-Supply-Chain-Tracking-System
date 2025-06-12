import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import GradientBoostingClassifier
import joblib
import logging
import os

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def train_model():
    try:
        # Create sample training data with correct types
        data = {
            'm01ab': np.zeros(100, dtype=np.float64),
            'm01ae': np.zeros(100, dtype=np.float64),
            'n02ba': np.zeros(100, dtype=np.float64),
            'n02be': np.zeros(100, dtype=np.float64),
            'n05b': np.zeros(100, dtype=np.float64),
            'n05c': np.zeros(100, dtype=np.float64),
            'r03': np.zeros(100, dtype=np.float64),
            'r06': np.zeros(100, dtype=np.float64),
            'hour': np.random.randint(0, 24, 100).astype(np.float64),
            'quarter': np.random.randint(1, 5, 100).astype(np.float64),
            'day_of_year': np.random.randint(1, 366, 100).astype(np.float64),
            'fiscal_quarter': np.random.randint(1, 5, 100).astype(np.float64),
            'is_business_hours': np.random.randint(0, 2, 100).astype(np.float64),
            'year': np.random.randint(2020, 2025, 100).astype(np.float64),
            'month': np.random.randint(1, 13, 100).astype(np.float64),
            'day': np.random.randint(1, 32, 100).astype(np.float64),
            'is_weekend': np.random.randint(0, 2, 100).astype(np.float64),
            'season': np.random.randint(1, 5, 100).astype(np.float64),
            'time_of_day': np.random.randint(0, 4, 100).astype(np.float64),
            'month_name': np.random.randint(0, 12, 100).astype(np.float64)
        }
        
        df = pd.DataFrame(data)
        
        # Create target variable (random for this example)
        y = np.random.randint(0, 2, 100)
        
        # Define numeric features (all features are numeric now)
        numeric_features = list(data.keys())
        
        # Create preprocessing pipeline
        scaler = StandardScaler()
        
        # Fit the scaler and transform the data
        X_scaled = scaler.fit_transform(df)
        
        # Create pipeline with just the model
        pipeline = Pipeline([
            ('model', GradientBoostingClassifier(learning_rate=0.05, max_depth=4, random_state=42, subsample=0.8))
        ])
        
        # Fit pipeline on scaled data
        logger.info("Training model...")
        pipeline.fit(X_scaled, y)
        
        # Create models directory if it doesn't exist
        os.makedirs('models', exist_ok=True)
        
        # Save pipeline and scaler
        logger.info("Saving model...")
        joblib.dump(pipeline, 'models/best_model_combined.pkl')
        
        logger.info("Saving scaler...")
        joblib.dump(scaler, 'models/scaler.pkl')
        
        logger.info("Model and scaler saved successfully")
        
    except Exception as e:
        logger.error(f"Error training model: {str(e)}", exc_info=True)

if __name__ == '__main__':
    train_model() 