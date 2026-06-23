import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "error" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-btn transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover focus:ring-primary focus:ring-offset-1",
    success: "bg-success text-white hover:bg-success-hover focus:ring-success focus:ring-offset-1",
    error: "bg-error text-white hover:bg-error-hover focus:ring-error focus:ring-offset-1",
    secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-500",
    outline: "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-slate-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm", // Matches the Figma guideline: padding 12px 24px
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
