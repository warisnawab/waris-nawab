
import React, { useState, useMemo } from 'react';
import { IGCase } from '../types';
import { Search, Filter, Plus, ChevronDown, Download, AlertCircle } from 'lucide-react';
import { CASE_TYPES, DISTRICTS, CASE_STATUSES } from '../constants';

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
        c.officeConcerned.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.assignedDIG.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !typeFilter || c.type === typeFilter;
      const matchesStatus = !statusFilter || c.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [cases, searchTerm, typeFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'No action taken/necessary': return 'bg-gray-100 text-gray-500 border-gray-200';
      case 'Decision sent to Finance Department': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Letter sent to concerned': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Reminder 1 issued': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Reminder 2 issued': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Final reminder issued': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600/50" size={18} />
          <input
            type="text"
            placeholder="Search by IGTA No, Office, or Officer..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold uppercase text-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select 
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold uppercase text-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {CASE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button 
            onClick={onAddCase}
            className="bg-emerald-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-md font-black text-xs uppercase"
          >
            <Plus size={16} />
            Initialize Case
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                <th className="px-6 py-4">IGTA File No</th>
                <th className="px-6 py-4">Case Type</th>
                <th className="px-6 py-4">District</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Administrative Status</th>
                <th className="px-6 py-4 text-center">Cooperation</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCases.map((c) => (
                <tr 
                  key={c.id} 
                  className="hover:bg-emerald-50/40 cursor-pointer transition-colors"
                  onClick={() => onCaseClick(c.id)}
                >
                  <td className="px-6 py-4 font-black text-emerald-900">{c.id}</td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-700 uppercase">{c.type}</td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-600">{c.district}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-400">{c.source}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded font-black uppercase border ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {c.cooperative ? (
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">COOPERATIVE</span>
                    ) : (
                      <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">NON-COOP</span>
                    )}
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

export default CaseList;
