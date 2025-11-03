import React, { useState, useEffect } from 'react';
import { User as FirebaseUser, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface ProfilePageProps {
  userNames: { fellipe: string, mhariana: string };
  onSave: (newNames: { fellipe: string, mhariana: string }) => void;
  firebaseUser: FirebaseUser;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userNames, onSave, firebaseUser }) => {
    const [names, setNames] = useState(userNames);
    const [namesSaved, setNamesSaved] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setNames(userNames);
    }, [userNames]);

    const handleSaveNames = () => {
        onSave(names);
        setNamesSaved(true);
        setTimeout(() => setNamesSaved(false), 3000);
    };
    
    const handlePasswordReset = () => {
        if (firebaseUser.email) {
            sendPasswordResetEmail(auth, firebaseUser.email)
                .then(() => {
                    setResetEmailSent(true);
                    setError('');
                    setTimeout(() => setResetEmailSent(false), 5000);
                })
                .catch((error) => {
                    setError('Erro ao enviar e-mail de redefinição. Tente novamente mais tarde.');
                    console.error('Password Reset Error:', error);
                });
        } else {
            setError('Nenhum e-mail associado a esta conta.');
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-100 mb-6">Perfil e Configurações</h2>

            <div className="space-y-8">
                {/* User Names Section */}
                <div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-3">Nomes de Usuário</h3>
                    <p className="text-sm text-slate-400 mb-4">
                        Altere os nomes que aparecem no aplicativo. Essas alterações serão sincronizadas automaticamente.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="fellipeName" className="block text-sm font-medium text-slate-400 mb-1">Usuário 1</label>
                            <input
                                id="fellipeName"
                                type="text"
                                value={names.fellipe}
                                onChange={(e) => setNames({ ...names, fellipe: e.target.value })}
                                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="mharianaName" className="block text-sm font-medium text-slate-400 mb-1">Usuário 2</label>
                            <input
                                id="mharianaName"
                                type="text"
                                value={names.mhariana}
                                onChange={(e) => setNames({ ...names, mhariana: e.target.value })}
                                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                     <button 
                        onClick={handleSaveNames} 
                        className={`w-full mt-4 font-bold py-3 px-4 rounded-lg transition-colors duration-200 ${
                            namesSaved 
                            ? 'bg-green-600 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {namesSaved ? 'Nomes Salvos!' : 'Salvar Nomes'}
                    </button>
                </div>
                
                 {/* Security Section */}
                <div className="pt-8 border-t border-slate-700/50">
                     <h3 className="text-xl font-semibold text-slate-200 mb-3">Segurança</h3>
                     <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-300">Senha</p>
                            <p className="text-sm text-slate-400">Clique para enviar um link de alteração para seu e-mail.</p>
                        </div>
                        <button 
                            onClick={handlePasswordReset}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                            Alterar Senha
                        </button>
                     </div>
                     {resetEmailSent && (
                        <p className="text-sm text-green-400 mt-2 text-center">E-mail de redefinição enviado com sucesso! Verifique sua caixa de entrada.</p>
                     )}
                     {error && (
                         <p className="text-sm text-red-400 mt-2 text-center">{error}</p>
                     )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;