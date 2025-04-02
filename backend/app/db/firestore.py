import os
from google.cloud import firestore
from langchain_google_firestore import FirestoreChatMessageHistory

FIRESTORE_CLIENT = firestore.Client(project=os.environ.get("FIRESTORE_PROJECT_ID"))