import { BanknotesIcon } from '@heroicons/react/24/outline';

const Footer = () => (
  <footer className="border-t border-gray-100 bg-gray-50">
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <BanknotesIcon className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">
            Expense<span className="text-indigo-600">Tracker</span>
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Created by{' '}
          <a
            href="https://serkanbayraktar.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 transition hover:text-indigo-500"
          >
            Serkanby
          </a>
          {' | '}
          <a
            href="https://github.com/Serkanbyx"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 transition hover:text-indigo-500"
          >
            Github
          </a>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
