"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [queues, setQueues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Proteksi Halaman
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const fetchQueues = async () => {
    try {
      const token = localStorage.getItem("admin_token"); 
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/queues`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`, 
        }
      });

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/login");
        return;
      }

      const data = await response.json();
      setQueues(data);
    } catch (error) {
      console.error("Gagal mengambil data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem("admin_token"); 
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/queues/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`, 
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/login");
        return;
      }

      if (response.ok) {
        fetchQueues();
      }
    } catch (error) {
      console.error("Gagal update status", error);
    }
  };

  const panggilSuara = (nomor: number, nama: string) => {
    if ('speechSynthesis' in window) {
      const teks = `Nomor antrean, ${nomor}, atas nama, ${nama}, silakan menuju loket cetak yang kosong.`;
      const speech = new SpeechSynthesisUtterance(teks);
      speech.lang = 'id-ID'; 
      speech.rate = 0.85;    
      speech.pitch = 1;      
      window.speechSynthesis.speak(speech);
    } else {
      alert("Maaf, browser Anda tidak mendukung fitur suara.");
    }
  };

  const handlePanggil = async (id: number, nomor: number, nama: string) => {
    await updateStatus(id, 'processing');
    panggilSuara(nomor, nama);
  };

  // PENYEMPURNAAN LOGOUT (Menghancurkan token di Backend)
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error("Gagal logout dari server", error);
    } finally {
      localStorage.removeItem("admin_token");
      router.push("/login");
    }
  };

  const totalAntrean = queues.length;
  const sisaAntrean = queues.filter(q => q.status === 'waiting').length;
  const selesaiAntrean = queues.filter(q => q.status === 'completed').length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 selection:bg-emerald-100">
      
      {/* Top Navigation Bar - Versi Dark Emerald */}
      <nav className="bg-gradient-to-r from-emerald-950 to-emerald-900 border-b border-emerald-800 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-4">
          {/* Logo dengan filter agar lebih menyatu dengan background gelap */}
          <img 
            src="/logo-dinas-fix.png" 
            alt="Logo Dinas" 
            className="w-12 h-12 object-contain brightness-110 contrast-125"
          />
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">Panel Admin AK-1</h1>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Layanan Cetak Kartu Kuning</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchQueues}
            className="text-xs font-extrabold text-emerald-100 bg-emerald-800/50 px-4 py-2.5 rounded-xl hover:bg-emerald-800 transition-all border border-emerald-700/50 flex items-center gap-2 shadow-inner"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            REFRESH
          </button>
          
          <div className="h-8 w-[1px] bg-emerald-800 mx-2"></div>

          <button 
            onClick={handleLogout}
            className="text-xs font-extrabold text-white bg-red-600/90 px-5 py-2.5 rounded-xl hover:bg-red-700 transition-all shadow-md active:scale-95 border border-red-500/50"
          >
            KELUAR
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        
        {/* Statistik / Widget Ringkasan */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-l-4 border-l-slate-400 border-y border-r border-slate-100 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-bold text-slate-500 mb-1">Total Pendaftar Hari Ini</p>
            <p className="text-4xl font-black text-slate-800">{totalAntrean}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border-l-4 border-l-amber-400 border-y border-r border-slate-100 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-bold text-amber-500 mb-1">Menunggu Panggilan</p>
            <p className="text-4xl font-black text-amber-600">{sisaAntrean}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border-l-4 border-l-emerald-500 border-y border-r border-slate-100 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-bold text-emerald-500 mb-1">Pelayanan Selesai</p>
            <p className="text-4xl font-black text-emerald-600">{selesaiAntrean}</p>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">No. Antrean</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Nama Pemohon</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Data NIK</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-right">Aksi Pelayanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queues.map((q: any) => (
                <tr 
                  key={q.id} 
                  className={`hover:bg-slate-50 transition-colors group ${q.status === 'processing' ? 'bg-blue-50/40' : ''}`}
                >
                  <td className="px-6 py-4">
                    <span className={`text-lg font-black ${q.status === 'processing' ? 'text-blue-700' : 'text-slate-700'}`}>
                      {q.nomor_antrian}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">{q.nama}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono tracking-wide">{q.nik}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-wide
                      ${q.status === 'waiting' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                        q.status === 'processing' ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' : 
                        q.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                      
                      {/* Indikator titik berkedip jika sedang diproses */}
                      {q.status === 'processing' && <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>}
                      {q.status === 'waiting' ? 'Menunggu' : 
                       q.status === 'processing' ? 'Di Loket' : 
                       q.status === 'completed' ? 'Selesai' : 'Terlewati'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end opacity-90 group-hover:opacity-100 transition-opacity">
                      {q.status !== 'completed' && (
                        <button 
                          onClick={() => handlePanggil(q.id, q.nomor_antrian, q.nama)}
                          className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-all shadow-sm active:scale-95"
                        >
                          Panggil
                        </button>
                      )}
                      {q.status === 'processing' && (
                        <button 
                          onClick={() => updateStatus(q.id, 'completed')}
                          className="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                        >
                          Tandai Selesai
                        </button>
                      )}
                      {(q.status === 'waiting' || q.status === 'processing') && (
                        <button 
                          onClick={() => updateStatus(q.id, 'skipped')}
                          className="bg-white border-2 border-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                        >
                          Lewati
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {queues.length === 0 && !loading && (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50/50">
               <svg className="w-14 h-14 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               <p className="text-sm font-bold">Belum ada data antrean hari ini.</p>
             </div>
          )}
        </div>
      </div>
    </main>
  );
}