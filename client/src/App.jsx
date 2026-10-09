import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Header from "./components/Header";
import ResultCard from "./components/ResultCard";
import AddCommandModal from "./components/AddCommandModal";
import { useDebounce } from "./hooks/useDebounce";
import { searchCommands } from "./api";
import "./App.css";

export default function App() {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const debouncedQuery = useDebounce(query.trim(), 300);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    searchCommands(debouncedQuery, controller.signal)
      .then(setResults)
      .catch((err) => {
        if (err.name !== "AbortError") setError("Could not reach the server.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, refreshKey]);

  return (
    <>
      <Header onAddClick={() => setModalOpen(true)} />
      <main className="main">
        <h1 className="title">What command are you looking for?</h1>

        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Type a command or describe what it does"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={100}
            autoFocus
          />
        </div>

        <section className="results">
          {!debouncedQuery && !loading && results.length > 0 && (
            <p className="hint">Recently added</p>
          )}
          {error && <p className="hint">{error}</p>}
          {!error && !loading && debouncedQuery && results.length === 0 && (
            <p className="hint">No matches. Add it with the button above.</p>
          )}
          {results.map((r) => (
            <ResultCard key={r.id} command={r.command} description={r.description} />
          ))}
        </section>
      </main>

      {modalOpen && (
        <AddCommandModal
          onClose={() => setModalOpen(false)}
          onAdded={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </>
  );
}