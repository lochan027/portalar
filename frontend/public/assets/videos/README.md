# Video Assets

This directory contains video files for AR video ads.

## Recommended Formats

- **Primary**: MP4 (H.264, AAC) for iOS compatibility
- **Fallback**: WebM (VP9, Opus) for Android

## Specifications

- **Resolution**: Max 1920×1080 (prefer 1280×720 for mobile)
- **Bitrate**: 2-5 Mbps
- **Duration**: 15-60 seconds
- **Frame Rate**: 30 fps
- **Audio**: Optional, muted autoplay recommended

## Optimization

### Using FFmpeg

```bash
# Install FFmpeg
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg

# Optimize for web
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart output.mp4

# Generate WebM fallback
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 2M -c:a libopus -b:a 128k output.webm

# Generate poster image (thumbnail)
ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 poster.jpg
```

### Using Script

```bash
npm run optimize-video -- --input=path/to/video.mp4
```

## CDN Hosting

For production, host videos on CDN:
- **Cloudflare Stream**
- **AWS S3 + CloudFront**
- **Vimeo** (embed)
- **YouTube** (embed)

## Usage

```json
{
  "type": "video",
  "videoUrl": "https://cdn.example.com/video.mp4",
  "posterUrl": "https://cdn.example.com/poster.jpg"
}
```

## Demo Videos

Sample video source:
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4

## Mobile Considerations

- Always include `playsinline` attribute
- Muted autoplay works best
- Provide play button for user control
- Keep file size < 10MB for 3G/4G

## License

Ensure videos are licensed for your use case.
