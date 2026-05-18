# metrics_for_single_image.py
import sys
import os
import argparse
import time
import torch
import cv2
import numpy as np
from skimage.metrics import peak_signal_noise_ratio as psnr
from skimage.metrics import structural_similarity as ssim

# Force import from current repo
sys.path.insert(0, os.path.abspath('.'))

from basicsr.models.archs.NAFNet_arch import NAFNetLocal

def calculate_metrics(gt_path, pred_path):
    """Compute PSNR and SSIM between ground truth and predicted image"""
    gt = cv2.imread(gt_path)
    pred = cv2.imread(pred_path)
    
    if gt is None or pred is None:
        raise ValueError("Cannot read one of the images")
    
    # Convert BGR → RGB
    gt = cv2.cvtColor(gt, cv2.COLOR_BGR2RGB)
    pred = cv2.cvtColor(pred, cv2.COLOR_BGR2RGB)
    
    # Resize prediction to match GT if sizes differ
    if gt.shape != pred.shape:
        pred = cv2.resize(pred, (gt.shape[1], gt.shape[0]), interpolation=cv2.INTER_AREA)
    
    # PSNR (data_range=255 for 8-bit images)
    psnr_value = psnr(gt, pred, data_range=255)
    
    # SSIM (multi-channel)
    ssim_value = ssim(gt, pred, multichannel=True, data_range=255, channel_axis=-1)
    
    return psnr_value, ssim_value

def main():
    parser = argparse.ArgumentParser(description="Evaluate fine-tuned NAFNet on a single image pair")
    parser.add_argument('--input', required=True, help='Path to degraded input image')
    parser.add_argument('--gt', required=True, help='Path to ground-truth clean image')
    parser.add_argument('--output', required=True, help='Where to save the enhanced result')
    parser.add_argument('--model', required=True, help='Path to your fine-tuned .pth model')
    args = parser.parse_args()

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")

    print(f"Loading model from: {args.model}")
    
    # === Model definition (exact same as your working script) ===
    net = NAFNetLocal(
        width=32,
        enc_blk_nums=[1, 1, 1, 8],
        middle_blk_num=1,
        dec_blk_nums=[1, 1, 1, 1]
    ).to(device)
    net.eval()

    # Load checkpoint
    checkpoint = torch.load(args.model, map_location=device)
    state_dict = checkpoint['params'] if 'params' in checkpoint else checkpoint
    net.load_state_dict(state_dict)

    # Count trainable parameters
    num_params = sum(p.numel() for p in net.parameters() if p.requires_grad)
    print(f"Number of trainable parameters: {num_params:,}")

    # Load input image
    img = cv2.imread(args.input)
    if img is None:
        print(f"Error: Cannot read input image: {args.input}")
        sys.exit(1)

    # Optional resize (same as your friend)
    h, w = img.shape[:2]
    MAX_DIM = 1000
    if max(h, w) > MAX_DIM:
        scale = MAX_DIM / max(h, w)
        print(f"Resizing from {w}x{h} → {int(w*scale)}x{int(h*scale)}")
        img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)

    # Preprocess
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    img_tensor = torch.from_numpy(np.transpose(img, (2, 0, 1))).float().unsqueeze(0).to(device)

    # Inference + timing
    start_time = time.time()
    with torch.no_grad():
        output = net(img_tensor)
    inference_time_ms = (time.time() - start_time) * 1000

    # Postprocess & save
    output = output.squeeze().cpu().clamp_(0, 1).numpy()
    output = np.transpose(output[[2, 1, 0], :, :], (1, 2, 0))
    output = (output * 255.0).round().astype(np.uint8)
    cv2.imwrite(args.output, cv2.cvtColor(output, cv2.COLOR_RGB2BGR))
    print(f"Enhanced image saved to: {args.output}")

    # Compute metrics
    psnr_val, ssim_val = calculate_metrics(args.gt, args.output)

    # Final results
    print("\n" + "═" * 60)
    print(f"Evaluation Results for: {args.input}")
    print(f"PSNR:          {psnr_val:.4f} dB")
    print(f"SSIM:          {ssim_val:.4f}")
    print(f"Inference Time: {inference_time_ms:.2f} ms")
    print(f"Parameters:     {num_params:,}")
    print("═" * 60)

if __name__ == '__main__':
    main()