type ClickableImageProps = {
  src: string
  alt: string
  className?: string
  onClick: () => void
}

export function ClickableImage({ src, alt, className, onClick }: ClickableImageProps) {
  return (
    <button type="button" className={`tosix-clickable-image${className ? ` ${className}` : ''}`} onClick={onClick} aria-label={`Phóng to: ${alt}`}>
      <img src={src} alt={alt} loading="lazy" />
      <span className="tosix-clickable-image-zoom" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
        </svg>
      </span>
    </button>
  )
}
