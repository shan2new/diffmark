import WebpackObfuscator from 'webpack-obfuscator'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable production source maps so obfuscated code isn't recoverable
  productionBrowserSourceMaps: false,
  webpack: (config, { isServer, dev }) => {
    // Harsh obfuscation only for production client bundles (e.g. Vercel deploy)
    if (!dev && !isServer && process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new WebpackObfuscator(
          {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 1,
            debugProtection: false,
            disableConsoleOutput: false,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            numbersToExpressions: true,
            renameGlobals: false,
            selfDefending: false,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 10,
            stringArray: true,
            stringArrayCallsTransform: true,
            stringArrayCallsTransformThreshold: 1,
            stringArrayEncoding: ['rc4'],
            stringArrayIndexShift: true,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayWrappersCount: 2,
            stringArrayWrappersType: 'variable',
            stringArrayThreshold: 1,
            transformObjectKeys: true,
            unicodeEscapeSequence: false,
          },
          []
        )
      )
    }
    return config
  },
}

export default nextConfig
