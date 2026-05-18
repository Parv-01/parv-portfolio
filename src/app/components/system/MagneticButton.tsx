import { useRef, type ReactNode, type MouseEvent, type CSSProperties } from 'react';
import { Link } from 'react-router';

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  strength?: number;
  onClick?: () => void;
  href?: string;
  external?: boolean;
};

export function MagneticButton({
  children,
  className = '',
  style,
  strength = 8,
  onClick,
  href,
  external,
}: Props) {
  const wrapperRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  const handleMove = (e: MouseEvent) => {
    const wrap = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    inner.style.transform = `translate3d(${(x / rect.width) * strength * 2}px, ${(y / rect.height) * strength * 2}px, 0)`;
  };

  const handleLeave = () => {
    const inner = innerRef.current;
    if (inner) inner.style.transform = 'translate3d(0, 0, 0)';
  };

  const content = (
    <span ref={innerRef} className="magnetic-target inline-flex items-center gap-2">
      {children}
    </span>
  );

  if (href) {
    const isExternal = external || /^https?:/.test(href);
    if (isExternal) {
      return (
        <a
          ref={wrapperRef as React.RefObject<HTMLAnchorElement>}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          className={`inline-flex items-center justify-center no-underline ${className}`}
          style={style}
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        ref={wrapperRef as React.RefObject<HTMLAnchorElement>}
        to={href}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className={`inline-flex items-center justify-center no-underline ${className}`}
        style={style}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      ref={wrapperRef as React.RefObject<HTMLButtonElement>}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`inline-flex items-center justify-center cursor-pointer border-0 bg-transparent p-0 ${className}`}
      style={style}
    >
      {content}
    </button>
  );
}
