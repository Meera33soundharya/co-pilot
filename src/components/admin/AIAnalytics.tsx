import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Brain } from "lucide-react";

const lineData = Array.from({ length: 12 }).map((_, i) => ({
  name: `M${i + 1}`,
  issues: Math.round(200 + Math.sin(i / 2) * 40 + Math.random() * 30),
  resolved: Math.round(120 + Math.cos(i / 3) * 30 + Math.random() * 20),
}));

const pieData = [
  { name: 'Resolved', value: 72 },
  { name: 'Pending', value: 18 },
  { name: 'Escalated', value: 10 },
];
const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

export default function AIAnalytics() {
  return (
    <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 blur-[100px] pointer-events-none group-hover:bg-red-500/10 transition-all duration-1000" />
      
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-red-50 rounded-[1.5rem] border border-red-100">
            <Brain className="w-6 h-6 text-[#B91C1C]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase italic leading-tight">AI Analytics</h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Predictive insights & trends</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="issues" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-1 h-56 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={4}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
