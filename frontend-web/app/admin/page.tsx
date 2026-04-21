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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/queues`);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/queues/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchQueues();
      }
    } catch (error) {
      console.error("Gagal update status", error);
    }
  };

  const panggilSuara = (nomor: number, nama: string) => {
    if ('speechSynthesis' in window) {
      const teks = `Nomor antrean, ${nomor}, atas nama, ${nama}, silakan menuju operator cetak yang kosong.`;
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

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/login");
  };

  // Menghitung Statistik Ringan
  const totalAntrean = queues.length;
  const sisaAntrean = queues.filter(q => q.status === 'waiting').length;
  const selesaiAntrean = queues.filter(q => q.status === 'completed').length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 selection:bg-indigo-100">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Panel Admin AK-1</h1>
          <p className="text-xs text-slate-500 mt-0.5">Dinas Tenaga Kerja</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchQueues}
            className="text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Segarkan Data
          </button>
          <button 
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
          >
            Keluar
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        
        {/* Statistik / Widget Ringkasan */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Pendaftar Hari Ini</p>
            <p className="text-4xl font-semibold text-slate-800">{totalAntrean}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-medium text-amber-500 mb-1">Menunggu Panggilan</p>
            <p className="text-4xl font-semibold text-amber-600">{sisaAntrean}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-medium text-emerald-500 mb-1">Pelayanan Selesai</p>
            <p className="text-4xl font-semibold text-emerald-600">{selesaiAntrean}</p>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">No. Antrean</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nama Pemohon</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Data NIK</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi Pelayanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queues.map((q: any) => (
                <tr 
                  key={q.id} 
                  className={`hover:bg-slate-50/80 transition-colors group ${q.status === 'processing' ? 'bg-indigo-50/30' : ''}`}
                >
                  <td className="px-6 py-4">
                    <span className="text-lg font-bold text-slate-700">{q.nomor_antrian}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{q.nama}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono tracking-wide">{q.nik}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                      ${q.status === 'waiting' ? 'bg-amber-100 text-amber-700' : 
                        q.status === 'processing' ? 'bg-indigo-100 text-indigo-700 shadow-sm shadow-indigo-200' : 
                        q.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-600'}`}>
                      {/* Indikator titik berkedip jika sedang diproses */}
                      {q.status === 'processing' && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-1.5 animate-pulse"></span>}
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
                          className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                        >
                          Panggil
                        </button>
                      )}
                      {q.status === 'processing' && (
                        <button 
                          onClick={() => updateStatus(q.id, 'completed')}
                          className="bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
                        >
                          Selesai
                        </button>
                      )}
                      {q.status === 'waiting' || q.status === 'processing' && (
                        <button 
                          onClick={() => updateStatus(q.id, 'skipped')}
                          className="bg-white border border-slate-200 text-slate-600 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 transition-all active:scale-95"
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
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
               <svg className="w-12 h-12 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               <p className="text-sm font-medium">Belum ada data antrean hari ini.</p>
             </div>
          )}
        </div>
      </div>
    </main>
  );
}