import { useState, useEffect, useRef } from 'react';

export default function InteractivePlayer({ video }) {
    const [words, setWords] = useState([]);
    const [detectedLanguage, setDetectedLanguage] = useState('en');
    const [languageProbability, setLanguageProbability] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(0); // Tracks real-time video playback
    const [activeTab, setActiveTab] = useState('transcript'); // Toggle state: 'transcript' or 'json'
    const [currentStatus, setCurrentStatus] = useState('New'); // Tracks current study progress state
    const videoRef = useRef(null);

    // List of all valid study progression milestones
    const statusOptions = ['New', 'Learning', 'Needs Review', 'Understood', 'Mastered'];

    useEffect(() => {
        setLoading(true);
        // Sync local dropdown value when the parent component swaps active videos
        setCurrentStatus(video.state || 'New');

        fetch(`/${video.script_url}`)
            .then(res => {
                if (!res.ok) throw new Error("Could not load transcript");
                return res.json();
            })
            .then(data => {
                setWords(data.words || []);
                setDetectedLanguage(data.detected_language || 'en');
                setLanguageProbability(data.language_probability !== undefined ? data.language_probability : 1.0);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [video]);

    // Triggers on every video playback frame tick to sync highlights
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    // Single Click: Seek to the precise timestamp and play/continue video
    const handleWordClick = (start) => {
        if (!videoRef.current) return;
        const targetTime = parseFloat(start);
        videoRef.current.currentTime = targetTime;
        
        // Ensure it triggers play state smoothly
        videoRef.current.play().catch(e => console.log("Playback interaction note:", e));
    };

    // Double Click: Seek to the precise timestamp and immediately pause the video
    const handleWordDoubleClick = (start) => {
        if (!videoRef.current) return;
        const targetTime = parseFloat(start);
        videoRef.current.currentTime = targetTime;
        videoRef.current.pause();
    };

    // Updates state locally and saves selection permanently to videos.json via backend endpoint
    const handleStateChange = async (newStatus) => {
        setCurrentStatus(newStatus);
        
        try {
            // Sends update metadata back to server script responsible for writing file updates
            const response = await fetch('/api/videos/update-state', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    video_url: video.video_url,
                    state: newStatus
                })
            });

            if (!response.ok) {
                throw new Error("Failed to persist status configuration on server backend.");
            }
        } catch (err) {
            console.error("Data Save Error:", err);
        }
    };

    // Status styling color dictionary matching the core selection list
    const getStatusColorStyles = (status) => {
        switch (status.toLowerCase()) {
            case 'new': return 'bg-slate-100 text-slate-700 border-slate-300 focus:ring-slate-400';
            case 'learning': return 'bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-400';
            case 'needs review': return 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-400';
            case 'understood': return 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-400';
            case 'mastered': return 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-400';
            default: return 'bg-slate-100 text-slate-700 border-slate-300 focus:ring-slate-400';
        }
    };

    return (
        <div>
            {/* Video Title & Meta State Banner */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">{video.title}</h2>
                    <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider font-semibold">{video.category}</p>
                </div>
                
                {/* Clean, Dynamic Progress State Listbox Selector */}
                <div className="flex items-center gap-2.5 min-w-[210px]">
                    <label htmlFor="state-select" className="text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                        Study Status:
                    </label>
                    <select
                        id="state-select"
                        value={currentStatus}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className={`w-full text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-xl border shadow-xs cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusColorStyles(currentStatus)}`}
                    >
                        {statusOptions.map((option) => (
                            <option key={option} value={option} className="bg-white text-slate-800 font-medium normal-case">
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Video Player (Hidden on mobile/small screens, visible on lg and up) */}
                <div className="hidden lg:block lg:col-span-7 sticky top-24">
                    <div className="bg-black rounded-2xl shadow-xl overflow-hidden border border-slate-200 aspect-video flex items-center justify-center">
                        <video 
                            ref={videoRef} 
                            src={`/${video.video_url}`} 
                            onTimeUpdate={handleTimeUpdate}
                            className="w-full h-full object-contain" 
                            controls 
                            preload="auto" 
                            crossOrigin="anonymous" 
                        />
                    </div>
                </div>

                {/* Right Side: Tabbed Pane (Takes full width on mobile, 5 columns on lg and up) */}
                <div className="col-span-1 lg:col-span-5 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col h-[calc(100vh-14rem)] overflow-hidden">
                    
                    {/* Tab Navigation Controls */}
                    <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/70">
                        <div className="flex gap-1 bg-slate-200/60 p-1 rounded-xl w-full">
                            <button
                                onClick={() => setActiveTab('transcript')}
                                className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                                    activeTab === 'transcript'
                                        ? 'bg-white text-slate-900 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Transcript
                            </button>
                            <button
                                onClick={() => setActiveTab('json')}
                                className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                                    activeTab === 'json'
                                        ? 'bg-white text-slate-900 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Raw JSON
                            </button>
                        </div>
                    </div>

                    {/* Interactive Content Windows */}
                    <div className="p-6 overflow-y-auto flex-grow bg-slate-50/30">
                        {loading && <div className="text-slate-400 italic">Loading transcript data...</div>}
                        {error && <div className="text-red-500 font-bold">Error: {error}</div>}
                        
                        {!loading && !error && (
                            activeTab === 'transcript' ? (
                                /* Standard Text Interactive View */
                                <div className="text-lg leading-loose text-slate-700 p-2 bg-white rounded-xl border border-slate-100 shadow-xs select-none">
                                    {words.map((wordObj, idx) => {
                                        const start = parseFloat(wordObj.start);
                                        const end = parseFloat(wordObj.end);
                                        const isActive = currentTime >= start && currentTime <= end;

                                        return (
                                            <span 
                                                key={idx} 
                                                onClick={() => handleWordClick(wordObj.start)}
                                                onDoubleClick={() => handleWordDoubleClick(wordObj.start)}
                                                className={`word transition-all duration-150 cursor-pointer inline-block ${
                                                    isActive 
                                                        ? 'bg-blue-100 text-blue-700 font-bold scale-105 shadow-xs ring-1 ring-blue-300 rounded px-0.5' 
                                                        : 'hover:bg-slate-100 rounded px-0.5'
                                                }`}
                                            >
                                                {wordObj.word}{' '}
                                            </span>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* Code Editor Style Syntax-Highlighted JSON View with Light Theme & Line Numbers */
                                <pre className="font-mono text-[11px] leading-relaxed text-slate-700 bg-white border border-slate-200 rounded-xl overflow-x-auto text-left py-4 selection:bg-blue-100">
                                    {/* Line 1 */}
                                    <div className="flex hover:bg-slate-50">
                                        <span className="text-slate-400 select-none text-right w-10 pr-3 border-r border-slate-200/60 sticky left-0 bg-slate-50/80 font-medium">1</span>
                                        <span className="pl-3 text-slate-400">{"{"}</span>
                                    </div>
                                    
                                    {/* Line 2: File Name */}
                                    <div className="flex hover:bg-slate-50">
                                        <span className="text-slate-400 select-none text-right w-10 pr-3 border-r border-slate-200/60 sticky left-0 bg-slate-50/80 font-medium">2</span>
                                        <span className="pl-3"><span className="text-indigo-600 font-medium">{"  \"file_name\""}</span><span className="text-slate-400">:</span> <span className="text-emerald-600">"{video.video_url.split('/').pop()}"</span><span className="text-slate-400">,</span></span>
                                    </div>

                                    {/* Line 3: Detected Language */}
                                    <div className="flex hover:bg-slate-50">
                                        <span className="text-slate-400 select-none text-right w-10 pr-3 border-r border-slate-200/60 sticky left-0 bg-slate-50/80 font-medium">3</span>
                                        <span className="pl-3"><span className="text-indigo-600 font-medium">{"  \"detected_language\""}</span><span className="text-slate-400">:</span> <span className="text-emerald-600">"{detectedLanguage}"</span><span className="text-slate-400">,</span></span>
                                    </div>

                                    {/* Line 4: Language Probability */}
                                    <div className="flex hover:bg-slate-50">
                                        <span className="text-slate-400 select-none text-right w-10 pr-3 border-r border-slate-200/60 sticky left-0 bg-slate-50/80 font-medium">4</span>
                                        <span className="pl-3"><span className="text-indigo-600 font-medium">{"  \"language_probability\""}</span><span className="text-slate-400">:</span> <span className="text-amber-600">{languageProbability}</span><span className="text-slate-400">,</span></span>
                                    </div>
                                    
                                    {/* Line 5: Words Array Open */}
                                    <div className="flex hover:bg-slate-50">
                                        <span className="text-slate-400 select-none text-right w-10 pr-3 border-r border-slate-200/60 sticky left-0 bg-slate-50/80 font-medium">5</span>
                                        <span className="pl-3"><span className="text-indigo-600 font-medium">{"  \"words\""}</span><span className="text-slate-400">:</span> <span className="text-slate-400">{"["}</span></span>
                                    </div>
                                    
                                    {/* Loop for individual word blocks */}
                                    {words.map((wordObj, idx) => {
                                        const start = parseFloat(wordObj.start);
                                        const end = parseFloat(wordObj.end);
                                        const isActive = currentTime >= start && currentTime <= end;
                                        
                                        // Metadata consumes 5 lines, so loop indexing offsets base line calculation to line 6
                                        const baseLine = 6 + (idx * 6);

                                        return (
                                            <div key={idx} className={isActive ? "bg-blue-50/70 border-y border-blue-100" : ""}>
                                                {/* Word Object Open */}
                                                <div className="flex hover:bg-slate-50">
                                                    <span className="text-slate-400 select-none text-right w-10 pr-3 border-r border-slate-200/60 sticky left-0 bg-slate-50/80 font-medium">{baseLine}</span>
                                                    <span className="pl-3 text-slate-400">{"    {"}</span>
                                                </div>
                                                
                                                {/* Word Sub-value String with Single and Double click actions */}
                                                <div className="flex hover:bg-slate-50">
                                                    <span className="text-slate-400 select-none text-right w-10 pr-3 border-r border-slate-200/60 sticky left-0 bg-slate-50/80 font-medium">{baseLine + 1}</span>
                                                    <span className="pl-3">
                                                        <span className="text-indigo-600 font-medium">{"      \"word\""}</span><span className="text-slate-400">:</span>{' '}
                                                        <span 
                                                            onClick={() => handleWordClick(wordObj.start)}
                                                            onDoubleClick={() => handleWordDoubleClick(wordObj.start)}
                                                            className={`cursor-pointer transition-all duration-150 inline-block rounded px-1 font-bold select-none ${
                                                                isActive 
                                                                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300 scale-105' 
                                                                    : 'text-emerald-600 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            "{wordObj.word}"
                                                        </span><span className="text-slate-400">,</span>
                                                    </span>
                                                </div>
                                                
                                                {/* Start Timestamp Value */}
                                                <div className="flex hover:bg-slate-50">
                                                    <span className="text-slate-400 select-none text-right w-10 pr-3 border-r border-slate-200/60 sticky left-0 bg-slate-50/80 font-medium">{baseLine + 2}</span>
                                                    <span className="pl-3"><span className="text-indigo-600 font-medium">{"      \"start\""}</span><span className="text-slate-400">:</span> <span className="text-amber-600">{wordObj.start}</span><span className="text-slate-400">,</span></span>
                                                </div>
                                                
                                                {/* End Timestamp Value */}
                                                <div className="flex hover:bg-slate-50">
                                                    <span className="text-slate-400 select-none text-right w-10 pr-3 border-r border-slate-200/60 sticky left-0 bg-slate-50/80 font-medium">{baseLine + 3}</span>
                                                    <span className="pl-3"><span className="text-indigo-600 font-medium">{"      \"end\""}</span><span className="text-slate-400">:</span> <span className="text-amber-600">{wordObj.end}</span><span className="text-slate-400">,</span></span>
                                                </div>
                                                
                                                {/* Probability Score Value */}
                                                <div className="flex hover:bg-slate-50">
                                                    <span className="text-slate-400 select-none text-right w-10 pr-3 border-r border-slate-200/60 sticky left-0 bg-slate-50/80 font-medium">{baseLine + 4}</span>
                                                    <span className="pl-3"><span className="text-indigo-600 font-medium">{"      \"probability\""}</span><span className="text-slate-400">:</span> <span className="text-amber-600">{wordObj.probability}</span></span>
                                                </div>
                                                
                                                {/* Word Object Close */}
                                                <div className="flex hover:bg-slate-50">
                                                    <span className="text-slate-400 select-none text-right w-10 pr-3 border-r border-slate-200/60 sticky left-0 bg-slate-50/80 font-medium">{baseLine + 5}</span>
                                                    <span className="pl-3 text-slate-400">{"    }"}{idx < words.length - 1 ? <span className="text-slate-400">,</span> : ""}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    {/* Array Closing Bracket Line */}
                                    <div className="flex hover:bg-slate-50">
                                        <span className="text-slate-400 select-none text-right w-10 pr-3 border-r border-slate-200/60 sticky left-0 bg-slate-50/80 font-medium">{6 + (words.length * 6)}</span>
                                        <span className="pl-3 text-slate-400">{"  ]"}</span>
                                    </div>
                                    
                                    {/* Root Object Closing Brace Line */}
                                    <div className="flex hover:bg-slate-50">
                                        <span className="text-slate-400 select-none text-right w-10 pr-3 border-r border-slate-200/60 sticky left-0 bg-slate-50/80 font-medium">{7 + (words.length * 6)}</span>
                                        <span className="pl-3 text-slate-400">{"}"}</span>
                                    </div>
                                </pre>
                            )
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}