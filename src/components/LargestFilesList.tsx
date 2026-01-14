import { FileText, Play, Music, Image, Code, Archive, Box } from 'lucide-react';

const getIcon = (category: string) => {
    switch (category) {
        case 'Video': return <Play className="text-blue-400" size={18} />;
        case 'Audio': return <Music className="text-pink-400" size={18} />;
        case 'Image': return <Image className="text-yellow-400" size={18} />;
        case 'Code': return <Code className="text-green-400" size={18} />;
        case 'Archive': return <Archive className="text-orange-400" size={18} />;
        case 'Application': return <Box className="text-purple-400" size={18} />;
        default: return <FileText className="text-slate-400" size={18} />;
    }
};

export function LargestFilesList({ files }: { files: any[] }) {
    if (!files || files.length === 0) return <div className="p-4 text-slate-500">No large files found.</div>;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-700/50 overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
                <h2 className="font-semibold text-lg">Largest Files</h2>
                <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">Top 50</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 sticky top-0 backdrop-blur-md">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium text-right">Size</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {files.map((file, i) => (
                            <tr key={i} className="hover:bg-slate-700/20 transition-colors group">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-700/30 rounded-lg group-hover:bg-slate-700/50 transition-colors">
                                            {getIcon(file.category)}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium truncate max-w-[200px] text-slate-200" title={file.name}>{file.name}</span>
                                            <span className="text-xs text-slate-500 truncate max-w-[200px]">{file.path}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => (window as any).electron.openPath(file.path)}
                                        className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                                        title="Reveal in Finder"
                                    >
                                        <Box size={14} />
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                                    {new Date(file.modified).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-slate-300 whitespace-nowrap">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
