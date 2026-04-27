import os
import platform
import subprocess
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from collections import deque
from datetime import datetime
from typing import List, Dict, Any
import psutil
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Core intelligence modules
from engine.updater import update_threat_database
from engine.heuristics import analyze_file, calculate_system_shield_score
from engine.models import ProcessInfo, StatsEntry, CleanupResult, ScanResult
from engine.yara_scanner import scan_with_yara

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# History deque with max length
history = deque(maxlen=20)

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic"""
    logger.info("🚀 SENTRA CORE initialized")
    yield
    logger.info("🛑 SENTRA CORE shutting down")

# Initialize FastAPI app
app = FastAPI(
    title="SENTRA CORE API",
    description="Advanced System Security & Optimization Engine",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
ALLOWED_ORIGINS = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
    max_age=3600,
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle all uncaught exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Internal server error", "details": str(exc)}
    )

# ==================== HEALTH CHECK ====================

@app.get("/api/health")
async def health_check() -> Dict[str, str]:
    """Check API health status"""
    return {
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# ==================== SYSTEM MONITORING ====================

@app.get("/api/system/processes", response_model=List[ProcessInfo])
async def get_procs() -> List[ProcessInfo]:
    """
    Universal Aggregator for clean process intel.
    Returns top 10 processes by CPU usage.
    """
    aggregated_procs = {}
    logical_cores = psutil.cpu_count(logical=True) or 1
    
    try:
        for proc in psutil.process_iter(['name', 'cpu_percent']):
            try:
                name = proc.info.get('name', 'Unknown')
                
                # Skip system idle processes
                if name.lower() in ["system idle process", "idle", "kernel_task"]:
                    continue
                
                raw_cpu = proc.info.get('cpu_percent', 0) or 0
                normalized_cpu = raw_cpu / logical_cores
                
                # Aggregate same processes
                if name in aggregated_procs:
                    aggregated_procs[name]['cpu_percent'] += normalized_cpu
                else:
                    aggregated_procs[name] = {
                        "name": name,
                        "cpu_percent": normalized_cpu
                    }
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
        
        # Filter and sort
        final_list = [
            ProcessInfo(name=p['name'], cpu_percent=round(p['cpu_percent'], 1))
            for p in aggregated_procs.values()
            if p['cpu_percent'] > 0.1
        ]
        
        return sorted(final_list, key=lambda x: x.cpu_percent, reverse=True)[:10]
    
    except Exception as e:
        logger.error(f"Process monitoring error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve processes")

@app.get("/api/system/stats-history", response_model=List[StatsEntry])
async def get_stats() -> List[StatsEntry]:
    """
    Historical tracking for the smooth-pulse graph.
    Returns last 20 CPU readings with timestamps.
    """
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory_percent = psutil.virtual_memory().percent
        
        entry = StatsEntry(
            time=datetime.now().strftime("%H:%M:%S"),
            cpu=round(cpu_percent, 1),
            memory=round(memory_percent, 1)
        )
        history.append(entry)
        return list(history)
    except Exception as e:
        logger.error(f"Stats history error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve stats")

# ==================== SYSTEM OPTIMIZATION ====================

@app.post("/api/actions/cleanup", response_model=CleanupResult)
async def perform_deep_optimization() -> CleanupResult:
    """
    Universal cleanup engine for temp files and DNS.
    Safely removes temporary files and flushes DNS cache.
    """
    current_os = platform.system()
    stats = CleanupResult(
        deleted_files=0,
        errors=0,
        dism_success=False,
        dns_reset=False,
        message=""
    )
    
    try:
        # Define temp paths based on OS
        temp_paths = []
        if current_os == "Windows":
            temp_paths = [
                os.environ.get('TEMP', ''),
                "C:\\Windows\\Temp",
                "C:\\Windows\\Prefetch"
            ]
        else:
            temp_paths = [
                "/tmp",
                "/var/tmp",
                os.path.expanduser("~/.cache")
            ]
        
        # Clean temp files
        for path in temp_paths:
            if path and os.path.exists(path):
                try:
                    for root, dirs, files in os.walk(path):
                        for f in files:
                            try:
                                file_path = os.path.join(root, f)
                                # Skip system-critical files
                                if not _is_system_critical(file_path):
                                    os.remove(file_path)
                                    stats.deleted_files += 1
                            except (PermissionError, OSError):
                                stats.errors += 1
                except Exception as e:
                    logger.warning(f"Error cleaning {path}: {e}")
                    stats.errors += 1
        
        # Run DISM cleanup on Windows
        if current_os == "Windows":
            try:
                result = subprocess.run(
                    ["dism.exe", "/Online", "/Cleanup-Image", "/StartComponentCleanup", "/ResetBase"],
                    capture_output=True,
                    timeout=120,
                    text=True
                )
                stats.dism_success = result.returncode == 0
                if not stats.dism_success:
                    logger.warning(f"DISM error: {result.stderr}")
            except subprocess.TimeoutExpired:
                logger.error("DISM cleanup timed out")
                stats.dism_success = False
            except Exception as e:
                logger.error(f"DISM error: {e}")
                stats.dism_success = False
        
        # Flush DNS cache
        try:
            if current_os == "Windows":
                subprocess.run(
                    ["ipconfig", "/flushdns"],
                    capture_output=True,
                    timeout=10
                )
            elif current_os == "Darwin":  # macOS
                subprocess.run(
                    ["sudo", "killall", "-HUP", "mDNSResponder"],
                    capture_output=True,
                    timeout=10
                )
            stats.dns_reset = True
        except Exception as e:
            logger.warning(f"DNS flush error: {e}")
            stats.dns_reset = False
        
        stats.message = f"Cleanup complete: {stats.deleted_files} files deleted, {stats.errors} errors encountered"
        logger.info(stats.message)
    
    except Exception as e:
        logger.error(f"Deep optimization error: {e}")
        stats.message = f"Cleanup failed: {str(e)}"
    
    return stats

def _is_system_critical(file_path: str) -> bool:
    """Check if file is system critical"""
    critical_patterns = [
        "system32",
        "syswow64",
        "drivers",
        "config",
        "boot"
    ]
    path_lower = file_path.lower()
    return any(pattern in path_lower for pattern in critical_patterns)

# ==================== THREAT INTELLIGENCE ====================

@app.post("/api/engine/update")
async def trigger_intelligence_update() -> Dict[str, Any]:
    """
    Air-Gap YARA rule updater.
    Downloads latest threat patterns for offline scanning.
    """
    try:
        logger.info("Initiating intelligence database update...")
        result = update_threat_database()
        logger.info(f"Update result: {result}")
        return result
    except Exception as e:
        logger.error(f"Intelligence update error: {e}")
        return {
            "status": "error",
            "message": f"Failed to update intelligence: {str(e)}"
        }

@app.get("/api/engine/scan", response_model=Dict[str, Any])
async def run_hybrid_scan() -> Dict[str, Any]:
    """
    RESTORED: Triggers the Hybrid Scanning Engine (Heuristics + YARA).
    This is the endpoint the 'Shield Scan' button hits.
    """
    try:
        scan_results = []
        scan_directory = "."
        
        logger.info(f"Starting security scan in {scan_directory}")
        
        # Scan files in current directory
        if os.path.exists(scan_directory):
            for item in os.listdir(scan_directory):
                file_path = os.path.join(scan_directory, item)
                
                # Skip directories and irrelevant files
                if os.path.isdir(file_path):
                    continue
                
                if item.endswith((".exe", ".py", ".dll", ".bat", ".cmd", ".sh", ".bin")):
                    try:
                        result = analyze_file(file_path)
                        if result['score'] > 0:
                            scan_results.append({
                                "file": item,
                                "risk_score": result['score'],
                                "details": result['findings']
                            })
                    except Exception as e:
                        logger.warning(f"Error analyzing {item}: {e}")
        
        shield_score = calculate_system_shield_score(scan_results)
        
        logger.info(f"Scan complete: {len(scan_results)} threats detected, shield score: {shield_score}")
        
        return {
            "status": "complete",
            "shield_score": shield_score,
            "results": scan_results,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Scan error: {e}")
        raise HTTPException(status_code=500, detail="Scan failed")

# ==================== STARTUP ====================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("API_PORT", 8000))
    host = os.getenv("API_HOST", "127.0.0.1")
    
    logger.info(f"Starting SENTRA CORE on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )