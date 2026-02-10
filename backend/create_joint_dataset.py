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
RAIN_TEST_DEG  = r'G:\My Drive\datasets\original\rain100\test\data'
RAIN_TEST_CLN  = r'G:\My Drive\datasets\original\rain100\test\gt'

RES_TRAIN_DEG  = r'G:\My Drive\datasets\original\reside\train\degraded'
RES_TRAIN_CLN  = r'G:\My Drive\datasets\original\reside\train\clean'
RES_TEST_DEG   = r'G:\My Drive\datasets\original\reside\test\hazy'
RES_TEST_CLN   = r'G:\My Drive\datasets\original\reside\test\GT'

# Output folders
OUT_ROOT = r'C:\Abhinand\FINAL YEAR PROJECT\ClearSight\backend\nafnet\datasets\joint_dataset'
for split in ['train', 'val', 'test']:
    os.makedirs(os.path.join(OUT_ROOT, split, 'degraded'), exist_ok=True)
    os.makedirs(os.path.join(OUT_ROOT, split, 'clean'),    exist_ok=True)

OUT_TRAIN_DEG = os.path.join(OUT_ROOT, 'train/degraded')
OUT_TRAIN_CLN = os.path.join(OUT_ROOT, 'train/clean')
OUT_VAL_DEG   = os.path.join(OUT_ROOT, 'val/degraded')
OUT_VAL_CLN   = os.path.join(OUT_ROOT, 'val/clean')
OUT_TEST_DEG  = os.path.join(OUT_ROOT, 'test/degraded')
OUT_TEST_CLN  = os.path.join(OUT_ROOT, 'test/clean')

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

def synth_rain_from_src(src_img_path, out_deg_dir, out_cln_dir, idx, is_hazy=False):
    img = cv2.imread(src_img_path)
    if img is None:
        print(f"Cannot read {src_img_path}")
        return False
    degraded = add_rain_streaks(img) if not is_hazy else add_rain_streaks(img)
    new_name = f'{idx:06d}.png'
    cv2.imwrite(os.path.join(out_deg_dir, new_name), degraded)
    shutil.copy(src_img_path, os.path.join(out_cln_dir, new_name))
    return True

# ────────────────────────────────────────────────
#  Load RESIDE pairs (most important part)
# ────────────────────────────────────────────────
res_train_deg_files = get_images(RES_TRAIN_DEG)
res_train_cln_files = get_images(RES_TRAIN_CLN)

if len(res_train_deg_files) != len(res_train_cln_files):
    raise ValueError(f"RESIDE train mismatch: {len(res_train_deg_files)} deg vs {len(res_train_cln_files)} cln")

# Create list of paired (deg_path, cln_path)
res_train_pairs = [
    (full_path(RES_TRAIN_DEG, d), full_path(RES_TRAIN_CLN, c))
    for d, c in zip(res_train_deg_files, res_train_cln_files)
]

# Shuffle the pairs together
random.shuffle(res_train_pairs)

# Split
res_train_src_pairs = res_train_pairs[:4800]
res_val_src_pairs   = res_train_pairs[4800:5400]
res_test_src_pairs  = res_train_pairs[5400:6000]   # note: using train set for extra test synth

print(f"RESIDE train pairs split: {len(res_train_src_pairs)} train / {len(res_val_src_pairs)} val / {len(res_test_src_pairs)} extra test")

# Rain100 (real rain) – assume already paired by name/order
rain_train_deg_files = get_images(RAIN_TRAIN_DEG)
rain_train_cln_files = get_images(RAIN_TRAIN_CLN)
rain_test_deg_files  = get_images(RAIN_TEST_DEG)
rain_test_cln_files  = get_images(RAIN_TEST_CLN)

rain_train_pairs = [
    (full_path(RAIN_TRAIN_DEG, d), full_path(RAIN_TRAIN_CLN, c))
    for d, c in zip(rain_train_deg_files, rain_train_cln_files)
]

rain_test_pairs = [
    (full_path(RAIN_TEST_DEG, d), full_path(RAIN_TEST_CLN, c))
    for d, c in zip(rain_test_deg_files, rain_test_cln_files)
]

# ────────────────────────────────────────────────
#  BUILD TRAIN (6000)
# ────────────────────────────────────────────────
idx = 0

