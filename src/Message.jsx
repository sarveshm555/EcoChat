import React from 'react'

const styles = {
  wrapper: (role) => ({
    display: 'flex',
    justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
    marginBottom: '4px',
  }),
  bubble: (role) => ({
    maxWidth: '82%',
    padding: '10px 14px',
    borderRadius: role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    fontSize: '14px',
    lineHeight: '1.65',
    background: role === 'user' ? 'var(--green-400)' : '#fff',
    color: role === 'user' ? 'var(--green-50)' : 'var(--gray-900)',
    border: role === 'user' ? 'none' : '0.5px solid var(--gray-200)',
    boxShadow: 'var(--shadow-sm)',
    whiteSpace: 'pre-wrap',
  }),
  typing: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
    padding: '14px 16px',
  }
}

function formatText(text) {
  const lines = text.split('\n')
  const elements = []
  let listItems = []
  let key = 0

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} style={{ paddingLeft: '16px', marginTop: '6px', marginBottom: '6px' }}>
          {listItems.map((item, i) => (
            <li key={i} style={{ marginBottom: '3px' }}>{item}</li>
          ))}
        </ul>
      )
      listItems = []
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      return
    }
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const content = trimmed.replace(/^[•\-*]\s*/, '')
      // Handle **bold** inline
      const parts = content.split(/\*\*(.*?)\*\*/g)
      listItems.push(parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p))
    } else {
      flushList()
      const parts = trimmed.split(/\*\*(.*?)\*\*/g)
      elements.push(
        <p key={key++} style={{ marginBottom: '4px' }}>
          {parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p)}
        </p>
      )
    }
  })
  flushList()
  return elements
}

export function TypingIndicator() {
  return (
    <div style={styles.wrapper('bot')}>
      <div style={{ ...styles.bubble('bot'), padding: '14px 16px' }}>
        <div style={styles.typing}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: 'var(--gray-400)',
              display: 'inline-block',
              animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Message({ role, text }) {
  return (
    <div style={styles.wrapper(role)}>
      <div style={styles.bubble(role)}>
        {role === 'bot' ? formatText(text) : text}
      </div>
    </div>
  )
}
