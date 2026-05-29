import { useRef, useState } from 'react'
import heroImg from './assets/hero.png'
import type { AnalysisResult } from './types'
import './App.css'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function analyzeFile(file: File) {
    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail ?? 'Analysis failed.')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      void analyzeFile(file)
    }
  }

  return (
    <section id="center">
      <img src={heroImg} alt="Hero" className="hero-image" />
      <h1>Welcome to the File Analyzer</h1>
      <p>Upload a PDF to see page count, metadata, and a text preview.</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={handleFileChange}
      />

      <button
        type="button"
        disabled={loading}
        onClick={() => fileInputRef.current?.click()}
      >
        {loading ? 'Analyzing…' : 'Choose PDF'}
      </button>

      {error && <p className="message error">{error}</p>}

      {result && (
        <div className="results">
          <h2>{result.filename}</h2>
          <dl className="results-grid">
            <div>
              <dt>Size</dt>
              <dd>{formatBytes(result.size_bytes)}</dd>
            </div>
            <div>
              <dt>Pages</dt>
              <dd>{result.analysis.page_count}</dd>
            </div>
            <div>
              <dt>Encrypted</dt>
              <dd>{result.analysis.encrypted ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt>SHA-256</dt>
              <dd className="mono">{result.sha256.slice(0, 16)}…</dd>
            </div>
          </dl>

          {Object.keys(result.analysis.metadata).length > 0 && (
            <div className="results-section">
              <h3>Metadata</h3>
              <dl className="metadata-list">
                {Object.entries(result.analysis.metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {result.analysis.text_preview && (
            <div className="results-section">
              <h3>Text preview</h3>
              <pre className="text-preview">{result.analysis.text_preview}</pre>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default App
