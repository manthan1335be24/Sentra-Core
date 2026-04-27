"""Heuristic analysis engine for threat detection"""
import math
import os
import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

def calculate_entropy(file_path: str) -> float:
    """
    Calculates the Shannon Entropy of a file to detect packing/encryption.
    Higher entropy suggests packed or encrypted content.
    """
    try:
        with open(file_path, 'rb') as f:
            byte_arr = list(f.read(10000))  # Read first 10KB only
        
        file_size = len(byte_arr)
        if file_size == 0:
            return 0.0

        # Calculate frequency of each byte
        freq_list = [0] * 256
        for b in byte_arr:
            freq_list[b] += 1

        # Calculate entropy
        entropy = 0.0
        for freq in freq_list:
            if freq > 0:
                probability = float(freq) / file_size
                entropy -= probability * math.log(probability, 2)
        
        return entropy
    except Exception as e:
        logger.warning(f"Entropy calculation error for {file_path}: {e}")
        return 0.0

def check_suspicious_sections(file_path: str) -> List[str]:
    """Check for suspicious sections in binary files"""
    findings = []
    
    try:
        with open(file_path, 'rb') as f:
            header = f.read(4)
        
        # Check for PE header (Windows executables)
        if header == b'MZ\x90\x00':
            findings.append("Windows PE executable detected")
        # Check for ELF header (Linux/Unix)
        elif header == b'\x7fELF':
            findings.append("ELF executable detected")
        # Check for Mach-O header (macOS)
        elif header in [b'\xfe\xed\xfa\xce', b'\xfe\xed\xfa\xcf', b'\xce\xfa\xed\xfe', b'\xcf\xfa\xed\xfe']:
            findings.append("Mach-O executable detected")
    except Exception as e:
        logger.warning(f"Section check error: {e}")
    
    return findings

def check_file_signatures(file_path: str) -> List[str]:
    """Check for known malicious file signatures"""
    findings = []
    
    # Known malicious signatures
    malicious_sigs = {
        b'This program cannot be run': 'Potentially obfuscated executable',
        b'WinRAR': 'RAR archive (potential vuln exploit)',
        b'\x4d\x5a\x90\x00': 'DOS/Windows executable',
    }
    
    try:
        with open(file_path, 'rb') as f:
            file_header = f.read(512)
        
        for sig, name in malicious_sigs.items():
            if sig in file_header:
                findings.append(name)
    except Exception as e:
        logger.warning(f"Signature check error: {e}")
    
    return findings

def analyze_file(file_path: str) -> Dict[str, Any]:
    """
    Analyzes a single file for suspicious heuristic traits.
    Returns risk score (0-100) and detailed findings.
    """
    findings: List[str] = []
    score = 0
    
    try:
        # Check if file exists and is readable
        if not os.path.isfile(file_path):
            return {"findings": ["File not found or not accessible"], "score": 0}
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Check for unusually large files
        if file_size > 100 * 1024 * 1024:  # 100MB
            findings.append(f"Unusually large file size ({file_size / 1024 / 1024:.1f}MB)")
            score += 15
        
        # Calculate entropy
        entropy = calculate_entropy(file_path)
        if entropy > 7.2:
            findings.append(f"High Entropy ({round(entropy, 2)}): Possible packed/encrypted payload")
            score += 40
        elif entropy > 6.8:
            findings.append(f"Medium Entropy ({round(entropy, 2)}): Possible compression")
            score += 20
        
        # Check for suspicious file locations
        temp_locations = ["temp", "tmp", "appdata", "cache", "downloads"]
        if any(loc in file_path.lower() for loc in temp_locations):
            findings.append("Suspicious Execution Location (Temp/Cache Directory)")
            score += 30
        
        # Check for suspicious extensions in temp
        suspicious_in_temp = [".exe", ".dll", ".sh", ".bat", ".cmd", ".scr"]
        if any(file_path.endswith(ext) for ext in suspicious_in_temp) and "temp" in file_path.lower():
            findings.append("Executable in temporary location")
            score += 25
        
        # Check for suspicious sections
        section_findings = check_suspicious_sections(file_path)
        findings.extend(section_findings)
        if section_findings:
            score += 10
        
        # Check file signatures
        sig_findings = check_file_signatures(file_path)
        findings.extend(sig_findings)
        if sig_findings and "RAR" in str(sig_findings):
            score += 15
        
        # Cap score at 100
        score = min(score, 100)
        
        logger.info(f"File analysis complete: {file_path} - Score: {score}")
    
    except Exception as e:
        logger.error(f"File analysis error for {file_path}: {e}")
        findings.append(f"Analysis error: {str(e)}")
    
    return {"findings": findings, "score": score}

def calculate_system_shield_score(scan_results: List[Dict[str, Any]]) -> int:
    """
    Translates raw threat data into a 0-100% health score for the gauge.
    Base score is 100%, reduced by threat severity.
    """
    base_score = 100
    
    try:
        # Sum up all risk scores
        total_risk = sum(item.get('risk_score', 0) for item in scan_results)
        
        # Convert total risk to percentage reduction
        # Each point of risk reduces score by 1%
        final_score = max(0, base_score - total_risk)
        
        logger.info(f"Shield score calculated: {final_score}% (total risk: {total_risk})")
        return int(final_score)
    
    except Exception as e:
        logger.error(f"Shield score calculation error: {e}")
        return base_score