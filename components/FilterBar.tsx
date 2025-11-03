import React from 'react';
import { ViewUser } from '../types';

interface FilterBarProps {
  viewUser: ViewUser;
  setViewUser: (user: ViewUser) => void;
  userNames: { fellipe: string, mhariana: string };
}

const FilterButton: React.FC<{ onClick: () => void, active: boolean, children: React.ReactNode }> = ({ onClick, active, children }) => (
    <button onClick={onClick} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${
        active ? 'bg-slate-700 text-white' : 'bg-transparent hover:bg-slate-800 text-slate-400'
    }`}>
        {children}
    </button>
);


const FilterBar: React.FC<FilterBarProps> = ({ viewUser, setViewUser, userNames }) => {
  return (
    <div className="flex items-center space-x-2 mt-8">
        <span className="text-sm font-medium text-slate-400">Visualizando:</span>
        <div className="flex items-center space-x-2">
            <FilterButton onClick={() => setViewUser('Ambos')} active={viewUser === 'Ambos'}>Ambos</FilterButton>
            <FilterButton onClick={() => setViewUser('Fellipe')} active={viewUser === 'Fellipe'}>{userNames.fellipe}</FilterButton>
            <FilterButton onClick={() => setViewUser('Mhariana')} active={viewUser === 'Mhariana'}>{userNames.mhariana}</FilterButton>
        </div>
    </div>
  );
};

export default FilterBar;