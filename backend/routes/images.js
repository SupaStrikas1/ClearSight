const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const ImageHistory = require("../models/ImageHistory");
const authMiddleware = require("../middleware/authMiddleware");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const os = require("os");

// ─── Cloudinary Setup ──────────────────────────────────────
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage → no disk write for incoming file
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper: Upload buffer to Cloudinary
async function uploadToCloudinary(
  buffer,
  originalname,
  folder = "image-enhancer",
) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        use_filename: true,
        unique_filename: true,
        resource_type: "image",
        public_id: `${Date.now()}-${path.parse(originalname).name}`,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url); // full https URL
      },
    );
    stream.end(buffer);
  });
}

// ─── Upload + Enhance Route ────────────────────────────────
router.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ msg: "No image uploaded" });
    }

    let tempWorkDir;

    try {
      // 1. Upload original (degraded) to Cloudinary directly from buffer
      const degradedUrl = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        "image-enhancer/degraded",
      );

      // 2. Still need temp file for Restormer (it reads from disk)
      const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const tempWorkDir = path.join(os.tmpdir(), `nafnet-${uniqueId}`);
      await fs.mkdir(tempWorkDir, { recursive: true });

      const tempInputPath = path.join(
        tempWorkDir,
        `input_${uniqueId}${path.extname(req.file.originalname)}`,
      );
      const tempOutputPath = path.join(tempWorkDir, `output_${uniqueId}.png`); // Assume PNG output; adjust if needed

      await fs.writeFile(tempInputPath, req.file.buffer);

      const pythonPath = "C:\\Abhinand\\miniconda3\\envs\\nafnet\\python.exe";
      const nafnetCwd = path.join(__dirname, "..", "nafnet"); // Updated path
      const inferenceScript = path.join(nafnetCwd, "custom_inference.py");

      console.log(
        "Full command:",
        `${pythonPath} "${path.join(nafnetCwd, "basicsr/demo.py")}" -opt "${path.join(nafnetCwd, "options/test/SIDD/NAFNet-width32.yml")}" --input_path "${tempInputPath}" --output_path "${tempOutputPath}"`,
      );

      // Run model (updated command)
      await exec(
        `"${pythonPath}" "${inferenceScript}" ` +
          `--input "${tempInputPath}" ` +
          `--output "${tempOutputPath}" ` +
          `--model "experiments/pretrained_models/net_g_22000.pth"`,
        {
          cwd: nafnetCwd,
          env: {
            ...process.env,
            PYTHONPATH: nafnetCwd.replace(/\\/g, "/"),
          },
        },
      );

      // Output is always tempOutputPath (fixed by your script)
      const cleanLocalPath = tempOutputPath;

      // Verify
      try {
        await fs.access(cleanLocalPath);
        console.log("Custom NAFNet inference completed:", cleanLocalPath);
      } catch {
        throw new Error("Custom inference did not produce output file");
      }

      // Upload enhanced
      const cleanBuffer = await fs.readFile(tempOutputPath);
      const cleanUrl = await uploadToCloudinary(
        cleanBuffer,
        `enhanced_${req.file.originalname}`,
        "image-enhancer/clean",
      );

      // Cleanup
      await fs.rm(tempWorkDir, { recursive: true, force: true });

      // Save to DB (only URLs)
      const history = new ImageHistory({
        userId: req.user.id,
        degradedUrl, // renamed field
        cleanUrl,
        createdAt: new Date(),
      });
      await history.save();

      res.json({
        degradedUrl,
        cleanUrl,
        downloadUrl: cleanUrl, // same URL works for download
      });
    } catch (err) {
      console.error("Upload/Enhance error:", err);
      res.status(500).json({ msg: "Enhancement failed", details: err.message });
    } finally {
      // Guarantee cleanup even on crash / early return / error
      if (tempWorkDir) {
        await fs
          .rm(tempWorkDir, { recursive: true, force: true })
          .catch((e) => console.warn("NAFNet temp cleanup failed:", e.message));
      }
    }
  },
);

// ─── History ───────────────────────────────────────────────
router.get("/history", authMiddleware, async (req, res) => {
  const histories = await ImageHistory.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });

  // Already have full HTTPS URLs
  res.json(histories);
});

// Remove /download route completely (not needed anymore)
// If you want signed/attachment download later, add later

module.exports = router;
