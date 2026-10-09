import { Terminal, Plus } from "lucide-react";
import "./Header.css";

export default function Header({ onAddClick }) {
  return (
    <header className="header">
      <div className="brand">
        <Terminal size={20} />
        <span>Open Command Center</span>
      </div>
      <button className="add-btn" onClick={onAddClick}>
        <Plus size={16} />
        Add command
      </button>
    </header>
  );
}