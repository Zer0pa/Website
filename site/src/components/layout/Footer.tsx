import Link from 'next/link';
import Wordmark from '@/components/layout/Wordmark';

const FOOTER_LINKS = [
  { href: '/proof', label: 'SYSTEM_STATUS' },
  { href: '/contact', label: 'PARTNERSHIPS' },
  { href: '/about', label: 'LEGAL_PROVISIONS' },
  { href: '/contact', label: 'LEGAL_INFORMATION' },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-grid">
        <div className="footer-brand">
          <Wordmark />
        </div>

        <p className="footer-copy">© 2026 ZER0PA. AUTHORITY LOGIC V1.0.4</p>

        <nav className="footer-links" aria-label="Footer">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
