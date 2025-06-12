import joblib
import os
import numpy as np

def inspect_model():
    try:
        # Load the model
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'best_model_combined.pkl')
        model = joblib.load(model_path)
        
        # Print model information
        print("Model type:", type(model))
        
        # If it's a pipeline, print steps
        if hasattr(model, 'steps'):
            print("\nPipeline steps:")
            for name, step in model.steps:
                print(f"- {name}: {type(step)}")
        
        # Try to get feature names
        try:
            if hasattr(model, 'feature_names_in_'):
                print("\nFeature names:")
                print(model.feature_names_in_)
            elif hasattr(model, 'named_steps') and hasattr(model.named_steps.get('preprocessor', None), 'get_feature_names_out'):
                print("\nFeature names from preprocessor:")
                print(model.named_steps['preprocessor'].get_feature_names_out())
        except Exception as e:
            print(f"Could not get feature names: {str(e)}")
        
        # Test prediction with dummy data
        print("\nTesting prediction with dummy data...")
        dummy_data = {
            'M01AB': [0.0], 'M01AE': [0.0], 'N02BA': [0.0], 'N02BE': [0.0],
            'N05B': [0.0], 'N05C': [0.0], 'R03': [0.0], 'R06': [0.0],
            'Year': [2024.0], 'Month': [3.0], 'Hour': [12.0],
            'quarter': [1.0], 'day_of_year': [1.0], 'is_weekend': [0.0]
        }
        import pandas as pd
        dummy_df = pd.DataFrame(dummy_data)
        prediction = model.predict(dummy_df)
        print("Prediction shape:", prediction.shape)
        print("Prediction type:", type(prediction))
        print("Prediction sample:", prediction)
        
    except Exception as e:
        print(f"Error inspecting model: {str(e)}")

if __name__ == '__main__':
    inspect_model() 