"use client"

import React, { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ResetPage(){
  const search = useSearchParams()
  const paramToken = search?.get('token') ?? ''
  const [token,setToken]=useState(paramToken)
  const [password,setPassword]=useState('')
  const [msg,setMsg]=useState<string | null>(null)
  const [loading,setLoading]=useState(false)
  const router = useRouter()

  async function onSubmit(e:React.FormEvent){
    e.preventDefault(); setMsg(null); setLoading(true)
    try{
      const res = await fetch('/api/auth/reset',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token, password }) })
      const data = await res.json()
      if(!res.ok) { setMsg(data.error||'Gagal'); return }
      setMsg('Kata sandi diubah. Silakan masuk.')
      setTimeout(()=>router.push('/login'),1500)
    }catch(e){ setMsg('Tidak dapat terhubung ke server.') }
    finally{ setLoading(false) }
  }

  return (
    <div className="flex items-center justify-center py-16">
      <form onSubmit={onSubmit} className="w-full max-w-md p-6 border">
        <h2 className="text-lg font-bold mb-4">Reset kata sandi</h2>
        <input value={token} onChange={e=>setToken(e.target.value)} required className="w-full p-2 mb-4 border" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full p-2 mb-4 border" />
        <button className="px-4 py-2 bg-blue-600 text-white" disabled={loading}>{loading? 'Memproses...' : 'Reset'}</button>
        {msg? <p className="mt-4 text-sm">{msg}</p> : null}
      </form>
    </div>
  )
}
