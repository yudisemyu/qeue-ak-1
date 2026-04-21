"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import router untuk pindah halaman

export default function Home() {
  const router = useRouter();
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [file, setFile] = useState<File | null>(null); // State untuk file bukti
  const [loading, setLoading] = useState(false);

  // Cek apakah user sudah punya antrian sebelumnya saat halaman dibuka
  useEffect(() => {
    const savedQueue = localStorage.getItem("my_queue");
    
    if (savedQueue) {
      const parsedData = JSON.parse(savedQueue);
      
      // Ambil tanggal dari tiket (created_at dari Laravel)
      const queueDate = new Date(parsedData.created_at).toDateString();
      const todayDate = new Date().toDateString();

      // Bandingkan apakah tiket dibuat hari ini?
      if (queueDate === todayDate) {
        // Jika tiket hari ini, lempar ke status
        router.push("/status-antrian");
      } else {
        // Jika tiket kemarin/basi, hapus dari memori browser!
        localStorage.removeItem("my_queue");
      }
    }
  }, [router]);

  const ambilAntrian = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi "Gertakan" di sisi frontend
    if (!file) {
      alert("WAJIB: Harap unggah screenshot bukti pendaftaran online!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/queues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ nik, nama }),
        // Perhatikan: Kita TIDAK mengirim 'file' ke Laravel. Ini murni trik UI.
      });

      const result = await response.json();

      if (response.ok) {
        // 1. Simpan data antrian ke brankas browser (LocalStorage)
        localStorage.setItem("my_queue", JSON.stringify(result.data));
        
        // 2. Pindah ke halaman status
        router.push("/status-antrian");
      } else {
        alert("Gagal: " + (result.message || "Cek NIK/Nama Anda"));
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      alert("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Background diubah menjadi slate-50 yang lebih elegan
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      
      {/* Card dengan border-radius besar dan soft shadow */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Antrean AK-1</h1>
          <p className="text-sm text-slate-500 mt-1">Dinas Tenaga Kerja</p>
        </div>
        
        <form onSubmit={ambilAntrian} className="flex flex-col gap-5">
          
          {/* Input Style: Background abu-abu, memutih & bergaris warna saat di-klik (focus) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">NIK</label>
            <input 
              type="text" 
              maxLength={16}
              className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-3 rounded-xl transition-all outline-none" 
              value={nik} 
              onChange={(e) => setNik(e.target.value)} 
              placeholder="Masukkan 16 digit NIK"
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
            <input 
              type="text" 
              className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-3 rounded-xl transition-all outline-none" 
              value={nama} 
              onChange={(e) => setNama(e.target.value)} 
              placeholder="Sesuai KTP"
              required 
            />
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl mt-2">
            <label className="block text-sm font-bold text-indigo-900 mb-1">
              Verifikasi Sistem
            </label>
            <p className="text-xs text-indigo-600/80 mb-3 leading-relaxed">
              Unggah tangkapan layar bukti pendaftaran online Anda.
            </p>
            <input 
              type="file" 
              accept="image/png, image/jpeg"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>

          {/* Tombol dengan efek klik (active:scale-95) */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-700 font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] mt-4 disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? "Memverifikasi..." : "Ambil Antrean"}
          </button>
        </form>
      </div>
    </main>
  );
}