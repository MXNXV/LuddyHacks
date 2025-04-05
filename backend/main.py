from fastapi import FastAPI, HTTPException # Import HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from typing import List, Dict, Any # For type hinting

app = FastAPI()

# Allow CORS for your frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Ensure this matches your Vite dev server port
    allow_credentials=True,
    allow_methods=["*"], # Allow POST/PATCH etc.
    allow_headers=["*"],
)

# Get the directory where this script is located
script_dir = os.path.dirname(__file__)
# Construct the path to the ideas.json file
ideas_file_path = os.path.join(script_dir, 'ideas.json')

# Helper function to read ideas
def read_ideas_data() -> List[Dict[str, Any]]:
    try:
        with open(ideas_file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Ideas file not found.")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding ideas JSON file.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred reading ideas: {str(e)}")

# Helper function to write ideas
def write_ideas_data(ideas_data: List[Dict[str, Any]]):
    try:
        with open(ideas_file_path, 'w') as f:
            json.dump(ideas_data, f, indent=2) # Use indent for readability
    except Exception as e:
        # Note: This error happens *after* the response might have been sent in a simple setup.
        # Proper error handling might involve transactions or more robust file writing.
        print(f"Error writing ideas data: {str(e)}") # Log error server-side
        # We might not be able to raise HTTPException here if response already started.


@app.get("/")
async def read_root():
    return {"message": "Hello World from Backend"}

@app.get("/ideas")
async def get_ideas():
    """
    Reads and returns the list of ideas from ideas.json.
    """
    return read_ideas_data()


@app.post("/ideas/{idea_id}/upvote")
async def upvote_idea(idea_id: int):
    """
    Increments the vote count for a specific idea.
    """
    ideas = read_ideas_data()
    idea_found = False
    updated_idea = None
    for idea in ideas:
        if idea.get("ID") == idea_id:
            idea["Votes"] = idea.get("Votes", 0) + 1
            idea_found = True
            updated_idea = idea
            break

    if not idea_found:
        raise HTTPException(status_code=404, detail=f"Idea with ID {idea_id} not found")

    write_ideas_data(ideas)
    return updated_idea 

@app.post("/ideas/{idea_id}/downvote")
async def downvote_idea(idea_id: int):
    """
    Decrements the vote count for a specific idea.
    """
    ideas = read_ideas_data()
    idea_found = False
    updated_idea = None
    for idea in ideas:
        if idea.get("ID") == idea_id:

            idea["Votes"] = idea.get("Votes", 0) - 1
            idea_found = True
            updated_idea = idea
            break

    if not idea_found:
        raise HTTPException(status_code=404, detail=f"Idea with ID {idea_id} not found")

    write_ideas_data(ideas)
    return updated_idea 
