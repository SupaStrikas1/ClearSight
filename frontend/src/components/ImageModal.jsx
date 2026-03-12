'use client';

import React from 'react';

const ImageModal = ({ degradedUrl, cleanUrl, onClose, onDownload }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-8">
      {/* Modal Container */}
      <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 px-6 sm:px-8 py-4 sm:py-6 border-b border-slate-700/50 bg-slate-800/60 backdrop-blur-xl flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Image Comparison</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors duration-200 p-1"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Degraded Image */}
            <div className="flex flex-col">
              <div className="mb-3">
                <h3 className="text-sm sm:text-base font-semibold text-slate-300">Original Image</h3>
                <p className="text-xs text-slate-500 mt-1">Input image</p>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-slate-600/50 bg-slate-900/50 flex-1 flex items-center justify-center min-h-64 sm:min-h-96">
                <img
                  src={degradedUrl || "/placeholder.svg"}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Clean Image */}
            <div className="flex flex-col">
              <div className="mb-3">
                <h3 className="text-sm sm:text-base font-semibold text-slate-300">Enhanced Image</h3>
                <p className="text-xs text-slate-500 mt-1">AI enhanced output</p>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-slate-600/50 bg-slate-900/50 flex-1 flex items-center justify-center min-h-64 sm:min-h-96">
                <img
                  src={cleanUrl || "/placeholder.svg"}
                  alt="Enhanced"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onDownload}
              className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 active:scale-95 text-sm sm:text-base"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Enhanced
              </span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-slate-700/50 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 text-sm sm:text-base border border-slate-600/50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;