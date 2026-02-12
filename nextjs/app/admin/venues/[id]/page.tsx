"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  apiFetch,
  getCsrfCookie,
  getCurrentUser,
  logout,
  type ApiError,
  type User,
} from "@/lib/api";

type VenuePayload = {
  id: number;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  seat_count: number;
  people_count: number;
  rating: number | null;
  rating_count: number;
  price_level: number;
  city_id: number;
  venue_type_id: number;
};

type VenueForm = {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  seat_count: string;
  people_count: string;
  rating: string;
  rating_count: string;
  price_level: string;
  city_id: string;
  venue_type_id: string;
};

type Option = {
  id: number;
  name: string;
};

const toFormValue = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

const toOptionalFloat = (value: string) => {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const toOptionalInt = (value: string) => {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const toFormState = (venue: VenuePayload): VenueForm => ({
  name: toFormValue(venue.name),
  address: toFormValue(venue.address),
  latitude: toFormValue(venue.latitude),
  longitude: toFormValue(venue.longitude),
  seat_count: toFormValue(venue.seat_count),
  people_count: toFormValue(venue.people_count),
  rating: toFormValue(venue.rating),
  rating_count: toFormValue(venue.rating_count),
  price_level: toFormValue(venue.price_level),
  city_id: toFormValue(venue.city_id),
  venue_type_id: toFormValue(venue.venue_type_id),
});

const parseErrorMessage = async (response: Response, fallback: string) => {
  try {
    const data = (await response.json()) as { message?: string };
    if (data?.message) {
      return data.message;
    }
  } catch {
    // ignore JSON parse errors
  }
  return fallback;
};

export default function AdminVenueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [venueForm, setVenueForm] = useState<VenueForm | null>(null);
  const [cities, setCities] = useState<Option[]>([]);
  const [venueTypes, setVenueTypes] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const venueId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoadError("");
      try {
        const currentUser = await getCurrentUser();
        if (!active) {
          return;
        }
        if (currentUser?.role !== 1) {
          router.replace("/login");
          return;
        }
        setUser(currentUser);
      } catch {
        if (!active) {
          return;
        }
        router.replace("/login");
        return;
      }

      if (!venueId) {
        setLoadError("Không tìm thấy venue.");
        setIsLoading(false);
        return;
      }

      try {
        const [venueResponse, cityResponse, venueTypeResponse] =
          await Promise.all([
            apiFetch(`/api/v1/venues/${venueId}`),
            apiFetch("/api/v1/cities"),
            apiFetch("/api/v1/venue-types"),
          ]);

        if (!venueResponse.ok) {
          const message = await parseErrorMessage(
            venueResponse,
            "Không thể tải chi tiết venue.",
          );
          throw new Error(message);
        }
        if (!cityResponse.ok || !venueTypeResponse.ok) {
          throw new Error("Không thể tải dữ liệu danh mục.");
        }

        const venuePayload = (await venueResponse.json()) as {
          data: VenuePayload;
        };
        const cityPayload = (await cityResponse.json()) as {
          data: Option[];
        };
        const venueTypePayload = (await venueTypeResponse.json()) as {
          data: Option[];
        };

        if (!active) {
          return;
        }

        setVenueForm(toFormState(venuePayload.data));
        setCities(cityPayload.data ?? []);
        setVenueTypes(venueTypePayload.data ?? []);
      } catch (err) {
        if (!active) {
          return;
        }
        setLoadError(
          err instanceof Error
            ? err.message
            : "Không thể tải chi tiết venue.",
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [router, venueId]);

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

  const handleFieldChange =
    (field: keyof VenueForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setVenueForm((prev) =>
        prev
          ? {
              ...prev,
              [field]: event.target.value,
            }
          : prev,
      );
    };

  const handleEdit = () => {
    setSaveError("");
    setSaveSuccess("");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!venueForm || !venueId) {
      return;
    }

    setSaveError("");
    setSaveSuccess("");
    setIsSaving(true);

    try {
      await getCsrfCookie();

      const payload = {
        name: venueForm.name.trim(),
        address: venueForm.address.trim(),
        latitude: toOptionalFloat(venueForm.latitude),
        longitude: toOptionalFloat(venueForm.longitude),
        seat_count: toOptionalInt(venueForm.seat_count),
        people_count: toOptionalInt(venueForm.people_count),
        rating: toOptionalFloat(venueForm.rating),
        rating_count: toOptionalInt(venueForm.rating_count),
        price_level: toOptionalInt(venueForm.price_level),
        city_id: toOptionalInt(venueForm.city_id),
        venue_type_id: toOptionalInt(venueForm.venue_type_id),
      };

      const response = await apiFetch(`/api/v1/venues/${venueId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const fallback =
          response.status === 422
            ? "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại."
            : "Không thể lưu venue. Vui lòng thử lại.";
        const message = await parseErrorMessage(response, fallback);
        throw new Error(message);
      }

      const updated = (await response.json()) as { data: VenuePayload };

      setVenueForm(toFormState(updated.data));
      setIsEditing(false);
      setSaveSuccess("Lưu venue thành công.");
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Không thể lưu venue.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500">
        Đang tải chi tiết venue...
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
              Venue #{venueId}
            </h1>
            <p className="text-sm text-zinc-500">
              Xin chào {user?.name ?? user?.email ?? "Admin"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/venues"
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              Quay lại danh sách
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
        {loadError ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        ) : null}

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Chi tiết venue
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Tất cả thông tin venue hiển thị ở chế độ chỉ đọc.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={!venueForm}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Chỉnh sửa
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Đang lưu..." : "Lưu"}
                </button>
              )}
            </div>
          </div>

          {saveError ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </div>
          ) : null}
          {saveSuccess ? (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {saveSuccess}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="venue-name"
                className="text-sm font-medium text-zinc-700"
              >
                Tên venue
              </label>
              <input
                id="venue-name"
                value={venueForm?.name ?? ""}
                onChange={handleFieldChange("name")}
                disabled={!isEditing}
                required
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-100"
                placeholder="Nhập tên venue"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="venue-address"
                className="text-sm font-medium text-zinc-700"
              >
                Địa chỉ
              </label>
              <input
                id="venue-address"
                value={venueForm?.address ?? ""}
                onChange={handleFieldChange("address")}
                disabled={!isEditing}
                required
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-100"
                placeholder="Nhập địa chỉ"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="venue-latitude"
                className="text-sm font-medium text-zinc-700"
              >
                Latitude
              </label>
              <input
                id="venue-latitude"
                type="number"
                step="0.000001"
                value={venueForm?.latitude ?? ""}
                onChange={handleFieldChange("latitude")}
                disabled={!isEditing}
                required
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-100"
                placeholder="-33.865143"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="venue-longitude"
                className="text-sm font-medium text-zinc-700"
              >
                Longitude
              </label>
              <input
                id="venue-longitude"
                type="number"
                step="0.000001"
                value={venueForm?.longitude ?? ""}
                onChange={handleFieldChange("longitude")}
                disabled={!isEditing}
                required
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-100"
                placeholder="151.2099"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="venue-seat-count"
                className="text-sm font-medium text-zinc-700"
              >
                Số ghế
              </label>
              <input
                id="venue-seat-count"
                type="number"
                min={0}
                value={venueForm?.seat_count ?? ""}
                onChange={handleFieldChange("seat_count")}
                disabled={!isEditing}
                required
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-100"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="venue-people-count"
                className="text-sm font-medium text-zinc-700"
              >
                Số người
              </label>
              <input
                id="venue-people-count"
                type="number"
                min={0}
                value={venueForm?.people_count ?? ""}
                onChange={handleFieldChange("people_count")}
                disabled={!isEditing}
                required
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-100"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="venue-rating"
                className="text-sm font-medium text-zinc-700"
              >
                Rating
              </label>
              <input
                id="venue-rating"
                type="number"
                min={0}
                max={5}
                step="0.1"
                value={venueForm?.rating ?? ""}
                onChange={handleFieldChange("rating")}
                disabled={!isEditing}
                required
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-100"
                placeholder="4.5"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="venue-rating-count"
                className="text-sm font-medium text-zinc-700"
              >
                Rating count
              </label>
              <input
                id="venue-rating-count"
                type="number"
                min={0}
                value={venueForm?.rating_count ?? ""}
                onChange={handleFieldChange("rating_count")}
                disabled={!isEditing}
                required
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-100"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="venue-price-level"
                className="text-sm font-medium text-zinc-700"
              >
                Price level
              </label>
              <input
                id="venue-price-level"
                type="number"
                min={1}
                max={5}
                value={venueForm?.price_level ?? ""}
                onChange={handleFieldChange("price_level")}
                disabled={!isEditing}
                required
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-100"
                placeholder="1-5"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="venue-city-id"
                className="text-sm font-medium text-zinc-700"
              >
                Thành phố
              </label>
              <select
                id="venue-city-id"
                value={venueForm?.city_id ?? ""}
                onChange={handleFieldChange("city_id")}
                disabled={!isEditing}
                required
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-100"
              >
                <option value="">Chọn thành phố</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="venue-type-id"
                className="text-sm font-medium text-zinc-700"
              >
                Loại venue
              </label>
              <select
                id="venue-type-id"
                value={venueForm?.venue_type_id ?? ""}
                onChange={handleFieldChange("venue_type_id")}
                disabled={!isEditing}
                required
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-100"
              >
                <option value="">Chọn loại venue</option>
                {venueTypes.map((venueType) => (
                  <option key={venueType.id} value={venueType.id}>
                    {venueType.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
