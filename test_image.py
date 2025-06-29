#!/usr/bin/env python3
"""
Create a simple test image for photo upload testing
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_test_image():
    # Create a simple test image
    width, height = 800, 600
    image = Image.new('RGB', (width, height), color='lightblue')
    
    # Add some text to make it identifiable
    draw = ImageDraw.Draw(image)
    
    # Try to use a default font, fallback to basic if not available
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        font = ImageFont.load_default()
    
    text = "Test Progress Photo"
    text2 = "Upload Test"
    
    # Get text bounding box for centering
    bbox1 = draw.textbbox((0, 0), text, font=font)
    bbox2 = draw.textbbox((0, 0), text2, font=font)
    
    text_width1 = bbox1[2] - bbox1[0]
    text_height1 = bbox1[3] - bbox1[1]
    text_width2 = bbox2[2] - bbox2[0]
    text_height2 = bbox2[3] - bbox2[1]
    
    # Center the text
    x1 = (width - text_width1) // 2
    y1 = (height - text_height1) // 2 - 30
    x2 = (width - text_width2) // 2
    y2 = (height - text_height2) // 2 + 30
    
    # Draw text with shadow effect
    draw.text((x1+2, y1+2), text, fill='black', font=font)
    draw.text((x1, y1), text, fill='white', font=font)
    draw.text((x2+2, y2+2), text2, fill='black', font=font)
    draw.text((x2, y2), text2, fill='white', font=font)
    
    # Add a border
    draw.rectangle([10, 10, width-10, height-10], outline='navy', width=5)
    
    # Save the image
    output_path = os.path.join(os.getcwd(), 'test_progress_photo.jpg')
    image.save(output_path, 'JPEG', quality=85)
    print(f"Test image created: {output_path}")
    return output_path

if __name__ == "__main__":
    create_test_image()
