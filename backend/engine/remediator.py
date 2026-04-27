import psutil
import zipfile
import os
import datetime

class ActiveRemediation:
    def __init__(self):
        self.log_file = 'remediation_log.txt'

    def kill_process(self, pid):
        """
        Terminate a malicious process by its PID.
        """ 
        try:
            p = psutil.Process(pid)
            p.terminate()
            self.track_remediation(f'Process {pid} terminated.')
        except Exception as e:
            self.track_remediation(f'Failed to terminate process {pid}: {e}')

    def quarantine_threat(self, file_path):
        """
        Move a file to a password-protected ZIP archive for quarantine.
        """ 
        if os.path.exists(file_path):
            zip_name = f'quarantine_{datetime.datetime.now().strftime("%Y%m%d%H%M%S")}.zip'
            with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
                zipf.setpassword(b'my_password')  # replace with your password
                zipf.write(file_path, os.path.basename(file_path))
            self.track_remediation(f'File {file_path} moved to {zip_name}.')
            os.remove(file_path)  # Remove the original file
        else:
            self.track_remediation(f'File not found: {file_path}')

    def track_remediation(self, message):
        """
        Track remediation actions by logging them to a file.
        """ 
        with open(self.log_file, 'a') as log:
            log.write(f'{datetime.datetime.now()}: {message}\n')

if __name__ == '__main__':
    remediation = ActiveRemediation()
    # Example usage
    # remediation.kill_process(1234)
    # remediation.quarantine_threat('/path/to/malicious_file.txt')