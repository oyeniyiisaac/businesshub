"use client";
import {
  ArrowRight,
  Inventory2,
  Payments,
  Security,
  Store,
} from "google-material-icons/filled";
import { Visibility, VisibilityOff } from "google-material-icons/outlined";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";

const Login = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");

  interface LoginFormValues {
    workEmail: string;
    password: string;
    rememberMe: boolean;
  }

  const loginSchema = Yup.object().shape({
    workEmail: Yup.string()
      .email("Invalid email address")
      .required("Work email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    rememberMe: Yup.boolean(),
  });

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      workEmail: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");
      try {
        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              mutation SignInUser(
              $workEmail: String!
              $password: String!
              ) {
                signInUser(
                workEmail: $workEmail
                password: $password
                ) {
                  token
                  user {
                    id
                    businessName
                    workEmail
                    phoneNumber
                  }
                }
              }
            `,
            variables: {
              workEmail: values.workEmail,
              password: values.password,
            },
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Unable to sign in");
        }

        if (result?.errors?.length) {
          throw new Error(result.errors[0].message || "Unable to sign in");
        }

        const authPayload = result?.data?.signInUser;
        if (!authPayload?.token) {
          throw new Error("Invalid authentication response");
        }

        localStorage.setItem("authToken", authPayload.token);

        router.push("/");
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Unable to sign in");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f7f6] p-4 md:p-10">
        <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-150">
          {/* Left panel - Info panel */}
          <div className="hidden md:flex md:w-[40%] bg-[#485f87] flex-col justify-between p-8 text-white">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 text-2xl mb-8 mt-2">
                <Store className="text-[#c49f59]" />
                <h1 className="font-bold tracking-tight">BusinessHub NG</h1>
              </div>
              <h2 className="text-left text-2xl font-bold leading-tight">
                Empowering Nigerian SMEs
              </h2>
              <p className="text-left text-sm opacity-90 leading-relaxed">
                Join thousands of businesses managing their finances, inventory,
                and growth in one secure platform.
              </p>

              <div className="flex flex-col gap-5 w-full mt-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-[#3a677c] p-3 rounded-full flex items-center justify-center shrink-0">
                    <Inventory2 className="text-[#8cf8b6]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Real-time Inventory</h3>
                    <p className="text-xs opacity-85 mt-0.5 leading-relaxed">
                      Track stock across multiple branches instantly. Never miss
                      a sale due to stockouts.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="bg-[#3a677c] p-3 rounded-full flex items-center justify-center shrink-0">
                    <Payments className="text-[#8cf8b6]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Secure Payments</h3>
                    <p className="text-xs opacity-85 mt-0.5 leading-relaxed">
                      Accept multiple payment methods and reconcile transactions
                      automatically.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="bg-[#3a677c] p-3 rounded-full flex items-center justify-center shrink-0">
                    <Security className="text-[#8cf8b6]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Business Security</h3>
                    <p className="text-xs opacity-85 mt-0.5 leading-relaxed">
                      Keep your sensitive customer and financial records safe
                      with advanced encryption.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[10px] opacity-60">
              © {new Date().getFullYear()} BusinessHub NG. All rights reserved.
            </div>
          </div>

          {/* Right panel - Form panel */}
          <div className="w-full md:w-[60%] bg-white text-black flex flex-col justify-center items-center p-6 md:p-10">
            <div className="w-full max-w-100 rounded-xl border border-gray-200 bg-white px-6 py-8 shadow-md">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-[#252525]">
                  Sign in to your account
                </h1>

                <p className="mt-1.5 text-xs text-gray-600">
                  Welcome back! Please enter your details below.
                </p>
              </div>

              {/* Form */}
              <form className="space-y-4" onSubmit={formik.handleSubmit}>
                {/* Work Email */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#222]">
                    Work Email <span className="text-red-600">*</span>
                  </label>

                  <input
                    type="email"
                    name="workEmail"
                    placeholder="jane@adeandsons.com"
                    className="h-10 w-full rounded-md border border-[#aeb8ae] bg-[#f7faf6] px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#00804b]"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.workEmail}
                  />
                  {formik.touched.workEmail && formik.errors.workEmail ? (
                    <small className="text-red-600">{formik.errors.workEmail}</small>
                  ) : null}
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-[#222]">
                      Password <span className="text-red-600">*</span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      className="h-10 w-full rounded-md border border-[#aeb8ae] bg-[#f7faf6] px-3 pr-10 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#00804b]"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.password}
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
                  {formik.touched.password && formik.errors.password ? (
                    <small className="text-red-600">{formik.errors.password}</small>
                  ) : null}
                </div>

                {/* Remember Me and Forgot Password */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      className="h-4 w-4 rounded border-gray-400 accent-[#007d4a]"
                      onChange={formik.handleChange}
                      checked={formik.values.rememberMe}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link
                    href={"/login/forgetpassword"}
                    className="font-medium text-[#007d4a] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {submitError ? (
                  <small className="block text-red-600">{submitError}</small>
                ) : null}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#007d4a] text-sm font-semibold text-white transition hover:bg-[#006b3f] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#007d4a]"
                >
                  {formik.isSubmitting ? "Signing In..." : "Sign In"}
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Sign Up Link */}
              <p className="mt-6 text-center text-xs text-gray-600">
                Dont have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-[#007d4a] hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
