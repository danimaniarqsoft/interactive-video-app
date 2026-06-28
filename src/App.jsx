import { useState, useEffect } from 'react';
import Header from './components/Header';
import VideoList from './components/VideoList';
import InteractivePlayer from './components/InteractivePlayer';

export default function App() {
    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);

    useEffect(() => {
        // Fetch videos from the public folder
        fetch('/data/videos.json')
            .then(res => res.json())
            .then(data => setVideos(data))
            .catch(err => console.error("Error loading videos database:", err));
    }, []);

    return (
        <div className="bg-slate-50 text-slate-800 font-sans antialiased min-h-screen flex flex-col">
            <Header 
                currentVideo={currentVideo} 
                onBack={() => setCurrentVideo(null)} 
            />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {!currentVideo ? (
                    <VideoList videos={videos} onVideoSelect={setCurrentVideo} />
                ) : (
                    <InteractivePlayer video={currentVideo} />
                )}
            </main>
        </div>
    );
}