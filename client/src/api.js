const BASE = import.meta.env.VITE_API_URL;

export async function searchCommands(q, signal) {
  const res = await fetch(`${BASE}/api/commands?q=${encodeURIComponent(q)}`, { signal });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function createCommand(command, description) {
  const res = await fetch(`${BASE}/api/commands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command, description }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not save command");
  return data;
}