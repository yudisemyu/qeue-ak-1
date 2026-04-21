<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Queue;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class QueueController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nik' => 'required|digits:16',
            'nama' => 'required|string|max:255',
        ]);

        // Gunakan Transaction agar prosesnya atomik (tidak bisa disela)
        return DB::transaction(function () use ($request) {
            $targetDate = Carbon::today();
            $limit = 250;

            while (Queue::whereDate('tanggal_antrian', $targetDate->format('Y-m-d'))->count() >= $limit) {
                $targetDate->addDay();
            }

            $formattedDate = $targetDate->format('Y-m-d');

            $existing = Queue::where('nik', $request->nik)
                ->whereDate('tanggal_antrian', $formattedDate)
                ->first();

            if ($existing) {
                return response()->json(['message' => 'Sudah terdaftar', 'data' => $existing], 200);
            }

            // LOCK FOR UPDATE: Mengunci baris ini agar tidak dibaca ganda oleh request lain
            $lastQueue = Queue::whereDate('tanggal_antrian', $formattedDate)
                ->lockForUpdate()
                ->max('nomor_antrian');
            
            $newNumber = $lastQueue ? $lastQueue + 1 : 1;

            $queue = Queue::create([
                'nomor_antrian' => $newNumber,
                'nik' => $request->nik,
                'nama' => $request->nama,
                'tanggal_antrian' => $formattedDate,
                'status' => 'waiting'
            ]);

            return response()->json(['message' => 'Berhasil', 'data' => $queue], 201);
        });
    }

    public function index()
    {
        $queues = Queue::whereDate('created_at', Carbon::today())
            ->orderBy('nomor_antrian', 'asc')
            ->get();

        return response()->json($queues);
    }

    // Tambahkan fungsi untuk update status
    public function updateStatus(Request $request, $id)
    {
        $queue = Queue::findOrFail($id);
        $queue->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status berhasil diperbarui',
            'data' => $queue
        ]);
    }

    public function current()
    {
        // Cari antrian hari ini yang statusnya sedang 'processing'
        $currentQueue = Queue::whereDate('created_at', Carbon::today())
            ->where('status', 'processing')
            ->orderBy('updated_at', 'desc') // Ambil yang paling baru dipanggil
            ->first();

        return response()->json([
            'data' => $currentQueue
        ]);
    }
}