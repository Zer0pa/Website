type WordmarkProps = {
  className?: string;
};

export default function Wordmark({ className = '' }: WordmarkProps) {
  const classes = ['wordmark', className].filter(Boolean).join(' ');

  return (
    <span className={classes} aria-label="ZER0PA">
      <span className="wordmark-muted">ZER</span>
      <span className="wordmark-zero">0</span>
      <span className="wordmark-muted">PA</span>
    </span>
  );
}
