"""
Load portfolio knowledge, chunk it, embed with Gemini, store in FAISS.
Run this once to build the vector store; the chatbot will load it for retrieval.
"""
import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document

load_dotenv()

# Gemini embedding API uses GOOGLE_API_KEY; map from .env GEMINI_API_KEY
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if api_key:
    os.environ["GOOGLE_API_KEY"] = api_key

PROJECT_ROOT = Path(__file__).resolve().parent
KNOWLEDGE_PATH = PROJECT_ROOT / "hassan_portfolio_knowledge.txt"
FAISS_INDEX_PATH = PROJECT_ROOT / "faiss_index"

# ~500 tokens ≈ 2000 chars (rough rule of thumb)
CHUNK_SIZE = 2000
CHUNK_OVERLAP = 200


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into chunks of ~chunk_size chars with overlap."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end >= len(text):
            chunks.append(text[start:].strip())
            break
        # Prefer splitting at paragraph or line boundary
        break_at = text.rfind("\n\n", start, end + 1)
        if break_at == -1:
            break_at = text.rfind("\n", start, end + 1)
        if break_at == -1:
            break_at = text.rfind(". ", start, end + 1)
        if break_at > start:
            end = break_at + 1
        chunks.append(text[start:end].strip())
        start = end - overlap if overlap < end else end
    return [c for c in chunks if c]


def main():
    if not KNOWLEDGE_PATH.exists():
        raise FileNotFoundError(f"Knowledge file not found: {KNOWLEDGE_PATH}")

    text = KNOWLEDGE_PATH.read_text(encoding="utf-8")
    chunks = chunk_text(text)
    documents = [Document(page_content=chunk) for chunk in chunks]

    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    vectorstore = FAISS.from_documents(documents, embeddings)

    FAISS_INDEX_PATH.mkdir(parents=True, exist_ok=True)
    vectorstore.save_local(str(FAISS_INDEX_PATH))

    print(f"Loaded {len(documents)} chunks from {KNOWLEDGE_PATH.name}")
    print(f"FAISS index saved to {FAISS_INDEX_PATH}")


if __name__ == "__main__":
    main()
