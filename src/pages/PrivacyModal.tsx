import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { APP_NAME, DOMAIN, CONTACT_EMAIL } from '../config';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-slate-300 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight">Privacy Policy</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
          <p className="text-slate-400">
            Last updated: October 2026. This Privacy Policy applies to {APP_NAME} ({DOMAIN}) and our associated mobile applications.
          </p>

          <h3 className="text-sm sm:text-base font-bold text-white pt-2">1. On-Device Processing Guarantee</h3>
          <p>
            Your photos never leave your device. All image uploads, brush masking, compositing, and video rendering are conducted 100% locally in your device's browser memory and WebCodecs GPU pipelines. We do not operate remote media servers, databases, or cloud processing queues.
          </p>

          <h3 className="text-sm sm:text-base font-bold text-white pt-2">2. Zero Account & Personal Data Collection</h3>
          <p>
            {APP_NAME} requires no account creation, passwords, email sign-ups, or social logins. We do not collect names, addresses, phone numbers, or contact lists.
          </p>

          <h3 className="text-sm sm:text-base font-bold text-white pt-2">3. No Biometric or Facial Recognition</h3>
          <p>
            The software provides manual brush tools and geometric presets (such as top/bottom/sides masks). We do not perform facial identification, biometric scanning, or celebrity recognition algorithms.
          </p>

          <h3 className="text-sm sm:text-base font-bold text-white pt-2">4. Local Storage and IndexedDB</h3>
          <p>
            Your projects and blackout strokes are saved locally on your device via browser IndexedDB and localStorage (for daily upload quota enforcement). You may clear this data at any time via the "Delete all my local data" button or through browser settings.
          </p>

          <h3 className="text-sm sm:text-base font-bold text-white pt-2">5. Cookieless Analytics</h3>
          <p>
            We may use privacy-preserving, cookieless analytics (such as Cloudflare Web Analytics) to count aggregated page visits and technical performance metrics. No personal tracking cookies or cross-site tracking fingerprints are utilized.
          </p>

          <h3 className="text-sm sm:text-base font-bold text-white pt-2">6. Contact</h3>
          <p>
            If you have questions regarding our privacy practices, contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 underline">
              {CONTACT_EMAIL}
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};
