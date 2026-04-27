"""Pydantic models for data validation"""
from pydantic import BaseModel, Field
from typing import List, Optional

class ProcessInfo(BaseModel):
    """Model for process information"""
    name: str
    cpu_percent: float = Field(..., ge=0, le=100)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "python.exe",
                "cpu_percent": 5.2
            }
        }

class StatsEntry(BaseModel):
    """Model for system statistics entry"""
    time: str
    cpu: float = Field(..., ge=0, le=100)
    memory: float = Field(default=0, ge=0, le=100)

    class Config:
        json_schema_extra = {
            "example": {
                "time": "14:30:45",
                "cpu": 25.5,
                "memory": 60.2
            }
        }

class ThreatFinding(BaseModel):
    """Model for individual threat finding"""
    description: str
    severity: int = Field(..., ge=0, le=100)

class ScanResult(BaseModel):
    """Model for individual file scan result"""
    file: str
    risk_score: int = Field(..., ge=0, le=100)
    details: List[str]

    class Config:
        json_schema_extra = {
            "example": {
                "file": "malware.exe",
                "risk_score": 85,
                "details": ["High Entropy detected", "Suspicious location"]
            }
        }

class CleanupResult(BaseModel):
    """Model for cleanup operation results"""
    deleted_files: int = Field(default=0, ge=0)
    errors: int = Field(default=0, ge=0)
    dism_success: bool = Field(default=False)
    dns_reset: bool = Field(default=False)
    message: str = Field(default="")

    class Config:
        json_schema_extra = {
            "example": {
                "deleted_files": 150,
                "errors": 5,
                "dism_success": True,
                "dns_reset": True,
                "message": "Cleanup complete"
            }
        }

class HealthResponse(BaseModel):
    """Model for health check response"""
    status: str
    timestamp: str
    version: str

class IntelligenceUpdate(BaseModel):
    """Model for intelligence update response"""
    status: str
    message: str
    rules_updated: Optional[int] = None
    timestamp: str
    path: Optional[str] = None