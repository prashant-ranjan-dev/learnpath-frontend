export default function BrandLogo({ className = '' }) {
  return (
    <img
      src="/learnpath-logo.png"
      alt="LearnPath AI — Plan, Learn, Grow"
      className={`block h-auto ${className}`}
    />
  );
}
