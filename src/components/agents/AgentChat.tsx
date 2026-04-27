import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { quickActions } from "../../mocks/conversation";
import type { AgentMessage } from "../../types";
import { AgentMessageView } from "./AgentMessage";

interface Props {
  messages: AgentMessage[];
  onSend: (text: string) => void;
  onQuick: (text: string) => void;
  onCardAction: (messageId: string, action: string) => void;
}

export function AgentChat({ messages, onSend, onQuick, onCardAction }: Props) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && text.trim()) {
      onSend(text.trim());
      setText("");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 p-3">
        <div className="text-xs uppercase tracking-wider text-slate-500">
          Текущая задача
        </div>
        <div className="mt-1 flex items-start justify-between gap-2">
          <div className="text-sm font-medium text-slate-900">
            Привязать новые задачи к эпикам
          </div>
          <Badge tone="info">В работе</Badge>
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          Создана: сегодня, 10:14 • Инициатор: Иван Петров
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        <div className="text-xs uppercase tracking-wider text-slate-500">
          Чат с агентом
        </div>
        {messages.map((m) => (
          <AgentMessageView key={m.id} message={m} onCardAction={onCardAction} />
        ))}
      </div>

      <div className="border-t border-slate-200 p-3 bg-white">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Напишите сообщение…"
            aria-label="Сообщение агенту"
            className="h-9 flex-1 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-500"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (text.trim()) {
                onSend(text.trim());
                setText("");
              }
            }}
          >
            ➤
          </Button>
        </div>

        <div className="mt-3">
          <div className="text-[11px] uppercase tracking-wider text-slate-500">
            Быстрые команды
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {quickActions.map((q) => (
              <button
                key={q}
                onClick={() => onQuick(q)}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 hover:border-cyan-300 hover:text-cyan-700"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
