"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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

              <div className="pt-5 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest text-center sm:text-left">Panduan Screenshot</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative rounded-xl border-2 border-emerald-500 overflow-hidden bg-white shadow-sm">
                    <div className="absolute top-0 left-0 w-full bg-emerald-500 text-white text-[10px] py-1 text-center font-bold tracking-widest">BENAR</div>
                    <div className="p-2 pt-8 flex items-center justify-center h-32 bg-emerald-50/30">
                       <img src="/contoh-benar.png" alt="Contoh Benar" className="max-h-full object-contain" />
                    </div>
                  </div>
                  <div className="relative rounded-xl border-2 border-red-500 overflow-hidden bg-white shadow-sm grayscale">
                    <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-[10px] py-1 text-center font-bold tracking-widest">TIDAK SESUAI</div>
                    <div className="p-2 pt-8 flex items-center justify-center h-32 bg-red-50/30">
                       <img src="/contoh-salah.png" alt="Contoh Salah" className="max-h-full object-contain opacity-80" />
                    </div>
                  </div>
                </div>
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
    </div>
  );
}