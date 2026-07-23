import React, { useId } from "react";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  maxLength?: number;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, required, maxLength, className = "", id: customId, value, ...props }, ref) => {
    const defaultId = useId();
    const textAreaId = customId || defaultId;
    const errorId = `${textAreaId}-error`;
    const helperId = `${textAreaId}-helper`;

    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          {label && (
            <label htmlFor={textAreaId} className="block text-sm font-medium text-slate-600">
              {label}
              {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
            </label>
          )}
          {maxLength && (
            <span className="text-xs text-slate-400">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={textAreaId}
          value={value}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full px-3 py-2 border rounded-input text-sm text-base-text bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 resize-y min-h-[100px] ${
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

TextArea.displayName = "TextArea";
export default TextArea;
