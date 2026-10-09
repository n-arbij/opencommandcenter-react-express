import { useState } from "react";
import { Copy, Check } from "lucide-react";
import "./ResultCard.css";

export default function ResultCard({ command, description }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked; ignore */
    }
  }

  return (
    <article className="card">
      <div className="card-top">
        <code>{command}</code>
        <button onClick={handleCopy} aria-label="Copy command">
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <p>{description}</p>
    </article>
  );
}