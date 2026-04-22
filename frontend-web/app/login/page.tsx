'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Panggil API Login Laravel
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal login. Periksa email dan password Anda.');
      }

      // SIMPAN KUNCI SANCTUM KE BRANKAS BROWSER (Local Storage)
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_data', JSON.stringify(data.user));

      // Arahkan ke halaman Dashboard Admin
      router.push('/admin');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header Login */}
        <div className="bg-emerald-800 px-6 py-8 text-center">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20">
             <svg className="w-6 h-6 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Portal Admin Loket</h2>
          <p className="text-emerald-200 text-sm mt-1">Gunakan akun resmi instansi</p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Pesan Error */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-5 border border-red-100 font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Petugas</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 outline-none transition-all bg-slate-50"
                placeholder="admin@pemalangkab.go.id"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 outline-none transition-all bg-slate-50"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl text-white font-bold transition-all ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98]'}`}
            >
              {isLoading ? 'Memeriksa...' : 'MASUK KE DASHBOARD'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}