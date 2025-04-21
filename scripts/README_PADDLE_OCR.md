# PaddleOCR Installation Guide

This guide will help you install and set up PaddleOCR for improved OCR accuracy in the nutrition scanning feature.

## Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

## Installation Steps

1. **Check if PaddleOCR is already installed**

   Run the check script to see if PaddleOCR is already installed:

   ```bash
   python scripts/check_paddle_ocr.py
   ```

2. **Install PaddleOCR**

   If PaddleOCR is not installed, you can install it using the installation script:

   ```bash
   python scripts/install_paddle_ocr.py
   ```

   Or manually install it using pip:

   ```bash
   pip install paddleocr
   ```

3. **Verify Installation**

   After installation, run the check script again to verify that PaddleOCR is installed correctly:

   ```bash
   python scripts/check_paddle_ocr.py
   ```

## Usage

Once PaddleOCR is installed, the nutrition scanning feature will automatically use it for improved OCR accuracy. You can enable PaddleOCR in the food page by checking the "Use PaddleOCR (better accuracy)" checkbox.

## Troubleshooting

If you encounter any issues during installation or usage:

1. **Check Python Version**

   Make sure you have Python 3.7 or higher installed:

   ```bash
   python --version
   ```

2. **Update pip**

   Update pip to the latest version:

   ```bash
   python -m pip install --upgrade pip
   ```

3. **Install Dependencies Manually**

   If the automatic installation fails, you can try installing the dependencies manually:

   ```bash
   pip install paddlepaddle
   pip install paddleocr
   ```

4. **Check Error Messages**

   If you see error messages in the console, they may provide clues about what's going wrong. Look for specific error messages related to missing dependencies or version conflicts.

## Fallback Behavior

If PaddleOCR is not installed or fails to run, the application will automatically fall back to using the existing OCR implementation. You'll still be able to use the nutrition scanning feature, but with potentially lower accuracy.
