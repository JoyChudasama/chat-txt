import os
from dotenv import load_dotenv

load_dotenv()

# Directory paths
CURRENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(CURRENT_DIR, "uploads")
VECTOR_STORE_DIR = os.path.join(CURRENT_DIR, "vector_store")

# Create necessary directories
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(VECTOR_STORE_DIR, exist_ok=True)

# Environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
FIRESTORE_PROJECT_ID = os.getenv("FIRESTORE_PROJECT_ID") 