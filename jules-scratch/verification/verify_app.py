import time
import subprocess
import os
from playwright.sync_api import sync_playwright, expect

def run_verification():
    server_process = None
    try:
        # Define the absolute path to the react-scripts executable
        react_scripts_path = os.path.abspath("sprinkler-system-designer/node_modules/.bin/react-scripts")

        log_path = os.path.abspath("npm_start.log")
        with open(log_path, 'w') as log_file:
            print(f"Starting dev server using direct path: {react_scripts_path}")
            print(f"Logging to {log_path}...")

            server_process = subprocess.Popen(
                [react_scripts_path, "start"],
                cwd="sprinkler-system-designer",
                stdout=log_file,
                stderr=log_file
            )

            print("Waiting for server to start (45s)...")
            time.sleep(45)

            with open(log_path, 'r') as f:
                logs = f.read()
                if "Compiled successfully!" not in logs:
                    print("Server did not compile successfully. Check logs.")
                    print("--- LOGS ---")
                    print(logs)
                    return False # Fail gracefully

            with sync_playwright() as p:
                print("Launching browser...")
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()

                print("Navigating to http://localhost:3000...")
                page.goto("http://localhost:3000", timeout=60000)

                print("Waiting for application content...")
                heading = page.get_by_role("heading", name="Lawn Sprinkler Design")
                expect(heading).to_be_visible(timeout=15000)

                print("Taking screenshot...")
                screenshot_path = "jules-scratch/verification/verification.png"
                page.screenshot(path=screenshot_path)
                print(f"Screenshot saved to {screenshot_path}")

                browser.close()

        return True

    finally:
        if server_process:
            print("Stopping dev server...")
            server_process.terminate()
            server_process.wait()
            print("Server stopped.")


if __name__ == "__main__":
    success = run_verification()
    if not success:
        exit(1)
