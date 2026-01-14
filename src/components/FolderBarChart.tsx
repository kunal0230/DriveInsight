import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FileNode {
    name: string;
    path: string;
    size: number;
    children?: FileNode[];
}

const COLORS = ['#3b82f6', '#60a5fa', '#2dd4bf', '#34d399', '#facc15', '#fbbf24', '#f472b6', '#a78bfa'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1e293b] border border-slate-700 p-3 rounded-lg shadow-xl text-xs z-50">
                <p className="text-slate-200 font-bold text-sm mb-1">{label}</p>
                <p className="text-blue-400 font-mono">{(payload[0].value / 1024 / 1024).toFixed(2)} MB</p>
            </div>
        );
    }

    return null;
};

export function FolderBarChart({ data }: { data: FileNode }) {
    if (!data || !data.children) return <div className="text-center p-10 text-slate-500">No data to visualize</div>;

    // Get top 10 largest items in the current directory
    const chartData = [...data.children]
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .map(item => ({
            name: item.name,
            size: item.size,
            path: item.path
        }));

    return (
        <div className="h-[400px] w-full bg-[#161b22]/60 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl flex flex-col">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">Largest Folders / Files</h2>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={150}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar
                            dataKey="size"
                            radius={[0, 4, 4, 0]}
                            barSize={20}
                            background={{ fill: '#1e293b', radius: [0, 4, 4, 0] } as any}
                            onClick={(data) => {
                                if (data && data.path) {
                                    (window as any).electron.openPath(data.path);
                                }
                            }}
                            className="cursor-pointer"
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
