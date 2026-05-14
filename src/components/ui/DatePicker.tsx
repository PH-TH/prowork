import type { InputHTMLAttributes } from 'react';
import { Input } from './Input';

interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function DatePicker(props: DatePickerProps) {
  return <Input type="date" {...props} />;
}
