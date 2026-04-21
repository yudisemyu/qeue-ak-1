"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StatusAntrian() {
  const router = useRouter();
  const [queueData, setQueueData] = useState<any>(null);
  const [currentServing, setCurrentServing] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("my_queue");
    
    if (saved) {
      const parsedData = JSON.parse(saved);
      
      const queueDate = new Date(parsedData.created_at).toDateString();
      const todayDate = new Date().toDateString();

      if (queueDate === todayDate) {
        setQueueData(parsedData);
      } else {
        // Jika data basi, hapus dan tendang balik ke halaman pendaftaran
        localStorage.removeItem("my_queue");
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  // Polling data terbaru
  useEffect(() => {
    const refreshData = async () => {
      if (!queueData?.nik) return;

      try {
        // 1. Cek antrean yang sedang dilayani di loket
        const resCurrent = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/queues/current`);
        const dataCurrent = await resCurrent.json();
        setCurrentServing(dataCurrent.data?.nomor_antrian || null);

        // 2. Cek status terbaru milik user ini sendiri (menggunakan NIK)
        const resMe = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/queues?nik=${queueData.nik}`);
        const dataMe = await resMe.json();
        
        // Cari data milik user di antara daftar antrean hari ini
        const myLatestData = dataMe.find((q: any) => q.nik === queueData.nik);
        if (myLatestData) {
          setQueueData(myLatestData);
        }
      } catch (error) {
        console.error("Error refreshing data:", error);
      }
    };

    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [queueData?.nik]);

  if (!queueData) return null;

  // LOGIKA PENENTUAN WARNA & TEMA
  const status = queueData.status; // 'waiting', 'processing', 'completed', 'skipped'
  
  const themes = {
    waiting: {
      bg: "bg-slate-50",
      cardHeader: "bg-indigo-600",
      text: "text-slate-800",
      accent: "text-indigo-600",
      label: "Menunggu Antrean",
      desc: "Mohon tunggu sejenak, kami akan memanggil Anda segera."
    },
    processing: {
      bg: "bg-emerald-500",
      cardHeader: "bg-white",
      text: "text-white",
      accent: "text-emerald-600",
      label: "Giliran Anda!",
      desc: "Silakan segera menuju loket cetak kartu AK-1."
    },
    completed: {
      bg: "bg-indigo-900",
      cardHeader: "bg-emerald-400",
      text: "text-white",
      accent: "text-emerald-400",
      label: "Proses Selesai",
      desc: "Terima kasih telah menggunakan layanan kami."
    },
    skipped: {
      bg: "bg-amber-500",
      cardHeader: "bg-white",
      text: "text-white",
      accent: "text-amber-600",
      label: "Antrean Terlewati",
      desc: "Maaf, Anda tidak hadir saat dipanggil. Silakan hubungi petugas."
    }
  };

  const currentTheme = themes[status as keyof typeof themes] || themes.waiting;

  return (
    <main className={`min-h-screen flex flex-col items-center p-4 transition-all duration-700 ${currentTheme.bg}`}>
      
      {/* Sedang Dilayani Counter */}
      <div className={`w-full max-w-sm flex items-center justify-between px-6 py-4 rounded-2xl shadow-sm mb-6 mt-4 transition-all ${status === 'waiting' ? 'bg-white text-slate-700' : 'bg-white/20 backdrop-blur-md text-white'}`}>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'waiting' ? 'bg-indigo-400' : 'bg-white'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'waiting' ? 'bg-indigo-500' : 'bg-white'}`}></span>
          </span>
          <p className="text-sm font-medium">Sedang Dilayani</p>
        </div>
        <span className="text-2xl font-black">{currentServing || '-'}</span>
      </div>

      {/* TIKET DIGITAL */}
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm text-center relative overflow-hidden flex flex-col">
        <div className={`h-3 w-full ${currentTheme.cardHeader}`}></div>

        <div className="p-8">
        <div className="mb-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tanggal Kedatangan</p>
          <p className="text-sm font-bold text-slate-700">
            {new Date(queueData.tanggal_antrian).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        </div>

        <div className="p-8">
          {/* Label Status Dinamis */}
          <div className={`inline-block px-4 py-2 text-xs font-bold mb-6 rounded-full uppercase tracking-widest
            ${status === 'waiting' ? 'bg-slate-100 text-slate-600' : 
              status === 'processing' ? 'bg-emerald-100 text-emerald-700 animate-bounce' : 
              status === 'completed' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
            {currentTheme.label}
          </div>

          <p className="text-slate-400 font-medium tracking-wide uppercase text-[10px]">Nomor Antrean Anda</p>
          <h1 className={`text-[6rem] font-black leading-none my-4 tracking-tighter transition-colors duration-500 ${currentTheme.accent}`}>
            {queueData.nomor_antrian}
          </h1>
          
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {currentTheme.desc}
          </p>

          <div className="w-full h-px bg-dashed bg-slate-200 my-6 relative">
            <div className="absolute -left-12 -top-4 w-8 h-8 bg-inherit rounded-full shadow-[inset_-4px_0_4px_rgba(0,0,0,0.02)]" style={{backgroundColor: 'inherit'}}></div>
            <div className="absolute -right-12 -top-4 w-8 h-8 bg-inherit rounded-full shadow-[inset_4px_0_4px_rgba(0,0,0,0.02)]" style={{backgroundColor: 'inherit'}}></div>
          </div>

          <div className="text-left">
            <p className="text-[10px] text-slate-400 mb-1 font-bold">PEMOHON</p>
            <p className="text-lg font-bold text-slate-800 truncate">{queueData.nama}</p>
            <p className="text-sm text-slate-500 font-mono">{queueData.nik}</p>
          </div>
        </div>

        {/* Tombol Ambil Antrean Baru (Hanya Muncul Jika Sudah Selesai/Terlewati) */}
        {(status === 'completed' || status === 'skipped') && (
          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <button 
              onClick={() => {
                localStorage.removeItem("my_queue");
                router.push("/");
              }}
              className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all"
            >
              Ambil Antrean Baru
            </button>
          </div>
        )}
      </div>
    </main>
  );
}