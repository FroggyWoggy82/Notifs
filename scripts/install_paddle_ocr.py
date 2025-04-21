#!/usr/bin/env python
"""
Install PaddleOCR and its dependencies
"""

import sys
import subprocess
import os

def run_command(command):
    """Run a shell command and print output"""
    print(f"Running: {command}")
    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=True,
        universal_newlines=True
    )
    
    # Print output in real-time
    for line in process.stdout:
        print(line.strip())
    
    # Wait for the process to complete
    process.wait()
    
    # Check if the command was successful
    if process.returncode != 0:
        print(f"Command failed with return code {process.returncode}")
        for line in process.stderr:
            print(line.strip())
        return False
    
    return True

def main():
    """Main function to install PaddleOCR"""
    print("Installing PaddleOCR and dependencies...")
    
    # Check Python version
    python_version = sys.version_info
    print(f"Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    # Install PaddleOCR
    if not run_command("pip install paddleocr"):
        print("Failed to install PaddleOCR")
        return 1
    
    # Verify installation
    try:
        from paddleocr import PaddleOCR
        print("Successfully imported PaddleOCR")
        
        # Try to initialize PaddleOCR
        try:
            ocr = PaddleOCR(use_angle_cls=True, lang='en')
            print("Successfully initialized PaddleOCR")
            print("\nPaddleOCR is installed and working properly!")
            return 0
        except Exception as e:
            print(f"Error initializing PaddleOCR: {e}")
            return 1
    except Exception as e:
        print(f"Error importing PaddleOCR: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
