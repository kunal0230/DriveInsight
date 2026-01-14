import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

// Custom content for Treemap to show labels
const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, colors, name } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: depth < 2 ? colors[Math.floor((index / root.children.length) * 6)] : 'none',
                    stroke: '#fff',
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
                >
                    {name}
                </text>
            ) : null}
        </g>
    );
};

const COLORS = ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D'];

export function FileTreemap({ data }: { data: any }) {
    // Transform data for Recharts if needed, but our FileNode structure is similar closely
    // Recharts expects { name, size, children }
    // We might need to filter out small files for performance or depth limiting

    if (!data || !data.children) return <div className="text-center p-10">No data to visualize</div>;

    return (
        <div className="h-[500px] w-full bg-white dark:bg-slate-800 rounded p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Folder Structure</h2>
            <ResponsiveContainer width="100%" height="100%">
                <Treemap
                    // width={400}
                    // height={200}
                    data={data.children}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    fill="#8884d8"
                    content={<CustomizedContent colors={COLORS} />}
                    animationDuration={500}
                >
                    <Tooltip
                        formatter={(value: any) => (value / 1024 / 1024).toFixed(2) + ' MB'}
                    />
                </Treemap>
            </ResponsiveContainer>
        </div>
    );
}
