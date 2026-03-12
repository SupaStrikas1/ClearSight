'use client';

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import ImageModal from "../components/ImageModal";
import { AuthContext } from "../context/AuthContext";

const History = () => {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/images/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setHistory(res.data);
      } catch (err) {
        console.error("History fetch error");
      }
    };
    fetchHistory();
  }, [token]);

  const openModal = (item) => setSelected(item);
  const closeModal = () => setSelected(null);

  const handleDownload = () => {
    if (selected && selected.cleanUrl) {
      const link = document.createElement("a");
      link.href = selected.cleanUrl;
      link.download = `enhanced-image-${new Date(selected.createdAt).toISOString().split("T")[0]}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("No enhanced image available for download");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-slate-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>

      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-2">
            Image History
          </h2>
        </div>

        {/* History Grid */}
        {history.length > 0 ? (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {history.map((item, index) => (
                <div
                  key={index}
                  onClick={() => openModal(item)}
                  className="group bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden shadow-lg hover:shadow-2xl hover:border-slate-600/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden h-40 sm:h-48 bg-slate-900/50">
                    <img
                      src={item.cleanUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4">
                    <p className="text-slate-300 text-xs sm:text-sm font-medium">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-16 sm:py-24">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 sm:h-20 sm:w-20 text-slate-600"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-300 mb-2">
                No Enhanced Images Yet
              </h3>
              <p className="text-slate-500 text-sm sm:text-base mb-6">
                Start by uploading an image on the home page to see your enhancement history here.
              </p>
              <a
                href="/home"
                className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 active:scale-95 text-sm sm:text-base"
              >
                Go to Home
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <ImageModal
          degradedUrl={selected.degradedUrl}
          cleanUrl={selected.cleanUrl}
          onClose={closeModal}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

export default History;