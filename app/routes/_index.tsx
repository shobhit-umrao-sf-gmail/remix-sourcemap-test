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

export default function Index() {
  // Log on component mount
  console.log('✅ Index component mounted')
  console.info('Environment:', {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
    timestamp: new Date().toISOString()
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

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>New Relic Sourcemap Test</h1>
      <p>Click any button below to trigger an error and verify sourcemap decoding in New Relic:</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', marginTop: '2rem' }}>
        <button
          onClick={handleSyncError}
          style={{ padding: '0.75rem', fontSize: '1rem', cursor: 'pointer' }}
        >
          🔴 Throw Sync Error
        </button>

        <button
          onClick={handleAsyncError}
          style={{ padding: '0.75rem', fontSize: '1rem', cursor: 'pointer' }}
        >
          ⏱️ Throw Async Error
        </button>

        <button
          onClick={handleNestedError}
          style={{ padding: '0.75rem', fontSize: '1rem', cursor: 'pointer' }}
        >
          📚 Throw Nested Error (3 levels deep)
        </button>

        <button
          onClick={handlePromiseRejection}
          style={{ padding: '0.75rem', fontSize: '1rem', cursor: 'pointer' }}
        >
          ⚠️ Trigger Unhandled Promise Rejection
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '4px' }}>
        <h3>Testing Instructions:</h3>
        <ol>
          <li>Open browser DevTools Console (F12) to see log messages</li>
          <li>Click any button to trigger an error</li>
          <li>Check console for logs with correct source locations</li>
          <li>Go to New Relic Browser → JS errors to verify sourcemaps</li>
        </ol>
        <h3>Expected in New Relic:</h3>
        <ul>
          <li>Stack traces should show original TypeScript file locations</li>
          <li>Line numbers should point to this source file (_index.tsx)</li>
          <li>Function names should be preserved (handleSyncError, deepFunction3, etc.)</li>
        </ul>
      </div>
    </div>
  )
}
