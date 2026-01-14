import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#2dd4bf', '#facc15', '#fbbf24', '#f472b6', '#a78bfa', '#60a5fa'];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1e293b] border border-slate-700 p-2 rounded shadow-xl text-xs">
                <p className="text-slate-200 font-semibold">{payload[0].name}</p>
                <p className="text-blue-400">{(payload[0].value / 1024 / 1024).toFixed(2)} MB</p>
            </div>
        );
    }
    return null;
};

export function CategoryChart({ data }: { data: Record<string, number> }) {
    if (!data) return null;

    const chartData = Object.entries(data)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    return (
        <div className="h-[350px] bg-[#161b22]/60 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl flex flex-col">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 text-center">Storage by Type</h2>
            <div className="flex-1 min-h-0 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
