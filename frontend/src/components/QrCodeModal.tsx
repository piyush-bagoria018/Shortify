"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiX, FiDownload, FiCopy } from "react-icons/fi";
import QRCode from "qrcode";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  theme?: string;
}

export default function QrCodeModal({
  isOpen,
  onClose,
  url,
  theme = "glass",
}: QrCodeModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && url) {
      generateQRCode();
    }
  }, [isOpen, url]);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: theme === "light" ? "#000000" : "#FFFFFF",
          light: theme === "light" ? "#FFFFFF" : "#000000",
        },
        errorCorrectionLevel: "M",
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement("a");
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyQRCodeUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className={`relative rounded-2xl shadow-2xl w-full max-w-md ${
          theme === "light"
            ? "bg-white border border-gray-200"
            : theme === "dark"
            ? "bg-[#1a1a1a] border border-gray-700"
            : "bg-gradient-to-br from-[#1e1e2e]/95 to-[#2a2a3e]/95 backdrop-blur-xl border border-gray-700/50"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            theme === "light"
              ? "border-gray-200"
              : theme === "dark"
              ? "border-gray-700"
              : "border-gray-700/50"
          }`}
        >
          <h3
            className={`text-xl font-semibold ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            QR Code
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === "light"
                ? "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                : "hover:bg-gray-700 text-gray-400 hover:text-white"
            }`}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="text-center">
              {/* QR Code */}
              <div
                className={`inline-block p-4 rounded-xl mb-4 ${
                  theme === "light"
                    ? "bg-white border border-gray-200"
                    : "bg-white/10 border border-gray-600"
                }`}
              >
                {qrCodeDataUrl && (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                )}
              </div>

              {/* URL Display */}
              <div
                className={`p-3 rounded-lg mb-4 text-sm break-all ${
                  theme === "light"
                    ? "bg-gray-50 text-gray-700"
                    : theme === "dark"
                    ? "bg-[#2a2a2a] text-gray-300"
                    : "bg-gray-800/50 text-gray-300"
                }`}
              >
                {url}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyQRCodeUrl}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    copied
                      ? theme === "light"
                        ? "bg-green-100 text-green-700"
                        : "bg-green-600 text-white"
                      : theme === "light"
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : theme === "dark"
                      ? "bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <FiCopy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy URL"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadQRCode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === "light"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <FiDownload className="w-4 h-4" />
                  Download
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
