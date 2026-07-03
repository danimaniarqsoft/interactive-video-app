import { useState, useEffect, useRef } from 'react';

export default function InteractivePlayer({ video }) {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(0); // Tracks real-time video playback
    const [activeTab, setActiveTab] = useState('transcript'); // Toggle state: 'transcript' or 'json'
    const videoRef = useRef(null);

    useEffect(() => {
        setLoading(true);
        fetch(`/${video.script_url}`)
            .then(res => {
                if (!res.ok) throw new Error("Could not load transcript");
                return res.json();
            })
            .then(data => {
                setWords(data.words || []);
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

    // Click to seek to the precise timestamp
    const handleWordClick = (start) => {
        if (!videoRef.current) return;
        const targetTime = parseFloat(start);
        
        videoRef.current.currentTime = targetTime;
        
        setTimeout(() => {
            if (Math.abs(videoRef.current.currentTime - targetTime) > 0.5) {
                videoRef.current.currentTime = targetTime;
            }
            videoRef.current.play().catch(e => console.log("Autoplay note:", e));
        }, 50);
    };

    return (
        <div>
            {/* Video Title Banner */}
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-900">{video.title}</h2>
                <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider font-semibold">{video.category}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Video Player */}
                <div className="lg:col-span-7 sticky top-24">
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

                {/* Right Side: Tabbed Pane */}
                <div className="lg:col-span-5 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col h-[calc(100vh-14rem)] overflow-hidden">
                    
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
                                <div className="text-lg leading-loose text-slate-700 p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                                    {words.map((wordObj, idx) => {
                                        const start = parseFloat(wordObj.start);
                                        const end = parseFloat(wordObj.end);
                                        const isActive = currentTime >= start && currentTime <= end;

                                        return (
                                            <span 
                                                key={idx} 
                                                onClick={() => handleWordClick(wordObj.start)}
                                                className={`word transition-all duration-150 cursor-pointer ${
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
                                /* Code Editor Style Syntax-Highlighted JSON View with Line Numbers */
                                <pre className="font-mono text-[11px] leading-relaxed text-slate-300 bg-slate-950 rounded-xl overflow-x-auto text-left py-4 selection:bg-blue-500/30">
                                    {/* Line 1 */}
                                    <div className="flex hover:bg-slate-900/40">
                                        <span className="text-slate-600 select-none text-right w-10 pr-3 border-r border-slate-800/80 sticky left-0 bg-slate-950">1</span>
                                        <span className="pl-3 text-slate-500">{"{"}</span>
                                    </div>
                                    
                                    {/* Line 2 */}
                                    <div className="flex hover:bg-slate-900/40">
                                        <span className="text-slate-600 select-none text-right w-10 pr-3 border-r border-slate-800/80 sticky left-0 bg-slate-950">2</span>
                                        <span className="pl-3"><span className="text-cyan-400">{"  \"file_name\""}</span><span className="text-slate-400">:</span> <span className="text-emerald-300">"{video.video_url.split('/').pop()}"</span><span className="text-slate-400">,</span></span>
                                    </div>
                                    
                                    {/* Line 3 */}
                                    <div className="flex hover:bg-slate-900/40">
                                        <span className="text-slate-600 select-none text-right w-10 pr-3 border-r border-slate-800/80 sticky left-0 bg-slate-950">3</span>
                                        <span className="pl-3"><span className="text-cyan-400">{"  \"words\""}</span><span className="text-slate-400">:</span> <span className="text-slate-500">{"["}</span></span>
                                    </div>
                                    
                                    {/* Loop for individual word blocks */}
                                    {words.map((wordObj, idx) => {
                                        const start = parseFloat(wordObj.start);
                                        const end = parseFloat(wordObj.end);
                                        const isActive = currentTime >= start && currentTime <= end;
                                        
                                        // Each word block occupies exactly 6 lines. Base math offsets line calculation.
                                        const baseLine = 4 + (idx * 6);

                                        return (
                                            <div key={idx} className={isActive ? "bg-blue-950/30 border-y border-blue-900/20" : ""}>
                                                {/* Word Object Open */}
                                                <div className="flex hover:bg-slate-900/40">
                                                    <span className="text-slate-600 select-none text-right w-10 pr-3 border-r border-slate-800/80 sticky left-0 bg-slate-950">{baseLine}</span>
                                                    <span className="pl-3 text-slate-500">{"    {"}</span>
                                                </div>
                                                
                                                {/* Word Sub-value String */}
                                                <div className="flex hover:bg-slate-900/40">
                                                    <span className="text-slate-600 select-none text-right w-10 pr-3 border-r border-slate-800/80 sticky left-0 bg-slate-950">{baseLine + 1}</span>
                                                    <span className="pl-3">
                                                        <span className="text-cyan-400">{"      \"word\""}</span><span className="text-slate-400">:</span>{' '}
                                                        <span 
                                                            onClick={() => handleWordClick(wordObj.start)}
                                                            className={`cursor-pointer transition-all duration-150 inline-block rounded px-1 font-bold ${
                                                                isActive 
                                                                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400 scale-105' 
                                                                    : 'text-emerald-300 hover:bg-slate-800 hover:text-white'
                                                            }`}
                                                        >
                                                            "{wordObj.word}"
                                                        </span><span className="text-slate-400">,</span>
                                                    </span>
                                                </div>
                                                
                                                {/* Start Timestamp Value */}
                                                <div className="flex hover:bg-slate-900/40">
                                                    <span className="text-slate-600 select-none text-right w-10 pr-3 border-r border-slate-800/80 sticky left-0 bg-slate-950">{baseLine + 2}</span>
                                                    <span className="pl-3"><span className="text-cyan-400">{"      \"start\""}</span><span className="text-slate-400">:</span> <span className="text-amber-400">{wordObj.start}</span><span className="text-slate-400">,</span></span>
                                                </div>
                                                
                                                {/* End Timestamp Value */}
                                                <div className="flex hover:bg-slate-900/40">
                                                    <span className="text-slate-600 select-none text-right w-10 pr-3 border-r border-slate-800/80 sticky left-0 bg-slate-950">{baseLine + 3}</span>
                                                    <span className="pl-3"><span className="text-cyan-400">{"      \"end\""}</span><span className="text-slate-400">:</span> <span className="text-amber-400">{wordObj.end}</span><span className="text-slate-400">,</span></span>
                                                </div>
                                                
                                                {/* Probability Score Value */}
                                                <div className="flex hover:bg-slate-900/40">
                                                    <span className="text-slate-600 select-none text-right w-10 pr-3 border-r border-slate-800/80 sticky left-0 bg-slate-950">{baseLine + 4}</span>
                                                    <span className="pl-3"><span className="text-cyan-400">{"      \"probability\""}</span><span className="text-slate-400">:</span> <span className="text-amber-400">{wordObj.probability}</span></span>
                                                </div>
                                                
                                                {/* Word Object Close */}
                                                <div className="flex hover:bg-slate-900/40">
                                                    <span className="text-slate-600 select-none text-right w-10 pr-3 border-r border-slate-800/80 sticky left-0 bg-slate-950">{baseLine + 5}</span>
                                                    <span className="pl-3 text-slate-500">{"    }"}{idx < words.length - 1 ? <span className="text-slate-400">,</span> : ""}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    {/* Array Closing Bracket Line */}
                                    <div className="flex hover:bg-slate-900/40">
                                        <span className="text-slate-600 select-none text-right w-10 pr-3 border-r border-slate-800/80 sticky left-0 bg-slate-950">{4 + (words.length * 6)}</span>
                                        <span className="pl-3 text-slate-500">{"  ]"}</span>
                                    </div>
                                    
                                    {/* Root Object Closing Brace Line */}
                                    <div className="flex hover:bg-slate-900/40">
                                        <span className="text-slate-600 select-none text-right w-10 pr-3 border-r border-slate-800/80 sticky left-0 bg-slate-950">{5 + (words.length * 6)}</span>
                                        <span className="pl-3 text-slate-500">{"}"}</span>
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