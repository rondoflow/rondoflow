---
name: download-youtube-videos-locally
description: "Downloads YouTube videos to ~/Downloads. Use when user wants to download a YouTube video to their machine."
category: "Media"
author: community
version: "1.0.3"
icon: image
---

# Download

Downloads YouTube videos to your ~/Downloads folder using yt-dlp.

## What it does

- Takes a YouTube URL as input
- Downloads the best available quality (video + audio merged to MP4)
- Saves to ~/Downloads with the video title as filename

## Usage

```bash
{baseDir}/download.sh "https://youtube.com/watch?v=VIDEO_ID"
```

Or just give me the URL and I'll run it for you.

## Requirements

- yt-dlp must be installed: `brew install yt-dlp`
- On first run, if yt-dlp is missing, the skill will prompt you to install it
