import React, { useState } from 'react';
import { X, Heart, Sparkles, Check } from 'lucide-react';

interface RomanticLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  dedication: string;
  onSaveDedication: (text: string) => void;
}

export const RomanticLetterModal: React.FC<RomanticLetterModalProps> = ({
  isOpen,
  onClose,
  dedication,
  onSaveDedication
}) => {
  const [inputText, setInputText] = useState(dedication);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDedication(inputText);
    onClose();
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    if (inputText) {
      url.searchParams.set('for', encodeURIComponent(inputText));
    }
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Romantic Dedication"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300"
    >
      <div 
        className="relative w-full max-w-lg p-7 sm:p-9 rounded-3xl bg-[#24000D]/90 border border-[#E6A078]/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-[#FFE0B2] overflow-hidden"
        style={{
          boxShadow: '0 0 50px rgba(230, 57, 91, 0.15), 0 20px 40px rgba(0,0,0,0.9)'
        }}
      >
        {/* Subtle decorative crimson glow in corner */}
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#E6395B]/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-[#E6A078] active:scale-90 transition-all focus:outline-none"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4 text-[#E6A078]">
          <Heart size={18} className="fill-[#E6395B] text-[#E6395B]" />
          <span className="text-xs uppercase tracking-widest font-sans font-light">
            A Cinematic Dedication
          </span>
        </div>

        {/* Romantic Letter Text */}
        <div className="font-serif italic text-lg sm:text-xl text-[#FFE0B2]/95 leading-relaxed space-y-4 mb-6 border-l-2 border-[#E6A078]/30 pl-4">
          <p>
            &ldquo;In all of space and every quiet breath of time, there is only one heart my soul recognizes as home.&rdquo;
          </p>
          <p className="text-sm font-sans not-italic text-[#E6A078]/80 leading-normal">
            Every flowing orbit of this rose-gold light carries an eternal whisper meant only for you.
          </p>
        </div>

        {/* Personalization Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label
              htmlFor="dedicationInput"
              className="block text-xs uppercase tracking-wider text-[#E6A078]/80 mb-1.5 font-sans"
            >
              Dedicate this experience to:
            </label>
            <input
              id="dedicationInput"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. For My Forever, Sarah"
              maxLength={45}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[#E6A078]/30 text-[#FFE0B2] placeholder-[#E6A078]/40 focus:outline-none focus:border-[#E6A078] font-serif text-base tracking-wide"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-serif tracking-wider text-[#E6A078] hover:bg-[#E6A078]/15 border border-[#E6A078]/25 transition-all"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Sparkles size={14} />}
              <span>{copied ? 'Dedication link copied!' : 'Share dedication'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-serif tracking-wider text-[#E6A078]/80 hover:text-[#FFE0B2] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-serif tracking-wider bg-[#E6A078] text-[#24000D] font-medium hover:bg-[#FFE0B2] shadow-lg shadow-[#E6A078]/20 transition-all active:scale-95"
              >
                Save Dedication
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
