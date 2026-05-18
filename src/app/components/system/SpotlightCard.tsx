import { useRef, type ReactNode, type CSSProperties, type MouseEvent, type HTMLAttributes } from 'react';

type Props = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
  children: ReactNode;
  className?: string;
  variant?: 'glass' | 'glass-deep' | 'plain';
  noise?: boolean;
  bordered?: boolean;
  style?: CSSProperties;
};

export function SpotlightCard(props: Props) {
  const {
    children,
    className = '',
    variant = 'glass',
    noise = true,
    bordered = false,
    style,
    ...rest
  } = props;

  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mx', `${x}%`);
    el.style.setProperty('--my', `${y}%`);
  };

  const classes: string[] = [];
  if (variant !== 'plain') classes.push(variant);
  classes.push('spotlight');
  if (noise) classes.push('noise');
  if (bordered) classes.push('border-anim');
  classes.push('rounded-xl');
  classes.push('overflow-hidden');
  if (className) classes.push(className);

  return (
    <div
      {...rest}
      ref={ref}
      onMouseMove={handleMove}
      className={classes.join(' ')}
      style={style}
    >
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
