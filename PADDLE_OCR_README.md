# PaddleOCR Integration

This project now includes PaddleOCR as an alternative OCR engine for improved nutrition label scanning accuracy.

## Installation

To use PaddleOCR, you need to install the required Python packages:

```bash
pip install -r requirements.txt
```

This will install:
- paddlepaddle (CPU version)
- paddleocr
- numpy
- Pillow

## Usage

1. Start the server as usual:
```bash
npm start
```

2. Navigate to the Food page in your browser.

3. When adding ingredients, you'll see a checkbox labeled "Use PaddleOCR (better accuracy)". Check this box to use PaddleOCR instead of Tesseract OCR.

4. Paste a nutrition label image as usual, and the system will use PaddleOCR to extract the nutrition information.

## Troubleshooting

If you encounter issues with PaddleOCR:

1. Make sure Python is installed and in your PATH.
2. Verify that the required Python packages are installed correctly.
3. Check the server logs for any Python-related errors.
4. If you see errors about missing DLLs on Windows, you may need to install the Visual C++ Redistributable.

## Performance Considerations

PaddleOCR may be slower than Tesseract OCR for the first run as it loads the models, but subsequent runs should be faster. The accuracy improvement is typically worth the slight performance trade-off.

## Switching Between OCR Engines

Your choice of OCR engine (PaddleOCR or Tesseract) is saved in your browser's localStorage, so it will persist between sessions.
