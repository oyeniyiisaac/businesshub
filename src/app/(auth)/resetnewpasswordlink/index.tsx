'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { gql } from '@apollo/client';
import { ArrowLeft, Rotate90DegreesCcw } from 'google-material-icons/filled';
import { Visibility, VisibilityOff } from 'google-material-icons/outlined';
import { useMutation } from '@apollo/client/react';

export const dynamic = 'force-dynamic';

const RESET_FORGOT_PASSWORD_MUTATION = gql`
  mutation ResetForgotPassword($token: String!, $newPassword: String!) {
    resetForgotPassword(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;

interface ResetForgotPasswordData {
  resetForgotPassword: {
    success: boolean;
    message: string;
  };
}

interface ResetForgotPasswordVariables {
  token: string;
  newPassword: string;
}

// Inner Component containing the useSearchParams logic
function ResetFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  const [resetForgotPassword, { loading }] = useMutation<
    ResetForgotPasswordData,
    ResetForgotPasswordVariables
  >(RESET_FORGOT_PASSWORD_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!token) {
      setStatusMessage({
        type: 'error',
        text: 'Invalid or missing password reset token in URL.',
      });
      return;
    }

    if (newPassword.length < 8) {
      setStatusMessage({
        type: 'error',
        text: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({
        type: 'error',
        text: 'Passwords do not match.',
      });
      return;
    }

    try {
      const { data } = await resetForgotPassword({
        variables: {
          token,
          newPassword,
        },
      });

      if (data?.resetForgotPassword?.success) {
        setStatusMessage({
          type: 'success',
          text: data.resetForgotPassword.message,
        });
        setTimeout(() => {
          router.push('/signin');
        }, 2000);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Something went wrong.',
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-linear-to-br from-surface via-surface-container-low to-surface-container p-4"
      style={{ fontFamily: 'var(--font-inter), sans-serif' }}
    >
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xl p-8 text-center">
        {/* Top Logo Icon */}
        <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary mb-4 shadow-sm">
          <Rotate90DegreesCcw className="w-6 h-6" />
        </div>

        {/* Header Title */}
        <h1 className="text-2xl font-bold text-primary tracking-tight">
          BusinessHub NG
        </h1>
        <p className="text-xs text-on-surface-variant mt-1 mb-6 font-medium">
          Create a new secure password.
        </p>

        {/* Feedback Messages */}
        {statusMessage && (
          <div
            className={`mb-4 p-3 text-xs rounded-lg font-medium text-left ${
              statusMessage.type === 'error'
                ? 'bg-error-container text-on-error-container border border-error/30'
                : 'bg-primary-container text-on-primary-container border border-primary/20'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Reset Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* New Password Field */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 pr-10 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 text-gray-800 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showNewPassword ? (
                  <VisibilityOff className="w-4 h-4" />
                ) : (
                  <Visibility className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1.5">
              Must be at least 8 characters long.
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 pr-10 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 text-gray-800 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <VisibilityOff className="w-4 h-4" />
                ) : (
                  <Visibility className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-container text-on-primary font-medium text-xs rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        {/* Back to Sign In Link */}
        <div className="mt-6">
          <Link
            href="/signin"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-container font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}


export default function ResetForm() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface p-4 text-sm font-medium text-gray-600">
          Loading reset form...
        </div>
      }
    >
      <ResetFormContent />
    </Suspense>
  );
}