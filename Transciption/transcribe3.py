import assemblyai as aai
import json
import os
from pathlib import Path

# Set your AssemblyAI API key
aai.settings.api_key = "a97e2886063b49a9aea58aae6359bc5b"

# Path to local audio file
LOCAL_FILE = "../data_audio/rOqgRiNMVqg.mp3"

# Extract name from file (without extension)
file_stem = Path(LOCAL_FILE).stem  # e.g., "harvard"

# Create a unique subfolder for this transcription
output_dir = f"output/{file_stem}"
os.makedirs(output_dir, exist_ok=True)

# Transcription config
config = aai.TranscriptionConfig(
    summarization=True,
    summary_model="informative",
    summary_type="bullets",
    iab_categories=True,
    sentiment_analysis=False,
    speaker_labels=True,
    filter_profanity=True,
    language_detection=False
)

# Transcribe
transcriber = aai.Transcriber(config=config)
print(f"Transcribing {LOCAL_FILE}...")
transcript = transcriber.transcribe(LOCAL_FILE)

# Check status
if transcript.status == aai.TranscriptStatus.error:
    print("Transcription failed:", transcript.error)
else:
    # === TRANSCRIPT ===
    with open(f"{output_dir}/transcript.txt", "w") as f:
        f.write(transcript.text)
    print(f"Saved {output_dir}/transcript.txt")

    # === SUMMARY ===
    with open(f"{output_dir}/summary.txt", "w") as f:
        f.write(transcript.summary)
    print(f"Saved {output_dir}/summary.txt")

    # === TOP IAB CATEGORY ===
    if transcript.iab_categories and transcript.iab_categories.results:
        all_labels = []
        for result in transcript.iab_categories.results:
            all_labels.extend(result.labels)
        if all_labels:
            top_label = max(all_labels, key=lambda x: x.relevance)
            with open(f"{output_dir}/iab_category.txt", "w") as f:
                f.write(f"{top_label.label} ({top_label.relevance:.2f})")
            print(f"Saved {output_dir}/iab_category.txt")

    # === SPEAKER SEGMENTS ===
    with open(f"{output_dir}/speaker_labels.txt", "w") as f:
        for utterance in transcript.utterances[:5]:
            f.write(f"Speaker {utterance.speaker}: {utterance.text}\n")
    print(f"Saved {output_dir}/speaker_labels.txt")

    # === LANGUAGE DETECTED (if enabled) ===
    if "language_code" in transcript.json_response:
        lang_code = transcript.json_response["language_code"]
        with open(f"{output_dir}/language.txt", "w") as f:
            f.write(f"{lang_code}")
        print(f"Saved {output_dir}/language.txt")
