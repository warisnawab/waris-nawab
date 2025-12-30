
import React, { useState, useMemo } from 'react';
import { IGCase } from '../types';
import { Search, Filter, Plus, ChevronDown, Download } from 'lucide-react';
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
  const [districtFilter, setDistrictFilter] = useState('');

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = 
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.officeConcerned.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.assignedDIG.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !typeFilter || c.type === typeFilter;
      const matchesStatus = !statusFilter || c.status === statusFilter;
      const matchesDistrict = !districtFilter || c.district === districtFilter;

      return matchesSearch && matchesType && matchesStatus && matchesDistrict;
    });
  }, [cases, searchTerm, typeFilter, statusFilter, districtFilter]);

  return (
    <div className="space-y-6">
      {/* Controls */}
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                <th className="px-6 py-4">IGTA File No</th>
                <th className="px-6 py-4">Case Type</th>
                <th className="px-6 py-4">District</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Pendency</th>
                <th className="px-6 py-4">Status</th>
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
                    <span className={`text-xs font-black ${c.daysPending > 30 ? 'text-red-600' : 'text-emerald-700'}`}>
                      {c.daysPending}d
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded font-black uppercase border ${
                      c.status === 'Closed' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                      c.status === 'On Hold' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
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
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic font-medium">
                    No matching records found in treasury archive.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CaseList;
