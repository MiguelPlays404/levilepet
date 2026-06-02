import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppFloat } from "./WhatsAppFloat";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell min-h-screen">
      <div className="fluid-orb fluid-orb--yellow left-[-8rem] top-[-8rem] h-64 w-64" />
      <div className="fluid-orb fluid-orb--white right-[-6rem] top-[14rem] h-56 w-56" />
      <div className="fluid-orb fluid-orb--yellow bottom-[-8rem] right-[22%] h-72 w-72 opacity-40" />
      <div className="soft-grid absolute inset-0 opacity-60" />
      <Navbar />
      <main className="relative z-10 pt-16 lg:pt-[72px]">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
