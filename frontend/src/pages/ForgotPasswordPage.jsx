import { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput";
import { forgotPassword } from "../services/authService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");

    try {
      const response = await forgotPassword(email);
      setStatus(response.message);
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Could not generate reset link");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="card">
        <h1 className="text-2xl font-semibold">Forgot Password</h1>
        <p className="mt-2 text-slate-600">Enter your email to generate a password reset link.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {status ? <p className="text-sm text-green-600">{status}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button type="submit" className="button-primary w-full">
            Send Reset Link
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          <Link to="/login" className="font-medium text-primary-700">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

