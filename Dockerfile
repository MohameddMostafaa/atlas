FROM python:3.14-slim

WORKDIR /app

COPY app/backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app/backend .

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
