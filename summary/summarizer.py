import os
import re
import json
from dotenv import load_dotenv
import google.generativeai as genai

# Load .env API key
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("models/gemini-1.5-pro-latest")

def summarize_and_extract(transcript_text):
    prompt = f"""
    You are an expert AI meeting assistant. Here's the meeting transcript:

    {transcript_text}

    Please return the output in the following format:

    === TL;DR ===
    (2-3 sentence summary of the entire meeting)

    === Meeting Minutes ===
    (Bullet point summary of all key points and discussions)

    === Action Items ===
    (List of tasks, each with:
      - Task Name
      - Assigned Owner (use 'Unassigned' if not mentioned)
      - Deadline (use 'No deadline' if not mentioned)
    )
    """

    response = model.generate_content(prompt)
    return response.text


def parse_output_to_json(output_text):
    sections = {
        "tl_dr": "",
        "meeting_minutes": [],
        "action_items": []
    }

    # TL;DR
    tl_match = re.search(r"=== TL;DR ===\s*(.+?)\s*=== Meeting Minutes ===", output_text, re.DOTALL)
    if tl_match:
        sections["tl_dr"] = tl_match.group(1).strip()

    # Meeting Minutes
    mm_match = re.search(r"=== Meeting Minutes ===\s*(.+?)\s*=== Action Items ===", output_text, re.DOTALL)
    if mm_match:
        raw_minutes = mm_match.group(1).strip().splitlines()
        sections["meeting_minutes"] = [line.strip("•*- ").strip() for line in raw_minutes if line.strip()]

    # Action Items
    ai_match = re.search(r"=== Action Items ===\s*(.+)", output_text, re.DOTALL)
    if ai_match:
        lines = ai_match.group(1).strip().splitlines()
        current_item = {}
        for line in lines:
            if "Task Name" in line:
                if current_item:
                    sections["action_items"].append(current_item)
                current_item = {"task": "", "owner": "", "deadline": ""}
                current_item["task"] = line.split("**Task Name:**")[-1].strip(" *:-")
            elif "Assigned Owner" in line:
                current_item["owner"] = line.split("**Assigned Owner:**")[-1].strip(" *:-")
            elif "Deadline" in line:
                current_item["deadline"] = line.split("**Deadline:**")[-1].strip(" *:-")
        if current_item:
            sections["action_items"].append(current_item)

    return sections



def main():
    with open("transcript.txt", "r", encoding="utf-8") as file:
        transcript = file.read()

    print("🚀 Generating summary...")
    raw_output = summarize_and_extract(transcript)

    parsed_json = parse_output_to_json(raw_output)

    # Save to JSON
    with open("summary_output.json", "w", encoding="utf-8") as f:
        json.dump(parsed_json, f, indent=4)

    print("✅ JSON output saved to summary_output.json")
    print(json.dumps(parsed_json, indent=4))


if __name__ == "__main__":
    main()
