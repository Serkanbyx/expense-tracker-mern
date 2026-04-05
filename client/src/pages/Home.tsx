import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  ChartBarIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  TagIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { HeroIcon } from '@/types';

/* ── Types ───────────────────────────────────────────── */

interface Feature {
  icon: HeroIcon;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

interface Step {
  step: string;
  title: string;
  description: string;
}

/* ── Constants ───────────────────────────────────────── */

const FEATURES: Feature[] = [
  {
    icon: ChartBarIcon,
    title: 'Visual Analytics',
    description:
      'Interactive charts and graphs to visualize your spending patterns with monthly and category breakdowns.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure & Private',
    description:
      'Your financial data is protected with JWT authentication, encryption, and industry-standard security practices.',
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Fully Responsive',
    description:
      'Access your finances from any device. Optimized for desktop, tablet, and mobile experiences.',
  },
  {
    icon: BanknotesIcon,
    title: 'Income & Expenses',
    description:
      'Track both income and expenses in one place. See your net balance at a glance with smart summaries.',
  },
  {
    icon: ArrowTrendingUpIcon,
    title: 'Monthly Trends',
    description:
      'Understand your financial habits with monthly trend analysis and spending comparisons over time.',
  },
  {
    icon: TagIcon,
    title: 'Category Tracking',
    description:
      'Organize transactions by category to identify where your money goes and optimize your budget.',
  },
];

const STATS: Stat[] = [
  { value: '100%', label: 'Free to Use' },
  { value: '256-bit', label: 'Encryption' },
  { value: '24/7', label: 'Access' },
  { value: 'Real-time', label: 'Sync' },
];

const HOW_IT_WORKS_STEPS: Step[] = [
  {
    step: '01',
    title: 'Create Your Account',
    description: 'Sign up in seconds with just your name, email, and a password.',
  },
  {
    step: '02',
    title: 'Add Transactions',
    description: 'Log your income and expenses with categories, dates, and notes.',
  },
  {
    step: '03',
    title: 'Gain Insights',
    description: 'View visual analytics and understand your spending patterns instantly.',
  },
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  const ctaPath = isAuthenticated ? '/dashboard' : '/register';
  const ctaText = isAuthenticated ? 'Go to Dashboard' : 'Get Started Free';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-indigo-200 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-purple-200 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600" />
              </span>
              Free &amp; Open Source
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Take Control of Your{' '}
              <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Finances
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
              Track expenses, monitor income, and visualize your spending
              patterns — all in one simple, beautiful dashboard. Start your
              journey to financial clarity today.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to={ctaPath}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                {ctaText}
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                Setup in 30 seconds
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-extrabold text-indigo-600 sm:text-4xl">
                {value}
              </p>
              <p className="mt-1 text-sm font-medium text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything You Need to{' '}
              <span className="text-indigo-600">Manage Money</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful features designed to give you full control and clear
              insights into your financial life.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-linear-to-b from-gray-50 to-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Get Started in{' '}
              <span className="text-indigo-600">3 Simple Steps</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              From sign-up to financial insights in under a minute.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map(({ step, title, description }) => (
              <div key={step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/30">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gray-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-indigo-600">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Master Your Finances?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
            Join now and start tracking your expenses with powerful analytics.
            It&apos;s completely free.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to={ctaPath}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-600 shadow-lg transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 sm:w-auto"
            >
              {ctaText}
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
