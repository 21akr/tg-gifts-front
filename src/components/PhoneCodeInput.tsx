import {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  useRef,
} from 'react';
import { COUNTRIES, Country } from './countries';

interface Props {
  code: string;
  number: string;
  onCodeChange: (code: string) => void;
  onNumberChange: (number: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

function lookup(code: string): {
  exact: Country | null;
  hasLongerOption: boolean;
} {
  if (!code) return { exact: null, hasLongerOption: false };
  const dial = `+${code}`;
  const exact = COUNTRIES.find((c) => c.dial === dial) ?? null;
  const hasLongerOption = COUNTRIES.some(
    (c) => c.dial.startsWith(dial) && c.dial !== dial,
  );
  return { exact, hasLongerOption };
}

function splitFullNumber(raw: string): { code: string; rest: string } | null {
  const stripped = raw.replace(/^(\+|00)/, '').replace(/\D/g, '');
  if (!stripped) return null;
  let bestCode = '';
  for (let len = 1; len <= 4 && len <= stripped.length; len++) {
    const candidate = stripped.slice(0, len);
    if (lookup(candidate).exact) bestCode = candidate;
  }
  if (!bestCode) return null;
  return { code: bestCode, rest: stripped.slice(bestCode.length) };
}

export function PhoneCodeInput({
  code,
  number,
  onCodeChange,
  onNumberChange,
  disabled,
  error,
  autoFocus,
}: Props) {
  const codeRef = useRef<HTMLInputElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);

  const handleCodePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;
    if (text.startsWith('+') || text.startsWith('00')) {
      const split = splitFullNumber(text);
      if (split) {
        e.preventDefault();
        onCodeChange(split.code);
        onNumberChange(split.rest);
        if (split.rest) {
          requestAnimationFrame(() => numberRef.current?.focus());
        }
      }
    }
  };

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (raw.startsWith('+') || raw.startsWith('00')) {
      const split = splitFullNumber(raw);
      if (split) {
        onCodeChange(split.code);
        onNumberChange(split.rest);
        if (split.rest) {
          requestAnimationFrame(() => numberRef.current?.focus());
        }
        return;
      }
    }

    const digits = raw.replace(/\D/g, '').slice(0, 4);
    onCodeChange(digits);

    const { exact, hasLongerOption } = lookup(digits);
    if (exact && !hasLongerOption) {
      requestAnimationFrame(() => numberRef.current?.focus());
    }
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    onNumberChange(e.target.value.replace(/\D/g, '').slice(0, 14));
  };

  const handleNumberKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && number.length === 0) {
      e.preventDefault();
      codeRef.current?.focus();
    }
  };

  const { exact: country } = lookup(code);

  return (
    <div className="phone-stack">
      <div className="phone-row">
        <div className={`phone-code-wrap ${error ? 'input-error' : ''}`}>
          <span className="phone-code-prefix">+</span>
          <input
            ref={codeRef}
            type="tel"
            inputMode="numeric"
            className="phone-code-input"
            value={code}
            onChange={handleCodeChange}
            onPaste={handleCodePaste}
            disabled={disabled}
            autoFocus={autoFocus}
            placeholder="998"
            maxLength={5}
            aria-label="Country code"
          />
        </div>
        <input
          ref={numberRef}
          type="tel"
          inputMode="tel"
          className={`input phone-number-input ${error ? 'input-error' : ''}`}
          value={number}
          onChange={handleNumberChange}
          onKeyDown={handleNumberKeyDown}
          disabled={disabled}
          placeholder="90 123 45 67"
          autoComplete="tel-national"
          aria-label="Phone number"
        />
      </div>
      <div className="phone-country-hint">
        {country ? (
          <>
            <span className="country-flag">{country.flag}</span>
            <span>{country.name}</span>
          </>
        ) : code.length > 0 ? (
          <span className="phone-country-unknown">Unknown country code</span>
        ) : (
          <span className="phone-country-placeholder">
            Type your country code
          </span>
        )}
      </div>
    </div>
  );
}
