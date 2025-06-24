import { AuthForm } from "../../../components/auth/AuthForm";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <AuthForm type="sign-in" />
      </div>
    </div>
  );
}
