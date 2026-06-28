# Interactive Video Transcript Player Studio

A modular, highly optimized single-page web application built with **React** and **Tailwind CSS v4**. This studio allows users to browse an expanding video library and dynamically jump to exact frames/timestamps by clicking on words within an AI-generated text transcript.


## Key Features

- **Component-Driven Modular Architecture:** Built with standalone, reusable React components (`Header`, `VideoList`, `InteractivePlayer`).
- **Interactive Timestamps:** Click any word in the transcript to instantaneously seek the video player to that exact millisecond.
- **Vite + Tailwind CSS v4 Plugin:** Compiled using Vite's high-performance native CSS bundling layer.
- **Client-Side Pagination:** Handles large video database indices gracefully by grouping records into smooth, 15-item layout cycles.
- **Fluid Light-Mode UI:** Clean typography, customized smooth scrollbars, and micro-interactions (hover lift & shadow highlights) following UX best practices.

## Project Directory Structure

```text
interactive-video-app/
├── public/                   # Static assets served directly by the frontend
│   └── data/                 # Local Media Workspace (Ignored by Git)
│       ├── videos.json       # Central video index catalog metadata database
│       ├── aba_fixed.mp4     # Fast-start seekable target video asset
│       └── aba_fixed.json    # Word-by-word timestamp script from Faster-Whisper
├── src/                      # React Source Code
│   ├── components/           # Isolated Functional UI Modules
│   │   ├── Header.jsx        # Navigation banner and context-driven back button
│   │   ├── VideoList.jsx     # Paginated directory search lookup index table
│   │   └── InteractivePlayer.jsx # Split-screen layout tying video stream to script data
│   ├── App.jsx               # Application core controller and view router state
│   ├── index.css             # Tailwind v4 globals and custom animation utility hooks
│   └── main.jsx              # React DOM initialization engine mounting script
├── .gitignore                # Optimized exclusion list for Node, Python (.venv), and Media files
├── package.json              # Project scripts and package dependencies manifest
└── vite.config.js            # Configuration engine mounting Tailwind v4 plugins
```

## 🛠️ Installation & Setup

### 1. Frontend Setup (React + Vite)

Make sure you have [Node.js](https://nodejs.org/) installed, then run the following commands inside the `interactive-video-app` root directory:

```sh
# Install required npm packages
npm install

# Spin up the local Vite development server
npm run dev
```

_The terminal will provide a local URL (typically `http://localhost:5173`). Open this link in your browser to interact with the app._

### 2. Video Pipeline Requirements (Backend Server)

To ensure that clicking words skips video frames properly, your local development server **must support HTTP Range Requests (Byte-Serving)**. Standard browser file loops (`file:///`) or basic HTTP modules will block temporal skipping.

Run your **Flask Server** (`server.py`) right alongside this workspace to serve your asset files continuously.

## 📊 Data Contracts (JSON Structures)

### Video Index Database (`public/data/videos.json`)

The application fetches this collection dynamically to render the directory lookup list. Add new records following this structure:

```json
[
  {
    "title": "Aba Fixed Tutorial",
    "category": "Education",
    "video_url": "data/aba_fixed.mp4",
    "script_url": "data/aba_fixed.json"
  }
]
```

### Transcript Script Schema (`public/data/[video_name].json`)

The word-level time synchronization behaves according to timestamps emitted by your automated `faster-whisper` AI processing sequence:

```json
{
  "words": [
    { "word": "Welcome ", "start": "0.14", "end": "0.52" },
    { "word": "to ", "start": "0.53", "end": "0.71" },
    { "word": "this ", "start": "0.72", "end": "0.98" }
  ]
}
```