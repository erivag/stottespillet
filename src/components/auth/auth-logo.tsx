import Link from "next/link";

export function AuthLogo() {
  return (
    <Link
      href="/"
      className="auth-animate-in font-heading text-xl font-semibold tracking-tight text-white sm:text-2xl"
    >
      Støttespillet
      <span className="text-brand-gold-bright">.</span>
    </Link>
  );
}
