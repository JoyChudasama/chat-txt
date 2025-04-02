import os
from google.cloud import firestore

FIRESTORE_CLIENT = firestore.Client(project=os.environ.get("FIRESTORE_PROJECT_ID"))
