import React from 'react';
import { ActiveView } from '../types';
import { DashboardIcon, ReportsIcon, CategoryIcon, ProfileIcon, LogoutIcon } from './icons';

interface HeaderProps {
  userNames: { fellipe: string, mhariana: string };
  currentUserEmail: string;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onLogout: () => void;
}

const NavButton: React.FC<{ icon: React.ReactNode, label: ActiveView, active?: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
        active ? 'bg-slate-700/50 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}>
        {icon}
        <span className="font-medium">{label}</span>
    </button>
);

const Header: React.FC<HeaderProps> = ({ userNames, currentUserEmail, activeView, setActiveView, onLogout }) => {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-slate-100">
        Finanças do Casal
      </h1>
      <nav className="hidden md:flex items-center bg-slate-900/80 border border-slate-800 rounded-lg p-1 space-x-1">
          <NavButton icon={<DashboardIcon className="w-5 h-5" />} label="Dashboard" active={activeView === 'Dashboard'} onClick={() => setActiveView('Dashboard')} />
          <NavButton icon={<ReportsIcon className="w-5 h-5" />} label="Relatórios" active={activeView === 'Relatórios'} onClick={() => setActiveView('Relatórios')} />
          <NavButton icon={<CategoryIcon className="w-5 h-5" />} label="Categorias" active={activeView === 'Categorias'} onClick={() => setActiveView('Categorias')} />
          <NavButton icon={<ProfileIcon className="w-5 h-5" />} label="Perfil" active={activeView === 'Perfil'} onClick={() => setActiveView('Perfil')} />
      </nav>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-slate-400 hidden sm:block">
            Bem-vindo(a), <span className="font-bold text-slate-200">{currentUserEmail}</span>
        </span>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          title="Sair"
        >
            <LogoutIcon className="w-5 h-5" />
            <span className="text-sm font-semibold md:hidden">Sair</span>
        </button>
      </div>
    </header>
  );
};

export default Header;