import React from 'react'

const CHIP_SETS = [
  ['Reduce plastic at home', 'Eco-friendly food choices', 'Save energy at home', 'Green travel tips'],
  ['Water conservation tips', 'Sustainable fashion', 'Composting basics', 'Carbon footprint'],
  ['Zero waste shopping', 'Eco-friendly cleaning', 'Renewable energy at home', 'Green gifting ideas'],
]

export default function SuggestionChips({ round, onSelect, disabled }) {
  const chips = CHIP_SETS[round % CHIP_SETS.length]

  return (
    <div style={{
      padding: '8px 16px',
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    }}>
      {chips.map(chip => (
        <button
          key={chip}
          onClick={() => !disabled && onSelect(chip)}
          disabled={disabled}
          style={{
            fontSize: '12px',
            padding: '5px 13px',
            borderRadius: '99px',
            border: '0.5px solid var(--green-200)',
            background: disabled ? 'var(--gray-100)' : 'var(--green-50)',
            color: disabled ? 'var(--gray-400)' : 'var(--green-600)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            fontFamily: 'var(--font-sans)',
          }}
          onMouseEnter={e => { if (!disabled) e.target.style.background = 'var(--green-100)' }}
          onMouseLeave={e => { if (!disabled) e.target.style.background = 'var(--green-50)' }}
        >
          {chip}
        </button>
      ))}
    </div>
  )
}
