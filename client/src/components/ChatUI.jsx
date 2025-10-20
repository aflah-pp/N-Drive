import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import api from '../service/api'
import chatBot from '/src/assets/ai-bot.jpg'
import 'highlight.js/styles/github.css'
import { toast } from 'react-toastify'

function ChatUI() {
  const messagesEndRef = useRef(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(() => scrollToBottom(), [messages, loading])

  const loadChat = async () => {
    try {
      const res = await api.get('v1/chat/history/')
      if (res.data?.conversation) setMessages(res.data.conversation)
    } catch (err) {
      console.error('Failed to load chat:', err)
    }
  }

  const saveChat = async updatedMessages => {
    setSaving(true)
    try {
      await api.post('v1/chat/save/', { conversation: updatedMessages })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    loadChat()
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = { sender: 'user', text: input }
    const newMsgs = [...messages, userMsg]
    setMessages([...newMsgs, { sender: 'ai', text: '...' }])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('v1/chat/', { message: input })
      const reply = res.data.reply || 'No response received.'
      const updated = [...newMsgs, { sender: 'ai', text: reply }]
      setMessages(updated)
      saveChat(updated)
    } catch (err) {
      console.error(err)
      setMessages([
        ...newMsgs,
        { sender: 'ai', text: 'Error: could not reply.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const resetChat = async () => {
    try {
      await api.delete('v1/chat/reset/')
      setMessages([])
      toast.success('Chat reset Success.')
    } catch (err) {
      console.log(err)
      toast.error('Chat reset Failed.')
    }
  }
  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#dbc2a6] to-[#b89a7c]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-[#99744a]/40 bg-[#dbc2a6]/60 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <img
            src={chatBot}
            alt="AI"
            className="w-10 h-10 rounded-full border border-[#99744a]/60 shadow-sm"
          />
          <div>
            <h2 className="text-xl font-semibold text-[#414a37]">N-Drive AI</h2>
            {saving && (
              <p className="text-sm text-[#99744a] animate-pulse">Saving...</p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={resetChat}
            className="px-4 py-2 text-sm font-medium text-white bg-[#99744a] rounded-lg shadow-md transition-all hover:bg-[#82603c] hover:shadow-lg focus:ring-2 focus:ring-[#99744a]/30"
          >
            Reset Chat
          </button>
        </div>
      </header>

      {/* Messages / Empty State */}
      <section
        className={`flex-1 px-6 py-4 ${
          isEmpty
            ? 'flex flex-col items-center justify-center text-center'
            : 'overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-[#99744a]/40'
        }`}
      >
        {isEmpty ? (
          <div className="text-[#414a37] text-lg font-medium">
            What can I help with?
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === 'ai' ? 'justify-start' : 'justify-end'
              }`}
            >
              {msg.sender === 'ai' && (
                <img
                  src={chatBot}
                  className="w-8 h-8 rounded-full mr-2 border border-[#99744a]"
                  alt="AI"
                />
              )}
              <div
                className={`px-4 py-3 rounded-2xl max-w-3xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
                  msg.sender === 'ai'
                    ? 'bg-[#99744a]/20 text-[#414a37] rounded-bl-none'
                    : 'bg-[#99744a] text-white rounded-br-none'
                }`}
              >
                {msg.sender === 'ai' ? (
                  <div className="prose prose-sm max-w-none break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        table: props => (
                          <div className="overflow-x-auto">
                            <table
                              {...props}
                              className="table-auto border-collapse"
                            />
                          </div>
                        ),
                        a: props => (
                          <a
                            {...props}
                            className="text-blue-600 underline hover:text-blue-800"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </section>

      {/* Input */}
      <footer className="px-6 py-4 bg-[#dbc2a6]/40 border-t border-[#99744a]/30 backdrop-blur-md sticky bottom-0 z-10">
        <div className="flex items-center gap-2 justify-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 max-w-md px-4 py-3 rounded-full bg-[#dbc2a6]/60 border border-[#99744a]/40 focus:outline-none focus:ring-2 focus:ring-[#99744a]/70 text-[#414a37] placeholder-[#99744a]"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-6 py-3 rounded-full bg-[#99744a] text-white font-medium hover:bg-[#b89a7c] transition disabled:opacity-50"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </footer>
    </div>
  )
}

export default ChatUI
