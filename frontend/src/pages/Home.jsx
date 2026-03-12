"use client";

import React, { useState, useContext } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const [file, setFile] = useState(null);
  const [degradedUrl, setDegradedUrl] = useState("");
  const [cleanUrl, setCleanUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = useContext(AuthContext);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image first");
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/images/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setDegradedUrl(res.data.degradedUrl);
      setCleanUrl(res.data.cleanUrl);
      // setDownloadUrl(res.data.downloadUrl);
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error("Upload error");
    }
    setLoading(false);
  };

  const forceDownload = async (url, filename = "enhanced-image.jpg") => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Could not download the image. Try right-click → Save image as.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div
        className="absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-slate-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <Navbar />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-4 sm:px-6 py-8 sm:py-12">
        {/* Upload Section */}
        <div className="w-full max-w-4xl">
          {!cleanUrl ? (
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-slate-700/50 p-6 sm:p-8 md:p-10">
              {/* Header */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                  Enhance Your Images
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm md:text-base">
                  Upload an image to see the magic of AI-powered enhancement
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-xs sm:text-sm font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* File Upload Area */}
              <div className="mb-6 sm:mb-8">
                <label
                  htmlFor="file-upload"
                  className="block text-slate-300 text-xs sm:text-sm font-medium mb-3"
                >
                  Select Image
                </label>
                <div className="relative">
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {file ? (
                    <div className="w-full px-4 sm:px-6 py-6 sm:py-8 border-2 border-dashed border-blue-500/50 rounded-lg bg-blue-500/10 hover:bg-blue-500/15 transition-all duration-200 cursor-pointer">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative h-40 rounded-lg overflow-hidden border border-blue-500/30 bg-slate-900/50">
                          <img
                            src={
                              URL.createObjectURL(file) || "/placeholder.svg"
                            }
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-slate-300 text-xs sm:text-sm font-medium truncate max-w-xs">
                            {file.name}
                          </p>
                          <p className="text-slate-500 text-xs mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full px-4 sm:px-6 py-6 sm:py-8 border-2 border-dashed border-slate-600/50 rounded-lg bg-slate-700/20 hover:bg-slate-700/30 hover:border-slate-500/50 transition-all duration-200 text-center cursor-pointer">
                      <svg
                        className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-slate-500 mb-2"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <p className="text-slate-300 text-xs sm:text-sm font-medium">
                        Click or drag to upload image
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        PNG, JPG, GIF up to 50MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={loading || !file}
                className="w-full py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 active:scale-95 relative overflow-hidden disabled:opacity-70"
                style={{
                  background: loading
                    ? "linear-gradient(to right, #1e40af, #1e40af 50%, #1d4ed8 50%, #1d4ed8)"
                    : "linear-gradient(to right, #2563eb, #1d4ed8)",
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-blue-400/30 to-blue-300/30 transition-transform duration-[3000ms] ease-in-out ${
                    loading
                      ? "translate-x-0 scale-x-100"
                      : "-translate-x-full scale-x-0"
                  }`}
                />

                <span className="relative z-10 text-white">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    "Upload and Enhance"
                  )}
                </span>
              </button>
            </div>
          ) : (
            /* Results Section */
            <div className="space-y-6">
              <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-slate-700/50 p-6 sm:p-8 md:p-10 overflow-hidden">
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                    Enhancement Results
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm md:text-base">
                    Compare the original and enhanced images
                  </p>
                </div>

                {/* Image Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Degraded Image */}
                  <div className="bg-slate-700/20 rounded-lg p-4 sm:p-6 border border-slate-600/30">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                      Original Image
                    </h3>
                    <div className="relative overflow-hidden rounded-lg bg-slate-900/50 aspect-square sm:aspect-auto">
                      <img
                        src={degradedUrl || "/placeholder.svg"}
                        alt="Degraded"
                        className="w-full h-auto rounded-lg hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Enhanced Image */}
                  <div className="bg-slate-700/20 rounded-lg p-4 sm:p-6 border border-slate-600/30">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                      Enhanced Image
                    </h3>
                    <div className="relative overflow-hidden rounded-lg bg-slate-900/50 aspect-square sm:aspect-auto">
                      <img
                        src={cleanUrl || "/placeholder.svg"}
                        alt="Clean"
                        className="w-full h-auto rounded-lg hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Download Button */}
                    <a
                      href={`${cleanUrl}?fl_attachment`}
                      onClick={() =>
                        forceDownload(
                          cleanUrl,
                          `enhanced-${new Date().toISOString().split("T")[0]}.jpg`,
                        )
                      }
                      className="mt-4 block w-full py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 active:scale-95 text-center text-sm sm:text-base"
                    >
                      Download Enhanced Image
                    </a>
                  </div>
                </div>
              </div>

              {/* New Upload Button */}
              <button
                onClick={() => {
                  setFile(null);
                  setDegradedUrl("");
                  setCleanUrl("");
                }}
                className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-slate-700/50 text-white font-semibold rounded-lg hover:bg-slate-700 border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200"
              >
                Upload Another Image
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
