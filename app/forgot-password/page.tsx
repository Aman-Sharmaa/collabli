import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-100 px-4">
      <div className="max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-neutral-900">Forgot password</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Password reset is not wired yet. Contact support or your admin for help.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-yellow-600 hover:text-yellow-700">
          ← Back to login
        </Link>
      </div>
    </main>
  );
}
