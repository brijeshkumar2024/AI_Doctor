import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FormInput from "../components/FormInput";
import { resetPassword } from "../services/authService";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");

    try {
      const token = searchParams.get("token");
      const response = await resetPassword({ token, password });
      setStatus(response.message);
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Could not reset password");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="card">
        <h1 className="text-2xl font-semibold">Reset Password</h1>
        <p className="mt-2 text-slate-600">Set a new password using the reset token from your link.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <FormInput
            label="New Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {status ? <p className="text-sm text-green-600">{status}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button type="submit" className="button-primary w-full">
            Reset Password
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

export default ResetPasswordPage;
