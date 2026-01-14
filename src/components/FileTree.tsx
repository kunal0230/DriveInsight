import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Video, Image, Code, FileText, Music } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileNode {
    name: string;
    path: string;
    size: number;
    type: 'file' | 'directory';
    children?: FileNode[];
    extension?: string;
    category?: string;
}

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (category?: string) => {
    switch (category) {
        case 'video': return <Video size={16} className="text-purple-400" />;
        case 'image': return <Image size={16} className="text-cyan-400" />;
        case 'code': return <Code size={16} className="text-yellow-400" />;
        case 'audio': return <Music size={16} className="text-pink-400" />;
        case 'document': return <FileText size={16} className="text-blue-400" />;
        default: return <File size={16} className="text-slate-500" />;
    }
};

const FileTreeNode = ({ node, level = 0 }: { node: FileNode; level?: number }) => {
    const [isOpen, setIsOpen] = useState(level < 1); // Open only top level by default
    const isDir = node.type === 'directory';
    const hasChildren = isDir && node.children && node.children.length > 0;

    return (
        <div>
            <div
                className={cn(
                    "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer select-none transition-colors",
                    "hover:bg-slate-800/50 text-slate-300 hover:text-white"
                )}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={() => isDir && setIsOpen(!isOpen)}
            >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {hasChildren && (
                        <div className="text-slate-500">
                            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                    )}
                </div>

                <div className="shrink-0">
                    {isDir ? (
                        isOpen ? <FolderOpen size={16} className="text-blue-400" /> : <Folder size={16} className="text-blue-500" />
                    ) : (
                        getFileIcon(node.category)
                    )}
                </div>

                <span className="truncate text-sm font-medium flex-1">{node.name}</span>
                <span className="text-xs text-slate-600 font-mono shrink-0">{formatSize(node.size)}</span>
            </div>

            <AnimatePresence initial={false}>
                {isOpen && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {/* Sort directories first, then files. Sort by size descending. */}
                        {node.children
                            ?.sort((a, b) => {
                                if (a.type === b.type) return b.size - a.size;
                                return a.type === 'directory' ? -1 : 1;
                            })
                            .map((child) => (
                                <FileTreeNode key={child.path} node={child} level={level + 1} />
                            ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export function FileTree({ root }: { root: FileNode }) {
    if (!root) return null;
    return (
        <div className="w-full h-full overflow-auto">
            <FileTreeNode node={root} />
        </div>
    );
}
