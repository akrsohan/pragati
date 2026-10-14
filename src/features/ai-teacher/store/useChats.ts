import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Chat, ChatMessage, TopicFilter } from '../types';
import { uid } from '../lib/utils';

function load(key: string): Chat[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Chat[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c) => ({
      ...c,
      messages: c.messages.map((m) => (m.status === 'streaming' ? { ...m, status: 'done' as const } : m)),
    }));
  } catch {
    return [];
  }
}

export function useChats(storageKey: string) {
  const [chats, setChats] = useState<Chat[]>(() => load(storageKey));
  const [activeId, setActiveId] = useState<string | null>(null);

  // persist (debounced so streaming tokens don't hammer localStorage)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(chats.slice(0, 100)));
      } catch {
        /* storage full or blocked: ignore */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [chats, storageKey]);

  const activeChat = useMemo(() => chats.find((c) => c.id === activeId) ?? null, [chats, activeId]);

  const createChat = useCallback((topic: TopicFilter, title: string): string => {
    const id = uid();
    const now = Date.now();
    setChats((prev) => [{ id, title, topic, createdAt: now, updatedAt: now, messages: [] }, ...prev]);
    setActiveId(id);
    return id;
  }, []);

  const renameChat = useCallback((id: string, newTitle: string) => {
    const clean = newTitle.trim();
    if (!clean) return;
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: clean, updatedAt: Date.now() } : c)),
    );
  }, []);

  const addMessages = useCallback((chatId: string, msgs: ChatMessage[]) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const existingIds = new Set(c.messages.map((m) => m.id));
        const newUnique: ChatMessage[] = [];
        for (const m of msgs) {
          if (existingIds.has(m.id)) continue;
          // Guard against duplicate consecutive user messages with identical content in rapid succession
          const lastMsg = newUnique.length > 0 ? newUnique[newUnique.length - 1] : c.messages[c.messages.length - 1];
          if (
            m.role === 'user' &&
            lastMsg &&
            lastMsg.role === 'user' &&
            lastMsg.content.trim() === m.content.trim() &&
            Math.abs(m.createdAt - lastMsg.createdAt) < 4000
          ) {
            continue;
          }
          newUnique.push(m);
          existingIds.add(m.id);
        }
        return { ...c, updatedAt: Date.now(), messages: [...c.messages, ...newUnique] };
      }),
    );
  }, []);

  const patchMessage = useCallback((chatId: string, msgId: string, patch: Partial<ChatMessage>) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...patch } : m)) } : c,
      ),
    );
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    setActiveId((cur) => (cur === id ? null : cur));
  }, []);

  return { chats, activeChat, activeId, setActiveId, createChat, renameChat, addMessages, patchMessage, deleteChat };
}
