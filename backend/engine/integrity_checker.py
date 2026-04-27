import os
import subprocess
import win32api

class IntegrityChecker:
    def __init__(self, temp_dirs):
        self.temp_dirs = temp_dirs

    def check_signature(self, file_path):
        try:
            # Use signtool to verify the signature
            result = subprocess.run(['signtool', 'verify', '/pa', file_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            return result.returncode == 0
        except Exception as e:
            print(f'Error checking signature for {file_path}: {e}')
            return False

    def check_trusted_publisher(self, file_path):
        try:
            # Get the publisher information
            info = win32api.GetFileVersionInfo(file_path, win32api.loword(win32api.GetFileVersionInfo(file_path)['FileVersion']))
            publisher = info['CompanyName']
            # Check if publisher is trusted (this should be replaced with actual trusted publishers list check)
            trusted_publishers = ['Microsoft Corporation', 'Example Trusted Publisher']
            return publisher in trusted_publishers
        except Exception as e:
            print(f'Error checking publisher for {file_path}: {e}')
            return False

    def assess_file(self, file_path):
        if not os.path.isfile(file_path):
            return False
        unsigned_penalty = 100
        # Check for files in temporary directories
        if any(temp_dir in file_path for temp_dir in self.temp_dirs):
            print(f'File {file_path} is in a temp directory.')
            if not self.check_signature(file_path):
                return unsigned_penalty
        elif not self.check_signature(file_path) or not self.check_trusted_publisher(file_path):
            print(f'File {file_path} failed signature or publisher checks.')
            return unsigned_penalty
        return 0  # No penalty - file is valid

# Example usage
if __name__ == '__main__':
    temp_directories = [r'C:\Temp', r'C:\Users\User\AppData\Local\Temp']
    checker = IntegrityChecker(temp_directories)
    test_file = r'C:\Path\To\Executable.exe'  # Replace with actual file path
    result = checker.assess_file(test_file)
    print(f'Integrity assessment result: {result}')