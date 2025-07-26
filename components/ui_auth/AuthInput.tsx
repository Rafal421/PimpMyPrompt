// components/AuthInput.tsx - Optimized input component
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";

interface AuthInputProps {
  id: string;
  name: string;
  type?: string;
  label: string;
  placeholder: string;
  value?: string;
  error?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  (
    {
      id,
      name,
      type = "text",
      label,
      placeholder,
      value,
      error,
      required = false,
      showPasswordToggle = false,
      onChange,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = showPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;

    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-white text-sm font-medium">
          {label}
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            name={name}
            type={inputType}
            placeholder={placeholder}
            required={required}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={`bg-gray-900/50 backdrop-blur-sm border text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-12 rounded-xl hover:border-gray-700/50 transition-all duration-200 ${
              showPasswordToggle ? "pr-12" : ""
            } ${
              error
                ? "border-red-500/50 focus:border-red-500"
                : "border-gray-800/50"
            }`}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
