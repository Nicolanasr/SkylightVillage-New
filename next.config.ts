import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/menu",
        destination: "https://menu.skylightvillagelb.com/",
        permanent: true,
      },
      {
        source: "/restaurant",
        destination: "https://menu.skylightvillagelb.com/",
        permanent: true,
      },
      {
        source: "/restaurant/:path*",
        destination: "https://menu.skylightvillagelb.com/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
