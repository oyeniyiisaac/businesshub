import { Store } from 'google-material-icons/filled'
import Link from 'next/link'
import React from 'react'

const ForgetPassword = () => {
    return (
        <div className='min-h-screen w-full flex items-center justify-center bg-[#f4f7f6] p-4'>
            <div className='w-full max-w-105 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center'>

                {/* Logo */}
                <div className="flex items-center gap-2 text-2xl font-bold text-[#006a40] tracking-tight mb-8">
                    <Store className='text-[#006a40]' />
                    <span>BusinessHub NG</span>
                </div>

                {/* Header */}
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center">
                    Forgot your password?
                </h1>
                <p className="mt-2 text-xs text-gray-600 text-center max-w-[280px] leading-relaxed mb-8">
                    Enter your work email address and well send you a link to reset your password.
                </p>

                {/* Form */}
                <form className="w-full space-y-5">
                    <div>
                        <label htmlFor='email' className="mb-1.5 block text-xs font-semibold text-gray-700">
                            Work Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <input
                                type="email"
                                id='email'
                                placeholder="admin@company.com"
                                className="pl-10 h-11 w-full rounded-md border border-gray-300 bg-white text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#00804b] focus:ring-1 focus:ring-[#00804b] transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full h-11 bg-[#007d4a] hover:bg-[#006b3f] text-white font-semibold text-sm rounded-md transition-colors shadow-sm cursor-pointer"
                    >
                        Send Reset Link
                    </button>
                </form>

                {/* Back to Login Link */}
                <div className='mt-6 text-center w-full'>
                    <Link
                        href='/login'
                        className='text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors inline-flex items-center gap-1.5'
                    >
                        <span>←</span> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ForgetPassword