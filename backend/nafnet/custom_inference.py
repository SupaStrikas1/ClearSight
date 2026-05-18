# custom_inference.py
import sys
import os
import argparse
import torch
import cv2
import numpy as np

# Force import from current repo
sys.path.insert(0, os.path.abspath('.'))

from basicsr.models.archs.NAFNet_arch import NAFNetLocal  # ← your import that worked

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True, help='input image path')
    parser.add_argument('--output', required=True, help='output image path')
    parser.add_argument('--model', required=True, help='path to .pth model')
    args = parser.parse_args()

    print(f"Loading model: {args.model}")
    net = NAFNetLocal(
        width=32,
        enc_blk_nums=[1, 1, 1, 8],
        middle_blk_num=1,
        dec_blk_nums=[1, 1, 1, 1]
    )

    checkpoint = torch.load(args.model, map_location='cpu')
    state_dict = checkpoint['params'] if 'params' in checkpoint else checkpoint
    net.load_state_dict(state_dict)
    net.eval()

    # Use GPU if available
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    net.to(device)

    # Read image
    img = cv2.imread(args.input)
    if img is None:
        print(f"Error: Cannot read {args.input}")
        sys.exit(1)

    # Optional resize if very large (like your friend did)
    h, w = img.shape[:2]
    MAX_DIM = 1000
    if max(h, w) > MAX_DIM:
        scale = MAX_DIM / max(h, w)
        img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)

    # Preprocess
    img = img.astype(np.float32) / 255.0
    img = torch.from_numpy(np.transpose(img[:, :, [2, 1, 0]], (2, 0, 1))).float()
    img = img.unsqueeze(0).to(device)

    # Inference
    with torch.no_grad():
        output = net(img)

    # Postprocess & save
    output = output.squeeze().cpu().clamp_(0, 1).numpy()
    output = np.transpose(output[[2, 1, 0], :, :], (1, 2, 0))
    output = (output * 255.0).round().astype(np.uint8)
    cv2.imwrite(args.output, output)
    print(f"Saved enhanced image to {args.output}")

if __name__ == '__main__':
    main()