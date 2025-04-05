from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import json
import os

from gemini_enricher import enrich_ideas  # Make sure gemini_enricher.py is in the same folder

app = FastAPI()

# Allow CORS for your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust if using a different frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory & file path for ideas.json (enriched output)
script_dir = os.path.dirname(__file__)
ideas_file_path = os.path.join(script_dir, 'ideas.json')

@app.get("/")
async def read_root():
    return {"message": "Hello World from Backend"}

@app.get("/ideas")
async def get_ideas():
    """
    Reads and returns the enriched list of ideas from ideas.json.
    """
    try:
        with open(ideas_file_path, 'r') as f:
            ideas_data = json.load(f)
        return ideas_data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Ideas file not found.")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding ideas JSON file.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# Pydantic model for raw idea input
class RawIdea(BaseModel):
    id: int
    title: str
    category: str
    description: str
    votes: int

@app.post("/enrich")
async def enrich_idea_list(ideas: List[RawIdea]):
    """
    Accepts raw ideas, enriches them via Gemini, and returns updated list.
    """
    try:
        idea_dicts = [idea.dict() for idea in ideas]
        enriched = enrich_ideas(idea_dicts)
        return {"status": "success", "enriched_ideas": enriched}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enrichment failed: {str(e)}")
