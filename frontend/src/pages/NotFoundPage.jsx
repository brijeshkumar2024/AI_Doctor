import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="mx-auto max-w-xl card text-center">
    <h1 className="text-2xl font-semibold">Page not found</h1>
    <p className="mt-2 text-slate-600">The page you requested does not exist.</p>
    <Link to="/" className="button-primary mt-4 inline-flex">
      Go Home
    </Link>
  </div>
);

export default NotFoundPage;
