import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import GradientBoostingRegressor
import joblib
import logging
import os
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('model_training.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

DRUG_TYPES = ['M01AB', 'M01AE', 'N02BA', 'N02BE', 'N05B', 'N05C', 'R03', 'R06']

def load_and_preprocess_data():
    try:
        logger.info("Loading datasets...")
        
        # Load all datasets
        hourly_df = pd.read_csv('saleshourly.csv')
        daily_df = pd.read_csv('salesdaily.csv')
        weekly_df = pd.read_csv('salesweekly.csv')
        monthly_df = pd.read_csv('salesmonthly.csv')
        
        logger.info(f"Hourly data shape: {hourly_df.shape}")
        logger.info(f"Daily data shape: {daily_df.shape}")
        logger.info(f"Weekly data shape: {weekly_df.shape}")
        logger.info(f"Monthly data shape: {monthly_df.shape}")
        
        # Convert date columns and add features
        for df in [hourly_df, daily_df, weekly_df, monthly_df]:
            if 'datum' in df.columns:
                df['datum'] = pd.to_datetime(df['datum'])
                df['year'] = df['datum'].dt.year
                df['month'] = df['datum'].dt.month
                df['day'] = df['datum'].dt.day
                df['quarter'] = df['datum'].dt.quarter
                df['day_of_year'] = df['datum'].dt.dayofyear
                df['is_weekend'] = df['datum'].dt.dayofweek >= 5
                df['season'] = pd.cut(df['datum'].dt.month, bins=[0, 3, 6, 9, 12], labels=['Winter', 'Spring', 'Summer', 'Fall'])
        
        # Combine datasets
        combined_df = pd.concat([
            hourly_df.assign(time_period='hourly'),
            daily_df.assign(time_period='daily'),
            weekly_df.assign(time_period='weekly'),
            monthly_df.assign(time_period='monthly')
        ], ignore_index=True)
        
        # Convert numeric columns
        numeric_columns = ['Year', 'Month', 'Hour', 'quarter', 'day_of_year']
        for col in numeric_columns:
            if col in combined_df.columns:
                combined_df[col] = pd.to_numeric(combined_df[col], errors='coerce')
        
        # Handle missing values for numeric columns only
        numeric_df = combined_df[numeric_columns].fillna(combined_df[numeric_columns].mean())
        combined_df[numeric_columns] = numeric_df
        
        # Convert boolean columns
        combined_df['is_weekend'] = combined_df['is_weekend'].astype(float)
        
        # Select features
        features = numeric_columns + ['is_weekend']
        
        # Prepare X and y
        X = combined_df[features]
        y = combined_df[DRUG_TYPES]  # Using all drug types as targets
        
        logger.info(f"Combined dataset shape: {combined_df.shape}")
        logger.info(f"Features: {features}")
        logger.info(f"Target shape: {y.shape}")
        
        return X, y
        
    except Exception as e:
        logger.error(f"Error loading and preprocessing data: {str(e)}", exc_info=True)
        raise

def train_model(X, y):
    try:
        logger.info("Starting model training...")
        
        # Create preprocessing pipeline
        numeric_features = X.columns
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numeric_features)
            ]
        )
        
        # Create base model
        base_model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=4,
            random_state=42
        )
        
        # Create multi-output model
        multi_model = MultiOutputRegressor(base_model)
        
        # Create model pipeline
        pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('model', multi_model)
        ])
        
        # Train model
        logger.info("Fitting model...")
        pipeline.fit(X, y)
        
        # Save model and preprocessor
        os.makedirs('models', exist_ok=True)
        
        logger.info("Saving model...")
        joblib.dump(pipeline, 'models/best_model_combined.pkl')
        
        logger.info("Model saved successfully")
        return pipeline
        
    except Exception as e:
        logger.error(f"Error training model: {str(e)}", exc_info=True)
        raise

def evaluate_model(model, X, y):
    try:
        logger.info("Evaluating model...")
        
        # Make predictions
        y_pred = model.predict(X)
        
        # Calculate metrics for each drug type
        for i, drug_type in enumerate(DRUG_TYPES):
            mse = np.mean((y.iloc[:, i] - y_pred[:, i]) ** 2)
            mae = np.mean(np.abs(y.iloc[:, i] - y_pred[:, i]))
            r2 = model.score(X, y.iloc[:, i])
            
            logger.info(f"\nMetrics for {drug_type}:")
            logger.info(f"Mean Squared Error: {mse:.4f}")
            logger.info(f"Mean Absolute Error: {mae:.4f}")
            logger.info(f"R2 Score: {r2:.4f}")
        
    except Exception as e:
        logger.error(f"Error evaluating model: {str(e)}", exc_info=True)
        raise

if __name__ == '__main__':
    try:
        # Load and preprocess data
        X, y = load_and_preprocess_data()
        
        # Train model
        model = train_model(X, y)
        
        # Evaluate model
        evaluate_model(model, X, y)
        
        logger.info("Training completed successfully")
        
    except Exception as e:
        logger.error(f"Error in main execution: {str(e)}", exc_info=True)
        raise 