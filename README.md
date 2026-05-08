# PulseAP — Ruckus AP Monitoring Tool

PulseAP is a production-ready network monitoring web application designed to monitor Ruckus wireless access points (APs) via SNMP. It supports multiple VPN providers, multi-site management, and real-time AP status tracking.

## Features

- **VPN Management**: Support for OpenFortiVPN, OpenVPN, and WireGuard.
- **Controller Management**: Monitor Ruckus SmartZone and ZoneDirector controllers.
- **Site/Zone Tree**: Organize APs by Site and Zone.
- **AP Discovery**: Automatically discover APs via SNMP.
- **Real-time Monitoring**: Periodic polling of AP status (online/offline).
- **Dashboard**: High-level overview of network health with drill-down capabilities.
- **Alerting**: In-app notifications and email alerts for AP status changes.

## Tech Stack

- **Backend**: Python (FastAPI), SQLAlchemy, APScheduler, PySNMP.
- **Frontend**: React, TailwindCSS, Lucide Icons.
- **Database**: Supabase (PostgreSQL).
- **Containerization**: Docker, Docker Compose.

## Prerequisites

- Docker and Docker Compose installed.
- A Supabase account or any PostgreSQL instance.
- VPN configuration files (if using OpenVPN or WireGuard).

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/pulseap.git
   cd pulseap
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and fill in your details.
   ```bash
   cp .env.example .env
   ```
   *Note: Make sure to generate a secure `ENCRYPTION_KEY` for password storage.*

3. **Generate Encryption Key**:
   ```bash
   python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```

4. **Run with Docker Compose**:
   ```bash
   docker-compose up --build -d
   ```

5. **Initialize the database**:
   ```bash
   docker-compose exec backend python -m app.init_db
   ```

6. **Access the application**:
   - Frontend: `http://localhost`
   - Backend API: `http://localhost:8000/docs`

## Initial Configuration

1. **Login**: Use the default admin credentials (configured in your database).
2. **Add VPN Profile**: Go to "VPN Profiles" and add your VPN details.
3. **Add Controller**: Go to "Settings" -> "Controllers" and link it to a VPN profile.
4. **Run Discovery**: Once the VPN is connected, use the discovery tool to sync APs from your Ruckus controller.

## Security

- All passwords and SNMP credentials are encrypted at rest using Fernet symmetric encryption.
- JWT-based authentication for all API endpoints.
- VPN subprocesses run with necessary network capabilities.

## License

Open Source (MIT)
