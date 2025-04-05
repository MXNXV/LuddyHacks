import assemblyai as aai
import json

# Set your AssemblyAI API key
aai.settings.api_key = "a97e2886063b49a9aea58aae6359bc5b"

# Path to local audio file
# LOCAL_FILE = "../data_audio/rOqgRiNMVqg.mp3"
LOCAL_FILE = "../data_audio/harvard.wav"

# Transcription configuration with all free features enabled
config = aai.TranscriptionConfig(
    summarization=True,
    summary_model="informative",
    summary_type="bullets",
    iab_categories=True,
    sentiment_analysis=False,
    speaker_labels=True,
    filter_profanity=True,
    language_detection=False
    # custom_vocabulary=["AssemblyAI", "AtharvaHack", "Summarization"]
)

# Create the transcriber
transcriber = aai.Transcriber(config=config)

# Transcribe the file
print("Transcribing audio with advanced features...")
transcript = transcriber.transcribe(LOCAL_FILE)

if transcript.status == aai.TranscriptStatus.error:
    print("Transcription failed:", transcript.error)
else:
    print("\n=== TRANSCRIPTION ===")
    print(transcript.text)

    print("\n=== SUMMARY ===")
    print(transcript.summary)

    print("\n=== TOP SENTIMENT ANALYSIS ===")
    if transcript.sentiment_analysis:
        top_sentiment = max(transcript.sentiment_analysis, key=lambda x: x.confidence)
        print(f"{top_sentiment.speaker}: {top_sentiment.sentiment} – {top_sentiment.text}")

    print("\n=== TOP IAB CATEGORY ===")
    if transcript.iab_categories and transcript.iab_categories.results:
        all_labels = []
        for result in transcript.iab_categories.results:
            all_labels.extend(result.labels)
        if all_labels:
            top_label = max(all_labels, key=lambda x: x.relevance)
            print(f"{top_label.label} ({top_label.relevance:.2f})")

    print("\n=== TOP SPEAKER SEGMENTS ===")
    for utterance in transcript.utterances[:5]:  # Show top 5 lines only
        print(f"Speaker {utterance.speaker}: {utterance.text}")

    # print("\n=== LANGUAGE DETECTED ===")
    # if hasattr(transcript, "language_detection") and transcript.language_detection:
    #     lang = transcript.language_detection
    #     print(f"{lang['language_code']} ({lang['confidence']:.2f})")
    # else:
    #     print("Language not detected or not returned.")

    print("\n=== LANGUAGE DETECTED ===")
    print(transcript.json_response["language_code"])
    # print(transcript.json_response["language_confidence"])

