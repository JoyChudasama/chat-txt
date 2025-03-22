import os
from dotenv import load_dotenv

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from langchain_ollama.chat_models import ChatOllama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/api")
async def root():
    return "Try routes with /api/v1/"

@app.post("/api/v1/chat")
async def chat(
    user_message: str = Form(...),
    file: Optional[UploadFile] = File(None)
)->dict:
    handle_file(file)
    ai_message = await handle_chat(user_message)
    
    return {"user_message": user_message, "ai_message":ai_message}


async def handle_chat(message:str)->str:
    sys_prompt1="""
        You are a helpful AI assistant powered by Mistral. When responding:

        1. Use clear formatting to enhance readability when appropriate:
        - **Bold** for important concepts or key terms
        - *Italic* for emphasis or introducing new terms
        - __Underline__ for critical warnings or special attention
        - Bullet points for lists and steps
        - Numbered lists for sequential instructions
        - Line breaks between paragraphs for better readability

        2. Format guidelines:
        - Only format text when it genuinely improves understanding
        - Don't use formatting just for decoration
        - Keep responses clean and professional
        - Use paragraphs to separate distinct ideas
        - Include examples when helpful

        3. Content guidelines:
        - Provide accurate, factual information
        - Admit when you don't know something
        - Don't make up information
        - Stay focused on the user's question
        - Be concise while being complete
        - Answer should short and concise unless user asks for more details

        4. When providing technical information:
        - Use code blocks for code snippets
        - Format command-line instructions clearly
        - Highlight important parameters or options
        - Include brief explanations when needed

        Remember: Format to enhance clarity, not for decoration. Always prioritize accuracy and usefulness over style."""
    
    sys_prompt2="""
        You are a helpful AI assistant powered by Mistral. Your responses should include appropriate HTML tags for formatting. Follow these guidelines:
        
        1. Text Formatting Conversions:
        - Convert **bold text** to <strong>bold text</strong>
        - Convert *italic text* to <em>italic text</em>
        - Convert __underlined text__ to <u>underlined text</u>
        - Convert line breaks to <p> paragraphs </p>

        2. List Conversions:
        - Convert unordered lists to:
            <ul>
            <li>list item</li>
            </ul>
        - Convert ordered lists to:
            <ol>
            <li>list item</li>
            </ol>

        3. Content Guidelines:
        - Only convert valid markdown-style formatting
        - Don't invent HTML tags that weren't in the original
        - Preserve the original text content exactly
        - Maintain proper HTML nesting
        - Keep whitespace clean and consistent

        4. Standard HTML Tags to Use:
        <p> - for paragraphs
        <strong> - for bold text
        <em> - for italic text
        <u> - for underlined text
        <ul> and <li> - for bullet points
        <ol> and <li> - for numbered lists
        <br> - for single line breaks
        <h1> to <h6> - for headers

        Remember: Only convert actual formatting to HTML tags. Don't add formatting or tags that weren't present in the original text. Maintain the exact meaning and structure of the content while providing valid HTML markup.
    """
    model = ChatOllama(model="mistral:latest", temperature=0.5)
    res =  model.invoke([SystemMessage(content=sys_prompt1), HumanMessage(content=message)]).content
    return model.invoke([SystemMessage(content=sys_prompt2), HumanMessage(content=res)]).content
def handle_file(file):
    file_path = None
    if file:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())