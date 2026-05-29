from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from analyzer import PdfAnalysisError, analyze_pdf

app = FastAPI(title="File Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    content = await file.read()

    try:
        return analyze_pdf(content, file.filename)
    except PdfAnalysisError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
