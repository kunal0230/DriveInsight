import { useState } from 'react'
import './App.css'
import { FolderBarChart } from './components/FolderBarChart';
import { FileTree } from './components/FileTree';
import { DirectoryPicker } from './components/DirectoryPicker';
import { CategoryChart } from './components/CategoryChart';
import { LargestFilesList } from './components/LargestFilesList';
import { LayoutDashboard, FolderSearch, HardDrive, PieChart as PieChartIcon, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pathInput, setPathInput] = useState('/Users/kunalchaugule/Documents');
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ count: number, path: string } | null>(null);

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    setScanProgress(null);

    // Listen for progress
    (window as any).electron.ipcRenderer.on('scan-progress', (data: any) => {
      setScanProgress(data);
    });

    try {
      const result = await (window as any).electron.scanDirectory(pathInput);
      if (!result) throw new Error("Result is empty. Ensure path exists.");
      setScanResult(result);
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Failed to scan directory.');
    } finally {
      // Cleanup listener
      (window as any).electron.ipcRenderer.removeAllListeners('scan-progress');
      setLoading(false);
      setScanProgress(null);
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl transition-all duration-200 group",
        activeTab === id
          ? "bg-blue-600/10 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.15)] border border-blue-500/20"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
      )}
    >
      <Icon size={20} className={cn("transition-colors", activeTab === id ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
      <span className="font-medium text-sm">{label}</span>
      {activeTab === id && (
        <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
      )}
    </button>
  );

  return (
    <div className="flex bg-[#0f1115] text-white h-screen overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Sidebar - Glassmorphism */}
      <div className="w-64 bg-[#13161c]/80 backdrop-blur-xl border-r border-slate-800/50 p-6 flex flex-col z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-lg shadow-lg shadow-blue-500/20">
            <HardDrive size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">DriveInsight</h1>
            <p className="text-[10px] text-blue-400 font-medium tracking-wide mt-1">PRO EDITION</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <div className="text-xs font-semibold text-slate-600 mb-4 px-4 uppercase tracking-wider">Overview</div>
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="reports" icon={PieChartIcon} label="Analytics" />

          <div className="text-xs font-semibold text-slate-600 mb-4 mt-8 px-4 uppercase tracking-wider">Tools</div>
          <SidebarItem id="explorer" icon={FolderSearch} label="File Explorer" />
          {/* Mock items for premium look */}
          <SidebarItem id="duplicates" icon={Sparkles} label="Smart Clean" />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0f1115] to-[#0f1115] pointer-events-none" />

        {/* Header */}
        <header className="h-20 border-b border-slate-800/50 flex items-center px-8 bg-[#0f1115]/80 backdrop-blur-md z-10 justify-between">
          <div className="flex gap-4 w-full max-w-xl items-center relative">
            <div className="absolute left-4 text-slate-500 cursor-pointer hover:text-white transition-colors" onClick={() => setIsPickerOpen(true)}>
              <FolderSearch size={18} />
            </div>
            <input
              type="text"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-full pl-12 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none text-slate-200 placeholder-slate-600 transition-all font-medium"
              placeholder="Select directory to analyze..."
              onClick={() => setIsPickerOpen(true)}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleScan}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-2.5 rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 whitespace-nowrap"
            >
              {loading ? 'Analyzing...' : 'Start Scan'}
            </motion.button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto p-8 relative z-0">
          <AnimatePresence mode="wait">
            {!scanResult && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-[60vh] text-slate-600"
              >
                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 ring-1 ring-slate-700">
                  <FolderSearch size={40} className="text-slate-500" />
                </div>
                <h2 className="text-xl font-medium text-slate-300 mb-2">Ready to Analyze</h2>
                <p className="max-w-md text-center text-slate-500">Select a directory above and click Start Scan to get a comprehensive breakdown of your storage.</p>
                {error && (
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                )}
              </motion.div>
            )}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-[60vh]"
              >
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-slate-400 font-medium text-lg">Scanning filesystem...</p>
                <div className="w-64 h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden relative">
                  <motion.div
                    className="h-full bg-blue-500 absolute left-0 top-0"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }} // Indeterminate for now, or use real progress if we known total files (we don't)
                  />
                </div>
                <p className="text-slate-500 text-xs mt-3 font-mono">
                  {scanProgress ? `Analyzing: ${scanProgress.count} files` : 'Gathering intelligence...'}
                </p>
                {scanProgress && (
                  <p className="text-slate-600 text-[10px] mt-1 max-w-md truncate px-4 opacity-50">
                    {scanProgress.path}
                  </p>
                )}
              </motion.div>
            )}

            {scanResult && activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 w-full h-full"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#161b22]/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/60 shadow-xl">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Total Storage</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white tracking-tight">
                        {(scanResult.stats.totalSize / 1024 / 1024 / 1024).toFixed(2)}
                      </span>
                      <span className="text-blue-400 font-medium">GB</span>
                    </div>
                  </div>
                  <div className="bg-[#161b22]/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/60 shadow-xl">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">File Count</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white tracking-tight">
                        {scanResult.stats.fileCount.toLocaleString()}
                      </span>
                      <span className="text-cyan-400 font-medium">Items</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-md p-6 rounded-2xl border border-blue-500/20 shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="text-blue-300/70 text-xs font-bold uppercase tracking-wider mb-3">Smart Insight</h3>
                      <p className="text-sm text-slate-300">
                        <span className="text-blue-400 font-semibold">{Object.entries(scanResult.stats.categoryBreakdown as Record<string, number>).sort((a, b) => b[1] - a[1])[0]?.[0]}s</span> take up the most space.
                      </p>
                    </div>
                    <Sparkles className="absolute -bottom-4 -right-4 text-blue-500/10 rotate-12" size={120} />
                  </div>
                </div>

                {/* Main Viz */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-6">
                    <FolderBarChart data={scanResult.root} />
                    <LargestFilesList files={scanResult.stats.largestFiles} />
                  </div>
                  <div className="space-y-6">
                    <CategoryChart data={scanResult.stats.categoryBreakdown} />

                    {/* Smart Suggestion Card Mockup */}
                    <div className="bg-gradient-to-br from-emerald-900/10 to-teal-900/10 rounded-xl p-5 border border-emerald-500/20">
                      <h3 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                        <Sparkles size={16} /> Cleanup Tip
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        We found <span className="text-slate-200 font-medium">{scanResult.stats.largestFiles.length} large files</span> over 10MB.
                        Reviewing them could save you significant space.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {scanResult && activeTab === 'explorer' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
              <div className="bg-[#161b22]/60 backdrop-blur-md border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl flex-1 flex flex-col">
                <div className="p-4 border-b border-slate-800/60 bg-slate-900/30 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-300 flex items-center gap-2">
                    <FolderSearch size={18} className="text-blue-400" />
                    File Explorer
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {scanResult.stats.fileCount.toLocaleString()} items
                  </span>
                </div>
                <div className="p-2 overflow-auto flex-1 custom-scrollbar">
                  <FileTree root={scanResult.root} />
                </div>
              </div>
            </motion.div>
          )}

          {scanResult && activeTab === 'reports' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-[50vh] text-slate-500">
              <p>Detailed PDF reports coming soon.</p>
            </motion.div>
          )}
        </main>

        <DirectoryPicker
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          onSelect={(path) => {
            setPathInput(path);
            setIsPickerOpen(false);
          }}
        />
      </div>
    </div>
  )
}

export default App
