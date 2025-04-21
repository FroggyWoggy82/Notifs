#!/usr/bin/env python
"""
Check if PaddleOCR is installed and working properly
"""

import sys
import os
import importlib.util
import traceback

def check_module(module_name):
    """Check if a module is installed"""
    spec = importlib.util.find_spec(module_name)
    if spec is None:
        print(f"Module {module_name} is NOT installed")
        return False
    else:
        print(f"Module {module_name} is installed")
        return True

def main():
    """Main function to check PaddleOCR installation"""
    print("Checking PaddleOCR installation...")
    print(f"Python version: {sys.version}")
    print(f"Current working directory: {os.getcwd()}")

    # Check if paddleocr is installed
    paddle_installed = check_module("paddleocr")
    if not paddle_installed:
        print("\nTo install PaddleOCR, run:")
        print("pip install paddleocr")
        return 1

    # Try to import PaddleOCR
    try:
        from paddleocr import PaddleOCR
        print("Successfully imported PaddleOCR")

        # Try to initialize PaddleOCR
        try:
            print("Initializing PaddleOCR...")
            ocr = PaddleOCR(use_angle_cls=True, lang='en')
            print("Successfully initialized PaddleOCR")

            # Try to run OCR on a test image
            test_image_path = os.path.join(os.getcwd(), 'public', 'img', 'logo.png')
            if os.path.exists(test_image_path):
                print(f"Running OCR on test image: {test_image_path}")
                try:
                    result = ocr.ocr(test_image_path, cls=True)
                    print(f"OCR result: {result}")
                    print("\nPaddleOCR is installed and working properly!")
                except Exception as e:
                    print(f"Error running OCR: {e}")
                    traceback.print_exc()
                    return 1
            else:
                print(f"Test image not found: {test_image_path}")
                print("Skipping OCR test")
                print("\nPaddleOCR is installed but not fully tested!")

            return 0
        except Exception as e:
            print(f"Error initializing PaddleOCR: {e}")
            traceback.print_exc()
            return 1
    except Exception as e:
        print(f"Error importing PaddleOCR: {e}")
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
