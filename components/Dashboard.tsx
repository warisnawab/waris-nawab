
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { IGCase } from '../types';
import { AlertCircle, Clock, FileWarning, CheckCircle, Users, MessageSquare, Search, ClipboardCheck, Activity } from 'lucide-react';

interface DashboardProps {
  cases: IGCase[];
  onCaseClick: (caseId: string) => void;
}

// Updated theme colors to greens
const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#064e3b'];

const Dashboard: React.FC<DashboardProps> = ({ cases, onCaseClick }) => {
  const stats = {
    total: cases.length,
    active: cases.filter(c => c.status !== 'Closed').length,
    pending15: cases.filter(c => c.daysPending > 15 && c.status !== 'Closed').length,
    pending30: cases.filter(c => c.daysPending > 30 && c.status !== 'Closed').length,
    nonCooperative: cases.filter(c => !c.cooperative).length,
    
    // Type Breakdown
    complaints: cases.filter(c => c.type === 'Complaint' && c.status !== 'Closed').length,
    inquiries: cases.filter(c => c.type === 'Inquiry' && c.status !== 'Closed').length,
    inspections: cases.filter(c => c.type === 'Inspection' && c.status !== 'Closed').length,
    monitoring: cases.filter(c => (c.type === 'Monitoring' || c.type === 'Surprise Visit' || c.type === 'Re-Inspection') && c.status !== 'Closed').length,
  };

  const statusData = [
    { name: 'Under Process', value: cases.filter(c => c.status === 'Under Process').length },
    { name: 'Awaiting Response', value: cases.filter(c => c.status === 'Awaiting Response').length },
    { name: 'Completed', value: cases.filter(c => c.status === 'Inspection Completed' || c.status === 'Report Submitted').length },
    { name: 'On Hold', value: cases.filter(c => c.status === 'On Hold').length },
  ].filter(d => d.value > 0);

  const districtData = Object.entries(
    cases.reduce((acc, c) => {
      acc[c.district] = (acc[c.district] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count })).slice(0, 8);

  const officerData = Object.entries(
    cases.reduce((acc, c) => {
      acc[c.assignedDIG] = (acc[c.assignedDIG] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-8">
      {/* 4 Major Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Complaints', value: stats.complaints, icon: MessageSquare, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Inquiries', value: stats.inquiries, icon: Search, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: 'Inspection', value: stats.inspections, icon: ClipboardCheck, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
          { label: 'Monitoring', value: stats.monitoring, icon: Activity, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
        ].map((typeStat, i) => (
          <div key={i} className={`${typeStat.bg} p-6 rounded-2xl shadow-sm border ${typeStat.border} relative overflow-hidden group hover:shadow-md transition-all`}>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
               <typeStat.icon size={120} />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{typeStat.label}</p>
                <p className={`text-4xl font-black ${typeStat.color}`}>{typeStat.value}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tight">Active Case Files</p>
              </div>
              <div className={`p-4 rounded-2xl ${typeStat.bg} border-2 ${typeStat.border} ${typeStat.color}`}>
                <typeStat.icon size={28} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pending', value: stats.active, icon: AlertCircle, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Awaiting DAO >15d', value: stats.pending15, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Critical >30d', value: stats.pending30, icon: FileWarning, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Non-Cooperative', value: stats.nonCooperative, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-4 rounded-xl shadow-sm border border-white flex items-center justify-between`}>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
            <stat.icon className={`w-6 h-6 ${stat.color} opacity-80`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Heatmap-like Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 flex items-center justify-between text-gray-800">
            <span>District-wise Pendency</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Top 8 Districts</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" fontSize={10} fontWeight="bold" />
                <YAxis dataKey="name" type="category" width={120} fontSize={10} fontWeight="bold" stroke="#64748b" />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="count" fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-gray-800">Case Status Distribution</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Officer Pendency */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6 text-gray-800">Officer-wise Case Load</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={officerData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={11} fontWeight="bold" />
              <YAxis fontSize={11} fontWeight="bold" />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent High Pendency Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800">Critical Pending Cases</h3>
          <button className="text-xs text-emerald-700 font-bold uppercase hover:underline">View All Records</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-widest font-black">
              <tr>
                <th className="px-6 py-4">File Number</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">District</th>
                <th className="px-6 py-4">Days Pending</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {cases
                .filter(c => c.status !== 'Closed')
                .sort((a, b) => b.daysPending - a.daysPending)
                .slice(0, 5)
                .map((c) => (
                  <tr key={c.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-emerald-800">{c.id}</td>
                    <td className="px-6 py-4 font-medium">{c.type}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{c.district}</td>
                    <td className="px-6 py-4">
                      <span className={`font-black ${c.daysPending > 30 ? 'text-red-600' : 'text-amber-600'}`}>
                        {c.daysPending} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black uppercase border border-emerald-200">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onCaseClick(c.id)}
                        className="text-emerald-700 hover:text-emerald-900 font-black text-xs uppercase underline"
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
