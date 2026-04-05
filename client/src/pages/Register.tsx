import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  validateName,
  validateEmail,
  validatePassword,
  sanitizeFormData,
  extractErrorMessage,
} from '../utils/validation';
import { getInputClass, FieldError } from '../components/ui/FormField';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Register = () => {
  const [formData, setFormData] = useState<{ name: string; email: string; password: string }>({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateField = useCallback((field: string, value: string): string | null => {
    switch (field) {
      case 'name':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      default:
        return null;
    }
  }, []);

  const validateAllFields = useCallback(() => {
    const fieldErrors: Record<string, string | null> = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };

    const activeErrors = Object.fromEntries(
      Object.entries(fieldErrors).filter(([, msg]) => msg !== null),
    ) as Record<string, string>;

    setErrors(activeErrors);
    setTouched({ name: true, email: true, password: true });

    return Object.keys(activeErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
    (e: React.FocusEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAllFields()) return;

    setIsSubmitting(true);
    const sanitized = sanitizeFormData(formData);

    try {
      await register(sanitized.name, sanitized.email, sanitized.password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(
        extractErrorMessage(error, 'Registration failed. Please try again.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = Object.keys(errors).length === 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-block text-2xl font-bold text-indigo-600 transition hover:opacity-80 mb-2"
          >
            ExpenseTracker
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Start tracking your expenses today
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={50}
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="John Doe"
              className={getInputClass(touched.name && errors.name)}
            />
            <FieldError message={touched.name && errors.name} />
          </div>

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
              autoComplete="new-password"
              maxLength={128}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              className={getInputClass(touched.password && errors.password)}
            />
            <FieldError message={touched.password && errors.password} />
            {!errors.password && formData.password.length > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                {formData.password.length < 8
                  ? `${8 - formData.password.length} more characters needed`
                  : 'Password strength: OK'}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isSubmitting && <LoadingSpinner />}
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
