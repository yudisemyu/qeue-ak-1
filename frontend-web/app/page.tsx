"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const savedQueue = localStorage.getItem("my_queue");
    
    if (savedQueue) {
      const parsedData = JSON.parse(savedQueue);
      
      const queueDate = new Date(parsedData.created_at).toDateString();
      const todayDate = new Date().toDateString();

      if (queueDate === todayDate) {
        router.push("/status-antrian");
      } else {
        localStorage.removeItem("my_queue");
      }
    }
  }, [router]);

  const ambilAntrian = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah halaman reload
    
    // Validasi Frontend
    if (nik.length !== 16) {
      alert("WAJIB: NIK harus 16 digit!");
      return;
    }
    if (!nama.trim()) {
      alert("WAJIB: Nama lengkap harus diisi!");
      return;
    }
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
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("my_queue", JSON.stringify(result.data || result));
        router.push("/status-antrian");
      } else {
        alert("Gagal: " + (result.message || "Silakan cek kembali NIK/Nama Anda"));
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      alert("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="relative bg-gradient-to-br from-emerald-900 to-emerald-700 px-6 py-10 overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-black/15 rounded-full translate-x-16 translate-y-16"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-4">
              <img 
                src="/logo-dinas-fix.png" 
                alt="Logo Instansi"
                className="w-36 h-36 object-contain"
                style={{ mixBlendMode: 'screen', marginTop: '-30px', marginBottom: '-30px' }}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">Antrean Cetak AK-1</h1>
            <span className="inline-block bg-emerald-800/60 border border-emerald-500/50 text-emerald-50 text-xs px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
              DTKPT Kabupaten Pemalang
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          
          {/* KOTAK PERINGATAN */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 sm:p-5 mb-8 rounded-r-xl shadow-sm">
            <h3 className="text-amber-900 font-extrabold text-sm sm:text-base mb-2 flex items-center uppercase tracking-wider">
              <svg className="w-5 h-5 mr-2 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Syarat Wajib Dibawa
            </h3>
            <ul className="list-disc list-inside text-amber-800/90 space-y-1.5 text-xs sm:text-sm font-medium ml-1">
              <li>Fotokopi KTP</li>
              <li>Fotokopi Ijazah Terakhir</li>
              <li>Pas Foto Background Merah/Biru</li>
              <li>Tunjukkan Nomor Antrian Digital di HP Anda</li>
            </ul>
          </div>

          {/* PERHATIKAN: onSubmit ditambahkan ke sini */}
          <form onSubmit={ambilAntrian} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Nomor Induk Kependudukan (NIK)</label>
                {/* PERHATIKAN: value dan onChange ditambahkan ke sini */}
                <input 
                  type="number" 
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
                  placeholder="Masukkan 16 digit NIK..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Nama Lengkap (Sesuai KTP)</label>
                {/* PERHATIKAN: value dan onChange ditambahkan ke sini */}
                <input 
                  type="text" 
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
                  placeholder="Masukkan nama lengkap..."
                  required
                />
              </div>
            </div>

            <div className="mt-8 p-4 sm:p-6 border border-slate-200 bg-slate-50/50 rounded-2xl">
              <label className="block text-sm font-bold text-slate-800 mb-3">Upload Bukti Akun SiapKerja</label>
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl mb-5 text-xs sm:text-sm font-medium leading-relaxed">
                <span className="font-extrabold text-red-800 block mb-1 uppercase tracking-wide text-[11px] sm:text-xs"> Peringatan:</span>
                Sistem akan menolak pendaftaran jika screenshot Tidak Sesuai. Untuk yang memalsukan akan dikenakan sanksi tegas sesuai peraturan yang berlaku. Pastikan screenshot jelas dan tidak terpotong!
              </div>

              {/* PERHATIKAN: onChange ditambahkan ke input file ini */}
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 transition-colors mb-6 cursor-pointer border border-slate-200 rounded-xl bg-white shadow-sm"
              />

              <div className="pt-6 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest text-center">Contoh Screenshot yang Diterima</p>
                
                <div className="flex justify-center">
                  <div 
                    onClick={() => setShowModal(true)}
                    className="relative rounded-xl border-2 border-emerald-500 overflow-hidden bg-white shadow-sm cursor-zoom-in hover:shadow-md transition-all group max-w-[180px]"
                  >
                    <div className="absolute top-0 left-0 w-full bg-emerald-500 text-white text-[10px] py-1 text-center font-extrabold tracking-widest uppercase z-10">
                      CONTOH 
                    </div>
                    {/* Efek Hover Kaca Pembesar */}
                    <div className="relative p-2 pt-8 bg-emerald-50/30">
                       <img 
                          src="/contoh-benar.png" 
                          alt="Preview Contoh" 
                          className="w-full h-auto object-contain rounded group-hover:scale-105 transition-transform" 
                       />
                       <div className="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/10 transition-colors flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                       </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-slate-500 font-medium text-center">
                  * Klik gambar untuk melihat ukuran penuh
                </p>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full text-white font-extrabold py-4 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] text-sm sm:text-base tracking-wide ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-800 hover:bg-emerald-900'}`}
            >
              {loading ? 'Mengambil...' : 'AMBIL NOMOR ANTREAN'}
            </button>
          </form>

        </div>
      </div>
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm transition-opacity"
          onClick={() => setShowModal(false)}
        >
          {/* Hentikan klik agar tidak menutup saat gambar diklik */}
          <div className="relative max-w-2xl w-full bg-white rounded-2xl p-2 shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            
            {/* Tombol Silang (Close) */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full p-1 shadow-lg z-10">
              <button 
                type="button"
                onClick={() => setShowModal(false)} 
                className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-center text-emerald-800 font-extrabold mb-3 text-sm border-b border-emerald-200 pb-2">
                CONTOH SCREENSHOT YANG DITERIMA
              </p>
              <img 
                src="/contoh-benar.png" 
                alt="Contoh Benar Full Size" 
                className="w-full h-auto max-h-[70vh] object-contain rounded" 
              />
              <p className="mt-3 text-xs text-emerald-700 font-bold text-center leading-relaxed">
                 Pastikan NIK, Nama, dan seluruh informasi terbaca dengan jelas tanpa terpotong. 
              </p>
            </div>
          </div>
        </div>
      )} 
    </div>
  );
}