import requests
import json
from datetime import datetime
import pandas as pd

BASE_URL = "http://localhost:5003"

def test_drug_types():
    """Test getting available drug types"""
    print("\nTesting GET /drugs/types")
    response = requests.get(f"{BASE_URL}/drugs/types")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        drug_types = response.json()
        print(f"Found {len(drug_types)} drug types:")
        for drug in drug_types:
            print(f"- {drug['code']}: {drug['name']}")
    return response.json() if response.status_code == 200 else None

def test_model_info():
    """Test getting model information"""
    print("\nTesting GET /model/info")
    response = requests.get(f"{BASE_URL}/model/info")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        info = response.json()
        print(f"Model Type: {info['model_type']}")
        print("\nTop 10 Important Features:")
        for feature in info['feature_importance']:
            print(f"- {feature['name']}: {feature['importance']:.4f}")
    return response.json() if response.status_code == 200 else None

def test_prediction(drug_type, month, days, stock_level):
    """Test making a prediction"""
    print(f"\nTesting POST /predict/forecast")
    print(f"Parameters: Drug Type: {drug_type}, Month: {month}, Days: {days}, Stock Level: {stock_level}")
    
    data = {
        "drug_type": drug_type,
        "month": month,
        "days": days,
        "stock_level": stock_level
    }
    
    response = requests.post(f"{BASE_URL}/predict/forecast", json=data)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Raw Prediction: {result['prediction']:.4f}")
        print(f"Predicted Quantity: {result['predicted_quantity']}")
        print(f"Average Daily: {result['average_daily']:.2f}")
    else:
        print(f"Error: {response.json()}")
    return response.json() if response.status_code == 200 else None

def main():
    print("Starting ML Service Tests")
    print("=" * 50)
    
    # Test getting drug types
    drug_types = test_drug_types()
    if not drug_types:
        print("Failed to get drug types. Exiting.")
        return
    
    # Test model info
    model_info = test_model_info()
    if not model_info:
        print("Failed to get model info. Exiting.")
        return
    
    print("\nTesting Predictions")
    print("=" * 50)
    
    # Test cases for different drug types
    test_cases = [
        # Different drug types for same month
        ("M01AB", "2025-06", 30, 100),
        ("N02BA", "2025-06", 30, 100),
        ("R03", "2025-06", 30, 100),
        
        # Different months for same drug type
        ("M01AB", "2025-01", 31, 100),  # Winter
        ("M01AB", "2025-07", 31, 100),  # Summer
        ("M01AB", "2025-12", 31, 100),  # Winter
        
        # Different stock levels
        ("M01AB", "2025-06", 30, 50),   # Low stock
        ("M01AB", "2025-06", 30, 200),  # High stock
        
        # Different days
        ("M01AB", "2025-06", 15, 100),  # Half month
        ("M01AB", "2025-06", 7, 100),   # One week
    ]
    
    results = []
    for drug_type, month, days, stock_level in test_cases:
        result = test_prediction(drug_type, month, days, stock_level)
        if result:
            results.append({
                'drug_type': drug_type,
                'month': month,
                'days': days,
                'stock_level': stock_level,
                'prediction': result['prediction'],
                'predicted_quantity': result['predicted_quantity'],
                'average_daily': result['average_daily']
            })
    
    if results:
        print("\nSummary of Test Results")
        print("=" * 50)
        df = pd.DataFrame(results)
        print(df.to_string(index=False))

if __name__ == "__main__":
    main() 