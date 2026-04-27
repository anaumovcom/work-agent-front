import type { AgentMessage } from "../../types";
import { Button } from "../common/Button";

interface Props {
  message: AgentMessage;
  onCardAction?: (messageId: string, action: string) => void;
}

export function AgentMessageView({ message, onCardAction }: Props) {
  if (message.author === "user") {
    return (
      <div className="flex flex-col items-end">
        <div className="text-[10px] text-slate-500">Иван П. • {message.time}</div>
        <div className="mt-1 max-w-[85%] rounded-lg rounded-tr-sm bg-cyan-50 border border-cyan-200 px-3 py-2 text-sm text-slate-900">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start">
      <div className="text-[10px] text-slate-500">Agent Team • {message.time}</div>
      {message.text && (
        <div className="mt-1 max-w-[85%] rounded-lg rounded-tl-sm bg-slate-100 border border-slate-200 px-3 py-2 text-sm text-slate-900">
          {message.text}
        </div>
      )}
      {message.card && (
        <div className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm">
          <div className="text-xs uppercase tracking-wider text-slate-500">
            Что вижу
          </div>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-slate-800">
            {message.card.seen.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <div className="mt-3 text-xs uppercase tracking-wider text-slate-500">
            Что предлагаю
          </div>
          <ul className="mt-1 list-decimal space-y-0.5 pl-5 text-slate-800">
            {message.card.proposal.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          {message.card.actions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.card.actions.map((a, i) => (
                <Button
                  key={a}
                  variant={i === 0 ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => onCardAction?.(message.id, a)}
                >
                  {a}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
