"""
Run the portfolio chatbot as an API for the website.
Start with: python chatbot_api.py
Serves POST /api/chat (body: { "message": "..." } -> { "answer": "..." })
CORS enabled for localhost (Next.js dev) and same-origin.
"""
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import after env is loaded so GEMINI_API_KEY is set
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if api_key:
    os.environ["GOOGLE_API_KEY"] = api_key

from chatbot import answer_with_rag
from pathlib import Path

FAISS_INDEX_PATH = Path(__file__).resolve().parent / "faiss_index"


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="Portfolio Chat API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if not FAISS_INDEX_PATH.exists():
        return ChatResponse(
            answer="Chat is not configured. Run build_knowledge_base.py first."
        )
    answer = answer_with_rag(request.message.strip())
    return ChatResponse(answer=answer)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
