---
name: transcribe-audio-with-qwen-asr
description: "Transcribe audio files using Qwen ASR (千问STT). Use when the user sends voice messages and wants them converted to text."
category: "Media"
author: community
version: "1.0.0"
icon: image
---

# Qwen ASR
Transcribe an audio file (wav/mp3/ogg...) to text using Qwen ASR. No configuration or API key required.

## Usage
```shell
uv run scripts/main.py -f audio.wav
cat audio.wav | uv run scripts/main.py > transcript.txt
```

## About
Qwen ASR is a free and open-source speech-to-text model.
It is trained on a large dataset of audio files from the web.
It is available in multiple languages.
This skill bases on the Qwen ASR Demo service (qwen-qwen3-asr-demo.ms.show).
