
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { IGCase } from '../types';
import { AlertCircle, Clock, FileWarning, CheckCircle, Users, MessageSquare, Search, ClipboardCheck, Activity, TrendingDown, TrendingUp } from 'lucide-react';

interface DashboardProps {
  cases: IGCase[];
  onCaseClick: (caseId: string) => void;
}

const COLORS = ['#064e3b', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

const Dashboard: React.FC<DashboardProps> = ({ cases, onCaseClick }) => {
  const stats = {
    total: cases.length,
    active: cases.filter(c => c.status !== 'Decision sent to Finance Department').length,
    pending15: cases.filter(c => c.daysPending > 15 && c.status !== 'Decision sent to Finance Department').length,
    pending30: cases.filter(c => c.daysPending > 30 && c.status !== 'Decision sent to Finance Department').length,
    nonCooperative: cases.filter(c => !c.cooperative).length,
    
    complaints: cases.filter(c => c.type === 'Complaint' && c.status !== 'Decision sent to Finance Department').length,
    inquiries: cases.filter(c => c.type === 'Inquiry' && c.status !== 'Decision sent to Finance Department').length,
    inspections: cases.filter(c => c.type === 'Inspection' && c.status !== 'Decision sent to Finance Department').length,
    monitoring: cases.filter(c => (c.type === 'Monitoring' || c.type === 'Surprise Visit' || c.type === 'Re-Inspection') && c.status !== 'Decision sent to Finance Department').length,
  };

  const statusData = [
    { name: 'Initial Analysis', value: cases.filter(c => c.status === 'No action taken/necessary').length },
    { name: 'Active Correspondence', value: cases.filter(c => c.status === 'Letter sent to concerned').length },
    { name: 'Critical Reminders', value: cases.filter(c => c.status.includes('Reminder')).length },
    { name: 'Finalized', value: cases.filter(c => c.status === 'Decision sent to Finance Department').length },
  ].filter(d => d.value > 0);

  // Fix: Explicitly handle the return types of Object.entries and subtraction to avoid TSC errors on arithmetic operations
  const districtData = Object.entries(
    cases.reduce((acc, c) => {
      acc[c.district] = (acc[c.district] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, count]) => ({ name, count: Number(count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Fake timeline data for response trends
  const trendData = [
    { month: 'Jan', responses: 12, delays: 4 },
    { month: 'Feb', responses: 18, delays: 2 },
    { month: 'Mar', responses: 15, delays: 7 },
    { month: 'Apr', responses: 22, delays: 3 },
    { month: 'May', responses: 28, delays: 5 },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Complaints', value: stats.complaints, icon: MessageSquare, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Inquiries', value: stats.inquiries, icon: Search, color: 'text-emerald-900', bg: 'bg-white', border: 'border-emerald-100' },
          { label: 'Inspections', value: stats.inspections, icon: ClipboardCheck, color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Monitoring', value: stats.monitoring, icon: Activity, color: 'text-emerald-950', bg: 'bg-white', border: 'border-emerald-100' },
        ].map((typeStat, i) => (
          <div key={i} className={`${typeStat.bg} p-8 rounded-[2rem] shadow-sm border-2 ${typeStat.border} relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}>
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-110 transition-transform text-black">
               <typeStat.icon size={160} />
            </div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className={`w-14 h-14 rounded-2xl ${typeStat.bg} border-2 ${typeStat.border} ${typeStat.color} flex items-center justify-center shadow-inner`}>
                <typeStat.icon size={24} />
              </div>
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{typeStat.label}</p>
                <div className="flex items-end gap-2">
                  <p className={`text-4xl font-black ${typeStat.color}`}>{typeStat.value}</p>
                  <span className="text-[10px] font-black text-emerald-500 mb-1 flex items-center gap-1"><TrendingUp size={10} /> +2</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Pending', value: stats.active, icon: AlertCircle, color: 'text-emerald-700', bg: 'bg-white', sub: 'Active Files' },
          { label: 'DAO Delay >15d', value: stats.pending15, icon: Clock, color: 'text-amber-600', bg: 'bg-white', sub: 'SLA Warnings' },
          { label: 'Critical >30d', value: stats.pending30, icon: FileWarning, color: 'text-red-600', bg: 'bg-white', sub: 'SLA Breached' },
          { label: 'Non-Cooperative', value: stats.nonCooperative, icon: Users, color: 'text-orange-600', bg: 'bg-white', sub: 'Blacklisted' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-emerald-300 transition-colors`}>
            <div className="flex items-center gap-4">
               <div className={`p-3 rounded-xl bg-gray-50 ${stat.color} group-hover:scale-110 transition-transform`}>
                 <stat.icon size={20} />
               </div>
               <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">{stat.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tight">District Pendency</h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-black uppercase tracking-widest">Regional Breakdown</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={districtData} layout="vertical">
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#064e3b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" fontSize={10} fontWeight="black" stroke="#cbd5e1" />
                <YAxis dataKey="name" type="category" width={140} fontSize={10} fontWeight="black" stroke="#64748b" />
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                />
                <Area dataKey="count" stroke="#059669" fillOpacity={1} fill="url(#colorCount)" radius={[0, 10, 10, 0]} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tight">Compliance Status</h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-black uppercase tracking-widest">Workflow Split</span>
          </div>
          <div className="h-80 w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={4} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="rect" wrapperStyle={{ fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-emerald-950 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="lg:w-1/3">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 leading-tight">Response & Compliance Trends</h3>
            <p className="text-emerald-300 text-sm font-medium leading-relaxed mb-6">Visualizing the speed of responses from District Accounts Offices compared to issued delays over the last fiscal cycle.</p>
            <div className="flex gap-8">
              <div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Avg Compliance</p>
                <p className="text-2xl font-black text-white">84%</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Critical DAO List</p>
                <p className="text-2xl font-black text-white">09</p>
              </div>
            </div>
          </div>
          <div className="flex-1 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#065f46" />
                <XAxis dataKey="month" stroke="#065f46" fontSize={11} fontWeight="black" />
                <YAxis stroke="#065f46" fontSize={11} fontWeight="black" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#064e3b', borderRadius: '12px', border: '1px solid #065f46', color: 'white' }} 
                  itemStyle={{ color: 'white', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="responses" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981' }} />
                <Line type="monotone" dataKey="delays" stroke="#ef4444" strokeWidth={4} dot={{ r: 6, fill: '#ef4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tight">Critical Pendency Ledger</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">SLA Breach Watchlist</p>
          </div>
          <button className="bg-emerald-100 text-emerald-800 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 transition-colors">Export Ledger</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/30 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">
              <tr>
                <th className="px-8 py-6">File Reference</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Office / District</th>
                <th className="px-8 py-6">Days Elapsed</th>
                <th className="px-8 py-6">Administrative Status</th>
                <th className="px-8 py-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {cases
                .filter(c => c.status !== 'Decision sent to Finance Department')
                .sort((a, b) => b.daysPending - a.daysPending)
                .slice(0, 5)
                .map((c) => (
                  <tr key={c.id} className="hover:bg-emerald-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${c.daysPending > 30 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-amber-400'}`}></div>
                        <span className="font-black text-emerald-950">{c.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">{c.type}</td>
                    <td className="px-8 py-6">
                       <p className="font-black text-gray-800 text-xs">{c.officeConcerned}</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{c.district}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-base font-black ${c.daysPending > 30 ? 'text-red-600' : 'text-amber-600'}`}>
                        {c.daysPending} <span className="text-[10px] font-black uppercase">Days</span>
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-[10px] font-black uppercase border-2 border-emerald-100/50 tracking-widest">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => onCaseClick(c.id)}
                        className="bg-emerald-900 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-black"
                      >
                        Drill Down
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
