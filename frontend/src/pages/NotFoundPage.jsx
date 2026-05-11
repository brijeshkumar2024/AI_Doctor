import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="hero-panel card mx-auto max-w-2xl text-center">
    <p className="eyebrow">Navigation</p>
    <h1 className="section-title mt-3 text-4xl font-semibold tracking-[-0.03em]">Page not found</h1>
    <p className="mx-auto mt-3 max-w-md subtle-text">The page you requested does not exist.</p>
    <Link to="/" className="button-primary mt-4 inline-flex">
      Go Home
    </Link>
  </div>
);

export default NotFoundPage;
