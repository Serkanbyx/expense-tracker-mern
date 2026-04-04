import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  validateEmail,
  validatePassword,
  sanitizeFormData,
  extractErrorMessage,
} from '../utils/validation';

const inputBaseClass =
  'w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition';

const getInputClass = (hasError) =>
  hasError
    ? `${inputBaseClass} border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20`
    : `${inputBaseClass} border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`;

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1 text-xs text-red-600" role="alert">
      {message}
    </p>
  ) : null;

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value, true);
      default:
        return null;
    }
  }, []);

  const validateAllFields = useCallback(() => {
    const fieldErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password, true),
    };

    const activeErrors = Object.fromEntries(
      Object.entries(fieldErrors).filter(([, msg]) => msg !== null),
    );

    setErrors(activeErrors);
    setTouched({ email: true, password: true });

    return Object.keys(activeErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => {
          if (error) return { ...prev, [name]: error };
          const { [name]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [touched, validateField],
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name, value);
      setErrors((prev) => {
        if (error) return { ...prev, [name]: error };
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    },
    [validateField],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAllFields()) return;

    setIsSubmitting(true);
    const sanitized = sanitizeFormData(formData);

    try {
      await login(sanitized.email, sanitized.password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Login failed. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = Object.keys(errors).length === 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to manage your expenses
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              className={getInputClass(touched.email && errors.email)}
            />
            <FieldError message={touched.email && errors.email} />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              className={getInputClass(touched.password && errors.password)}
            />
            <FieldError message={touched.password && errors.password} />
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isSubmitting && (
              <svg
                className="animate-spin h-4 w-4 text-white"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
