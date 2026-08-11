"use client"
import { ArrowRight, Inventory2, Payments, Security, Store } from 'google-material-icons/filled'
import { Visibility, VisibilityOff } from 'google-material-icons/outlined'
import React, { useState } from 'react'
import Link from 'next/link'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <>
      <div className='min-h-screen w-full flex items-center justify-center bg-[#f4f7f6] p-4 md:p-10'>
        <div className='flex w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[600px]'>
          
          {/* Left panel - Info panel */}
          <div className='hidden md:flex md:w-[40%] bg-[#485f87] flex-col justify-between p-8 text-white'>
            <div className='flex flex-col gap-6'>
              <div className='flex items-center gap-2 text-2xl mb-8 mt-2'>
                <Store className='text-[#c49f59]' />
                <h1 className='font-bold tracking-tight'>BusinessHub NG</h1>
              </div>
              <h2 className='text-left text-2xl font-bold leading-tight'>Empowering Nigerian SMEs</h2>
              <p className='text-left text-sm opacity-90 leading-relaxed'>
                Join thousands of businesses managing their finances, inventory, and growth in one secure platform.
              </p>
              
              <div className='flex flex-col gap-5 w-full mt-6'>
                <div className='flex gap-4 items-start'>
                  <div className='bg-[#3a677c] p-3 rounded-full flex items-center justify-center shrink-0'>
                    <Inventory2 className='text-[#8cf8b6]' />
                  </div>
                  <div>
                    <h3 className='font-bold text-sm'>Real-time Inventory</h3>
                    <p className='text-xs opacity-85 mt-0.5 leading-relaxed'>
                      Track stock across multiple branches instantly. Never miss a sale due to stockouts.
                    </p>
                  </div>
                </div>
                <div className='flex gap-4 items-start'>
                  <div className='bg-[#3a677c] p-3 rounded-full flex items-center justify-center shrink-0'>
                    <Payments className='text-[#8cf8b6]' />
                  </div>
                  <div>
                    <h3 className='font-bold text-sm'>Secure Payments</h3>
                    <p className='text-xs opacity-85 mt-0.5 leading-relaxed'>
                      Accept multiple payment methods and reconcile transactions automatically.
                    </p>
                  </div>
                </div>
                <div className='flex gap-4 items-start'>
                  <div className='bg-[#3a677c] p-3 rounded-full flex items-center justify-center shrink-0'>
                    <Security className='text-[#8cf8b6]' />
                  </div>
                  <div>
                    <h3 className='font-bold text-sm'>Business Security</h3>
                    <p className='text-xs opacity-85 mt-0.5 leading-relaxed'>
                      Keep your sensitive customer and financial records safe with advanced encryption.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className='text-[10px] opacity-60'>
              © {new Date().getFullYear()} BusinessHub NG. All rights reserved.
            </div>
          </div>

          {/* Right panel - Form panel */}
          <div className='w-full md:w-[60%] bg-white text-black flex flex-col justify-center items-center p-6 md:p-10'>
            <div className="w-full max-w-[400px] rounded-xl border border-gray-200 bg-white px-6 py-8 shadow-md">

              {/* Header */}
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-[#252525]">
                  Create your account
                </h1>

                <p className="mt-1.5 text-xs text-gray-600">
                  Start managing your business smarter today.
                </p>
              </div>

              {/* Form */}
              <form className="space-y-4">

                {/* Business Name */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#222]">
                    Business Name <span className="text-red-600">*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Ade & Sons Trading"
                    className="h-10 w-full rounded-md border border-[#aeb8ae] bg-[#f7faf6] px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#00804b]"
                  />
                </div>

                {/* Owner Full Name */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#222]">
                    Owner Full Name <span className="text-red-600">*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Jane Doe"
                    className="h-10 w-full rounded-md border border-[#aeb8ae] bg-[#f7faf6] px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#00804b]"
                  />
                </div>

                {/* Work Email */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#222]">
                    Work Email <span className="text-red-600">*</span>
                  </label>

                  <input
                    type="email"
                    placeholder="jane@adeandsons.com"
                    className="h-10 w-full rounded-md border border-[#aeb8ae] bg-[#f7faf6] px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#00804b]"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#222]">
                    Phone Number <span className="text-red-600">*</span>
                  </label>

                  <div className="flex h-10">
                    <div className="flex w-12 items-center justify-center rounded-l-md border border-r-0 border-[#aeb8ae] bg-[#eef4ed] text-sm text-gray-500">
                      +234
                    </div>

                    <input
                      type="tel"
                      placeholder="801 234 5678"
                      className="min-w-0 flex-1 rounded-r-md border border-[#aeb8ae] bg-[#f7faf6] px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#00804b]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#222]">
                    Password <span className="text-red-600">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-10 w-full rounded-md border border-[#aeb8ae] bg-[#f7faf6] px-3 pr-10 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#00804b]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 focus:outline-none cursor-pointer"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <VisibilityOff size={16} />
                      ) : (
                        <Visibility size={16} />
                      )}
                    </button>
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters.
                  </p>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-gray-400 accent-[#007d4a]"
                  />

                  <p className="text-xs leading-normal text-gray-600">
                    I agree to the{" "}
                    <a href="#" className="font-medium text-[#007d4a] hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="font-medium text-[#007d4a] hover:underline">
                      Privacy Policy
                    </a>
                    .
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#007d4a] text-sm font-semibold text-white transition hover:bg-[#006b3f] cursor-pointer"
                >
                  Create My Business Account
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Login */}
              <p className="mt-6 text-center text-xs text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#007d4a] hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register