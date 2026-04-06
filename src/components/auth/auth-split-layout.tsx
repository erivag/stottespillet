import type { ReactNode } from "react";

type AuthSplitLayoutProps = {
  marketing: ReactNode;
  form: ReactNode;
};

export function AuthSplitLayout({ marketing, form }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-brand-pine lg:flex-row">
      <aside className="relative flex min-h-[40vh] shrink-0 flex-col justify-between overflow-hidden px-6 pb-6 pt-6 sm:min-h-[44vh] sm:px-10 sm:pb-8 sm:pt-8 lg:min-h-dvh lg:w-[60%] lg:justify-center lg:px-14 lg:py-12">
        {marketing}
      </aside>
      <main className="relative flex min-h-0 flex-1 flex-col rounded-t-3xl bg-brand-cream shadow-[0_-12px_48px_-16px_rgba(10,46,26,0.14)] lg:min-h-dvh lg:w-[40%] lg:rounded-none lg:shadow-[-16px_0_48px_-20px_rgba(10,46,26,0.12)]">
        <div className="flex min-h-[60vh] flex-1 flex-col justify-center px-5 py-10 sm:px-10 sm:py-12 lg:min-h-0 lg:px-12 lg:py-16">
          <div className="auth-animate-in auth-animate-delay-1 w-full max-w-md lg:max-w-none">
            {form}
          </div>
        </div>
      </main>
    </div>
  );
}
