import Link from 'next/link';
import Wordmark from '@/components/layout/Wordmark';

type HeaderVariant = 'landing' | 'product';

const HEADER_CONFIG: Record<
  HeaderVariant,
  {
    className: string;
    nav: Array<{ href: string; label: string; active?: boolean }>;
    cta?: { href: string; label: string };
  }
> = {
  landing: {
    className: 'site-header--landing',
    nav: [
      { href: '/imc', label: 'ZERO' },
      { href: '/work', label: 'WORK' },
      { href: '/proof', label: 'PROOF' },
      { href: '/about', label: 'ABOUT' },
    ],
  },
  product: {
    className: 'site-header--product',
    nav: [
      { href: '/', label: 'INDEX' },
      { href: '/work', label: 'ARCHIVE', active: true },
      { href: '/proof', label: 'DOSSIER' },
      { href: '/contact', label: 'TERMINAL' },
    ],
    cta: { href: '/contact', label: 'INITIALIZE_SYSTEM' },
  },
};

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 3.5 5.5 6v5.7c0 4.1 2.4 7.6 6.5 9.8 4.1-2.2 6.5-5.7 6.5-9.8V6L12 3.5Z" />
      <path d="M12 7.25v9.5M8.75 12h6.5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3.5" y="6.5" width="17" height="11" rx="1.5" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
}

function StatusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <rect x="1.5" y="1.5" width="13" height="13" />
      <path d="M5 5h6v6H5Z" />
    </svg>
  );
}

export default function Header({ variant = 'landing' }: { variant?: HeaderVariant }) {
  const config = HEADER_CONFIG[variant];

  return (
    <header className={`site-header ${config.className}`} data-spec="home.header">
      <div className="page-shell site-header-inner">
        <Link
          href="/"
          aria-label="Return to homepage"
          className={`site-brand site-brand--${variant}`}
          data-spec="home.header.logo"
        >
          {variant === 'product' ? (
            <span className="site-brand-product">ZEROPA.AI</span>
          ) : (
            <Wordmark />
          )}
        </Link>

        <nav className={`site-nav site-nav--${variant}`} aria-label="Primary" data-spec="home.header.nav">
          {config.nav.map((item) => (
            <Link key={item.label} href={item.href} className={item.active ? 'is-active' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={`site-header-actions site-header-actions--${variant}`}>
          {variant === 'product' ? (
            <>
              <span className="status-icon-wrap status-icon-wrap--product" aria-hidden="true">
                <ShieldIcon />
              </span>
              <span className="status-icon-wrap status-icon-wrap--product" aria-hidden="true">
                <MailIcon />
              </span>
              {config.cta ? (
                <Link href={config.cta.href} className="secondary-button secondary-button--header">
                  {config.cta.label}
                </Link>
              ) : null}
            </>
          ) : (
            <span className="status-icon-wrap" data-spec="home.header.status-icon" aria-hidden="true">
              <StatusIcon />
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
