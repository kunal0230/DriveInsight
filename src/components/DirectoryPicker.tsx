import { useState, useEffect } from 'react';
import { Folder, HardDrive, ChevronRight, ChevronDown, Check, X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PickerNode {
    name: string;
    path: string;
    type: 'directory' | 'file';
    children?: PickerNode[];
    isOpen?: boolean;
    isLoading?: boolean;
    hasLoaded?: boolean;
}

export function DirectoryPicker({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (path: string) => void }) {
    const [roots, setRoots] = useState<PickerNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadCommonDirs();
        }
    }, [isOpen]);

    const loadCommonDirs = async () => {
        setLoading(true);
        try {
            const dirs = await (window as any).electron.getCommonDirectories();
            setRoots(dirs.map((d: any) => ({ ...d, children: [], isOpen: false, hasLoaded: false })));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleNode = async (nodePath: string) => {
        // Recursive update to find and toggle node
        const updateTree = async (nodes: PickerNode[]): Promise<PickerNode[]> => {
            return Promise.all(nodes.map(async (node) => {
                if (node.path === nodePath) {
                    if (node.isOpen) {
                        return { ...node, isOpen: false };
                    } else {
                        // Open
                        let children = node.children;
                        if (!node.hasLoaded) {
                            try {
                                const fetched = await (window as any).electron.listDirectory(nodePath);
                                children = fetched.map((f: any) => ({
                                    ...f,
                                    children: [],
                                    isOpen: false,
                                    hasLoaded: false
                                })).sort((a: any, b: any) => {
                                    // Sort folders first
                                    if (a.type === b.type) return a.name.localeCompare(b.name);
                                    return a.type === 'directory' ? -1 : 1;
                                });
                            } catch (e) {
                                console.error(e);
                            }
                        }
                        return { ...node, isOpen: true, hasLoaded: true, children };
                    }
                } else if (node.children && node.children.length > 0) {
                    return { ...node, children: await updateTree(node.children) };
                }
                return node;
            }));
        };

        setRoots(await updateTree(roots));
    };

    // Recursive renderer
    const renderTree = (nodes: PickerNode[], level = 0) => {
        return nodes.map((node) => (
            <div key={node.path} className="select-none">
                <div
                    className={cn(
                        "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors text-sm",
                        selectedPath === node.path ? "bg-blue-600/20 text-blue-400" : "text-slate-300 hover:bg-slate-800",
                        level > 0 && "ml-4"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (node.type === 'directory') {
                            setSelectedPath(node.path);
                        }
                    }}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (node.type === 'directory') toggleNode(node.path);
                    }}
                >
                    <div
                        className="w-4 h-4 flex items-center justify-center shrink-0 hover:text-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (node.type === 'directory') toggleNode(node.path);
                        }}
                    >
                        {node.type === 'directory' && (
                            node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                        )}
                    </div>

                    {node.path === '/' || node.path === '/Volumes' ? <HardDrive size={16} className="text-purple-400" /> : <Folder size={16} className={cn(selectedPath === node.path ? "text-blue-400" : "text-slate-500")} />}

                    <span className="truncate">{node.name}</span>
                </div>
                {node.isOpen && node.children && (
                    <div className="border-l border-slate-800 ml-3 pl-1">
                        {renderTree(node.children, level + 1)}
                    </div>
                )}
            </div>
        ));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#161b22] border border-slate-800 w-full max-w-2xl h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#0f1115]">
                            <h2 className="text-lg font-semibold text-white">Select Directory to Scan</h2>
                            <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                            {loading ? (
                                <div className="flex items-center justify-center h-full text-slate-500 gap-2">
                                    <Loader2 className="animate-spin" /> Loading drives...
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {renderTree(roots)}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-[#0f1115] flex justify-between items-center">
                            <div className="text-xs text-slate-500 truncate max-w-[300px]">
                                {selectedPath || "No directory selected"}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={onClose} className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium">Cancel</button>
                                <button
                                    onClick={() => {
                                        if (selectedPath) onSelect(selectedPath);
                                    }}
                                    disabled={!selectedPath}
                                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                                >
                                    <Check size={16} /> Select Directory
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
