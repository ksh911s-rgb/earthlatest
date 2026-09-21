import React, { useState, useEffect, useRef } from 'react';
import { TEACHER_PASSWORD } from '../utils/constants';
import { Lock, X, AlertCircle } from 'lucide-react';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin === TEACHER_PASSWORD) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        if (nextPin === TEACHER_PASSWORD) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => setPin(''), 400);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-sm text-white shadow-2xl overflow-hidden p-6 sm:p-8 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center mx-auto mb-3 text-indigo-400 shadow-lg">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black tracking-tight">선생님 관리창 잠금</h3>
          <p className="text-xs text-zinc-400 mt-1">
            학생들의 임의 조작 방지를 위해 교사 비밀번호 4자리를 입력하세요
          </p>
        </div>

        {/* PIN Display Dots */}
        <div className="flex justify-center items-center gap-3 mb-4">
          {[0, 1, 2, 3].map((idx) => {
            const hasChar = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-11 h-12 rounded-xl border flex items-center justify-center text-xl font-bold font-mono transition-all ${
                  hasChar
                    ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300 scale-105'
                    : 'border-zinc-700 bg-zinc-800/60 text-zinc-500'
                } ${error ? 'border-red-500 bg-red-950/30' : ''}`}
              >
                {hasChar ? '●' : ''}
              </div>
            );
          })}
        </div>

        {/* Hidden physical keyboard input */}
        <form onSubmit={handleSubmit} className="mb-2">
          <input
            ref={inputRef}
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setPin(val);
              setError(false);
              if (val.length === 4) {
                if (val === TEACHER_PASSWORD) {
                  onSuccess();
                } else {
                  setError(true);
                  setTimeout(() => setPin(''), 400);
                }
              }
            }}
            className="sr-only"
            autoFocus
          />
        </form>

        {/* Error Message */}
        {error ? (
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-red-400 mb-4 animate-shake">
            <AlertCircle className="w-4 h-4" />
            <span>비밀번호가 일치하지 않습니다. 다시 입력해 주세요.</span>
          </div>
        ) : (
          <div className="h-5 mb-3" />
        )}

        {/* On-screen Numeric Keypad (Great for Smart TV & Touchscreens) */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeypadPress(digit)}
              className="py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 font-mono text-lg font-bold transition shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setPin('');
              setError(false);
            }}
            className="py-3 rounded-2xl bg-zinc-800/60 hover:bg-zinc-800 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 font-mono text-lg font-bold transition shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3 rounded-2xl bg-zinc-800/60 hover:bg-zinc-800 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition"
          >
            ← 지움
          </button>
        </div>
      </div>
    </div>
  );
};
