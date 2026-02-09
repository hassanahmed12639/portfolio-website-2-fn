"""
Portfolio contextual chatbot with RAG: FAISS retrieval + Gemini.
Run: python chatbot.py (then open the Gradio URL in browser).
"""
import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.messages import HumanMessage, SystemMessage
import gradio as gr

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if api_key:
    os.environ["GOOGLE_API_KEY"] = api_key

PROJECT_ROOT = Path(__file__).resolve().parent
FAISS_INDEX_PATH = PROJECT_ROOT / "faiss_index"

# RAG config
TOP_K_CHUNKS = 4
EMBEDDING_MODEL = "models/gemini-embedding-001"
# Set GEMINI_LLM_MODEL in .env to override. See https://ai.google.dev/gemini-api/docs/models
LLM_MODEL = os.getenv("GEMINI_LLM_MODEL", "gemini-2.5-flash")

SYSTEM_PROMPT = """You are a helpful assistant representing Hassan Ahmed, a Performance Marketer with 5+ years of experience. Your answers are based only on the provided context from his portfolio knowledge base.

Answer in a natural, professional way. When discussing his work, reference specific case studies, results (ROI, ROAS, CPA, conversions), and strategies where relevant. Stay concise and avoid generic marketing fluff. If the context doesn't contain enough information to answer, say so and suggest what the user could ask instead. Do not make up facts or numbers."""

_retriever = None
_llm = None


def _get_retriever():
    global _retriever
    if _retriever is None:
        embeddings = GoogleGenerativeAIEmbeddings(model=EMBEDDING_MODEL)
        vectorstore = FAISS.load_local(
            str(FAISS_INDEX_PATH),
            embeddings,
            allow_dangerous_deserialization=True,
        )
        _retriever = vectorstore.as_retriever(search_kwargs={"k": TOP_K_CHUNKS})
    return _retriever


def _get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGoogleGenerativeAI(
            model=LLM_MODEL,
            temperature=0.4,
            google_api_key=os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY"),
        )
    return _llm


def answer_with_rag(query: str) -> str:
    """
    Retrieves relevant chunks from the knowledge base and generates a context-aware
    answer using Gemini.
    """
    if not query or not query.strip():
        return "Please ask a question about Hassan's experience, case studies, or services."

    retriever = _get_retriever()
    llm = _get_llm()

    docs = retriever.invoke(query)
    context = "\n\n---\n\n".join(doc.page_content for doc in docs)

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(
            content=f"Use the following context to answer the question. If the answer is not in the context, say so.\n\nContext:\n{context}\n\nQuestion: {query}"
        ),
    ]
    try:
        response = llm.invoke(messages)
        return response.content if hasattr(response, "content") else str(response)
    except Exception as e:
        err = str(e).lower()
        if "404" in err or "not_found" in err:
            return (
                "The chat model is not available with your API key. "
                "Add GEMINI_LLM_MODEL to your .env with a valid model (e.g. gemini-2.5-flash, gemini-3-flash-preview). "
                "See https://ai.google.dev/gemini-api/docs/models"
            )
        raise


def launch_ui():
    if not FAISS_INDEX_PATH.exists():
        raise FileNotFoundError(
            f"FAISS index not found at {FAISS_INDEX_PATH}. Run build_knowledge_base.py first."
        )

    demo = gr.Interface(
        fn=answer_with_rag,
        inputs=gr.Textbox(
            label="Ask about Hassan's portfolio",
            placeholder="e.g. What case studies do you have in eCommerce? What's your approach to ROAS?",
            lines=2,
        ),
        outputs=gr.Textbox(label="Answer", lines=8),
        title="Hassan Ahmed — Portfolio Chat",
        description="Ask about performance marketing, case studies, ROI, or strategies. Answers are based on the portfolio knowledge base.",
    )
    demo.launch()


if __name__ == "__main__":
    launch_ui()
