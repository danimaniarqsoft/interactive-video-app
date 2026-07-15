import { useState } from 'react';

export default function VideoList({ videos, onVideoSelect }) {
    // --- STATE MANAGEMENT ---
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedStates, setSelectedStates] = useState([]);

    const itemsPerPage = 5;

    // --- DYNAMIC OPTION EXTRACTION ---
    const uniqueCategories = [...new Set(videos.map(v => v.category))].filter(Boolean);
    const allStates = ['New', 'Learning', 'Needs Review', 'Understood', 'Mastered'];

    // --- EVENT HANDLERS ---
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); 
    };

    const toggleCategory = (category) => {
        setSelectedCategories(prev => {
            const next = prev.includes(category) 
                ? prev.filter(c => c !== category) 
                : [...prev, category];
            setCurrentPage(1); 
            return next;
        });
    };

    const toggleState = (stateValue) => {
        setSelectedStates(prev => {
            const next = prev.includes(stateValue) 
                ? prev.filter(s => s !== stateValue) 
                : [...prev, stateValue];
            setCurrentPage(1); 
            return next;
        });
    };

    // --- FILTER LOGIC ---
    const filteredVideos = videos.filter(video => {
        const matchesName = video.title
            ? video.title.toLowerCase().includes(searchQuery.toLowerCase())
            : false;

        const matchesCategory = selectedCategories.length === 0 
            ? true 
            : selectedCategories.includes(video.category);

        const videoStateNormalized = video.state || 'New';
        const matchesState = selectedStates.length === 0 
            ? true 
            : selectedStates.some(s => s.toLowerCase() === videoStateNormalized.toLowerCase());

        return matchesName && matchesCategory && matchesState;
    });

    // --- PAGINATION CALCULATION ---
    const totalPages = Math.ceil(filteredVideos.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentVideos = filteredVideos.slice(startIndex, startIndex + itemsPerPage);

    const getStateBadgeColor = (state) => {
        const normalizedState = state ? state.toLowerCase() : 'new';
        
        switch (normalizedState) {
            case 'new': return 'bg-slate-100 text-slate-600';
            case 'learning': return 'bg-indigo-50 text-indigo-700';
            case 'needs review': return 'bg-amber-50 text-amber-700';
            case 'understood': return 'bg-emerald-50 text-emerald-700';
            case 'mastered': return 'bg-purple-50 text-purple-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Videos</h2>
                
                <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Search by Video Name
                        </label>
                        <input
                            type="text"
                            placeholder="Type to search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                Filter by Category
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {uniqueCategories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => toggleCategory(category)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedCategories.includes(category) ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-300'}`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                Filter by Study State
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {allStates.map(state => (
                                    <button
                                        key={state}
                                        onClick={() => toggleState(state)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedStates.includes(state) ? 'bg-slate-700 text-white' : 'bg-white text-slate-600 border border-slate-300'}`}
                                    >
                                        {state}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold border-b border-slate-200">Video Name</th>
                            <th className="px-6 py-4 font-semibold border-b border-slate-200">Category</th>
                            <th className="px-6 py-4 font-semibold border-b border-slate-200">State</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {currentVideos.length === 0 ? (
                            <tr><td colSpan="3" className="p-8 text-center text-slate-500">No videos match.</td></tr>
                        ) : (
                            currentVideos.map((video) => (
                                <tr key={video.video_url} onClick={() => onVideoSelect(video)} className="hover:bg-slate-50 cursor-pointer">
                                    <td className="px-6 py-4 font-medium text-slate-900">{video.title}</td>
                                    <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase">{video.category}</span></td>
                                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStateBadgeColor(video.state)}`}>{video.state || 'New'}</span></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-sm">
                <span>Showing page {currentPage} of {totalPages}</span>
                <div className="flex gap-2">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-white border rounded-md disabled:opacity-50">Previous</button>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-white border rounded-md disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
}