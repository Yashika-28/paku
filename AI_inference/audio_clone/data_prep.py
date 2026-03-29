

import os
import librosa
import soundfile as sf
import numpy as np
from pydub import AudioSegment
from pydub.silence import split_on_silence
from colorama import Fore, init
import shutil

init(autoreset=True)

RAW_FOLDER = "raw_audio"        # Put your 6-min raw WAVs here
DATASET_FOLDER = "dataset"      # The final sliced files go here

if os.path.exists(DATASET_FOLDER):
    shutil.rmtree(DATASET_FOLDER)
os.makedirs(DATASET_FOLDER, exist_ok=True)
os.makedirs(RAW_FOLDER, exist_ok=True)

MAX_AMP_THRESHOLD = 1.05  # Increased to allow natural heavy distortion
MIN_ROLLOFF_HZ = 2500     # Lowered to accommodate deep vocal tones

def is_valid_chunk(audio_chunk, sample_rate):
    import numpy as np
    import librosa
    
    max_amp = np.max(np.abs(audio_chunk))
    rolloff = librosa.feature.spectral_rolloff(y=audio_chunk, sr=sample_rate)[0]
    mean_rolloff = np.mean(rolloff)
    
    if max_amp > MAX_AMP_THRESHOLD:
        return False, f"Clipped (Max Amp: {max_amp:.2f})"
    if mean_rolloff < MIN_ROLLOFF_HZ:
        return False, f"Muffled (Rolloff: {mean_rolloff:.0f}Hz)"
        
    return True, "Valid"

def analyze_and_slice():
    print(f"{Fore.CYAN}Starting Slicing & Analysis...")
    chunk_counter = 0
    passed_chunks = 0
    
    for filename in os.listdir(RAW_FOLDER):
        if not filename.endswith('.wav'): continue
        
        filepath = os.path.join(RAW_FOLDER, filename)
        audio = AudioSegment.from_wav(filepath)
        
        # 1. Split on Silence (Min 500ms silence, -40dB threshold)
        chunks = split_on_silence(audio, min_silence_len=500, silence_thresh=-40)
        
        for i, chunk in enumerate(chunks):
            # Enforce length: Drop chunks shorter than 3s or longer than 12s
            if len(chunk) < 3000 or len(chunk) > 12000:
                continue
                
            temp_path = f"temp_chunk.wav"
            chunk.export(temp_path, format="wav")
            
            # 2. Quality Analysis (Librosa)
            y, sr = librosa.load(temp_path, sr=40000, mono=True)
            
            # 3. The Strict Filter
            is_valid, reason = is_valid_chunk(y, sr)
            if not is_valid:
                print(f"{Fore.RED}Dropped {filename} chunk {i}: {reason}")
            else:
                # Passed! Save to dataset
                final_path = os.path.join(DATASET_FOLDER, f"voice_{chunk_counter:04d}.wav")
                sf.write(final_path, y, sr)
                print(f"{Fore.GREEN}Saved {final_path} | Length: {len(chunk)/1000:.1f}s")
                passed_chunks += 1
                chunk_counter += 1

    print(f"\n{Fore.CYAN}Total valid chunks for training: {passed_chunks}")

# Run the function (Make sure your raw files are in 'raw_audio' folder first)
analyze_and_slice()