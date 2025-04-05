from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

# Allow CORS for your frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Ensure this matches your Vite dev server port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the directory where this script is located
script_dir = os.path.dirname(__file__)
# Construct the path to the ideas.json file
ideas_file_path = os.path.join(script_dir, 'ideas.json')

@app.get("/")
async def read_root():
    return {"message": "Hello World from Backend"}

@app.get("/ideas")
async def get_ideas():
    """
    Reads and returns the list of ideas from ideas.json.
    """
    try:
        with open(ideas_file_path, 'r') as f:
            ideas_data = json.load(f)
        return ideas_data
    except FileNotFoundError:
        return {"error": "Ideas file not found."}, 404
    except json.JSONDecodeError:
        return {"error": "Error decoding ideas JSON file."}, 500
    except Exception as e:
        return {"error": f"An unexpected error occurred: {str(e)}"}, 500

# Make sure to run this backend using: uvicorn main:app --reload --port 8000