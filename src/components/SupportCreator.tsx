import { useEffect, useRef, useState } from 'react';

const TELEGRAM_HANDLE = 'v21akr';
const TON_WALLET = 'UQAOrunbnzTTL6VUO8X1Lq5E3n9xtrFLM2oFb_ZxrP59fWOn';

const BMC_URL = 'https://www.buymeacoffee.com/21akr';

const TON_DEEP_LINK = `ton://transfer/${TON_WALLET}`;
const TON_VIEWER_URL = `https://tonviewer.com/${TON_WALLET}`;
const TG_LINK = `https://t.me/${TELEGRAM_HANDLE}`;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupportCreator({ open, onOpenChange }: Props) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);

  const copyWallet = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(TON_WALLET);
      setCopied(true);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="support" ref={ref}>
      <button
        type="button"
        className="support-toggle"
        onClick={() => onOpenChange(!open)}
        aria-label="Support the creator"
        title="Support the creator"
      >
        <HeartIcon filled />
      </button>

      {open && (
        <div className="support-popover" role="dialog">
          <div className="support-header">
            <h3 className="support-title">Support the creator</h3>
            <p className="support-subtitle">
              Reach out, donate, or send a Telegram gift.
            </p>
          </div>

          <div className="support-section">
            <div className="support-label">Contact · business · send a gift :P</div>
            <a
              className="support-row support-row-link"
              href={TG_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="support-row-value">@{TELEGRAM_HANDLE}</span>
              <ExternalIcon />
            </a>
          </div>

          <div className="support-section">
            <div className="support-label">Donate TON</div>
            <a
              className="support-row support-row-link"
              href={TON_DEEP_LINK}
              title="Open in your TON wallet"
            >
              <span className="support-row-value support-mono">
                {TON_WALLET.slice(0, 8)}…{TON_WALLET.slice(-6)}
              </span>
              <button
                type="button"
                className="support-icon-btn"
                onClick={copyWallet}
                aria-label="Copy address"
                title="Copy address"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </a>
            <a
              className="support-sublink"
              href={TON_VIEWER_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Tonviewer ↗
            </a>
          </div>

          <div className="support-section">
            <div className="support-label">Buy me a coffee</div>
            <a
              className="support-row support-row-link"
              href={BMC_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="support-row-value">buymeacoffee.com/21akr</span>
              <ExternalIcon />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
