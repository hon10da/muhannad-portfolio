import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion"; import { X } from "lucide-react";
export default function Modal({ onClose, children, label }: { onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; }; }, [onClose]);
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal" role="dialog" aria-modal="true" aria-label={label} initial={{ y: 24, scale: .97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 16, opacity: 0 }} onClick={e => e.stopPropagation()}>
        <button className="x" onClick={onClose} aria-label="Close" autoFocus><X size={18} /></button>{children}
      </motion.div>
    </motion.div>
  );
}
