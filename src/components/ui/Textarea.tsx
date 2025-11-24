import React, { TextareaHTMLAttributes, useId } from 'react';

type Props = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  hint?: string;
  error?: string;
  success?: boolean;
  containerClassName?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'>;

const Textarea: React.FC<Props> = ({ label, value, onChange, hint, error, success, containerClassName, id, className, rows = 3, ...rest }) => {
  const autoId = useId();
  const inputId = id || autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const base = 'w-full rounded-md border bg-white px-3 py-2 text-sm transition-all duration-200 outline-none';
  const state = error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500' : success ? 'border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500';
  const depth = 'shadow-sm focus:shadow';

  return (
    <div className={containerClassName || ''}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
      <textarea
        id={inputId}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`${base} ${state} ${depth} ${className || ''}`}
        aria-invalid={!!error}
        aria-describedby={`${hint ? hintId : ''} ${error ? errorId : ''}`.trim()}
        {...rest}
      />
      {hint && <p id={hintId} className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p id={errorId} className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Textarea;