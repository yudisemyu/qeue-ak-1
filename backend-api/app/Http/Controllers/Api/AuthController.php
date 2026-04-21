<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        if ($request->username === 'admin' && $request->password === 'disnaker123') {
            return response()->json([
                'message' => 'Login Berhasil',
                'token' => base64_encode('admin-session-token') // Simple token untuk belajar
            ], 200);
        }

        return response()->json(['message' => 'Username atau Password salah'], 401);
    }
}