import { bindings, defineConfig } from 'cf/config'

export default defineConfig({
    worker: {
        name: 'travelmore-india',
        compatibilityDate: '2026-11-15',
        entrypoint: './worker.ts',
        assets: {
            notFoundHandling: 'single-page-application',
            runWorkerFirst: ['/api/*'],
        },
        env: {
            GROQ_API_KEY: bindings.secret(),
            CARTO_BASEMAPS_API_KEY: bindings.secret(),
            PLANNER_LIMIT: bindings.rateLimit({ namespace: '76431829', simple: { limit: 15, period: 60 } }),
        },
        observability: {
            enabled: true,
            redactQueryString: true,
            traces: { enabled: true, headSamplingRate: 0.05 },
        },
    },
})
