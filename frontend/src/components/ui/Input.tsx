import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, required, className = "", id: customId, ...props }, ref) => {
    const defaultId = useId();
    const inputId = customId || defaultId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-600 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full px-3 py-2 border rounded-input text-sm text-base-text bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
            error
              ? "border-red-500 focus:ring-red-500 text-red-900"
              : "border-[#b2bec3] focus:ring-primary focus:border-transparent"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p id={errorId} className="mt-1 text-xs text-red-500 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1 text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
