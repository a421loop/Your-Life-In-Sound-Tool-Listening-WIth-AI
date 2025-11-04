# Listening with AI

A web-based tool for exploring machine listening through custom-trained audio classification models.

## Overview

Students train audio models using Google's Teachable Machine, then paste their model URL into this tool to visualize real-time predictions and confidence scores. The tool is designed for classroom exploration of the gap between human and machine listening.

## Requirements

- Modern web browser (Chrome recommended)
- HTTPS connection (required for microphone access)
- Teachable Machine audio model URL

## Files
```
├── index.html    # Main structure
├── style.css     # Styling
└── script.js     # Functionality
```

## Setup

### Option 1: GitHub Pages

1. Create a new repository
2. Upload all three files to the root directory
3. Go to Settings → Pages
4. Source: Deploy from branch → main → / (root)
5. Save and wait 1-2 minutes

Your URL: `https://username.github.io/repo-name/`

### Option 2: Glitch

1. Go to glitch.com
2. New Project → glitch-hello-website
3. Delete existing files
4. Upload index.html, style.css, script.js
5. Click Show

### Option 3: Local

Open `index.html` directly in Chrome. Works immediately.

## Usage

1. Train an audio model at https://teachablemachine.withgoogle.com/
2. Export: TensorFlow.js → Upload → Shareable Link
3. Paste URL into the tool
4. Click "Load My Model"
5. Allow microphone access
6. Observe real-time detections

## How Confidence Works

### Model Output

The TensorFlow model processes audio and returns a probability distribution across all trained classes:
```javascript
scores = [0.728, 0.101, 0.171]
labels = ["Background Noise", "quiet", "noisy"]
```

Each score is a probability between 0 and 1. All scores sum to 1.0 due to the softmax output layer.

### Winner Selection

The code finds the highest probability:
```javascript
let maxIndex = 0;
let maxScore = scores[0];

for (let i = 1; i < scores.length; i++) {
    if (scores[i] > maxScore) {
        maxScore = scores[i];
        maxIndex = i;
    }
}

const detectedLabel = labels[maxIndex];
```

### Display

Confidence is displayed as a percentage:
```javascript
(maxScore * 100).toFixed(1) + "% confidence"
```

Example: `0.728` becomes `72.8%`

### CSV Export

Detections are logged with timestamp, label, and confidence:
```
Timestamp,Label,Confidence
12:59:41 AM,Background Noise,72.8
12:59:42 AM,noisy,89.9
```

## Technical Details

### Dependencies

- TensorFlow.js (loaded via CDN)
- TensorFlow Speech Commands library (loaded via CDN)
- Google Fonts: Space Grotesk

### Audio Processing

- Uses browser's Web Audio API via TensorFlow Speech Commands
- Processes audio in real-time with configurable parameters:
  - `probabilityThreshold: 0.5`
  - `invokeCallbackOnNoiseAndUnknown: true`
  - `overlapFactor: 0.5`

### Model Loading

Models are loaded directly from Teachable Machine's CDN:
```javascript
recognizer = speechCommands.create(
    'BROWSER_FFT',
    undefined,
    baseURL + 'model.json',
    baseURL + 'metadata.json'
);
```

## Browser Compatibility

Requires:
- Web Audio API
- Microphone access
- ES6 JavaScript support
- HTTPS (for microphone permissions)

Tested on Chrome, Firefox, Edge.

## Troubleshooting

### "speechCommands is not defined"

This occurs in sandboxed environments like the p5.js editor. Host the files on GitHub Pages, Glitch, or locally instead.

### Microphone access denied

Check browser permissions. The page must be served over HTTPS (except for localhost).

### Model fails to load

Verify the Teachable Machine URL ends with a `/` and contains `model.json` and `metadata.json`.

### 404 on GitHub Pages

Ensure:
- Files are in root directory (not a subfolder)
- File is named `index.html` (lowercase)
- GitHub Pages is enabled in repository settings
- Wait 1-2 minutes after enabling

## Credits

Made with 💜 by Sarena, inspired by Professor Wirfs-Brock, with debugging help from Claude

## License

Educational use. Modify as needed for classroom activities.
