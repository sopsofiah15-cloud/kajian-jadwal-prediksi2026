"use client";

import { useState } from "react";

export default function Home() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [result, setResult] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!from) {
      setError("Tanggal mulai wajib diisi");
      return;
    }
    setLoading(true);
    setError("");
    setResult("");
    setCopied(false);

    try {
      const params = new URLSearchParams({ from, to: to || from });
      const res = await fetch(`/api/fixtures?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengambil data");
      }

      setResult(data.formattedText);
      setCount(data.count);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "2rem 1.5rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#1a1a1a",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
        Panel Jadwal Pertandingan
      </h1>
      <p style={{ color: "#666", marginTop: 0, marginBottom: "1.5rem" }}>
        Ambil jadwal pertandingan otomatis dari API-Football, terformat siap pakai.
      </p>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: "0.85rem", color: "#444" }}>Dari tanggal</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: "0.85rem", color: "#444" }}>
            Sampai tanggal (opsional)
          </span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc" }}
          />
        </label>

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: 6,
            border: "none",
            background: loading ? "#999" : "#111",
            color: "#fff",
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Memuat..." : "Ambil Jadwal"}
        </button>
      </div>

      {error && (
        <p style={{ color: "#c0392b", background: "#fdecea", padding: "0.75rem", borderRadius: 6 }}>
          {error}
        </p>
      )}

      {result && (
        <>
          <p style={{ color: "#555", fontSize: "0.9rem" }}>
            {count} pertandingan ditemukan
          </p>
          <textarea
            readOnly
            value={result}
            rows={22}
            style={{
              width: "100%",
              fontFamily: "'SF Mono', Menlo, monospace",
              fontSize: "0.9rem",
              padding: "0.85rem",
              boxSizing: "border-box",
              borderRadius: 6,
              border: "1px solid #ccc",
              lineHeight: 1.6,
            }}
          />
          <button
            onClick={handleCopy}
            style={{
              marginTop: "0.75rem",
              padding: "0.5rem 1rem",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {copied ? "Tersalin!" : "Salin ke Clipboard"}
          </button>
        </>
      )}
    </main>
  );
}
