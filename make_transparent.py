import cv2
import numpy as np

def make_transparent(filename):
    img = cv2.imread(filename, cv2.IMREAD_UNCHANGED)
    if img is None:
        return
        
    # Ensure it's RGBA
    if img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
        
    # Find black pixels (r, g, b all near 0)
    # We use a threshold of < 50 for all color channels
    black_pixels = (img[:, :, 0] < 50) & (img[:, :, 1] < 50) & (img[:, :, 2] < 50)
    
    # Set alpha channel to 0 for black pixels
    img[black_pixels] = [0, 0, 0, 0]
    
    cv2.imwrite(filename, img)
    print(f"Made background transparent for {filename}")

make_transparent('body.png')
make_transparent('eyes.png')
