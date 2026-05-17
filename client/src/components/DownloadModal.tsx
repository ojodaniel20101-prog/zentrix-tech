/*
  Download Modal Component
  Provides download options with quality, language, and subtitle selection
  Design: Obsidian Forge — glassmorphism modal
*/

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mediaId: number;
  mediaType: 'movie' | 'tv' | 'anime';
}

const QUALITY_OPTIONS = [
  { value: '480p', label: '480p (Low)', size: '~200MB' },
  { value: '720p', label: '720p (HD)', size: '~500MB' },
  { value: '1080p', label: '1080p (Full HD)', size: '~1.2GB' },
  { value: '4k', label: '4K (Ultra HD)', size: '~3GB' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'pt', label: 'Portuguese' },
];

const SUBTITLE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
];

export default function DownloadModal({
  isOpen,
  onClose,
  title,
  mediaId,
  mediaType,
}: DownloadModalProps) {
  const [quality, setQuality] = useState('720p');
  const [language, setLanguage] = useState('en');
  const [subtitle, setSubtitle] = useState('en');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadComplete(false);

    try {
      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setDownloadProgress(i);
      }

      setDownloadComplete(true);
      setTimeout(() => {
        onClose();
        setDownloadComplete(false);
        setDownloadProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(11, 18, 32, 0.95)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5" style={{ color: '#00D4FF' }} />
                  <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                    Download {title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  <X className="w-5 h-5" style={{ color: '#8899AA' }} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {!downloadComplete ? (
                  <>
                    {/* Quality Selection */}
                    <div>
                      <label className="text-sm font-600 uppercase tracking-wider" style={{ color: '#8899AA' }}>
                        Quality
                      </label>
                      <div className="mt-3 space-y-2">
                        {QUALITY_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setQuality(opt.value)}
                            className="w-full px-4 py-3 rounded-lg text-sm font-500 transition-all text-left flex items-center justify-between"
                            style={{
                              background:
                                quality === opt.value
                                  ? 'rgba(0, 212, 255, 0.15)'
                                  : 'rgba(255, 255, 255, 0.05)',
                              color: quality === opt.value ? '#00D4FF' : '#8899AA',
                              border: `1px solid ${
                                quality === opt.value
                                  ? 'rgba(0, 212, 255, 0.4)'
                                  : 'rgba(255, 255, 255, 0.1)'
                              }`,
                            }}
                          >
                            <span>{opt.label}</span>
                            <span className="text-xs opacity-70">{opt.size}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language Selection */}
                    <div>
                      <label className="text-sm font-600 uppercase tracking-wider" style={{ color: '#8899AA' }}>
                        Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full mt-3 px-4 py-2 rounded-lg text-sm"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#00D4FF',
                          border: '1px solid rgba(0, 212, 255, 0.2)',
                        }}
                      >
                        {LANGUAGE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subtitle Selection */}
                    <div>
                      <label className="text-sm font-600 uppercase tracking-wider" style={{ color: '#8899AA' }}>
                        Subtitles
                      </label>
                      <select
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="w-full mt-3 px-4 py-2 rounded-lg text-sm"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#00D4FF',
                          border: '1px solid rgba(0, 212, 255, 0.2)',
                        }}
                      >
                        {SUBTITLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Download Progress */}
                    {isDownloading && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs" style={{ color: '#8899AA' }}>
                            Downloading...
                          </span>
                          <span className="text-xs font-600" style={{ color: '#00D4FF' }}>
                            {downloadProgress}%
                          </span>
                        </div>
                        <div
                          className="w-full h-2 rounded-full overflow-hidden"
                          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                        >
                          <motion.div
                            className="h-full"
                            style={{ background: '#00D4FF' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${downloadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle
                      className="w-12 h-12 mx-auto mb-4"
                      style={{ color: '#06FFA5' }}
                    />
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#FFFFFF' }}>
                      Download Complete!
                    </h3>
                    <p className="text-sm" style={{ color: '#8899AA' }}>
                      {title} has been saved to your device.
                    </p>
                  </div>
                )}

                {/* Info Box */}
                <div
                  className="p-3 rounded-lg flex gap-2"
                  style={{ background: 'rgba(0, 212, 255, 0.1)' }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#00D4FF' }} />
                  <p className="text-xs" style={{ color: '#8899AA' }}>
                    Downloads are stored locally on your device and available offline.
                  </p>
                </div>
              </div>

              {/* Footer */}
              {!downloadComplete && (
                <div className="flex gap-3 p-6 border-t border-gray-800">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-600 transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#8899AA',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    disabled={isDownloading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-600 transition-all"
                    style={{
                      background: '#00D4FF',
                      color: '#050816',
                    }}
                    disabled={isDownloading}
                  >
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
