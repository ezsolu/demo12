"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import {
  apiFetch,
  getCurrentUser,
  logout,
  type ApiError,
  type User,
} from "@/lib/api";

DataTable.use(DT);

type VenueRow = {
  id: number;
  name: string;
  address: string;
  coordinates?: string | null;
  seat_count: number;
  people_count: number;
  price_level: number;
  venue_type_name?: string | null;
  city_name?: string | null;
};

const DEFAULT_FILTERS = {
  name: "",
  venueType: "",
  city: "",
  priceLevel: "",
};

export default function AdminVenuesListPage() {
  const router = useRouter();
  const tableRef = useRef<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

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

  const columns = useMemo(
    () => [
      { data: "id" },
      { data: "name" },
      { data: "address" },
      { data: "seat_count" },
      { data: "people_count" },
      { data: "price_level" },
      { data: "venue_type_name" },
      { data: "city_name" },
    ],
    [],
  );

  const reloadTable = () => {
    const table = tableRef.current?.dt?.();
    if (table) {
      table.ajax.reload();
    }
  };

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reloadTable();
  };

  const handleFilterReset = () => {
    setFilters(DEFAULT_FILTERS);
    setTimeout(() => reloadTable(), 0);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500">
        Đang tải danh sách venues...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Admin Venues
            </p>
            <h1 className="text-lg font-semibold text-zinc-900">
              Danh sách venues
            </h1>
            <p className="text-sm text-zinc-500">
              Xin chào {user?.name ?? user?.email ?? "Admin"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              Về dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {listError ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {listError}
          </div>
        ) : null}

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleFilterSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">
                  Tên venue
                </label>
                <input
                  value={filters.name}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  placeholder="Nhập tên venue"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">
                  Loại venue
                </label>
                <input
                  value={filters.venueType}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      venueType: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  placeholder="Nhập loại"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">
                  Thành phố
                </label>
                <input
                  value={filters.city}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      city: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  placeholder="Nhập thành phố"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">
                  Price level
                </label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={filters.priceLevel}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      priceLevel: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  placeholder="0-5"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Áp dụng
              </button>
              <button
                type="button"
                onClick={handleFilterReset}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Đặt lại
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <DataTable
            ref={tableRef}
            ajax={async (data, callback) => {
              setListError("");
              try {
                const params = new URLSearchParams();
                params.set("draw", String(data.draw ?? 0));
                params.set("start", String(data.start ?? 0));
                params.set("length", String(data.length ?? 50));

                if (data.order?.length) {
                  params.set("order[0][column]", String(data.order[0].column));
                  params.set("order[0][dir]", String(data.order[0].dir));
                }

                data.columns?.forEach(
                  (column: { data: string }, index: number) => {
                    params.set(`columns[${index}][data]`, column.data);
                  },
                );

                if (filters.name) {
                  params.set("name", filters.name);
                }
                if (filters.venueType) {
                  params.set("venue_type", filters.venueType);
                }
                if (filters.city) {
                  params.set("city", filters.city);
                }
                if (filters.priceLevel) {
                  params.set("price_level", filters.priceLevel);
                }

                const response = await apiFetch(`/api/v1/venues?${params}`);
                if (!response.ok) {
                  throw new Error("Bad response");
                }

                const payload = (await response.json()) as {
                  draw?: number;
                  recordsTotal?: number;
                  recordsFiltered?: number;
                  data?: VenueRow[];
                };

                callback({
                  draw: payload.draw ?? data.draw ?? 0,
                  recordsTotal: payload.recordsTotal ?? 0,
                  recordsFiltered: payload.recordsFiltered ?? 0,
                  data: payload.data ?? [],
                });
              } catch (err) {
                setListError("Không thể tải danh sách venues. Vui lòng thử lại.");
                callback({
                  draw: data.draw ?? 0,
                  recordsTotal: 0,
                  recordsFiltered: 0,
                  data: [],
                });
              }
            }}
            columns={columns}
            options={{
              serverSide: true,
              processing: true,
              searching: false,
              pageLength: 50,
              lengthChange: false,
              order: [[0, "desc"]],
              rowCallback: (row, rowData: VenueRow) => {
                row.onclick = () => router.push(`/admin/venues/${rowData.id}`);
                row.style.cursor = "pointer";
              },
            }}
            className="display w-full"
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Địa chỉ</th>
                <th>Số ghế</th>
                <th>Số người</th>
                <th>Price level</th>
                <th>Loại</th>
                <th>City</th>
              </tr>
            </thead>
          </DataTable>
        </div>
      </main>
    </div>
  );
}
