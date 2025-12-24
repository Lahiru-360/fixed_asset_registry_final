import { useState, useEffect } from "react";
import ImageCarousel from "../components/ui/ImageCarousel";
import { PackageCheck } from "lucide-react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BackToHomeButton from "../components/ui/BackToHomeButton";
import { useAuth } from "../context/AuthContext";

// Firebase helpers
import { registerFirebase, getFirebaseToken } from "../firebaseAuth";

function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { user, loading } = useAuth();

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isFormValid, setIsFormValid] = useState(false);

  const departments = [
    "Finance",
    "IT",
    "Human Resources",
    "Operations",
    "Procurement",
    "Facilities",
    "Administration",
  ];

  // Validators
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone) => /^07\d{8}$/.test(phone);

  useEffect(() => {
    const valid =
      firstName.trim() &&
      lastName.trim() &&
      validateEmail(email) &&
      validatePhone(phone) &&
      password.length >= 8 &&
      confirmPassword === password &&
      department;

    setIsFormValid(valid);
  }, [
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    department,
  ]);

  useEffect(() => {
    if (!loading) {
      if (user?.role == "employee" || user?.role == "admin") {
        navigate("/redirect");
      }
    }
  }, [user, loading]);

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&#]/.test(password)) strength++;

    if (strength <= 2) return "Weak";
    if (strength === 3) return "Medium";
    return "Strong";
  };

  // --- Input Handlers with Validation ---
  const handleEmailChange = (e) => {
    const val = e.target.value;
    // Allows only valid email characters
    const sanitizedValue = val.replace(/[^a-zA-Z0-9@._-]/g, "");
    setEmail(sanitizedValue);
    setErrors((prev) => ({
      ...prev,
      email: validateEmail(sanitizedValue) ? "" : "Invalid email format",
    }));
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    // Allows only numbers and limits length to 10
    const sanitizedValue = val.replace(/[^0-9]/g, "");
    if (sanitizedValue.length <= 10) {
      setPhone(sanitizedValue);
      setErrors((prev) => ({
        ...prev,
        phone: validatePhone(sanitizedValue) ? "" : "Phone must be 10 digits",
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordMatch(val === confirmPassword);
    setPasswordStrength(getPasswordStrength(val));
    setErrors((prev) => ({
      ...prev,
      password: val.length >= 8 ? "" : "Password must be at least 8 characters",
    }));
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    const match = password === val;
    setPasswordMatch(match);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: match ? "" : "Passwords do not match",
    }));
  };

  // SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      // 1️⃣ Create user in Firebase Auth
      const firebaseUser = await registerFirebase(email, password);

      // 2️⃣ Get Firebase ID token
      const token = await firebaseUser.getIdToken();

      // 3️⃣ Send user profile to backend
      const payload = {
        firstName,
        lastName,
        phone,
        email,
        department,
      };

      const response = await axiosInstance.post("/api/auth/register", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/login"); // Or to dashboard if you prefer auto-login
    } catch (error) {
      let errorMsg = "Registration failed. Please try again.";

      // Handle Firebase Auth errors (most likely from registerFirebase)
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMsg = "This email is already registered.";
            break;
          case "auth/weak-password":
            errorMsg =
              "Password is too weak. Please choose a stronger password.";
            break;
          case "auth/invalid-email":
            errorMsg = "Please enter a valid email address.";
            break;
          default:
            errorMsg = error.message || errorMsg;
        }
      }
      // Handle backend API errors (from axios post)
      else if (error.response?.data) {
        errorMsg =
          error.response.data.message || error.response.data.error || errorMsg;
      }

      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-background text-foreground transition-colors duration-300 min-h-screen lg:h-screen  flex">
      {/* LEFT CAROUSEL */}
      <div className="hidden lg:block lg:w-1/2">
        <ImageCarousel />
      </div>

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center w-full lg:w-1/2 px-6 relative">
        <div className="w-full max-w-lg">
          {/* HEADER */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <PackageCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-xl font-semibold">Employee Registration</h1>
            <p className="opacity-70 text-sm mt-1">
              Join the Fixed Asset Management System
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* ROW 1 — First + Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm opacity-80">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(e.target.value.replace(/[^a-zA-Z\s-]/g, ""))
                  }
                  className="
                                        w-full px-4 py-2.5 mt-2 text-foreground placeholder-foreground/50
                                        bg-muted border border-muted rounded-lg
                                        focus:border-primary focus:ring-0 focus:outline-none
                                        transition-colors
                                    "
                />
              </div>

              <div>
                <label className="text-sm opacity-80">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) =>
                    setLastName(e.target.value.replace(/[^a-zA-Z\s-]/g, ""))
                  }
                  className="
                                        w-full px-4 py-2.5 mt-2 text-foreground placeholder-foreground/50
                                        bg-muted border border-muted rounded-lg
                                        focus:border-primary focus:ring-0 focus:outline-none
                                        transition-colors
                                    "
                />
              </div>
            </div>

            {/* ROW 2 — Email */}
            <div>
              <label className="text-sm opacity-80">Email Address</label>
              <input
                type="email"
                placeholder="example@company.com"
                value={email}
                onChange={handleEmailChange}
                className="
                                        w-full px-4 py-2.5 mt-2 text-foreground placeholder-foreground/50
                                        bg-muted border border-muted rounded-lg
                                        focus:border-primary focus:ring-0 focus:outline-none
                                        transition-colors
                                    "
              />
              <AnimatePresence mode="wait">
                {errors.email && (
                  <motion.div
                    key="email-error-wrapper"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.p
                      key="email-error"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.email}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ROW 3 — Phone + Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm opacity-80">Contact Number</label>
                <input
                  type="text"
                  placeholder="07XXXXXXXX"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="
                                        w-full px-4 py-2.5 mt-2 text-foreground placeholder-foreground/50
                                        bg-muted border border-muted rounded-lg
                                        focus:border-primary focus:ring-0 focus:outline-none
                                        transition-colors
                                    "
                />
                <AnimatePresence mode="wait">
                  {errors.phone && (
                    <motion.div
                      key="phone-error-wrapper"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.p
                        key="phone-error"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.phone}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="text-sm opacity-80">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="
                                        w-full px-4 py-2.5 mt-2 text-foreground placeholder-foreground/50
                                        bg-muted border border-muted rounded-lg
                                        focus:border-primary focus:ring-0 focus:outline-none
                                        transition-colors
                                    "
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ROW 4 — Password + Confirm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm opacity-80">Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={handlePasswordChange}
                  className="
                                        w-full px-4 py-2.5 mt-2 text-foreground placeholder-foreground/50
                                        bg-muted border border-muted rounded-lg
                                        focus:border-primary focus:ring-0 focus:outline-none
                                        transition-colors
                                    "
                />
                <AnimatePresence>
                  {(errors.password || password) && (
                    <motion.div
                      key="pw-wrapper"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative mt-1 mb-1"
                    >
                      {errors.password && (
                        <motion.p
                          key="pw-length-error"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className="text-red-500 text-sm"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                      {!errors.password && password && (
                        <motion.p
                          key="pw-strength"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className={`text-sm ${
                            passwordStrength === "Strong"
                              ? "text-green-600"
                              : passwordStrength === "Medium"
                              ? "text-yellow-600"
                              : "text-red-500"
                          }`}
                        >
                          Strength: {passwordStrength}
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="text-sm opacity-80">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Retype your password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className="
                                        w-full px-4 py-2.5 mt-2 text-foreground placeholder-foreground/50
                                        bg-muted border border-muted rounded-lg
                                        focus:border-primary focus:ring-0 focus:outline-none
                                        transition-colors
                                    "
                />
                <div className="relative mt-1 min-h-[20px]">
                  <AnimatePresence initial={false} mode="wait">
                    {!passwordMatch && (
                      <motion.p
                        key="pw-error"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute text-red-500 text-sm"
                      >
                        Passwords do not match.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-3 rounded-xl font-semibold shadow-md transition-all duration-200 
                ${
                  isFormValid && !isSubmitting
                    ? "bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.02]"
                    : "bg-muted text-foreground/40 cursor-not-allowed"
                }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* FOOTER */}
          <p className="mt-6 text-sm text-center opacity-80">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:opacity-70">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
