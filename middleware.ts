import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hanya periksa rute /presensi dan /api/presensi
  if (pathname.startsWith('/presensi') || pathname.startsWith('/api/presensi')) {
    // Ambil client IP dari header umum reverse proxy / edge
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp =
      (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      (request as any).ip ||
      '127.0.0.1';

    const allowedConfig =
      process.env.SAC_ALLOWED_IPS ||
      '127.0.0.1,::1,localhost,::ffff:127.0.0.1,10.22.,192.168.';
    const allowedList = allowedConfig
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Cek apakah IP client cocok atau diawali salah satu prefix allowedList
    const isAllowed = allowedList.some((allowed) => {
      if (allowed === 'localhost') {
        return (
          clientIp === '127.0.0.1' ||
          clientIp === '::1' ||
          clientIp.includes('127.0.0.1')
        );
      }
      return clientIp === allowed || clientIp.startsWith(allowed);
    });

    // Izinkan bypass jika ada header khusus internal / mode dev testing
    const internalBypass = request.headers.get('x-sac-network') === 'local-sac';

    if (!isAllowed && !internalBypass) {
      // Jika request API, kembalikan JSON 403
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Akses Terbatas: Presensi pengunjung hanya dapat diakses melalui jaringan lokal Wi-Fi SAC Gedung F Pascasarjana Lantai 1 FEB UB.',
            clientIp,
          },
          { status: 403 }
        );
      }

      // Jika request halaman /presensi, kembalikan response halaman HTML 403 resmi
      const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Akses Terbatas — SAC FEB UB</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #0B2546;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      color: #FFFFFF;
    }
    .card {
      background: #FFFFFF;
      color: #0F172A;
      max-width: 520px;
      width: 100%;
      border-radius: 1.25rem;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(212, 175, 55, 0.4);
      text-align: center;
    }
    .header {
      background: #0B2546;
      color: #FFFFFF;
      padding: 1.5rem;
      border-bottom: 3px solid #D4AF37;
    }
    .logo-box {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
    }
    .logo-box img {
      height: 48px;
      width: auto;
    }
    .content {
      padding: 2rem 1.75rem;
    }
    .badge-alert {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #FEF2F2;
      color: #DC2626;
      border: 1px solid #FECACA;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1.25rem;
    }
    h2 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0B2546;
      margin-bottom: 0.75rem;
      line-height: 1.3;
    }
    .message {
      font-size: 0.925rem;
      line-height: 1.6;
      color: #475569;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      padding: 1rem;
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;
      font-weight: 600;
    }
    .ip-info {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: #64748B;
      margin-bottom: 1.5rem;
      background: #F1F5F9;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      display: inline-block;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      background: #0B2546;
      color: #FFFFFF;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.875rem;
      padding: 0.85rem 1.25rem;
      border-radius: 0.75rem;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #001027;
    }
    .footer-note {
      font-size: 0.75rem;
      color: #94A3B8;
      margin-top: 1.25rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo-box">
        <img src="/logo-feb.webp" alt="FEB UB Logo" />
      </div>
      <h1 style="font-size: 1rem; font-weight: 700; letter-spacing: -0.01em;">Self Access Centre (SAC) FEB UB</h1>
      <p style="font-size: 0.75rem; color: #CBD5E1; margin-top: 0.25rem;">Gedung F Pascasarjana Lantai 1 • Universitas Brawijaya</p>
    </div>
    <div class="content">
      <div class="badge-alert">
        <span>⚠️</span>
        <span>Akses Jaringan Terbatas</span>
      </div>
      <h2>Presensi Ruangan Khusus Jaringan Lokal</h2>
      <div class="message">
        Akses Terbatas: Presensi pengunjung hanya dapat diakses melalui jaringan lokal Wi-Fi SAC Gedung F Pascasarjana Lantai 1 FEB UB.
      </div>
      <div class="ip-info">
        IP Anda: <strong>${clientIp}</strong> (Di luar subnet SAC)
      </div>
      <a href="/" class="btn">
        <span>Kembali ke Portal Utama SAC</span>
        <span>&rarr;</span>
      </a>
      <p class="footer-note">
        Jika Anda sedang berada di ruangan SAC Gedung F Pascasarjana Lantai 1, pastikan perangkat terhubung ke Wi-Fi resmi <strong>SAC-FEB-UB</strong> atau hubungi staf resepsionis bertugas.
      </p>
    </div>
  </div>
</body>
</html>`;

      return new NextResponse(htmlContent, {
        status: 403,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/presensi/:path*', '/api/presensi/:path*'],
};
