import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

// Custom content for Treemap to show labels
const CustomizedContent = (props: any) => {
    const { depth, x, y, width, height, index, colors, name } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: depth === 1 ? colors[index % colors.length] : '#334155',
                    fillOpacity: depth === 1 ? 1 : 0.3,
                    stroke: '#0f172a',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {depth === 1 ? (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 7}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={14}
                    fillOpacity={0.9}
                    style={{ pointerEvents: 'none' }}
                >
                    {width > 60 && height > 30 ? (name.length > 12 ? name.substring(0, 12) + '...' : name) : ''}
                </text>
            ) : null}
        </g>
    );
};

const COLORS = ['#3b82f6', '#60a5fa', '#2dd4bf', '#34d399', '#facc15', '#fbbf24'];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-xl text-xs">
                <p className="text-slate-200 font-semibold">{payload[0].payload.name}</p>
                <p className="text-blue-400">{(payload[0].value / 1024 / 1024).toFixed(2)} MB</p>
            </div>
        );
    }

    return null;
};

export function FileTreemap({ data }: { data: any }) {

    if (!data || !data.children) return <div className="text-center p-10 text-slate-500">No data to visualize</div>;

    return (
        <div className="h-[500px] w-full bg-[#161b22]/60 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl flex flex-col">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Folder Structure Map</h2>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                        data={data.children}
                        dataKey="size"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                        fill="#8884d8"
                        content={<CustomizedContent colors={COLORS} />}
                        animationDuration={500}
                    >
                        <Tooltip content={<CustomTooltip />} />
                    </Treemap>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
