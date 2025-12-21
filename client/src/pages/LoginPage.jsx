import { useState, useEffect } from "react";
import ImageCarousel from "../components/ui/ImageCarousel";
import { PackageCheck } from "lucide-react";
import { Link } from "react-router-dom";
import BackToHomeButton from "../components/ui/BackToHomeButton";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Firebase helpers
import { loginFirebase } from "../firebaseAuth";

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^a-zA-Z0-9@._-]/g, "");
    setEmail(sanitizedValue);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 🔥 NEW FIREBASE LOGIN PROCESS
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      // 🔥 1. Firebase login
      const firebaseUser = await loginFirebase(email, password);

      // 🔒 2. Check if email is verified
      if (!firebaseUser.emailVerified) {
        toast.error("Please verify your email before logging in.");
        return;
      }

      // 🪪 3. Get token to send to backend
      const token = await firebaseUser.getIdToken();

      // 🗄 4. Hit backend to fetch DB profile
      const response = await axiosInstance.post(
        "/api/auth/login",
        {}, // No need to send email/pass again
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data.user);
      navigate("/redirect");
    } catch (error) {
      let errorMsg = "Login failed. Please try again.";

      // Extract short code using regex from error.message or error.toString()
      const errorString = error.message || error.toString();
      // Example: "Firebase: Error (auth/wrong-password)." or similar
      const match = errorString.match(/auth\/([a-z-]+)/);

      if (match) {
        const shortCode = match[1]; // e.g., "wrong-password", "user-not-found", "invalid-credential"

        switch (shortCode) {
          case "user-not-found":
          case "invalid-credential": // Newer Firebase versions use this for wrong email/password
            errorMsg = "Invalid email or password.";
            break;
          case "too-many-requests":
            errorMsg = "Too many failed attempts. Please try again later.";
            break;
          case "invalid-email":
            errorMsg = "Please enter a valid email address.";
            break;
          default:
            errorMsg =
              "Login failed. Please check your credentials and try again.";
        }
      }
      // Fallback for backend errors (unlikely here, but safe to include)
      else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }

      console.error(
        "Login error (extracted code):",
        match ? match[1] : "unknown"
      );
      console.error("Full error:", error);

      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    const isValid = validateEmail(email) && password.length >= 8;
    setIsFormValid(isValid);
  }, [email, password]);

  useEffect(() => {
    if (!loading) {
      if (user?.role == "employee" || user?.role == "admin") {
        navigate("/redirect");
      }
    }
  }, [user, loading]);

  return (
    <div className="bg-background text-foreground transition-colors duration-300 h-screen flex">
      {/* LEFT SIDE IMAGE */}
      <div className="hidden lg:block lg:w-1/2">
        <ImageCarousel />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center w-full max-w-md px-6 mx-auto lg:w-1/2 relative">
        <div className="flex-1">
          {/* Logo + Headline */}
          <div className="text-center">
            <div className="flex justify-center mx-auto">
              <PackageCheck className="h-8 w-8 text-primary" />
            </div>
            <p className="mt-3 text-foreground opacity-80">
              Sign in to access your account
            </p>
          </div>

          {/* FORM */}
          <div className="mt-8">
            <form onSubmit={handleSubmit}>
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm text-foreground opacity-80"
                >
                  Email Address
                </label>

                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="example@example.com"
                  className="
                    w-full px-4 py-2.5 mt-2 text-foreground placeholder-foreground/50
                    bg-muted border border-muted rounded-lg
                    focus:border-primary focus:ring-0 focus:outline-none
                    transition-colors
                  "
                />
              </div>

              {/* PASSWORD */}
              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="text-sm text-foreground opacity-80"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgotpassword"
                    className="text-sm text-accent hover:opacity-70 transition"
                  >
                    Forgot password?
                  </Link>
                </div>

                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your Password"
                  className="
                    w-full px-4 py-2.5 mt-2 text-foreground placeholder-foreground/50
                    bg-muted border border-muted rounded-lg
                    focus:border-primary focus:ring-0 focus:outline-none
                    transition-colors
                  "
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`
                    w-full py-3 px-6 rounded-xl font-semibold shadow-md
                    transition-all duration-200 transform
                    ${
                      isFormValid
                        ? "bg-primary text-primary-foreground hover:scale-[1.02] hover:opacity-90"
                        : "bg-muted text-foreground/40 cursor-not-allowed"
                    }
                  `}
                >
                  Sign in
                </button>
              </div>
            </form>
            {/* SIGNUP LINK */}
            <p className="mt-6 text-sm text-center text-foreground/70">
              Don't have an account?{" "}
              <Link to="/register" className="text-accent hover:opacity-70">
                Sign up
              </Link>
            </p>{" "}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
