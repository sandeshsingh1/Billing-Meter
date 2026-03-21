# ─────────────────────────────────────
# predict.py — Usage Forecasting Engine
# Linear Regression use karke agla 
# mahina predict karta hai
# ─────────────────────────────────────
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.linear_model import LinearRegression
app = Flask(__name__)
CORS(app)  # React se requests allow karo

# ─────────────────────────────────────
# Helper — Linear Regression se predict karo
# data = [10, 20, 30, 40] → predict 50
# ─────────────────────────────────────
def predict_next(values):
    if len(values) < 2:
        # Data kam hai — last value return karo
        return values[-1] if values else 0
    
    # X = [0, 1, 2, 3...] — mahine ka index
    X = np.array(range(len(values))).reshape(-1, 1)
    
    # Y = actual values
    Y = np.array(values)
    
    # Model train karo
    model = LinearRegression()
    model.fit(X, Y)
    
    # Agla mahina predict karo
    next_month = np.array([[len(values)]])
    prediction = model.predict(next_month)[0]
    
    # Negative nahi hona chahiye
    return max(0, round(prediction, 2))

# ─────────────────────────────────────
# POST /predict
# Body: { storageHistory, apiCallsHistory, bandwidthHistory }
# Returns: next month predictions
# ─────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        # History arrays lo
        storage_history   = data.get('storageHistory',   [])
        api_calls_history = data.get('apiCallsHistory',  [])
        bandwidth_history = data.get('bandwidthHistory', [])

        # Predict karo
        predicted_storage   = predict_next(storage_history)
        predicted_api_calls = predict_next(api_calls_history)
        predicted_bandwidth = predict_next(bandwidth_history)
        
        # AWS pricing se cost predict karo
        predicted_cost = (
            predicted_storage   * 0.023 +
            (predicted_api_calls / 10000) * 0.004 +
            predicted_bandwidth * 0.09
        )
        
        return jsonify({
            'success': True,
            'predictions': {
                'storageGB':   predicted_storage,
                'apiCalls':    predicted_api_calls,
                'bandwidthGB': predicted_bandwidth,
                'estimatedCost': round(predicted_cost, 2)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ─────────────────────────────────────
# GET /health
# ─────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK', 'engine': 'ML Forecasting v1.0'})

if __name__ == '__main__':
    print('🤖 ML Forecasting Engine running on port 5001')
    app.run(host='0.0.0.0', port=5001, debug=True)