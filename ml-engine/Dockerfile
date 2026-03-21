# ML Engine Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Dependencies install karo
RUN pip install flask flask-cors numpy scikit-learn

# Files copy karo
COPY . .

EXPOSE 5001

CMD ["python3", "predict.py"]