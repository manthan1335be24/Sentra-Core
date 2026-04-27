"""Intelligence database updater module"""
import requests
import os
import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

RULES_URL = os.getenv(
    "YARA_RULES_URL",
    "https://raw.githubusercontent.com/YARA-Rules/rules/master/malware/MALW_Active.yar"
)
RULES_PATH = os.getenv("RULES_PATH", "backend/engine/rules/active_threats.yar")

def update_threat_database() -> Dict[str, Any]:
    """
    Fetches latest YARA patterns for offline scanning.
    Creates rules directory if it doesn't exist.
    """
    try:
        logger.info(f"Fetching threat database from {RULES_URL}")
        
        # Create rules directory if needed
        rules_dir = os.path.dirname(RULES_PATH)
        os.makedirs(rules_dir, exist_ok=True)
        
        # Fetch rules with timeout
        response = requests.get(RULES_URL, timeout=15)
        
        if response.status_code == 200:
            # Write rules to file
            with open(RULES_PATH, "w", encoding="utf-8") as f:
                f.write(response.text)
            
            rules_count = response.text.count("rule ")
            
            logger.info(f"Intelligence database updated successfully. Rules: {rules_count}")
            
            return {
                "status": "success",
                "message": f"Intelligence updated successfully. {rules_count} rules loaded.",
                "rules_updated": rules_count,
                "timestamp": datetime.now().isoformat(),
                "path": RULES_PATH
            }
        else:
            error_msg = f"Source connection failed: HTTP {response.status_code}"
            logger.error(error_msg)
            return {
                "status": "failed",
                "message": error_msg,
                "timestamp": datetime.now().isoformat()
            }
    
    except requests.exceptions.Timeout:
        error_msg = "Request timeout: YARA rules server not responding"
        logger.error(error_msg)
        return {
            "status": "error",
            "message": error_msg,
            "timestamp": datetime.now().isoformat()
        }
    
    except requests.exceptions.ConnectionError as e:
        error_msg = f"Connection error: Unable to reach rules server - {str(e)}"
        logger.error(error_msg)
        return {
            "status": "error",
            "message": error_msg,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        error_msg = f"Update error: {str(e)}"
        logger.error(error_msg)
        return {
            "status": "error",
            "message": error_msg,
            "timestamp": datetime.now().isoformat()
        }

def get_rules_path() -> str:
    """Get the path to YARA rules file"""
    return RULES_PATH

def rules_exist() -> bool:
    """Check if YARA rules exist locally"""
    return os.path.exists(RULES_PATH) and os.path.getsize(RULES_PATH) > 0