import { useEffect, useMemo, useRef, useState } from 'react';
import type { Artifact, Attachment, ChatMessage, Language, Topic, TopicFilter } from './types';
import { QUICK_ACTIONS, type QuickActionId } from './constants';
import { parseMessage } from './lib/parseMessage';
import { cn, uid } from './lib/utils';
import { streamAnswer } from './services/aiService';
import { useChats } from './store/useChats';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { ChatView } from './components/ChatView';
import { ExplainerPanel } from './components/explainer/ExplainerPanel';

export interface AiTeacherProps {
  /** Logged-in student's name (shown in greeting and sidebar) */
  userName?: string;
  /** If provided, a close (x) button is shown */
  onClose?: () => void;
  /** Use a per-user key so chat history is not shared between accounts */
  storageKey?: string;
  /** Render as a full-screen overlay (like a modal) */
  asModal?: boolean;
  className?: string;
  /** Optional curriculum skill context */
  skillId?: string;
  /** Optional curriculum step context */
  stepId?: string;
}

const MAX_FILE_CHARS = 100_000;

export function AiTeacher({ 
  userName = 'Student', 
  onClose, 
  storageKey = 'pragati-ai-teacher:v1', 
  asModal = false, 
  className,
  skillId,
  stepId
}: AiTeacherProps) {
  const store = useChats(storageKey);
  const { activeChat } = store;

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [language, setLanguage] = useState<Language>('Bangla + English');
  const [topic, setTopic] = useState<TopicFilter>('All topics');
  const [streamingChatId, setStreamingChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openArtifactId, setOpenArtifactId] = useState<string | null>(null);
  const [focusTick, setFocusTick] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const activeRequestIdRef = useRef<string | null>(null);

  const streaming = streamingChatId !== null;

  const artifacts = useMemo<Artifact[]>(
    () => (activeChat ? activeChat.messages.filter((m) => m.role === 'assistant').flatMap((m) => parseMessage(m.id, m.content).artifacts) : []),
    [activeChat],
  );
  const openArtifact = artifacts.find((a) => a.id === openArtifactId) ?? null;

  // Esc closes the explainer panel
  useEffect(() => {
    if (!openArtifact) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && setOpenArtifactId(null);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [openArtifact]);

  const newChat = () => {
    abortRef.current?.abort();
    activeRequestIdRef.current = null;
    store.setActiveId(null);
    setOpenArtifactId(null);
    setInput('');
    setAttachments([]);
    setSidebarOpen(false);
    setFocusTick((t) => t + 1);
  };

  const selectChat = (id: string) => {
    const chat = store.chats.find((c) => c.id === id);
    if (chat) setTopic(chat.topic);
    store.setActiveId(id);
    setOpenArtifactId(null);
    setSidebarOpen(false);
  };

  const attachFiles = async (files: FileList) => {
    const added: Attachment[] = [];
    for (const f of Array.from(files).slice(0, 3)) {
      const content = (await f.text()).slice(0, MAX_FILE_CHARS);
      added.push({ name: f.name, content });
    }
    setAttachments((prev) => [...prev.filter((p) => !added.some((a) => a.name === p.name)), ...added].slice(0, 3));
  };

  const sendMessage = async (raw?: string, quickActionParam?: string) => {
    const text = (raw ?? input).trim();
    if ((!text && attachments.length === 0) || streaming) return;

    const atts = raw ? [] : attachments;
    if (!raw) {
      setInput('');
      setAttachments([]);
    }

    let chatId = activeChat?.id;
    let prior: ChatMessage[] = activeChat?.messages ?? [];
    if (!chatId) {
      const title = (text || atts[0]?.name || 'New chat').slice(0, 48);
      chatId = store.createChat(topic, title);
      prior = [];
    }

    const now = Date.now();
    const currentReqId = uid();
    activeRequestIdRef.current = currentReqId;

    const userMsg: ChatMessage = { id: uid(), role: 'user', content: text, createdAt: now, attachments: atts.length ? atts : undefined, status: 'done' };
    const aiMsg: ChatMessage = { id: uid(), role: 'assistant', content: '', createdAt: now + 1, status: 'streaming' };
    store.addMessages(chatId, [userMsg, aiMsg]);
    setStreamingChatId(chatId);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let acc = '';
    let hasVisualArtifact = false;
    try {
      await streamAnswer({
        history: [...prior, userMsg],
        topic,
        language,
        userName,
        skillId,
        currentStepId: stepId,
        quickAction: quickActionParam,
        requestId: currentReqId,
        signal: ctrl.signal,
        onResponseMeta: (meta) => {
          hasVisualArtifact = meta.hasVisualArtifact;
        },
        onToken: (t) => {
          if (activeRequestIdRef.current !== currentReqId) return;
          acc += t;
          store.patchMessage(chatId!, aiMsg.id, { content: acc });
        },
      });
      if (activeRequestIdRef.current === currentReqId) {
        store.patchMessage(chatId, aiMsg.id, { status: 'done', content: acc });
      }
    } catch (err) {
      if (ctrl.signal.aborted) {
        store.patchMessage(chatId, aiMsg.id, { status: 'done', content: acc });
      } else {
        console.error('[AiTeacher]', err);
        store.patchMessage(chatId, aiMsg.id, { status: 'error', content: acc });
      }
    } finally {
      if (activeRequestIdRef.current === currentReqId) {
        setStreamingChatId(null);
        abortRef.current = null;
      }
    }

    // Only open Visual View when an actual artifact is generated or requested:
    // Normal responses: visualOpen = false
    // Artifact responses: visualOpen = true
    if (hasVisualArtifact) {
      const auto = parseMessage(aiMsg.id, acc).autoOpenId;
      if (auto) setOpenArtifactId(auto);
    }
  };

  const stop = () => abortRef.current?.abort();

  const quickAction = (id: QuickActionId) => {
    const a = QUICK_ACTIONS.find((x) => x.id === id);
    if (!a) return;
    const typed = input.trim();
    if (typed) {
      void sendMessage(`${a.prefix}${typed}`, id);
      setInput('');
    } else if (activeChat && activeChat.messages.length > 0) {
      void sendMessage(a.follow, id);
    } else {
      setInput(a.prefix);
      setFocusTick((t) => t + 1);
    }
  };

  const pickTopic = (t: Topic) => {
    setTopic(t);
    void sendMessage(`I want to learn ${t}. Give me a beginner-friendly roadmap and what to study first.`);
  };

  const explainerOpen = Boolean(openArtifact);
  // when the explainer panel is open the sidebar becomes a slide-over until 2xl screens
  const menuClass = explainerOpen ? '2xl:hidden' : 'lg:hidden';

  const common = {
    input,
    setInput,
    onSend: () => void sendMessage(),
    onStop: stop,
    streaming,
    attachments,
    onAttach: (f: FileList) => void attachFiles(f),
    onRemoveAttachment: (n: string) => setAttachments((p) => p.filter((a) => a.name !== n)),
    focusTick,
    onQuickAction: quickAction,
    onMenu: () => setSidebarOpen(true),
    menuClass,
    onClose,
  };

  const shell = (
    <div className={cn('relative flex h-full w-full overflow-hidden bg-[#FAF9FF] text-[#1B1B2F]', className)}>
      {sidebarOpen && <div className={cn('fixed inset-0 z-40 bg-black/30', explainerOpen ? '2xl:hidden' : 'lg:hidden')} onClick={() => setSidebarOpen(false)} />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 h-full w-[290px] shrink-0 border-r border-[#E2DFF5] bg-[#F1EEFF] transition-transform duration-200',
          explainerOpen ? '2xl:static 2xl:translate-x-0' : 'lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar chats={store.chats} activeId={store.activeId} userName={userName} onNew={newChat} onSelect={selectChat} onDelete={store.deleteChat} />
      </aside>

      <main className="flex min-w-0 flex-1">
        <section className="min-w-0 flex-1">
          {activeChat && activeChat.messages.length > 0 ? (
            <ChatView
              {...common}
              chat={activeChat}
              topic={topic}
              onTopic={setTopic}
              language={language}
              onLanguage={setLanguage}
              activeArtifactId={openArtifactId}
              onOpenArtifact={(a) => setOpenArtifactId(a.id)}
              onFollowUp={(q) => void sendMessage(q)}
              onFeedback={(id, f) => activeChat && store.patchMessage(activeChat.id, id, { feedback: f })}
            />
          ) : (
            <HomeView {...common} userName={userName} onPickTopic={pickTopic} onAsk={(q) => void sendMessage(q)} />
          )}
        </section>

        {openArtifact && (
          <ExplainerPanel
            artifacts={artifacts}
            active={openArtifact}
            onSelect={setOpenArtifactId}
            onClose={() => setOpenArtifactId(null)}
            onAsk={(t) => void sendMessage(t)}
          />
        )}
      </main>
    </div>
  );

  if (!asModal) return shell;
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 sm:p-4">
      <div className="h-full overflow-hidden bg-white shadow-2xl sm:rounded-3xl">{shell}</div>
    </div>
  );
}
