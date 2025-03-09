interface JavaScriptLogoProps {
  className?: string
  size?: number
}

export function JavaScriptLogo({ className = "", size = 40 }: JavaScriptLogoProps) {
  return (
    <div
      className={`bg-[#F7DF1E] flex items-center justify-center rounded ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="text-black font-bold" style={{ fontSize: size * 0.4 }}>
        JS
      </span>
    </div>
  )
}

