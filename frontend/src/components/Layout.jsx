import Navbar from "./Navbar";

const Layout = ({ children }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <Navbar />
    <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
  </div>
);

export default Layout;

