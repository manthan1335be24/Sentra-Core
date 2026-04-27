# SENTRA CORE - Advanced System Security & Optimization Engine

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-Production%20Ready-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

## 🎯 Overview

SENTRA CORE is a sophisticated cybersecurity and system optimization platform featuring:
- **Real-time Process Monitoring** - Live CPU tracking and aggregation
- **Advanced Threat Detection** - Heuristic & entropy-based file analysis
- **System Health Gauge** - Visual shield score (0-100%)
- **Intelligent Cleanup** - Temp files & DNS cache management
- **Intelligence Updates** - YARA rule database updates
- **Multi-Theme Interface** - 4 customizable color schemes
- **Production-Ready** - Comprehensive error handling & logging

---

## 📋 Requirements

### Backend
- Python 3.9+
- pip (Python package manager)

### Frontend
- Node.js 18+
- npm or yarn

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Create environment file
cp backend/.env.example backend/.env  # if exists, otherwise create manually

# Run backend
python backend/main.py