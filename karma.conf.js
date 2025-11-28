// karma.conf.js
export default function (config) {
  config.set({
    frameworks: ['jasmine'],
    files: [{ pattern: 'tests/**/*.spec.js', watched: true }],
    preprocessors: { 'tests/**/*.spec.js': ['esbuild'] },
    esbuild: {
      target: 'es2020',
      jsx: 'automatic',
      loader: { '.js': 'jsx' },
      sourcemap: 'inline',
      define: { 'process.env.NODE_ENV': '"test"' }
    },
    client: { jasmine: { random: false } },
    reporters: ['progress'],
    browsers: ['ChromeHeadless'],
    singleRun: true
  });
}
