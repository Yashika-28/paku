# @title 2. RVC Automated Training Pipeline (Bash/Colab)

# 1. Clone the repository and install dependencies
git clone https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI.git
cd Retrieval-based-Voice-Conversion-WebUI
pip install -r requirements.txt
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# 2. Download necessary Base Models (Hubert & Pre-trained v2)
wget https://huggingface.co/lj1995/VoiceConversionWebUI/resolve/main/hubert_base.pt -P ./assets/hubert
wget https://huggingface.co/lj1995/VoiceConversionWebUI/resolve/main/rmvpe.pt -P ./assets/rmvpe
wget https://huggingface.co/lj1995/VoiceConversionWebUI/resolve/main/pretrained_v2/f0G40k.pth -P ./assets/pretrained_v2
wget https://huggingface.co/lj1995/VoiceConversionWebUI/resolve/main/pretrained_v2/f0D40k.pth -P ./assets/pretrained_v2

# 3. Setup Experiment Variables
EXPERIMENT_NAME="my_clone_v1"
DATASET_DIR="../dataset" # Pointing to the folder from Phase 1

# 4. Pre-process the dataset
python infer/modules/train/preprocess.py $DATASET_DIR 40000 2 ./logs/$EXPERIMENT_NAME False

# 5. Extract Features and Pitch (using RMVPE algorithm)
python infer/modules/train/extract/extract_f0_print.py ./logs/$EXPERIMENT_NAME 2 rmvpe
python infer/modules/train/extract_feature_print.py cuda:0 1 0 0 ./logs/$EXPERIMENT_NAME v2

# 6. Train the Model! (Tuned for 6 minutes of data)
# Arguments: exp_dir, sr, if_f0, spk_id, save_epoch, total_epoch, batch_size, if_save_latest, pretrained_G, pretrained_D, gpus, if_cache_gpu
python infer/modules/train/train.py \
  -e $EXPERIMENT_NAME \
  -sr 40k \
  -f0 1 \
  -se 20 \
  -te 150 \
  -bs 8 \
  -g ./assets/pretrained_v2/f0G40k.pth \
  -d ./assets/pretrained_v2/f0D40k.pth \
  -c 1

# 7. Build the Index (for the accent/timbre matching)
python infer/modules/train/train_index.py $EXPERIMENT_NAME v2