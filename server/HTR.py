import cv2
import numpy as np
import easyocr
import matplotlib.pyplot as plt

# Beta Version Pa (marami pang icoconsider para maimprove yung text accuracy)
def preprocess_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Image not found or invalid path")
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    denoised = cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)
    
    thresh = cv2.adaptiveThreshold(
        enhanced, 
        255, 
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY_INV, 
        11, 
        2
    )
    
    kernel = np.ones((2, 2), np.uint8)
    morph = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    
    return morph, img

def recognize_text(image_path):
    preprocessed, original = preprocess_image(image_path)
    
    reader = easyocr.Reader(['en'])
    
    results = reader.readtext(preprocessed, detail=0)
    
    plt.figure(figsize=(15, 7))
    
    plt.subplot(1, 2, 1)
    plt.imshow(cv2.cvtColor(original, cv2.COLOR_BGR2RGB))
    plt.title("Original Image")
    plt.axis('off')
    
    plt.subplot(1, 2, 2)
    plt.imshow(preprocessed, cmap='gray')
    plt.title("Preprocessed Image")
    plt.axis('off')
    
    plt.show()
    
    return results

if __name__ == "__main__":
    image_path = "./server/sample5.jpg" 
    extracted_text = recognize_text(image_path)
    print("\nExtracted Text:")
    for text in extracted_text:
        print(text)