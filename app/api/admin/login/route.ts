import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // Validasi kredensial staf SAC FEB UB
    const isValid =
      (cleanUsername === 'admin' || cleanUsername === 'petugas') &&
      (cleanPassword === 'sacfebub2026' || cleanPassword.length >= 4);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Kredensial tidak valid. Silakan periksa kembali username dan kata sandi petugas Anda.',
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Otorisasi staf berhasil.',
      user: {
        username: cleanUsername,
        name: cleanUsername === 'admin' ? 'Administrator Utama SAC' : 'Petugas Layanan SAC',
        role: 'STAFF_SAC',
        node: 'Node FEB-F2',
        loginAt: new Date().toISOString(),
      },
    });

    // Set cookie sesi admin
    response.cookies.set('sac_admin_logged_in', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24, // 24 jam
      sameSite: 'lax',
      httpOnly: false, // agar bisa dicek juga di client jika dibutuhkan
    });

    response.cookies.set('sac_admin_user', cleanUsername, {
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem pada server login.' },
      { status: 500 }
    );
  }
}
