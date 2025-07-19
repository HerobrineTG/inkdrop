
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { getRoomChats, updateRoomChats } from '@/lib/actions/room.actions';

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export default function Chat({ roomId, user }: { roomId: string; user: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChats() {
      setLoading(true);
      const backendChats = await getRoomChats(roomId);
      let parsedChats: ChatMessage[] = [];
      if (Array.isArray(backendChats)) {
        parsedChats = backendChats.map((str: string) => {
          try {
            return JSON.parse(str);
          } catch {
            return null;
          }
        }).filter(Boolean);
      } else if (typeof backendChats === 'string') {
        try {
          parsedChats = [JSON.parse(backendChats)];
        } catch {
          parsedChats = [];
        }
      }
      setMessages(parsedChats);
      setLoading(false);
    }
    fetchChats();
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [
      ...messages,
      {
        id: Math.random().toString(36).slice(2),
        user,
        text: input,
        timestamp: Date.now(),
      },
    ];
    setMessages(newMessages);
    setInput('');
    await updateRoomChats(roomId, newMessages.map(msg => JSON.stringify(msg)));
  };

  return (
    <div className="flex flex-col h-[500px] w-full">
      <div className="bg-gradient-to-b from-purple-800 via-purple-950 to-transparent rounded-md shadow-lg p-4 mb-4 w-96 mx-auto">
        <h2 className="text-4xl font-semibold text-white text-center tracking-wide font-poppins">
          Chat
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-transparent">
        {loading ? (
          <div className="text-zinc-500 text-center mt-10">Loading chat...</div>
        ) : messages.length === 0 ? (
          <div className="text-zinc-500 text-center mt-10">No messages yet.</div>
        ) : (
          messages.map((msg: ChatMessage) => {
            const isMe = msg.user === user;
            return (
              <div key={msg.id} className={cn(
                'flex flex-col gap-1',
                isMe ? 'items-end' : 'items-start'
              )}>
                <span className={cn(
                  'text-xs',
                  isMe ? 'text-purple-300 text-right' : 'text-zinc-400 text-left'
                )}>
                  {isMe ? 'You' : msg.user} <span className="text-purple-600">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </span>
                <span className={cn(
                  'rounded px-3 py-2 text-white w-fit max-w-[80%] break-words',
                  isMe 
                    ? 'bg-gradient-to-r from-purple-600 via-purple-800 to-purple-950/50 flex h-full gap-1 px-5 py-2 rounded-md shadow '
                    : 'bg-zinc-800'
                )}>
                  {msg.text}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="flex gap-2 p-2 border-t border-zinc-800" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
        <input
          className="flex-1 rounded bg-zinc-900 p-2 text-white"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <Button type="submit" className='gradient-blue flex h-full gap-1 px-5' variant="purpleBorder">Send</Button>
      </form>
    </div>
  );
}
