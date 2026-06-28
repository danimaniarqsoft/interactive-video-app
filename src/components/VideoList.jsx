import { useState } from 'react';

export default function VideoList({ videos, onVideoSelect }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const totalPages = Math.ceil(videos.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentVideos = videos.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Available Videos</h2>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold border-b border-slate-200">Video Name</th>
                            <th className="px-6 py-4 font-semibold border-b border-slate-200">Category</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {currentVideos.length === 0 ? (
                            <tr><td colSpan="2" className="p-6 text-center text-slate-500">No videos found.</td></tr>
                        ) : (
                            currentVideos.map((video, idx) => (
                                <tr key={idx} onClick={() => onVideoSelect(video)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{video.title}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                            {video.category}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-sm text-slate-600">
                <span>Showing page {currentPage} of {totalPages}</span>
                <div className="flex gap-2">
                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    <button 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}