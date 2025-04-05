import json
import re
import os
import google.generativeai as genai

# Configure Gemini API
API_KEY = "AIzaSyDoxmAqYNKVU0kniaLqp5tHJF_Qw0KxPgA"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("models/gemini-1.5-pro-latest")

def enrich_ideas(raw_ideas: list) -> list:
    # === Prompt Template ===
    prompt_template = """
📌 Updated AI Agent Prompt — Score Attribution + Evaluation

You are an AI agent responsible for evaluating ideas submitted via an innovation portal. Each idea initially contains the following fields:

Title
Category (or Department)
Description
Votes

As part of your task, you must assign and explain scores for the following criteria:

ROI (1–10): The potential business value of implementing this idea.
Effort (1–10): Estimated complexity, time, and resources required.
Strategic Alignment (1–5): How well this idea supports current strategic goals.
Risk (1–5): Probability of failure, rework, or significant challenge.

Your job is to:
- Assign scores for ROI, Effort, Alignment, and Risk based on the description, category context, and votes.
- Justify each score with a short explanation using language accessible to non-technical stakeholders.
- Use department/category-specific modifiers if relevant (e.g., different strategic priorities or team bandwidth).
- Calculate a composite score using the provided formula.
- Recommend a priority level (High, Medium, Low) with a clear, business-friendly explanation.

🎯 Use the ReAct (Reasoning + Action) Format

Step 1: Input Summary
Restate the idea title, category, description, and vote count.

Step 2: Score Assignment and Justification
Assign and explain each score like so:
ROI: 8 → “This idea directly targets a customer-facing pain point and could result in revenue uplift or cost savings, hence a high ROI.”
Effort: 6 → “Implementation requires integration with two internal systems but leverages existing frameworks.”
Alignment: 4 → “Closely supports our current strategic priority of automation in IT.”
Risk: 3 → “Moderate risk due to integration dependencies, but fallback options exist.”

Step 3: Department Modifiers
Adjust alignment and effort if the category affects scoring:
Example: Product ideas may benefit from higher alignment this quarter (deptBoost = 1.5), while HR may have less capacity (effortMod = 1.2).

Step 4: Composite Score
Use the following formula:
Composite Score =
(ROI × 2 + Alignment × deptBoost + (Votes / 100)) ÷ (Effort × Risk × deptEffortMod)

Where:
deptBoost = department-specific alignment weight (e.g., 1.5 for Product)
deptEffortMod = multiplier to model capacity (e.g., 1.2 for HR if resourced-constrained)

Step 5: Prioritization Decision
Label the idea as High, Medium, or Low priority and explain why.

📜 Output Format

Respond ONLY with a valid JSON array of updated ideas. Do not include any extra commentary or formatting.
Each idea should include all original fields, and new fields:
- roi
- effort
- alignment
- risk
- reasoning
- composite_score
- priority
- explanation

Input ideas:
{input_json}
"""

    # === Format Prompt ===
    input_json = json.dumps(raw_ideas, indent=2)
    prompt = prompt_template.format(input_json=input_json)
    response = model.generate_content(prompt)

    raw_response = response.text.strip()

    # === Try to Parse Response ===
    try:
        updated_ideas = json.loads(raw_response)
    except json.JSONDecodeError:
        print("Could not parse AI response as valid JSON. Attempting regex fallback.")
        match = re.search(r'\[.*\]', raw_response, re.DOTALL)
        if match:
            try:
                updated_ideas = json.loads(match.group(0))
            except json.JSONDecodeError:
                print("Regex extraction failed to parse.")
                updated_ideas = []
        else:
            updated_ideas = []

    # === Save to ideas.json (for /ideas route) ===
    script_dir = os.path.dirname(__file__)
    output_path = os.path.join(script_dir, 'ideas_output.json')

    with open(output_path, 'w') as outfile:
        json.dump(updated_ideas, outfile, indent=2)

    print("✅ Updated ideas written to ideas.json")
    return updated_ideas
