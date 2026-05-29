export interface PdfAnalysis {
  page_count: number
  encrypted: boolean
  metadata: Record<string, string>
  text_preview: string
}

export interface AnalysisResult {
  filename: string
  size_bytes: number
  mime_type: string
  sha256: string
  analysis: PdfAnalysis
}
