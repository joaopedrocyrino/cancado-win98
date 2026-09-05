import type { ElementType, ReactNode } from 'react';
import { cx } from '../utils/cx';
import './primitives.css';

export interface TitleProps {
  children?: ReactNode;
  /** Heading level to render. Defaults to `h2`. */
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
}

/** The standard window heading. */
export function Title({ children, as: Tag = 'h2', className }: TitleProps) {
  return <Tag className={cx('w98-title', className)}>{children}</Tag>;
}

export interface TextProps {
  children?: ReactNode;
  /** `meta` for muted captions, `strong` for record headers. */
  variant?: 'default' | 'meta' | 'strong';
  as?: ElementType;
  className?: string;
}

/** Body text with the two emphasis variants the kit uses. */
export function Text({
  children,
  variant = 'default',
  as: Tag = 'span',
  className,
}: TextProps) {
  return (
    <Tag
      className={cx(
        variant !== 'default' && `w98-text--${variant}`,
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export interface BulletListProps {
  items: ReadonlyArray<ReactNode>;
  className?: string;
}

/** The standard bulleted list. */
export function BulletList({ items, className }: BulletListProps) {
  return (
    <ul className={cx('w98-list', className)}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export interface LinkProps {
  href: string;
  children?: ReactNode;
  external?: boolean;
  className?: string;
}

/** Inline hyperlink in the period blue/purple. */
export function Link({ href, children, external, className }: LinkProps) {
  return (
    <a
      href={href}
      className={cx('w98-link', className)}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : null)}
    >
      {children}
    </a>
  );
}
