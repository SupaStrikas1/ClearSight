import os
import shutil
import cv2
import numpy as np
import random

# ────────────────────────────────────────────────
#  Your rain streaks function (unchanged)
# ────────────────────────────────────────────────
def add_rain_streaks(image, intensity=0.85, length=15, angle=45):
    row, col, ch = image.shape
    noise = np.zeros((row, col), dtype=np.float32)
    num_dots = int(row * col * intensity / 10)
    for i in range(num_dots):
        x = random.randint(0, col - 1)
        y = random.randint(0, row - 1)
        noise[y, x] = 255
    trans_mat = cv2.getRotationMatrix2D((length/2, length/2), angle, 1)
    kernel = np.zeros((length, length))
    kernel[int(length/2), :] = 1
    kernel = cv2.warpAffine(kernel, trans_mat, (length, length))
    kernel /= np.sum(kernel)
    rain_layer = cv2.filter2D(noise, -1, kernel)
    rain_layer = cv2.GaussianBlur(rain_layer, (3, 3), 0)
    rain_layer = cv2.cvtColor(rain_layer, cv2.COLOR_GRAY2BGR)
    joint_image = cv2.addWeighted(image.astype(np.float32), 1.0, rain_layer, 0.8, 0)
    joint_image = np.clip(joint_image, 0, 255).astype(np.uint8)
    return joint_image

# ────────────────────────────────────────────────
#  Paths (adjust if needed)
# ────────────────────────────────────────────────
RAIN_TRAIN_DEG = r'G:\My Drive\datasets\original\rain100\train\degraded'
RAIN_TRAIN_CLN = r'G:\My Drive\datasets\original\rain100\train\clean'

RES_TRAIN_DEG  = r'G:\My Drive\datasets\original\reside\train\degraded'
RES_TRAIN_CLN  = r'G:\My Drive\datasets\original\reside\train\clean'

# Output folders
OUT_ROOT = r'C:\Abhinand\FINAL YEAR PROJECT\ClearSight\backend\nafnet\datasets\custom_joint_dataset'
for split in ['train']:
    os.makedirs(os.path.join(OUT_ROOT, split, 'degraded'), exist_ok=True)
    os.makedirs(os.path.join(OUT_ROOT, split, 'clean'),    exist_ok=True)

OUT_TRAIN_DEG = os.path.join(OUT_ROOT, 'train/degraded')
OUT_TRAIN_CLN = os.path.join(OUT_ROOT, 'train/clean')

# ────────────────────────────────────────────────
#  Helpers
# ────────────────────────────────────────────────
def get_images(folder):
    exts = ('.png', '.jpg', '.jpeg')
    return [f for f in sorted(os.listdir(folder)) if f.lower().endswith(exts)]

def full_path(folder, fname):
    return os.path.join(folder, fname)

def copy_pair(src_deg, src_cln, out_deg_dir, out_cln_dir, idx):
    new_name = f'{idx:06d}.png'
    shutil.copy(src_deg, os.path.join(out_deg_dir, new_name))
    shutil.copy(src_cln, os.path.join(out_cln_dir, new_name))

def synth_rain_from_src(src_img_path, out_deg_dir, out_cln_dir, idx, is_hazy=False, gt_path=None):
    img = cv2.imread(src_img_path)
    if img is None:
        print(f"Cannot read {src_img_path}")
        return False
    
    degraded = add_rain_streaks(img)
    new_name = f'{idx:06d}.png'
    
    cv2.imwrite(os.path.join(out_deg_dir, new_name), degraded)
    
    # Use provided ground-truth path if given, otherwise fall back to src (for clean→rain cases)
    clean_source = gt_path if gt_path is not None else src_img_path
    shutil.copy(clean_source, os.path.join(out_cln_dir, new_name))
    
    return True

# ────────────────────────────────────────────────
#  Load RESIDE pairs (most important part)
# ────────────────────────────────────────────────
res_deg_files = get_images(RES_TRAIN_DEG)
res_cln_files = get_images(RES_TRAIN_CLN)
res_pairs = list(zip(
    [full_path(RES_TRAIN_DEG, f) for f in res_deg_files],
    [full_path(RES_TRAIN_CLN, f) for f in res_cln_files]
))
random.shuffle(res_pairs)   # important for fair sampling

# Real rain — now from Rain100/train (898 pairs)
rain_deg_files = get_images(RAIN_TRAIN_DEG)
rain_cln_files = get_images(RAIN_TRAIN_CLN)

if len(rain_deg_files) < 798 or len(rain_cln_files) < 798:
    raise ValueError(f"Rain100/train has only {min(len(rain_deg_files), len(rain_cln_files))} pairs — cannot take 798")

rain_pairs = list(zip(
    [full_path(RAIN_TRAIN_DEG, f) for f in rain_deg_files[:798]],
    [full_path(RAIN_TRAIN_CLN, f) for f in rain_cln_files[:798]]
))

print(f"Using {len(rain_pairs)} real rain pairs from Rain100/train")
print(f"Available real hazy pairs: {len(res_pairs)}")

# ────────────────────────────────────────────────
#  BUILD TRAIN (6000)
# ────────────────────────────────────────────────
idx = 0

# Hazy: 800 real hazy from RESIDE train src
for deg_p, cln_p in res_pairs[:800]:
    copy_pair(deg_p, cln_p, OUT_TRAIN_DEG, OUT_TRAIN_CLN, idx)
    idx += 1

# Rainy: 898 real rain (mixed heavy + light from Rain100/train
for deg_p, cln_p in rain_pairs:
    copy_pair(deg_p, cln_p, OUT_TRAIN_DEG, OUT_TRAIN_CLN, idx)
    idx += 1
    
clean_for_synth = [cln_p for _, cln_p in res_pairs[800:800+100]]
for cln_p in clean_for_synth:
    synth_rain_from_src(cln_p, OUT_TRAIN_DEG, OUT_TRAIN_CLN, idx, is_hazy=False)
    idx += 1

# Rain + Haze: 999 = hazy + rain streaks
hazy_for_rain_pairs = res_pairs[900:900+999]          # keep both deg and clean
for deg_p, cln_p in hazy_for_rain_pairs:
    # Create degraded = hazy + synthetic rain
    synth_rain_from_src(deg_p, OUT_TRAIN_DEG, OUT_TRAIN_CLN, idx, is_hazy=True, gt_path=cln_p)
    idx += 1

# Clean: 153 identity
for _, cln_p in res_pairs[1899:1899+153]:
    copy_pair(cln_p, cln_p, OUT_TRAIN_DEG, OUT_TRAIN_CLN, idx)
    idx += 1

print(f"Train created: {idx} pairs")

print("Done. Check custom_joint_dataset/ folders.")