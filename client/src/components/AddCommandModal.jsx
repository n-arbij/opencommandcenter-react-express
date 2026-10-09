import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createCommand } from "../api";
import "./AddCommandModal.css";

export default function AddCommandModal({ onClose, onAdded }) {
  const [command, setCommand] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createCommand(command.trim(), description.trim());
      onAdded();
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form className="modal" onSubmit={handleSubmit} role="dialog" aria-modal="true">
        <div className="modal-head">
          <h2>Add a command</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <label>
          Command
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="e.g. ipconfig /flushdns"
            maxLength={200}
            required
            autoFocus
          />
        </label>

        <label>
          What it does
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Clears the DNS resolver cache on Windows"
            maxLength={500}
            minLength={3}
            rows={3}
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="save-btn" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save command"}
        </button>
      </form>
    </div>
  );
}