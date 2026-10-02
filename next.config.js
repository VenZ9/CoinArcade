/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The project ships no ESLint configuration; skip linting during production
  // builds so `next build` stays deterministic in CI. Linting remains available
  // locally via `npm run lint` once a config is added.
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Bound static-generation parallelism. Hosts that expose many CPUs but a
    // modest memory cap (containers, some CI runners) otherwise spawn one
    // worker per core and get OOM-killed during "Generating static pages".
    // These knobs affect build-time resource use only, never runtime behaviour.
    cpus: 1,
    workerThreads: false,
  },
};

module.exports = nextConfig;
