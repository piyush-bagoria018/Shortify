"use client";
import { useState } from "react";
import { FiCopy, FiChevronUp, FiLink, FiSlash } from "react-icons/fi";
import { RiQrCodeLine } from "react-icons/ri";
import {
  FaTwitter,
  FaYoutube,
  FaVimeo,
  FaUnsplash,
  FaGlobeAmericas,
} from "react-icons/fa";
import { motion } from "framer-motion";

const links = [
  {
    short: "https://shortify.com/Bn41aCOlnxj",
    original: "https://www.twitter.com/tweets/8erelColhu/",
    icon: FaTwitter,
    clicks: 814,
    status: "Active",
    date: "Sep - 18 - 2023",
  },
  {
    short: "https://shortify.com/Bn41aCOlnxjj",
    original: "https://www.youtube.com/embed/y9hPjK8Q_S8",
    icon: FaYoutube,
    clicks: 2042,
    status: "Inactive",
    date: "Sep - 18 - 2023",
  },
  {
    short: "https://shortify.com/Bn41aCOlnxj",
    original: "https://www.adventuresinwanderlust.com/",
    icon: FaGlobeAmericas,
    clicks: 1013,
    status: "Active",
    date: "Sep - 18 - 2023",
  },
  {
    short: "https://shortify.com/Bn41aCOlnxj",
    original: "https://vimeo.com/652957634",
    icon: FaVimeo,
    clicks: 1313,
    status: "Active",
    date: "Sep - 18 - 2023",
  },
  {
    short: "https://shortify.com/Bn41aCOlnxj",
    original: "https://unsplash.com/photos/2KNvDz2FIVQ",
    icon: FaUnsplash,
    clicks: 1423,
    status: "Active",
    date: "Sep - 18 - 2023",
  },
];

interface UrlTableProps {
  compact?: boolean;
}

export default function UrlTable({ compact = false }: UrlTableProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Home page: show copy icon without copying or toast
  const copyToClipboard = async (_text: string, id: number) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  // For compact mode, only show first 5 rows to fit single screen
  const displayLinks = compact ? links.slice(0, 5) : links;

  return (
    <div
      className={`w-full max-w-7xl mx-auto ${compact ? "mt-1" : "mt-8"} px-4 ${
        compact ? "flex-1" : ""
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative bg-[#1a1f2e]/80 backdrop-blur-xl rounded-2xl border border-[#2a2f3e]/50 overflow-hidden ${
          compact ? "h-full" : ""
        }`}
      >
        {/* Table */}
        <div className={compact ? "overflow-hidden" : "overflow-x-auto"}>
          <table className="w-full">
            <thead>
              <tr className="bg-[#0f1525]/80 border-b border-[#2a2f3e]/50">
                <th className="text-left py-4 px-6 text-white/90 font-semibold text-sm">
                  Short Link
                </th>
                <th className="text-left py-4 px-6 text-white/90 font-semibold text-sm">
                  Original Link
                </th>
                <th className="text-center py-4 px-6 text-white/90 font-semibold text-sm">
                  QR Code
                </th>
                <th className="text-center py-4 px-6 text-white/90 font-semibold text-sm">
                  Clicks
                </th>
                <th className="text-center py-4 px-6 text-white/90 font-semibold text-sm">
                  Status
                </th>
                <th className="text-center py-4 px-6 text-white/90 font-semibold text-sm">
                  <span className="inline-flex items-center gap-1">
                    Date <FiChevronUp className="w-3 h-3 opacity-70" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayLinks.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`group border-b border-[#2a2f3e]/10 ${
                      index % 2 === 0 ? "bg-[#101827]/40" : "bg-transparent"
                    } hover:bg-[#2a2f3e]/20 transition-colors`}
                  >
                    {/* Short Link */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="text-white/90 font-medium text-sm">
                          {link.short}
                        </div>
                        <button
                          onClick={() => copyToClipboard(link.short, index)}
                          className="ml-1 w-8 h-8 rounded-full bg-[#0f1525]/70 border border-white/10 flex items-center justify-center hover:bg-white/10 opacity-100"
                          title="Copy"
                        >
                          <FiCopy className="w-4 h-4 text-white/80" />
                        </button>
                      </div>
                    </td>

                    {/* Original Link */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${
                            IconComponent === FaTwitter
                              ? "bg-[#1DA1F2]"
                              : IconComponent === FaYoutube
                              ? "bg-[#FF0000]"
                              : IconComponent === FaVimeo
                              ? "bg-[#1AB7EA]"
                              : IconComponent === FaUnsplash
                              ? "bg-black"
                              : "bg-[#2563eb]"
                          }`}
                        >
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-white/90 font-medium text-sm truncate">
                          {link.original}
                        </div>
                      </div>
                    </td>

                    {/* QR Code */}
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-[#0f1525]/70 border border-white/10">
                        <RiQrCodeLine className="w-5 h-5 text-white/60" />
                      </div>
                    </td>

                    {/* Clicks */}
                    <td className="py-4 px-6 text-center">
                      <div className="text-white/80 font-medium">
                        {link.clicks}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            link.status === "Active"
                              ? "text-green-400 bg-green-400/10 border-green-400/20"
                              : "text-yellow-300 bg-yellow-300/10 border-yellow-300/20"
                          }`}
                        >
                          {link.status}
                        </span>
                        <span
                          className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                            link.status === "Active"
                              ? "bg-green-500/10 border-green-400/20"
                              : "bg-yellow-500/20 border-yellow-400/30"
                          }`}
                          title={
                            link.status === "Active" ? "Active" : "Inactive"
                          }
                        >
                          {link.status === "Active" ? (
                            <FiLink className="w-4 h-4 text-green-400" />
                          ) : (
                            <FiSlash className="w-4 h-4 text-yellow-300" />
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-center">
                      <div className="text-white/60 text-sm">{link.date}</div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom blur overlay + subtle CTA */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-18 bg-gradient-to-t from-[#0b1220]/95 via-[#0b1220]/40 to-transparent backdrop-blur-sm" />
        <div className="absolute inset-x-0 bottom-8 z-10 text-center">
          <p className="text-white/70 text-sm">
            <a
              href="/register"
              className="text-[#4F8CFF] hover:underline cursor-pointer"
            >
              Register Now
            </a>{" "}
            to enjoy Unlimited History
          </p>
        </div>
      </motion.div>

      {/* No global toast on home page */}
    </div>
  );
}
