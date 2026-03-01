// Helper functions to create nested stack traces
function deepFunction3() {
  throw new Error('Error from deeply nested function (level 3)')
}

function deepFunction2() {
  deepFunction3()
}

function deepFunction1() {
  deepFunction2()
}

export default function Index() {
  const handleSyncError = () => {
    throw new Error('Synchronous error thrown from button click')
  }

  const handleAsyncError = async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    throw new Error('Async error thrown after timeout')
  }

  const handleNestedError = () => {
    deepFunction1()
  }

  const handlePromiseRejection = () => {
    Promise.reject(new Error('Unhandled promise rejection'))
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
