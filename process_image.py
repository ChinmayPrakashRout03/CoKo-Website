import cv2
import numpy as np

# Load image
img = cv2.imread('logo.png', cv2.IMREAD_UNCHANGED)
if img.shape[2] == 4:
    # Convert RGBA to grayscale based on alpha/white
    gray = cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)
else:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Threshold to get white pixels
_, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)

# Find contours
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
# Or RETR_LIST if the eyes are inside the ghost's bounding box and the ghost is closed

contours, _ = cv2.findContours(thresh, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

print("Found", len(contours), "contours.")
for i, c in enumerate(contours):
    x, y, w, h = cv2.boundingRect(c)
    area = cv2.contourArea(c)
    if area > 100:  # Ignore small noise
        print(f"Contour {i}: x={x}, y={y}, w={w}, h={h}, area={area}")
