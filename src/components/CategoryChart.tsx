import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BF3', '#FF6666'];

export function CategoryChart({ data }: { data: Record<string, number> }) {
    if (!data) return null;

    const chartData = Object.entries(data)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value); // Sort descending

    return (
        <div className="h-[300px] bg-white dark:bg-slate-800 rounded p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-center">Storage by Type</h2>
            <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => (value ? (Number(value) / 1024 / 1024).toFixed(2) + ' MB' : '0 MB')} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
