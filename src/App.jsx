import { useState, useEffect } from 'react';
import Header from './components/Header';
import VideoList from './components/VideoList';
import InteractivePlayer from './components/InteractivePlayer';

export default function App() {
    // --- DATABASE & NAVIGATION STATE ---
    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [isFullWidth, setIsFullWidth] = useState(true); // Tracks full-width layout setting

    // --- PERSISTENT VIDEO LIST STATE ---
    // These states live here so they persist even when VideoList unmounts!
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedStates, setSelectedStates] = useState([]);

    useEffect(() => {
        // Fetch videos from the public folder database
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

            {/* Layout Width Controller Container */}
            <main className={`flex-grow mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full transition-all duration-300 ${
                currentVideo && isFullWidth ? 'max-w-full lg:px-12' : 'max-w-7xl'
            }`}>
                
                {/* Width Toggle Button Wrapper (Only displays when a video is actively selected) */}
                {currentVideo && (
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setIsFullWidth(!isFullWidth)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-medium cursor-pointer"
                        >
                            {isFullWidth ? (
                                <>
                                    {/* Compress / Standard Width Icon */}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M10 10V4m0 0H4m6 6L3 3m10 7V4m0 0h6m-6 6l7-7" />
                                    </svg>
                                    Standard View
                                </>
                            ) : (
                                <>
                                    {/* Expand / Full Width Icon */}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                    </svg>
                                    Full Width View
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Conditional View Rendering */}
                {!currentVideo ? (
                    <VideoList 
                        videos={videos} 
                        onVideoSelect={setCurrentVideo} 
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        selectedStates={selectedStates}
                        setSelectedStates={setSelectedStates}
                    />
                ) : (
                    <InteractivePlayer video={currentVideo} />
                )}
            </main>
        </div>
    );
}