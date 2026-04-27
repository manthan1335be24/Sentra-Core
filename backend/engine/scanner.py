import os
import time
import json

class FullPCScan:
    def __init__(self):
        self.scan_results = []

    def scan_directory(self, directory, progress_callback=None):
        total_files = sum([len(files) for r, d, files in os.walk(directory)])
        scanned_files = 0

        for root, dirs, files in os.walk(directory):
            for file in files:
                file_path = os.path.join(root, file)
                risk_score, threat_found = self.analyze_file(file_path)
                self.scan_results.append({"file_path": file_path, "risk_score": risk_score, "threat_found": threat_found})
                scanned_files += 1
                if progress_callback:
                    progress_callback(scanned_files, total_files)

    def analyze_file(self, file_path):
        # Placeholder for the heuristic analysis
        # In a real implementation, you would analyze the file contents
        risk_score = 0
        threat_found = None

        # Simulated heuristics for example
        if file_path.endswith('.exe'):
            risk_score = 8
            threat_found = "Potentially malicious executable"
        elif file_path.endswith('.txt'):
            risk_score = 1
            threat_found = "Safe text file"
        else:
            risk_score = 3
            threat_found = "Unknown file type"

        return risk_score, threat_found

    def get_scan_results(self):
        return self.scan_results

    def print_results(self):
        print(json.dumps(self.scan_results, indent=4))

# Example usage
if __name__ == '__main__':
    scanner = FullPCScan()

    def progress_callback(scanned, total):
        print(f'Scanned {scanned} of {total} files.')

    print('Starting full system scan...')
    start_time = time.time()
    scanner.scan_directory("/", progress_callback)
    end_time = time.time()
    print('Scan completed in', end_time - start_time, 'seconds.')

    scanner.print_results()