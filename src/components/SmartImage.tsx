import { useState } from "react";
import { ImageOff } from "lucide-react";
// Shows the image, or a labelled placeholder when path is empty / file is missing. No broken icons, stable layout.
export default function SmartImage({ src, alt, label, ratio = "4/3", fit = "cover", className = "" }: { src?: string; alt: string; label?: string; ratio?: string; fit?: "cover" | "contain"; className?: string }) {
  const [bad, setBad] = useState(false);
  return (
    <div className={`img ${className}`} style={{ aspectRatio: ratio }}>
      {src && !bad ? <img src={src} alt={alt} loading="lazy" onError={() => setBad(true)} style={{ objectFit: fit }} />
        : <div className="ph" role="img" aria-label={`Placeholder: ${alt}`}><ImageOff size={22} /><span>Asset needed</span><small>{label || alt}</small></div>}
    </div>
  );
}
