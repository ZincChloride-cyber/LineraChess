import { Link } from "react-router-dom";
import { useState } from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className = "", showText = false, size = "md" }: LogoProps) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };

  return (
    <Link to="/" className={`flex items-center gap-3 ${className}`}>
      {!imageError ? (
        <img
          src="/logo.png"
          alt="LineraChess"
          className={`${sizeClasses[size]} w-auto object-contain`}
          onError={() => setImageError(true)}
        />
      ) : (
        <h1 className="text-2xl font-bold">
          <span className="text-primary">Linera</span>Chess
        </h1>
      )}
      {showText && !imageError && (
        <h1 className="text-2xl font-bold">
          <span className="text-primary">Linera</span>Chess
        </h1>
      )}
    </Link>
  );
};
