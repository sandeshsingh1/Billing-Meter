from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app)


def predict_next(values):
    if len(values) < 2:
        return values[-1] if values else 0

    x_values = np.array(range(len(values))).reshape(-1, 1)
    y_values = np.array(values)

    model = LinearRegression()
    model.fit(x_values, y_values)

    next_month = np.array([[len(values)]])
    prediction = model.predict(next_month)[0]

    return max(0, round(prediction, 2))


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        storage_history = data.get('storageHistory', [])
        api_calls_history = data.get('apiCallsHistory', [])
        bandwidth_history = data.get('bandwidthHistory', [])

        predicted_storage = predict_next(storage_history)
        predicted_api_calls = predict_next(api_calls_history)
        predicted_bandwidth = predict_next(bandwidth_history)

        predicted_cost = (
            predicted_storage * 0.023 +
            (predicted_api_calls / 10000) * 0.004 +
            predicted_bandwidth * 0.09
        )

        return jsonify({
            'success': True,
            'predictions': {
                'storageGB': predicted_storage,
                'apiCalls': predicted_api_calls,
                'bandwidthGB': predicted_bandwidth,
                'estimatedCost': round(predicted_cost, 2)
            }
        })
    except Exception as error:
        return jsonify({'error': str(error)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK', 'engine': 'ML Forecasting v1.0'})


if __name__ == '__main__':
    port = int(os.getenv('PORT', '5001'))
    print(f'ML Forecasting Engine running on port {port}')
    app.run(host='0.0.0.0', port=port, debug=False)
