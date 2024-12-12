import { Metadata } from 'next';
import Link from 'next/link';
import AccessCodeForm from '@/components/AccessCodeForm';

export const metadata: Metadata = {
  title: 'Evaluace výuky - Než zazvoní',
  description: 'Systém pro hodnocení výuky a učitelů',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo.svg"
          alt="Než zazvoní"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Evaluace výuky
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Zadejte přístupový kód, který jste obdrželi od svého učitele
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AccessCodeForm />
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Pro administrátory a ředitele
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/admin"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Přihlásit se
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 