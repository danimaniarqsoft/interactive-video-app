import { useState, useEffect, useRef } from 'react';

export default function InteractivePlayer({ video }) {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

    const handleWordClick = (start) => {
        if (!videoRef.current) return;
        const targetTime = parseFloat(start);
        
        videoRef.current.currentTime = targetTime;
        
        setTimeout(() => {
            if (Math.abs(videoRef.current.currentTime - targetTime) > 0.5) {
                videoRef.current.currentTime = targetTime;
            }
            videoRef.current.play().catch(e => console.log("Autoplay context note:", e));
        }, 50);
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-900">{video.title}</h2>
                <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider font-semibold">{video.category}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 sticky top-24">
                    <div className="bg-black rounded-2xl shadow-xl overflow-hidden border border-slate-200 aspect-video flex items-center justify-center">
                        <video ref={videoRef} src={`/${video.video_url}`} className="w-full h-full object-contain" controls preload="auto" crossOrigin="anonymous" />
                    </div>
                </div>

                <div className="lg:col-span-5 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col h-[calc(100vh-14rem)]">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Interactive Transcript</h3>
                    </div>

                    <div className="p-6 overflow-y-auto flex-grow text-lg leading-loose text-slate-700">
                        {loading && <div className="text-slate-400 italic">Loading transcript...</div>}
                        {error && <div className="text-red-500 font-bold">Error: {error}</div>}
                        {!loading && !error && words.map((wordObj, idx) => (
                            <span 
                                key={idx} 
                                onClick={() => handleWordClick(wordObj.start)}
                                className="word">
                                {wordObj.word}{' '}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}