/// <reference types="vite/client" />

interface FileNode {
    name: string;
    path: string;
    size: number;
    type: 'file' | 'directory';
    children?: FileNode[];
    extension?: string;
    category?: string;
    modified?: string | Date;
}

interface FileStat {
    name: string;
    path: string;
    size: number;
    category: string;
    modified: string | Date;
}

interface ScanResult {
    root: FileNode;
    stats: {
        totalSize: number;
        fileCount: number;
        categoryBreakdown: Record<string, number>;
        largestFiles: FileStat[];
    }
}

interface ElectronAPI {
    scanDirectory: (path: string) => Promise<ScanResult>;
    getCommonDirectories: () => Promise<FileNode[]>;
    listDirectory: (path: string) => Promise<FileNode[]>;
    openPath: (path: string) => Promise<void>;
    ipcRenderer: {
        on(channel: string, func: (...args: any[]) => void): void;
        removeAllListeners(channel: string): void;
    };
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}
