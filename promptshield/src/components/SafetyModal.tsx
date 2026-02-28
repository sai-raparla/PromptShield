import React from "react";

export function SafetyModal({
  open,
  reasons,
  suggestedPrompt,
  onUseSuggested,
  onSendAnyway,
  onClose,
}: {
  open: boolean;
  reasons: string[];
  suggestedPrompt: string;
  onUseSuggested: () => void;
  onSendAnyway: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <div className="modalHeader">
          <div className="modalTitle">⚠ Prompt is not safe to send</div>
          <button className="modalClose" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modalBody">
          <div className="modalSection">
            <div className="modalLabel">Detected sensitive info</div>
            <ul className="modalList">
              {reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="modalSection">
            <div className="modalLabel">Better prompt (safe to send)</div>
            <textarea className="modalTextarea" readOnly value={suggestedPrompt} />
          </div>
        </div>

        <div className="modalActions">
          <button className="btn btnPrimary" onClick={onUseSuggested}>
            Use better prompt & send
          </button>
          <button className="btn" onClick={onSendAnyway}>
            Send anyway
          </button>
        </div>
      </div>
    </div>
  );
}