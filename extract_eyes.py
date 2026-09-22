import cv2
import numpy as np

img = cv2.imread('logo.png', cv2.IMREAD_UNCHANGED)

# Ensure RGBA
if img.shape[2] == 3:
    img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)

# Make mask for the eyes
gray = cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)
_, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
contours, _ = cv2.findContours(thresh, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

# We know eyes are contours 0 and 1 based on previous output (areas 3061 and 8626)
eye_contours = []
for i, c in enumerate(contours):
    area = cv2.contourArea(c)
    if 3000 < area < 9000 and cv2.boundingRect(c)[0] > 250 and cv2.boundingRect(c)[0] < 500:
        eye_contours.append(c)

print(f"Found {len(eye_contours)} eye contours.")

# Mask for eyes
eye_mask = np.zeros((img.shape[0], img.shape[1]), dtype=np.uint8)
cv2.drawContours(eye_mask, eye_contours, -1, 255, -1)

# Body image (everything EXCEPT eyes)
body_img = img.copy()
body_img[eye_mask == 255] = [0, 0, 0, 0] # transparent where eyes were

# Save body
cv2.imwrite('body.png', body_img)

# Eyes image (1024x1024 with everything but eyes transparent)
eyes_full = np.zeros_like(img)
eyes_full[eye_mask == 255] = img[eye_mask == 255]

# Save eyes
cv2.imwrite('eyes.png', eyes_full)

# Calculate eye center for CSS transform-origin
x, y, w, h = cv2.boundingRect(np.vstack(eye_contours))
cx = x + w/2
cy = y + h/2
print(f"Center X: {cx}, Center Y: {cy}")
print(f"Transform Origin: {cx/img.shape[1]*100:.2f}% {cy/img.shape[0]*100:.2f}%")
