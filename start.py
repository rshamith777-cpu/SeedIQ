import subprocess
import sys
import os
import time

def main():
    print("Starting SeedIQ Backend (Flask)...")
    backend_process = subprocess.Popen([sys.executable, "app.py"], cwd=os.path.join(os.getcwd(), "SeedIQ"))
    
    print("Starting SeedIQ Frontend (React SSR dev mode)...")
    frontend_process = subprocess.Popen(["npm", "run", "dev"], cwd=os.path.join(os.getcwd(), "seediq-frontend"), shell=True)
    
    print("Both servers started! Press Ctrl+C to stop.")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        backend_process.wait()
        frontend_process.wait()
        print("Servers stopped.")

if __name__ == "__main__":
    main()
