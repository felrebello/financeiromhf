import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { LoaderIcon } from './icons';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        signInWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                switch (error.code) {
                    case 'auth/invalid-email':
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        setError('E-mail ou senha inválidos.');
                        break;
                    default:
                        setError('Ocorreu um erro ao fazer login. Tente novamente.');
                        break;
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans p-4">
            <div className="w-full max-w-md">
                <form 
                    onSubmit={handleSubmit}
                    className="bg-slate-900 border border-slate-800 shadow-2xl shadow-slate-950/50 rounded-2xl p-8 space-y-6 animate-fade-in"
                >
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-slate-100">Finanças do Casal</h1>
                        <p className="text-slate-400 mt-2">Faça login para continuar</p>
                    </div>

                    {error && (
                         <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-1">
                                E-mail
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="seu@email.com"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-slate-400 mb-1">
                                Senha
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-opacity duration-200 flex items-center justify-center disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : 'Entrar'}
                        </button>
                    </div>
                </form>
                 <footer className="text-center mt-6 text-sm text-slate-600">
                    <p>Use as credenciais criadas no Firebase Authentication.</p>
                </footer>
            </div>
        </div>
    );
};

export default LoginPage;