import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

// Helper functions to create nested stack traces
function deepFunction3() {
  console.log('📍 deepFunction3: About to throw error')
  console.trace('Stack trace before error')
  throw new Error('Error from deeply nested function (level 3)')
}

function deepFunction2() {
  console.log('📍 deepFunction2: Calling deepFunction3')
  deepFunction3()
}

function deepFunction1() {
  console.log('📍 deepFunction1: Starting nested call chain')
  deepFunction2()
}

// Simulate API calls that fail
async function failingApiCall() {
  await new Promise(resolve => setTimeout(resolve, 500))
  throw new Error('API call failed: Network error from server')
}

async function failingApiCallNested() {
  await new Promise(resolve => setTimeout(resolve, 300))
  return deepNestedApiError()
}

function deepNestedApiError() {
  throw new Error('Deep nested API error in data processing')
}

export default function Index() {
  // Log on component mount
  console.log('✅ Index component mounted')
  console.info('Environment:', {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
    timestamp: new Date().toISOString()
  })

  // React Query mutation with HANDLED error + manual NR reporting (like production)
  const handledMutationWithNR = useMutation({
    mutationFn: failingApiCall,
    onError: (error: unknown) => {
      console.log('🟡 Handled error + manually sent to NR:', error)

      // Manually send to New Relic (like production)
      if (typeof window !== 'undefined' && window.newrelic) {
        window.newrelic.noticeError(error as Error)
        console.log('📤 Manually sent to NR via noticeError()')
      }

      toast.error(`Handled + NR: ${(error as Error).message}`)
    },
  })

  // React Query mutation with HANDLED error (no manual NR call)
  const handledMutation = useMutation({
    mutationFn: failingApiCall,
    onError: (error: unknown) => {
      console.log('🟡 Handled error (no manual NR call):', error)
      toast.error(`Handled only: ${(error as Error).message}`)
      // Error is caught here - does NR still see it naturally?
    },
  })

  // React Query mutation with UNHANDLED error (no onError)
  const unhandledMutation = useMutation({
    mutationFn: failingApiCall,
    // No onError - error will bubble up naturally
  })

  // React Query mutation with nested error + handler + manual NR
  const nestedHandledMutation = useMutation({
    mutationFn: failingApiCallNested,
    onError: (error: unknown) => {
      console.log('🟡 Nested handled error + NR:', error)

      if (typeof window !== 'undefined' && window.newrelic) {
        window.newrelic.noticeError(error as Error)
      }

      toast.error(`Nested handled: ${(error as Error).message}`)
    },
  })

  const handleSyncError = () => {
    console.log('🔴 handleSyncError: Button clicked')
    console.warn('About to throw synchronous error')
    throw new Error('Synchronous error thrown from button click')
  }

  const handleAsyncError = async () => {
    console.log('⏱️ handleAsyncError: Button clicked, waiting 100ms...')
    await new Promise(resolve => setTimeout(resolve, 100))
    console.error('Throwing async error now')
    throw new Error('Async error thrown after timeout')
  }

  const handleNestedError = () => {
    console.log('📚 handleNestedError: Button clicked, starting nested call chain')
    deepFunction1()
  }

  const handlePromiseRejection = () => {
    console.log('⚠️ handlePromiseRejection: Button clicked')
    console.warn('Creating unhandled promise rejection')
    Promise.reject(new Error('Unhandled promise rejection'))
    console.log('Promise rejection triggered (this will be unhandled)')
  }

  const handleTryCatchError = async () => {
    console.log('🛡️ handleTryCatchError: Button clicked')
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      throw new Error('Error caught in try-catch block')
    } catch (error) {
      console.log('🟡 Error caught in catch:', error)
      toast.error(`Caught: ${error instanceof Error ? error.message : 'Unknown error'}`)
      // Error is caught - will NR see it?
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>New Relic Sourcemap Test</h1>
      <p>Click any button below to trigger an error and verify sourcemap decoding in New Relic:</p>

      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Unhandled Errors (Should appear in NR)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
          <button
            onClick={handleSyncError}
            style={{ padding: '0.75rem', fontSize: '1rem', cursor: 'pointer', background: '#fee', border: '1px solid #c00' }}
          >
            🔴 Throw Sync Error
          </button>

          <button
            onClick={handleAsyncError}
            style={{ padding: '0.75rem', fontSize: '1rem', cursor: 'pointer', background: '#fee', border: '1px solid #c00' }}
          >
            ⏱️ Throw Async Error
          </button>

          <button
            onClick={handleNestedError}
            style={{ padding: '0.75rem', fontSize: '1rem', cursor: 'pointer', background: '#fee', border: '1px solid #c00' }}
          >
            📚 Throw Nested Error (3 levels deep)
          </button>

          <button
            onClick={handlePromiseRejection}
            style={{ padding: '0.75rem', fontSize: '1rem', cursor: 'pointer', background: '#fee', border: '1px solid #c00' }}
          >
            ⚠️ Trigger Unhandled Promise Rejection
          </button>

          <button
            onClick={() => unhandledMutation.mutate()}
            disabled={unhandledMutation.isPending}
            style={{ padding: '0.75rem', fontSize: '1rem', cursor: 'pointer', background: '#fee', border: '1px solid #c00' }}
          >
            🌐 React Query Unhandled Error {unhandledMutation.isPending && '(Loading...)'}
          </button>
        </div>

        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '2rem' }}>Handled Errors (Test NR behavior)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
          <button
            onClick={handleTryCatchError}
            style={{ padding: '0.75rem', fontSize: '1rem', cursor: 'pointer', background: '#ffc', border: '1px solid #aa0' }}
          >
            🛡️ Try-Catch Error (Caught & Logged)
          </button>

          <button
            onClick={() => handledMutation.mutate()}
            disabled={handledMutation.isPending}
            style={{ padding: '0.75rem', fontSize: '1rem', cursor: 'pointer', background: '#ffc', border: '1px solid #aa0' }}
          >
            🟡 React Query Handled (NO manual NR) {handledMutation.isPending && '(Loading...)'}
          </button>

          <button
            onClick={() => handledMutationWithNR.mutate()}
            disabled={handledMutationWithNR.isPending}
            style={{ padding: '0.75rem', fontSize: '1rem', cursor: 'pointer', background: '#e7f5ff', border: '1px solid #0066cc' }}
          >
            📤 React Query + noticeError() (PROD PATTERN) {handledMutationWithNR.isPending && '(Loading...)'}
          </button>

          <button
            onClick={() => nestedHandledMutation.mutate()}
            disabled={nestedHandledMutation.isPending}
            style={{ padding: '0.75rem', fontSize: '1rem', cursor: 'pointer', background: '#e7f5ff', border: '1px solid #0066cc' }}
          >
            📤 Nested + noticeError() {nestedHandledMutation.isPending && '(Loading...)'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '4px' }}>
        <h3>Testing Instructions:</h3>
        <ol>
          <li>Open browser DevTools Console (F12) to see log messages</li>
          <li>Click buttons to trigger errors (red = unhandled, yellow = handled)</li>
          <li>Check console for logs with correct source locations</li>
          <li>Go to New Relic Browser → JS errors to verify sourcemaps</li>
        </ol>
        <h3>Expected in New Relic:</h3>
        <ul>
          <li>✅ <strong>Unhandled errors</strong>: Should appear with full stack traces</li>
          <li>❓ <strong>Handled errors</strong>: May or may not appear (testing this behavior)</li>
          <li>Stack traces should show original TypeScript file locations (_index.tsx)</li>
          <li>Line numbers should match source code</li>
          <li>Function names should be preserved (handleSyncError, deepFunction3, etc.)</li>
        </ul>
        <h3>Key Question:</h3>
        <p>Do errors caught in try-catch or React Query's onError callback still report to New Relic with sourcemaps?</p>
      </div>
    </div>
  )
}
