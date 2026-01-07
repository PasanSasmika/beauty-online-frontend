'use client';

import { useEffect, useState } from 'react';
import { Loader2, Mail, MessageSquare, Send, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Added for redirect if no token

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'replied';
  adminReply?: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const router = useRouter();

  // Fetch Messages
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token'); // <--- 1. Get Token
      
      // Optional: Redirect if no token found
      if (!token) {
        console.error("No token found");
        return; 
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`, {
         // <--- 2. Add Auth Header
         headers: {
            'Authorization': `Bearer ${token}`
         }
      });

      if (!res.ok) {
         if (res.status === 401) console.error("Unauthorized: Invalid Token");
         throw new Error("Failed to fetch");
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]); 
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  // Send Reply
  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    setSending(true);

    try {
      const token = localStorage.getItem('token'); // <--- 3. Get Token again

      if (!token) {
        alert("You are not logged in!");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <--- 4. Send Token here!
        },
        body: JSON.stringify({ replyText })
      });

      if (res.ok) {
        alert('Reply sent successfully!');
        setReplyingTo(null);
        setReplyText('');
        fetchMessages(); 
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to send email.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error. Check console.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#2D241E] rounded-lg text-white">
          <Mail size={24} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-[#2D241E]">Customer Messages</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {Array.isArray(messages) && messages.map((msg) => (
            <div key={msg._id} className={`bg-white p-6 rounded-2xl border ${msg.status === 'new' ? 'border-[#ee3f5c] shadow-md' : 'border-stone-200 opacity-80'}`}>
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-[#2D241E]">{msg.subject}</h3>
                  <p className="text-sm text-stone-500">From: <span className="font-medium text-stone-800">{msg.name}</span> ({msg.email})</p>
                  <p className="text-xs text-stone-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${msg.status === 'new' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {msg.status === 'new' ? <><Clock size={12} /> Pending</> : <><CheckCircle size={12} /> Replied</>}
                </span>
              </div>

              {/* Message Body */}
              <div className="bg-stone-50 p-4 rounded-xl text-stone-700 text-sm leading-relaxed mb-4">
                {msg.message}
              </div>

              {/* Reply Section */}
              {msg.status === 'replied' ? (
                <div className="pl-4 border-l-2 border-green-500">
                  <p className="text-xs font-bold text-green-600 uppercase mb-1">You replied:</p>
                  <p className="text-sm text-stone-600 italic">"{msg.adminReply}"</p>
                </div>
              ) : (
                <div>
                  {replyingTo === msg._id ? (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                      <textarea 
                        className="w-full p-3 border border-stone-300 rounded-lg text-sm outline-none focus:border-[#ee3f5c]" 
                        rows={4}
                        placeholder="Type your reply here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex gap-2 mt-3 justify-end">
                        <button onClick={() => setReplyingTo(null)} className="px-4 py-2 text-sm text-stone-500 hover:text-stone-800">Cancel</button>
                        <button 
                          onClick={() => handleReply(msg._id)} 
                          disabled={sending}
                          className="bg-[#2D241E] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-stone-800 disabled:opacity-50"
                        >
                          {sending ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} /> Send Reply</>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setReplyingTo(msg._id); setReplyText(''); }}
                      className="text-[#ee3f5c] font-bold text-sm hover:underline flex items-center gap-1"
                    >
                      <MessageSquare size={16} /> Reply to Customer
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {messages.length === 0 && <div className="text-center text-stone-400 py-10">No messages found.</div>}
        </div>
      )}
    </div>
  );
}