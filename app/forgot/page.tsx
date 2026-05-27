"use client"

import React, { useState } from 'react'

export default function ForgotPage(){
  const [email,setEmail]=useState('')
  const [token,setToken]=useState<string | null>(null)
  const [msg,setMsg]=useState<string | null>(null)
  const [loading,setLoading]=useState(false)

  async function onSubmit(e:React.FormEvent){
    e.preventDefault(); setMsg(null); setToken(null); setLoading(true)
    try{
      const res = await fetch('/api/auth/forgot',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) })
      const data = await res.json()
      if(!res.ok) { setMsg(data.error||'Gagal'); return }
      setMsg('Jika email terdaftar, instruksi reset telah dikirim.')
      if(data.token) setToken(data.token)
    }catch(e){ setMsg('Tidak dapat terhubung ke server.') }
    finally{ setLoading(false) }
  }

  return (
    <div className="flex items-center justify-center py-16">
      <form onSubmit={onSubmit} className="w-full max-w-md p-6 border">
        <h2 className="text-lg font-bold mb-4">Lupa kata sandi</h2>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full p-2 mb-4 border" />
        <button className="px-4 py-2 bg-blue-600 text-white" disabled={loading}>{loading? 'Mengirim...' : 'Kirim'}</button>
        {msg? <p className="mt-4 text-sm">{msg}</p> : null}
        {token? <div className="mt-4 text-sm"><p>Token (dev):</p><code className="break-all">{token}</code></div> : null}
      </form>
    </div>
  )
}
