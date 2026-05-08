FROM python:3.11-slim

# Install system dependencies for VPN and SNMP
RUN apt-get update && apt-get install -y \
    openfortivpn \
    openvpn \
    wireguard-tools \
    iproute2 \
    procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure scripts are executable
RUN chmod +x /app/app/main.py

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
