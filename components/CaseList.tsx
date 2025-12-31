
import React, { useState, useMemo } from 'react';
import { IGCase } from '../types';
import { Search, Plus } from 'lucide-react';
import { CASE_TYPES, CASE_STATUSES } from '../constants';

interface CaseListProps {
  cases: IGCase[];
  onCaseClick: (caseId: string) => void;
  onAddCase: () => void;
}

const CaseList: React.FC<CaseListProps> = ({ cases, onCaseClick, onAddCase }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = 
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.officeConcerned.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !typeFilter || c.type === typeFilter;
      const matchesStatus = !statusFilter || c.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [cases, searchTerm, typeFilter, statusFilter]);

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'text-red-700 bg-red-50 border-red-100';
      case 'Medium': return 'text-amber-700 bg-amber-50 border-amber-100';
      default: return 'text-blue-700 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600/50" size={18} />
          <input type="text" placeholder="Search by IGTA No or Office..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <select className="bg-gray-50 border rounded-lg px-3 py-2 text-xs font-bold uppercase" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">Types</option>
            {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={onAddCase} className="bg-emerald-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-800 transition-all font-black text-xs uppercase"><Plus size={16} />Initialize Case</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
              <th className="px-6 py-4">IGTA File No</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">District</th>
              <th className="px-6 py-4">Administrative Status</th>
              <th className="px-6 py-4">Cooperation</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredCases.map((c) => (
              <tr key={c.id} className="hover:bg-emerald-50/40 cursor-pointer transition-colors" onClick={() => onCaseClick(c.id)}>
                <td className="px-6 py-4 font-black text-emerald-900">{c.id}</td>
                <td className="px-6 py-4">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black border ${getPriorityColor(c.priority)}`}>{c.priority}</span>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-gray-600">{c.district}</td>
                <td className="px-6 py-4"><span className="text-[10px] px-2 py-1 rounded font-black uppercase border border-emerald-100 bg-emerald-50 text-emerald-800">{c.status}</span></td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black px-2 py-1 rounded border ${c.cooperative ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'}`}>{c.cooperative ? 'COOPERATIVE' : 'NON-COOP'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CaseList;
