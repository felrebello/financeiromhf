import React, { useState } from 'react';
import { auth } from '../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword as firebaseUpdatePassword } from 'firebase/auth';

interface ProfileProps {}

const Profile: React.FC<ProfileProps> = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As novas senhas não correspondem.' });
      setIsLoading(false);
      return;
    }
    
    if (newPassword.length < 6) {
        setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
        setIsLoading(false);
        return;
    }
    
    const user = auth.currentUser;
    if (!user || !user.email) {
        setMessage({ type: 'error', text: 'Usuário não autenticado.' });
        setIsLoading(false);
        return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await firebaseUpdatePassword(user, newPassword);

      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
       console.error(error);
       setMessage({ type: 'error', text: 'A senha atual está incorreta ou ocorreu um erro.' });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6">Perfil e Segurança</h2>
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-white">Alterar Senha</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-gray-400 mb-1" htmlFor="currentPassword">Senha Atual</label>
                    <input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                 <div>
                    <label className="block text-gray-400 mb-1" htmlFor="newPassword">Nova Senha</label>                    
                    <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                 <div>
                    <label className="block text-gray-400 mb-1" htmlFor="confirmPassword">Confirmar Nova Senha</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                {message && (
                    <p className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {message.text}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-indigo-400"
                >
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </form>
        </div>
    </div>
  );
};

export default Profile;
