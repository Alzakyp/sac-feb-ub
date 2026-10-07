import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/admin', destination: '/backoffice', permanent: false },
      { source: '/admin/login', destination: '/backoffice/login', permanent: false },
      { source: '/register', destination: '/', permanent: false },
      { source: '/chat-sac', destination: '/turnitin', permanent: true },
      { source: '/admin/login', destination: '/backoffice/login', permanent: false },
  ];
  },
};

export default nextConfig;
