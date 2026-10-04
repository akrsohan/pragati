import { useMemo, useState, useRef, useEffect } from 'react';
import type { Chat } from '../types';
import { topicColor } from '../constants';
import { groupChats, cn } from '../lib/utils';
import { BotAvatar } from './BotAvatar';
import { Icon } from './Icons';

interface Props {
  chats: Chat[];
  activeId: string | null;
  userName: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNew: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onCloseMobile?: () => void;
}

export function Sidebar({
  chats,
  activeId,
  userName,
  isCollapsed = false,
  onToggleCollapse,
  onNew,
  onSelect,
  onRename,
  onDelete,
  onCloseMobile,
}: Props) {
  const [q, setQ] = useState('');
  const [menuOpenChatId, setMenuOpenChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const editInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredChats = useMemo(() => {
    if (!q.trim()) return chats;
    const query = q.trim().toLowerCase();
    return chats.filter((c) => c.title.toLowerCase().includes(query));
  }, [chats, q]);

  const groups = useMemo(() => groupChats(filteredChats), [filteredChats]);

  // Auto-focus and select input when entering rename mode
  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChatId]);

  // Close 3-dot dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenChatId(null);
      }
    };
    if (menuOpenChatId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpenChatId]);

  const handleStartRename = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
    setMenuOpenChatId(null);
  };

  const handleSaveRename = (chatId: string) => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed.length > 0) {
      onRename(chatId, trimmed);
    }
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleCancelRename = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const handlePromptDelete = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(chatId);
    setMenuOpenChatId(null);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  // =========================================================================
  // STATE B: COLLAPSED SIDEBAR (Icon-only bar ~68px wide)
  // =========================================================================
  if (isCollapsed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-between bg-[#F8F7FF] dark:bg-[#141424] py-4 border-r border-[#EBE8F8] dark:border-[#25243C]">
        <div className="flex flex-col items-center gap-3 w-full px-2">
          {/* Brand Avatar */}
          <div className="p-1" title="Pragati AI Teacher">
            <BotAvatar size={34} />
          </div>

          {/* Expand Sidebar Button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-[#1B1B2F] border border-[#ECE8F8] dark:border-[#2D2A48] text-[#6E5CF6] dark:text-[#A78BFA] hover:bg-[#F0EDFF] dark:hover:bg-[#252245] transition shadow-2xs cursor-pointer"
            >
              <Icon name="sidebarExpand" className="h-4.5 w-4.5" />
            </button>
          )}

          <div className="my-1 h-[1px] w-8 bg-[#E6E3F5] dark:bg-[#2A2844]" />

          {/* New Chat Icon Button */}
          <button
            type="button"
            onClick={onNew}
            aria-label="New chat"
            title="New chat"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#6E5CF6] to-[#8C76FA] text-white shadow-xs hover:opacity-95 active:scale-95 transition cursor-pointer"
          >
            <Icon name="plus" className="h-5 w-5" />
          </button>

          {/* Search trigger (expands sidebar) */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Search chats"
            title="Search chats"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#7A78A0] dark:text-[#9A98BD] hover:bg-white dark:hover:bg-[#1E1E34] hover:text-[#6E5CF6] transition cursor-pointer"
          >
            <Icon name="search" className="h-4.5 w-4.5" />
          </button>

          {/* Collapsed Chat History Badges */}
          <div className="mt-2 flex-1 overflow-y-auto no-scrollbar flex flex-col items-center gap-2 w-full max-h-[calc(100vh-280px)]">
            {chats.slice(0, 8).map((c) => {
              const active = c.id === activeId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelect(c.id)}
                  title={c.title}
                  className={cn(
                    'relative flex h-8.5 w-8.5 items-center justify-center rounded-xl transition cursor-pointer',
                    active
                      ? 'bg-white dark:bg-[#1E1E34] shadow-xs ring-2 ring-[#7C6CFF]'
                      : 'hover:bg-white/80 dark:hover:bg-[#1C1C30] text-[#7A78A0] dark:text-[#9A98BD]',
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: topicColor(c.topic) }}
                  />
                  {active && <span className="absolute -left-1 top-1.5 h-5 w-1 rounded-full bg-[#7C6CFF]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsed Profile */}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#6E5CF6] to-[#8C76FA] text-[13px] font-bold text-white shadow-xs cursor-pointer"
          title={`${userName} (DIU CSE Student)`}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE A: EXPANDED SIDEBAR (Full view ~290px wide)
  // =========================================================================
  return (
    <div className="relative flex h-full w-full flex-col bg-[#F8F7FF] dark:bg-[#141424] border-r border-[#EBE8F8] dark:border-[#25243C] select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 pb-2.5 pt-4.5">
        <div className="flex items-center gap-3 min-w-0">
          <BotAvatar size={36} />
          <div className="min-w-0">
            <div className="truncate text-[14.5px] font-bold text-[#18182E] dark:text-white leading-tight">
              Pragati AI Teacher
            </div>
            <div className="truncate text-[10.5px] text-[#7A78A0] dark:text-[#9A98BD] mt-0.5 font-medium">
              DIU CSE Study Workspace
            </div>
          </div>
        </div>

        {/* Action button: Collapse (on desktop) or Close (on mobile drawer) */}
        <div className="flex items-center gap-1 shrink-0">
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-[#7A78A0] dark:text-[#9A98BD] hover:bg-white dark:hover:bg-[#1E1E34] hover:text-[#18182E] dark:hover:text-white transition cursor-pointer"
            >
              <Icon name="sidebarCollapse" className="h-4.5 w-4.5" />
            </button>
          )}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
              className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-[#7A78A0] dark:text-[#9A98BD] hover:bg-white dark:hover:bg-[#1E1E34] transition cursor-pointer"
            >
              <Icon name="close" className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Actions: New Chat & Search */}
      <div className="px-4 pt-2 pb-2 space-y-2.5">
        <button
          type="button"
          onClick={onNew}
          className="flex h-10.5 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#6E5CF6] to-[#8C76FA] px-4 text-[13.5px] font-bold text-white shadow-xs transition hover:opacity-95 active:scale-[0.99] cursor-pointer"
        >
          <Icon name="plus" className="h-4 w-4 shrink-0 text-white" />
          <span className="leading-none">New chat</span>
        </button>

        {/* Real-time search bar */}
        <div className="flex items-center h-9.5 w-full rounded-xl border border-[#E2DFF5] dark:border-[#2D2A48] bg-white dark:bg-[#1B1B2F] px-3 gap-2 transition focus-within:border-[#7C6CFF] focus-within:ring-2 focus-within:ring-[#7C6CFF]/15">
          <Icon name="search" className="h-3.5 w-3.5 shrink-0 text-[#9A98B8]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search discussions..."
            className="w-full bg-transparent text-[12.5px] text-[#18182E] dark:text-white placeholder:text-[#9A98B8] outline-none border-none p-0"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              aria-label="Clear search"
              className="text-[#9A98B8] hover:text-[#18182E] dark:hover:text-white text-[12px] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Chat History Grouped List (Scrollable Area) */}
      <nav className="mt-1 flex-1 overflow-y-auto px-3 pb-4 [scrollbar-width:thin]">
        {filteredChats.length === 0 ? (
          <div className="px-3 pt-6 text-center">
            {q ? (
              <p className="text-[12px] text-[#7A78A0] dark:text-[#8E8CB0]">
                No conversations found for &ldquo;{q}&rdquo;
              </p>
            ) : (
              <div className="space-y-1.5 py-4">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#F1EEFF] dark:bg-[#221F3D] text-[#6E5CF6]">
                  <Icon name="messageSquare" className="h-4 w-4" />
                </div>
                <p className="text-[12.5px] font-semibold text-[#18182E] dark:text-white">No conversations yet</p>
                <p className="text-[11px] text-[#7A78A0] dark:text-[#8E8CB0]">
                  Start a new chat to begin learning!
                </p>
              </div>
            )}
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.label} className="mb-3.5">
              <div className="px-2.5 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#8A88AE] dark:text-[#7C7A9E]">
                {g.label}
              </div>
              {g.items.map((c) => {
                const active = c.id === activeId;
                const isEditing = editingChatId === c.id;
                const isMenuOpen = menuOpenChatId === c.id;

                return (
                  <div
                    key={c.id}
                    className={cn(
                      'group relative mb-1 flex items-center rounded-xl border transition-all text-left',
                      active
                        ? 'border-[#DCD8F7] dark:border-[#38345E] bg-white dark:bg-[#1E1E34] shadow-xs text-[#18182E] dark:text-white'
                        : 'border-transparent hover:bg-white/80 dark:hover:bg-[#1C1C30] text-[#3A3A54] dark:text-[#C5C4DC]',
                    )}
                  >
                    {/* Active accent pill */}
                    {active && <span className="absolute left-0 top-2 h-5.5 w-1 rounded-full bg-[#7C6CFF]" />}

                    {isEditing ? (
                      /* Inline Rename Input */
                      <div className="flex items-center gap-1.5 w-full px-2.5 py-1.5">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editTitle}
                          maxLength={50}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(c.id);
                            if (e.key === 'Escape') handleCancelRename();
                          }}
                          className="h-7 w-full rounded-md border border-[#7C6CFF] bg-white dark:bg-[#141424] px-2 text-[12px] font-medium text-[#18182E] dark:text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(c.id)}
                          aria-label="Save title"
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#7C6CFF] text-white hover:bg-[#6A58FA] cursor-pointer"
                        >
                          <Icon name="check" className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelRename}
                          aria-label="Cancel rename"
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#ECE8F8] dark:bg-[#2D2A48] text-[#555] dark:text-[#BBB] hover:bg-[#DDD] cursor-pointer"
                        >
                          <Icon name="close" className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      /* Normal Chat Item Row */
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            onSelect(c.id);
                            if (onCloseMobile) onCloseMobile();
                          }}
                          className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-left cursor-pointer"
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: topicColor(c.topic) }}
                          />
                          <span
                            className={cn(
                              'truncate text-[13px] leading-snug',
                              active ? 'font-semibold text-[#18182E] dark:text-white' : 'font-medium',
                            )}
                          >
                            {c.title}
                          </span>
                        </button>

                        {/* Three-dot Action Trigger */}
                        <div className="relative shrink-0 pr-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenChatId(isMenuOpen ? null : c.id);
                            }}
                            aria-label="Chat actions"
                            className={cn(
                              'h-7 w-7 items-center justify-center rounded-lg text-[#9A98B8] hover:bg-[#F1EEFF] dark:hover:bg-[#2C284E] hover:text-[#18182E] dark:hover:text-white transition cursor-pointer',
                              isMenuOpen ? 'flex' : 'hidden group-hover:flex',
                            )}
                          >
                            <Icon name="dots" className="h-3.5 w-3.5" />
                          </button>

                          {/* Action Dropdown Menu */}
                          {isMenuOpen && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 top-8 z-50 w-32 rounded-xl border border-[#E8E4F8] dark:border-[#2D2A48] bg-white dark:bg-[#1B1B2F] p-1 shadow-lg backdrop-blur-xs text-[12px] font-medium animate-in fade-in zoom-in-95 duration-100"
                            >
                              <button
                                type="button"
                                onClick={(e) => handleStartRename(c, e)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[#3A3A54] dark:text-[#D1D0E4] hover:bg-[#F1EEFF] dark:hover:bg-[#27234A] hover:text-[#6E5CF6] transition cursor-pointer"
                              >
                                <Icon name="edit" className="h-3.5 w-3.5" />
                                <span>Rename</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handlePromptDelete(c.id, e)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[#E11D48] hover:bg-[#FFEAEF] dark:hover:bg-[#3D1A25] transition cursor-pointer"
                              >
                                <Icon name="trash" className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </nav>

      {/* User Footer Profile */}
      <div className="flex items-center gap-3 border-t border-[#E8E5F6] dark:border-[#25243C] px-4 py-3.5 bg-white/40 dark:bg-[#141424] shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#6E5CF6] to-[#8C76FA] text-[13.5px] font-bold text-white shadow-xs shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-bold text-[#18182E] dark:text-white leading-tight">
            {userName}
          </div>
          <div className="text-[10.5px] text-[#7A78A0] dark:text-[#9A98BD] mt-0.5 font-medium">
            DIU CSE Student
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-[#E8E4F8] dark:border-[#302D4E] bg-white dark:bg-[#18182D] p-5 shadow-xl">
            <h3 className="text-[15px] font-bold text-[#18182E] dark:text-white">Delete conversation?</h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#6A6888] dark:text-[#9A98BD]">
              This conversation and all its messages will be removed. This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="h-8.5 rounded-xl border border-[#E2DFF5] dark:border-[#2E2B4B] bg-white dark:bg-[#1D1D32] px-3.5 text-[12px] font-semibold text-[#42425A] dark:text-[#C5C4DC] hover:bg-[#F9F8FF] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="h-8.5 rounded-xl bg-[#E11D48] px-3.5 text-[12px] font-semibold text-white shadow-xs hover:bg-[#D01740] active:scale-95 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
