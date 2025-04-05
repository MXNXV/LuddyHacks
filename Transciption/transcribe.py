import requests
import time

# Replace with your AssemblyAI API key
API_KEY = "a97e2886063b49a9aea58aae6359bc5b"
headers = {"authorization": API_KEY}

def upload_file(file_path):
    """
    Uploads a file to AssemblyAI and returns the URL of the uploaded file.
    """
    upload_endpoint = "https://api.assemblyai.com/v2/upload"
    with open(file_path, "rb") as f:
        response = requests.post(upload_endpoint, headers=headers, data=f)
    response.raise_for_status()  # raise exception if upload fails
    audio_url = response.json()['upload_url']
    return audio_url

def request_transcription(audio_url):
    """
    Requests transcription for the provided audio URL.
    Returns the transcript ID.
    """
    transcript_endpoint = "https://api.assemblyai.com/v2/transcript"
    json_data = {
        "audio_url": audio_url
    }
    response = requests.post(transcript_endpoint, json=json_data, headers=headers)
    response.raise_for_status()
    transcript_id = response.json()['id']
    return transcript_id

def poll_transcription(transcript_id):
    """
    Polls the transcription endpoint until the transcript is completed.
    Returns the transcription text.
    """
    transcript_endpoint = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"
    while True:
        response = requests.get(transcript_endpoint, headers=headers)
        response.raise_for_status()
        status = response.json()['status']
        if status == "completed":
            return response.json()['text']
        elif status == "error":
            raise Exception("Transcription failed: " + response.json()['error'])
        print(f"Transcription status: {status}. Retrying in 5 seconds...")
        time.sleep(5)

if __name__ == "__main__":
    # Path to your MP3 file
    mp3_file_path = "../data_audio/harvard.wav"

    try:
        print("Uploading file...")
        audio_url = upload_file(mp3_file_path)
        print("File uploaded successfully. Audio URL:", audio_url)
        
        print("Requesting transcription...")
        transcript_id = request_transcription(audio_url)
        print("Transcription requested. Transcript ID:", transcript_id)
        
        print("Polling for transcription result...")
        transcription_text = poll_transcription(transcript_id)
        print("\nTranscription Completed:")
        print(transcription_text)
    except Exception as e:
        print("An error occurred:", e)
