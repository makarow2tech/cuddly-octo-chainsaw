import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import ThemeBridge from "@/components/site/ThemeBridge";

export default function SiteLayout({ children }) {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden">
      <ThemeBridge />
      <div className="relative z-10">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1360px] px-4 pb-16 sm:px-6 lg:px-8">{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}