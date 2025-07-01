import base64
import io
import cv2
import numpy as np
import onnxruntime as ort
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

app = FastAPI()
session = ort.InferenceSession("mnist_cnn.onnx")


class ImagePayload(BaseModel):
    image: str


@app.post("/predict")
async def predict(payload: ImagePayload):
    image_b64 = payload.image.split(",")[1]
    image_bytes = base64.b64decode(image_b64)
    img = Image.open(io.BytesIO(image_bytes)).convert("L")
    img_np = np.array(img)
    img_np = 255 - img_np  # inversion
    _, img_bin = cv2.threshold(img_np, 10, 255, cv2.THRESH_BINARY)
    coords = cv2.findNonZero(img_bin)
    x, y, w, h = cv2.boundingRect(coords)
    digit = img_np[y:y+h, x:x+w]
    
    # digit_resized = cv2.resize(digit, (20, 20), interpolation=cv2.INTER_AREA)
    h, w = digit.shape
    if h > w:
        new_h = 20
        new_w = int(w * (20.0 / h))
    else:
        new_w = 20
        new_h = int(h * (20.0 / w))
    digit_resized = cv2.resize(digit, (new_w, new_h), interpolation=cv2.INTER_AREA)

    canvas = np.zeros((28, 28), dtype=np.uint8)
    x_offset = (28 - new_w) // 2
    y_offset = (28 - new_h) // 2
    canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = digit_resized
    
    debug_img = Image.fromarray(canvas)
    debug_img.save("../debug_digit.png")
    
    img_norm = canvas.astype(np.float32) / 255.0
    img_norm = (img_norm - 0.1307) / 0.3081

    input_tensor = img_norm.reshape(1, 1, 28, 28)
    outputs = session.run(None, {"input": input_tensor})
    prediction = int(np.argmax(outputs[0]))
    
    print("Input shape:", input_tensor.shape)
    print("Min:", input_tensor.min(), "Max:", input_tensor.max())
    
    return {"prediction": prediction}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)
