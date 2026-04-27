import os
import platform
import json

class PersistenceHunter:
    def __init__(self):
        self.results = {}

    def check_windows(self):
        # Check Windows Registry Run keys
        run_key_path = r'Software\Microsoft\Windows\CurrentVersion\Run'
        run_keys = self.get_registry_keys(run_key_path)
        self.results['Windows Run Keys'] = run_keys

    def check_macos(self):
        # Check macOS LaunchDaemons and LaunchAgents
        launch_daemons_path = '/Library/LaunchDaemons/'
        launch_agents_path = '/Library/LaunchAgents/'
        self.results['macOS LaunchDaemons'] = os.listdir(launch_daemons_path)
        self.results['macOS LaunchAgents'] = os.listdir(launch_agents_path)

    def check_linux(self):
        # Check Linux Cron jobs
        cron_jobs = self.get_cron_jobs()
        self.results['Linux Cron Jobs'] = cron_jobs

    def get_registry_keys(self, path):
        # Placeholder for actual registry fetching logic
        return ['ExampleKey1', 'ExampleKey2']  # Dummy data for illustration

    def get_cron_jobs(self):
        # Placeholder for actual cron job fetching logic
        cron_files = ['/etc/cron.d/', '/var/spool/cron/']
        jobs = []
        for cron_file in cron_files:
            if os.path.exists(cron_file):
                jobs.extend(os.listdir(cron_file))
        return jobs

    def run(self):
        os_type = platform.system()
        if os_type == 'Windows':
            self.check_windows()
        elif os_type == 'Darwin':  # macOS
            self.check_macos()
        elif os_type == 'Linux':
            self.check_linux()
        else:
            self.results['Error'] = 'Unsupported OS'

        return json.dumps(self.results, indent=4)

# Example usage:
if __name__ == '__main__':
    hunter = PersistenceHunter()
    print(hunter.run())