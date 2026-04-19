import React, { useState, useRef, useEffect } from 'react'
import Message, { TypingIndicator } from './Message'
import SuggestionChips from './SuggestionChips'
import ApiKeyBar from './ApiKeyBar'
import { callGemini, getMockResponse, analyzeImage, generateDailyTip } from './gemini'

const WELCOME = {
  role: 'bot',
  text: "Hi! I'm EcoChat — your AI sustainability advisor 🌿\n\nAsk me anything about living greener, reducing waste, or protecting the planet. You can also upload a photo of trash or a product label and I'll tell you how to handle it!"
}

const FALLBACK_TIPS = [
  "💡 A plant-based meal once a week saves ~50kg of CO₂ per year.",
  "💡 Unplugging devices on standby can save up to 10% on your electricity bill.",
  "💡 Buying second-hand reduces clothing's carbon footprint by 82%.",
  "💡 Shorter showers (4 min) save up to 30L of water per shower.",
  "💡 Walking or cycling for short trips is 20× less carbon-intensive than driving.",
]

export default function App() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ecochat_key') || '')
  const [history, setHistory] = useState([])
  const [chipRound, setChipRound] = useState(0)
  const [commitCount, setCommitCount] = useState(() => parseInt(localStorage.getItem('ecochat_commits') || '0'))
  const [lastBotText, setLastBotText] = useState('')
  const [showCommit, setShowCommit] = useState(false)
  const [committed, setCommitted] = useState(false)
  const [dailyTip, setDailyTip] = useState(FALLBACK_TIPS[new Date().getDate() % FALLBACK_TIPS.length])
  const [tipLoading, setTipLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Generate dynamic tip when API key is set
  useEffect(() => {
    if (apiKey && !tipLoading) {
      setTipLoading(true)
      generateDailyTip(apiKey).then(tip => {
        if (tip) setDailyTip(tip)
        setTipLoading(false)
      }).catch(() => setTipLoading(false))
    }
  }, [apiKey])

  const saveApiKey = (key) => {
    setApiKey(key)
    if (key) localStorage.setItem('ecochat_key', key)
    else localStorage.removeItem('ecochat_key')
  }

  const handleCommit = () => {
    const newCount = commitCount + 1
    setCommitCount(newCount)
    localStorage.setItem('ecochat_commits', newCount.toString())
    setCommitted(true)
    setShowCommit(false)
    setMessages(prev => [...prev, {
      role: 'bot',
      text: `That's the spirit! 🎉 You're commit #${newCount} in our community. Every action counts — together we're making Coimbatore greener! 🌱`
    }])
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Please add your Gemini API key first to use image analysis! 🔑' }])
      return
    }

    setMessages(prev => [...prev, { role: 'user', text: `📷 Uploaded image: ${file.name}` }])
    setLoading(true)

    try {
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload = () => res(reader.result.split(',')[1])
        reader.onerror = rej
        reader.readAsDataURL(file)
      })

      const reply = await analyzeImage(apiKey, base64, file.type)
      setMessages(prev => [...prev, { role: 'bot', text: reply }])
      setLastBotText(reply)
      setShowCommit(true)
      setCommitted(false)
      setChipRound(r => r + 1)
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: `Image analysis failed: ${err.message}` }])
    }

    setLoading(false)
    e.target.value = ''
  }

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return

    setInput('')
    setShowCommit(false)
    setCommitted(false)
    setMessages(prev => [...prev, { role: 'user', text: userText }])
    setLoading(true)

    try {
      let botText
      let newHistory = history

      if (apiKey) {
        const result = await callGemini(apiKey, history, userText)
        botText = result.reply
        newHistory = result.updatedHistory
      } else {
        await new Promise(r => setTimeout(r, 700 + Math.random() * 500))
        botText = getMockResponse(userText) + '\n\n*(Add your Gemini API key above for real AI responses)*'
      }

      setHistory(newHistory)
      setLastBotText(botText)
      setMessages(prev => [...prev, { role: 'bot', text: botText }])
      setShowCommit(true)
      setChipRound(r => r + 1)
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: `Sorry, something went wrong: ${err.message}\n\nDouble-check your API key and try again.`
      }])
    }

    setLoading(false)
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        .msg-enter { animation: fadeIn 0.2s ease-out forwards; }
        .commit-btn { animation: popIn 0.25s ease-out forwards; }
        .commit-btn:hover { transform: scale(1.03); }
        .img-btn:hover { background: var(--green-100) !important; }
      `}</style>

      <div style={{ height:'100dvh', display:'flex', flexDirection:'column', maxWidth:'700px', margin:'0 auto', background:'#fff', boxShadow:'0 0 0 0.5px rgba(0,0,0,0.08)' }}>

        {/* Header */}
        <div style={{ padding:'12px 20px', borderBottom:'0.5px solid var(--gray-100)', display:'flex', alignItems:'center', gap:'12px', background:'#fff' }}>
          <div style={{ width:'36px', height:'36px', background:'var(--green-50)', border:'0.5px solid var(--green-100)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🌿</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'15px', fontWeight:600, color:'var(--gray-900)', letterSpacing:'-0.2px' }}>EcoChat</div>
            <div style={{ fontSize:'12px', color:'var(--gray-400)' }}>AI sustainability advisor · Coimbatore</div>
          </div>
          {/* Global commit counter */}
          <div style={{ textAlign:'center', background:'var(--green-50)', border:'0.5px solid var(--green-100)', borderRadius:'10px', padding:'4px 12px' }}>
            <div style={{ fontSize:'16px', fontWeight:700, color:'var(--green-600)', lineHeight:1 }}>{commitCount}</div>
            <div style={{ fontSize:'10px', color:'var(--green-800)', marginTop:'1px' }}>commitments</div>
          </div>
          <div style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'99px', background:'var(--green-50)', color:'var(--green-600)', border:'0.5px solid var(--green-100)', fontWeight:500 }}>🌍 Earth Day</div>
        </div>

        {/* API Key Bar */}
        <ApiKeyBar apiKey={apiKey} onSave={saveApiKey} />

        {/* Dynamic tip of the day */}
        <div style={{ padding:'7px 20px', fontSize:'12px', color:'var(--green-800)', background:'var(--green-50)', borderBottom:'0.5px solid var(--green-100)', display:'flex', alignItems:'center', gap:'6px' }}>
          {tipLoading ? '🌱 Generating today\'s eco fact...' : dailyTip}
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 16px 8px', display:'flex', flexDirection:'column', gap:'4px' }}>
          {messages.map((msg, i) => (
            <div key={i} className="msg-enter">
              <Message role={msg.role} text={msg.text} />
            </div>
          ))}
          {loading && <TypingIndicator />}

          {/* Commit button */}
          {showCommit && !committed && !loading && (
            <div className="commit-btn" style={{ display:'flex', justifyContent:'flex-start', marginTop:'8px', marginLeft:'4px' }}>
              <button
                onClick={handleCommit}
                style={{
                  padding:'8px 18px',
                  borderRadius:'99px',
                  border:'none',
                  background:'var(--green-400)',
                  color:'var(--green-50)',
                  fontSize:'13px',
                  fontWeight:600,
                  cursor:'pointer',
                  transition:'transform 0.15s',
                  fontFamily:'var(--font-sans)',
                  boxShadow:'0 2px 8px rgba(99,153,34,0.3)',
                }}
              >
                ✅ I'll commit to this!
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips */}
        <SuggestionChips round={chipRound} onSelect={sendMessage} disabled={loading} />

        {/* Input area */}
        <div style={{ padding:'10px 16px 16px', borderTop:'0.5px solid var(--gray-100)', display:'flex', gap:'8px', alignItems:'flex-end', background:'#fff' }}>

          {/* Image upload button */}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display:'none' }} />
          <button
            className="img-btn"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            title="Upload a photo of trash or product label"
            style={{
              width:'40px', height:'40px', borderRadius:'50%',
              border:'0.5px solid var(--gray-200)',
              background:'var(--gray-50)',
              fontSize:'18px', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0, transition:'background 0.15s',
            }}
          >
            📷
          </button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about sustainability… or upload a photo 📷"
            rows={1}
            style={{
              flex:1, resize:'none', padding:'10px 14px', fontSize:'14px',
              borderRadius:'14px', border:'0.5px solid var(--gray-200)',
              outline:'none', fontFamily:'var(--font-sans)', color:'var(--gray-900)',
              background:'var(--gray-50)', lineHeight:'1.5',
              transition:'border-color 0.15s', maxHeight:'100px', overflowY:'auto',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--green-400)'}
            onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width:'40px', height:'40px', borderRadius:'50%', border:'none',
              background: loading || !input.trim() ? 'var(--gray-200)' : 'var(--green-400)',
              color: loading || !input.trim() ? 'var(--gray-400)' : 'var(--green-50)',
              fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.15s', flexShrink:0, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            }}
          >↑</button>
        </div>

      </div>
    </>
  )
}
