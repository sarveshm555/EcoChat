import React, { useState } from 'react'

export default function ApiKeyBar({ apiKey, onSave }) {
  const [value, setValue] = useState(apiKey)
  const [saved, setSaved] = useState(!!apiKey)

  const handleSave = () => {
    onSave(value.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{
      padding: '8px 16px',
      background: apiKey ? 'var(--green-50)' : '#FFF8E6',
      borderBottom: `0.5px solid ${apiKey ? 'var(--green-100)' : '#F5D98A'}`,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <span style={{ fontSize: '12px', color: apiKey ? 'var(--green-600)' : '#92700A', whiteSpace: 'nowrap', fontWeight: 500 }}>
        {apiKey ? '✓ Gemini connected' : '⚡ Add Gemini API key'}
      </span>
      {!apiKey && (
        <>
          <input
            type="password"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="AIza..."
            style={{
              flex: 1,
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '0.5px solid #F5D98A',
              background: '#fff',
              fontFamily: 'var(--font-mono)',
              color: 'var(--gray-900)',
              outline: 'none',
              height: '28px',
            }}
          />
          <button
            onClick={handleSave}
            style={{
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: '6px',
              border: 'none',
              background: saved ? 'var(--green-400)' : '#BA7517',
              color: '#fff',
              fontWeight: 500,
              height: '28px',
              transition: 'background 0.2s',
            }}
          >
            {saved ? 'Saved!' : 'Save'}
          </button>
        </>
      )}
      {apiKey && (
        <button
          onClick={() => { onSave(''); setValue(''); }}
          style={{
            fontSize: '11px',
            padding: '2px 10px',
            borderRadius: '6px',
            border: '0.5px solid var(--green-200)',
            background: 'transparent',
            color: 'var(--green-600)',
            marginLeft: 'auto',
            cursor: 'pointer',
          }}
        >
          Remove
        </button>
      )}
      {!apiKey && (
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '11px', color: '#BA7517', whiteSpace: 'nowrap', marginLeft: 'auto' }}
        >
          Get free key →
        </a>
      )}
    </div>
  )
}
