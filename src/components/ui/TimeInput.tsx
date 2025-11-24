import React, { useEffect, useState } from 'react';
import Input from './Input';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  containerClassName?: string;
};

const TimeInput: React.FC<Props> = ({ label, value, onChange, required, containerClassName }) => {
  const [error, setError] = useState<string | undefined>(undefined);
  const pattern = /^([01]\d|2[0-3]):[0-5]\d$/;

  useEffect(() => {
    if (!value) { setError(undefined); return; }
    setError(pattern.test(value) ? undefined : '请输入 HH:mm');
  }, [value]);

  return (
    <Input
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="HH:mm"
      inputMode="numeric"
      pattern={pattern.source}
      error={error}
      containerClassName={containerClassName}
      required={required}
    />
  );
};

export default TimeInput;