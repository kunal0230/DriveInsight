import fs from 'node:fs/promises';
import path from 'node:path';

export interface FileNode {
    name: string;
    path: string;
    size: number;
    type: 'file' | 'directory';
    children?: FileNode[];
    extension?: string;
    category?: string;
    modified?: Date;
}

export interface FileStat {
    name: string;
    path: string;
    size: number;
    category: string;
    modified: Date;
}

export interface ScanResult {
    root: FileNode;
    stats: {
        totalSize: number;
        fileCount: number;
        categoryBreakdown: Record<string, number>;
        largestFiles: FileStat[];
    }
}

const IGNORED_DIRS = new Set([
    '.git', 'node_modules', '.Trash', '.cache', 'Library', 'tmp', '.DS_Store', 'System', 'Volumes'
]);

// Helper to determine category
function getCategory(ext: string): string {
    const images = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.heic', '.raw', '.nef']);
    const videos = new Set(['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v']);
    const audio = new Set(['.mp3', '.wav', '.aac', '.flac', '.m4a', '.ogg']);
    const code = new Set(['.js', '.ts', '.tsx', '.jsx', '.html', '.css', '.json', '.py', '.java', '.c', '.cpp', '.rb', '.php', '.go', '.rs', '.sql', '.yml', '.yaml']);
    const docs = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md', '.csv']);
    const archives = new Set(['.zip', '.tar', '.gz', '.rar', '.7z', '.dmg', '.iso']);
    const apps = new Set(['.app', '.exe', '.msi']);

    if (images.has(ext)) return 'Image';
    if (videos.has(ext)) return 'Video';
    if (audio.has(ext)) return 'Audio';
    if (code.has(ext)) return 'Code';
    if (docs.has(ext)) return 'Document';
    if (archives.has(ext)) return 'Archive';
    if (apps.has(ext)) return 'Application';
    return 'Other';
}

async function safeStat(filePath: string) {
    try {
        return await fs.stat(filePath);
    } catch (error) {
        return null;
    }
}

// Fixed size priority queue for largest files would be better, but simple array sort at end is fine for < 1M files usually
// We will store top 50
const MAX_LARGEST_FILES = 50;

interface ScanContext {
    fileCount: number;
    categoryBreakdown: Record<string, number>;
    largestFiles: FileStat[];
}

async function recursiveScan(dirPath: string, context: ScanContext, depth: number): Promise<FileNode | null> {
    const stats = await safeStat(dirPath);
    if (!stats) return null;

    const name = path.basename(dirPath);

    if (!stats.isDirectory()) {
        const ext = path.extname(name).toLowerCase();
        const category = getCategory(ext);

        // Update stats
        context.fileCount++;
        context.categoryBreakdown[category] = (context.categoryBreakdown[category] || 0) + stats.size;

        // Track large files - simplified logic: just push all > 10MB then sort/slice later? 
        // Or maintenance of a small list. Let's just push everything interesting (>50MB) and sort at the end? 
        // No, that melts memory.
        // Let's keep a simple check: if larger than smallest in list (or list not full), add.

        if (stats.size > 10 * 1024 * 1024) { // Only track > 10MB to save memory initially
            context.largestFiles.push({
                name,
                path: dirPath,
                size: stats.size,
                category,
                modified: stats.mtime
            });
        }

        return {
            name,
            path: dirPath,
            size: stats.size,
            type: 'file',
            extension: ext,
            category,
            modified: stats.mtime
        };
    }

    // Directory
    // Prune recursion at extreme depth to prevent stack overflow/hangs
    if (depth > 20) return null;

    // Special handling for .app bundles on macOS - treat as files? 
    // Usually users see them as apps. But they are directories. 
    // For now, scan them.

    const node: FileNode = {
        name,
        path: dirPath,
        size: 0,
        type: 'directory',
        children: []
    };

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        // Process sequentially in chunks to be nicer to event loop? Or parallel?
        // Parallel is faster but uses more memory. JSON.stringify at the end kills it.
        // Let's stick to Promise.all but limit concurrency if needed. 
        // For now, Promise.all is okay for typical SSDs.

        const childrenPromises = entries.map(async (entry) => {
            if (IGNORED_DIRS.has(entry.name)) return null;
            // if (entry.name.startsWith('.')) return null; // Ignore hidden files? Maybe option.

            const fullPath = path.join(dirPath, entry.name);
            return await recursiveScan(fullPath, context, depth + 1);
        });

        const children = (await Promise.all(childrenPromises)).filter(Boolean) as FileNode[];

        // Optimization: Don't store children for huge arrays if they are small files?
        // Actually, for Recharts Treemap, we need children. 
        // But maybe we can drop children that are extremely small (e.g. < 0.1% of parent size)?
        // For now, keep all.

        node.children = children;
        node.size = children.reduce((acc, child) => acc + child.size, 0);

    } catch (error) {
        // console.error(`Error scanning ${dirPath}`);
    }

    return node;
}

export async function scanDirectory(dirPath: string): Promise<ScanResult | null> {
    const context: ScanContext = {
        fileCount: 0,
        categoryBreakdown: {},
        largestFiles: []
    };

    const rootNode = await recursiveScan(dirPath, context, 0);

    if (!rootNode) return null;

    // Process largest files
    context.largestFiles.sort((a, b) => b.size - a.size);
    context.largestFiles = context.largestFiles.slice(0, MAX_LARGEST_FILES);

    return {
        root: rootNode,
        stats: {
            totalSize: rootNode.size,
            fileCount: context.fileCount,
            categoryBreakdown: context.categoryBreakdown,
            largestFiles: context.largestFiles
        }
    };
}
export async function getCommonDirectories(): Promise<FileNode[]> {
    const home = process.env.HOME || '/';
    const common = [
        { name: 'Home', path: home, type: 'directory' },
        { name: 'Desktop', path: path.join(home, 'Desktop'), type: 'directory' },
        { name: 'Documents', path: path.join(home, 'Documents'), type: 'directory' },
        { name: 'Downloads', path: path.join(home, 'Downloads'), type: 'directory' },
        { name: 'Volumes', path: '/Volumes', type: 'directory' }, // macOS specific
    ];

    // Filter to only those that exist
    const results = await Promise.all(common.map(async (dir) => {
        try {
            const stats = await fs.stat(dir.path);
            return stats.isDirectory() ? { ...dir, size: 0, children: [] } as FileNode : null;
        } catch {
            return null;
        }
    }));

    return results.filter(Boolean) as FileNode[];
}

export async function listDirectory(dirPath: string): Promise<FileNode[]> {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const nodes = await Promise.all(entries.map(async (entry) => {
            if (IGNORED_DIRS.has(entry.name)) return null;

            const fullPath = path.join(dirPath, entry.name);
            try {
                const stats = await fs.stat(fullPath);
                return {
                    name: entry.name,
                    path: fullPath,
                    size: stats.isDirectory() ? 0 : stats.size, // Don't calc folder size here to be fast
                    type: entry.isDirectory() ? 'directory' : 'file',
                    extension: entry.isDirectory() ? '' : path.extname(entry.name).toLowerCase(),
                    category: entry.isDirectory() ? 'Folder' : getCategory(path.extname(entry.name).toLowerCase()),
                    modified: stats.mtime,
                    children: [] // No recursion
                } as FileNode;
            } catch {
                return null;
            }
        }));

        return nodes.filter(Boolean) as FileNode[];
    } catch (error) {
        return [];
    }
}
