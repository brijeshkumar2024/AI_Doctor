import Navbar from "./Navbar";

const Layout = ({ children }) => (
  <div className="min-h-screen text-slate-900">
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-[-6rem] top-[-7rem] h-72 w-72 rounded-full bg-[#d5bf95]/25 blur-3xl" />
      <div className="absolute right-[-5rem] top-12 h-80 w-80 rounded-full bg-primary-100/60 blur-3xl" />
      <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-white/40 blur-3xl" />
    </div>
    <Navbar />
    <main className="relative mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">{children}</main>
  </div>
);

export default Layout;
