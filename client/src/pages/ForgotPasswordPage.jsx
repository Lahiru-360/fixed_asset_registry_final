import { useState } from "react";
import { sendPasswordReset } from "../firebaseAuth";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import BackToHomeButton from "../components/ui/BackToHomeButton";
import { Mail } from "lucide-react";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await sendPasswordReset(email);
      setSent(true);
      toast.success("Password reset link sent to your email.");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to send reset email");
    }
  };

  return (
    <div className="bg-background text-foreground h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* HEADER */}
        <div className="text-center mb-6">
          <Mail className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-xl font-semibold mt-2">Reset Your Password</h1>
          <p className="opacity-70 text-sm mt-1">
            Enter your email to receive a reset link
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm opacity-80">Email Address</label>
              <input
                type="email"
                placeholder="example@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full px-4 py-2.5 mt-2 
                  text-foreground placeholder-foreground/50
                  bg-muted border border-muted rounded-lg
                  focus:border-primary focus:ring-0 focus:outline-none
                  transition-colors
                "
              />
            </div>

            <button
              type="submit"
              disabled={!email}
              className={`
                w-full py-3 rounded-xl font-semibold shadow-md transition-all 
                ${
                  email
                    ? "bg-primary text-primary-foreground hover:scale-[1.02] hover:opacity-90"
                    : "bg-muted text-foreground/40 cursor-not-allowed"
                }
              `}
            >
              Send Reset Link
            </button>
          </form>
        ) : (
          <p className="text-center opacity-80 text-sm">
            A password reset link has been sent to{" "}
            <span className="font-semibold">{email}</span>.
            <br />
            Check your inbox and follow the instructions.
          </p>
        )}

        {/* Footer */}
        <p className="mt-6 text-sm text-center opacity-80">
          Remember your password?{" "}
          <Link to="/login" className="text-accent hover:opacity-70">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