# Hazy: 2000 real hazy from RESIDE train src
for deg_p, cln_p in res_train_src_pairs[:2000]:
    copy_pair(deg_p, cln_p, OUT_TRAIN_DEG, OUT_TRAIN_CLN, idx)
    idx += 1

# Rainy: 1255 real + 745 synthetic rain on clean
for deg_p, cln_p in rain_train_pairs:
    copy_pair(deg_p, cln_p, OUT_TRAIN_DEG, OUT_TRAIN_CLN, idx)
    idx += 1

clean_for_synth = [cln_p for _, cln_p in res_train_src_pairs[2000:2000+745]]
for cln_p in clean_for_synth:
    synth_rain_from_src(cln_p, OUT_TRAIN_DEG, OUT_TRAIN_CLN, idx, is_hazy=False)
    idx += 1

# Rain + Haze: 1500 = hazy + rain streaks
hazy_for_rain = [deg_p for deg_p, _ in res_train_src_pairs[2745:2745+1500]]
for deg_p in hazy_for_rain:
    synth_rain_from_src(deg_p, OUT_TRAIN_DEG, OUT_TRAIN_CLN, idx, is_hazy=True)
    idx += 1

# Clean: 500 identity
for _, cln_p in res_train_src_pairs[4245:4245+500]:
    copy_pair(cln_p, cln_p, OUT_TRAIN_DEG, OUT_TRAIN_CLN, idx)
    idx += 1

print(f"Train created: {idx} pairs")

# ────────────────────────────────────────────────
#  VAL (750) – using val source pairs
# ────────────────────────────────────────────────
idx = 0

# Hazy 250
for deg_p, cln_p in res_val_src_pairs[:250]:
    copy_pair(deg_p, cln_p, OUT_VAL_DEG, OUT_VAL_CLN, idx)
    idx += 1

# Rainy 250 synthetic
clean_val = [cln_p for _, cln_p in res_val_src_pairs[250:500]]
for cln_p in clean_val:
    synth_rain_from_src(cln_p, OUT_VAL_DEG, OUT_VAL_CLN, idx, is_hazy=False)
    idx += 1

# Rain+Haze 188
hazy_val = [deg_p for deg_p, _ in res_val_src_pairs[500:500+188]]
for deg_p in hazy_val:
    synth_rain_from_src(deg_p, OUT_VAL_DEG, OUT_VAL_CLN, idx, is_hazy=True)
    idx += 1

# Clean 62
for _, cln_p in res_val_src_pairs[688:688+62]:
    copy_pair(cln_p, cln_p, OUT_VAL_DEG, OUT_VAL_CLN, idx)
    idx += 1

print(f"Val created: {idx} pairs")

# ────────────────────────────────────────────────
#  TEST (750)
# ────────────────────────────────────────────────
idx = 0

# Hazy 250 from RESIDE test
res_test_deg_files = get_images(RES_TEST_DEG)
res_test_cln_files = get_images(RES_TEST_CLN)
for d, c in zip(res_test_deg_files[:250], res_test_cln_files[:250]):
    copy_pair(full_path(RES_TEST_DEG, d), full_path(RES_TEST_CLN, c), OUT_TEST_DEG, OUT_TEST_CLN, idx)
    idx += 1

# Rainy: 100 real + 150 synthetic
for deg_p, cln_p in rain_test_pairs[:100]:
    copy_pair(deg_p, cln_p, OUT_TEST_DEG, OUT_TEST_CLN, idx)
    idx += 1

clean_test = [cln_p for _, cln_p in res_test_src_pairs[:150]]
for cln_p in clean_test:
    synth_rain_from_src(cln_p, OUT_TEST_DEG, OUT_TEST_CLN, idx, is_hazy=False)
    idx += 1

# Rain+Haze 188 from RESIDE test deg
for d in res_test_deg_files[250:250+188]:
    synth_rain_from_src(full_path(RES_TEST_DEG, d), OUT_TEST_DEG, OUT_TEST_CLN, idx, is_hazy=True)
    idx += 1

# Clean 62
for c in res_test_cln_files[438:438+62]:
    cln_p = full_path(RES_TEST_CLN, c)
    copy_pair(cln_p, cln_p, OUT_TEST_DEG, OUT_TEST_CLN, idx)
    idx += 1

print(f"Test created: {idx} pairs")
print("Done. Check joint_dataset/ folders.")