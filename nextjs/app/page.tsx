export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <main className="w-full max-w-3xl rounded-2xl bg-white p-10 shadow-sm ring-1 ring-zinc-200">
        <p className="text-sm font-medium text-zinc-500">Frontend Home</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-900">
          Trang chủ hệ thống
        </h1>
        <p className="mt-3 text-base text-zinc-500">
          Đây là trang mặc định cho người dùng. Nếu bạn là admin, hãy đăng nhập
          để truy cập dashboard quản trị.
        </p>
        <div className="mt-6">
          <a
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
            href="/login"
          >
            Đăng nhập admin
          </a>
        </div>
      </main>
    </div>
  );
}
