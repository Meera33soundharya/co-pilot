import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineProps {
    data: any[];
    color: string;
}

export function Sparkline({ data, color }: SparklineProps) {
    return (
        <div className="h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        animationDuration={2000}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
