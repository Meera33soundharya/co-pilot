interface RiskMeterProps {
    value: number; // 0 to 100
    label: string;
}

export function RiskMeter({ value, label }: RiskMeterProps) {
    const getColor = (v: number) => {
        if (v < 30) return "#10B981";
        if (v < 70) return "#FBBF24";
        return "#EF4444";
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
                <span className="text-sm font-black text-gray-900">{value}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                    style={{ width: `${value}%`, backgroundColor: getColor(value) }}
                />
            </div>
        </div>
    );
}

export function SentimentGauge({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-32 h-16 overflow-hidden">
                {/* Semi-circle track */}
                <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[10px] border-gray-100" />
                {/* Fill */}
                <div
                    className="absolute top-0 left-0 w-32 h-32 rounded-full border-[10px] transition-all duration-1000 origin-center"
                    style={{
                        borderColor: '#D4AF37',
                        transform: `rotate(${((value / 100) * 180) - 180}deg)`,
                        clipPath: 'inset(0 0 50% 0)'
                    }}
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                    <span className="text-xl font-black text-gray-900">{value}</span>
                </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
        </div>
    );
}
