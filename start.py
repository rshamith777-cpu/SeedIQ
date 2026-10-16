import subprocess
import sys
import os
import time

def get_python_executable():
    venv_py = os.path.join(os.getcwd(), ".venv", "Scripts", "python.exe")
    if os.path.exists(venv_py):
        return venv_py
    return sys.executable

def main():
    python_exe = get_python_executable()
    print(f"Starting SeedIQ Backend (Flask) using {python_exe}...")
    backend_process = subprocess.Popen([python_exe, "app.py"], cwd=os.path.join(os.getcwd(), "SeedIQ"))
    
    print("Starting SeedIQ Frontend (React SSR dev mode)...")
    frontend_process = subprocess.Popen(["npm", "run", "dev"], cwd=os.path.join(os.getcwd(), "seediq-frontend"), shell=True)
    
    print("Both servers started! Press Ctrl+C to stop.")
    
    try:
        while True:
            time.sleep(2)
            if backend_process.poll() is not None:
                print("\n[start.py] Backend process exited. Auto-restarting Flask backend...")
                backend_process = subprocess.Popen([python_exe, "app.py"], cwd=os.path.join(os.getcwd(), "SeedIQ"))
            if frontend_process.poll() is not None:
                print("\n[start.py] Frontend process exited. Auto-restarting frontend dev server...")
                frontend_process = subprocess.Popen(["npm", "run", "dev"], cwd=os.path.join(os.getcwd(), "seediq-frontend"), shell=True)
    except KeyboardInterrupt:
        print("\nStopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        backend_process.wait()
        frontend_process.wait()
        print("Servers stopped.")

if __name__ == "__main__":
    main()
