import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // web/ je root deploya, izvan njega ne tražimo ništa
  outputFileTracingRoot: path.resolve(process.cwd()),
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
