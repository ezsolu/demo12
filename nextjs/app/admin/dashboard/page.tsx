"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout, type ApiError, type User } from "@/lib/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((data) => {
        if (!active) {
          return;
        }
        if (data?.role !== 1) {
          router.replace("/login");
          return;
        }
        setUser(data);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        router.replace("/login");
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [router]);

  const handleLogout = async () => {
    setError("");
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message ?? "Đăng xuất thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500">
        Đang tải dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Admin Dashboard
            </p>
            <h1 className="text-lg font-semibold text-zinc-900">
              Xin chào {user?.name ?? user?.email ?? "Admin"}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900">
              Tổng quan hệ thống
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Khu vực này sẽ hiển thị các chỉ số quan trọng của hệ thống.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900">
              Quản lý nhanh
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Các thao tác quản trị sẽ được bổ sung tại đây.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
