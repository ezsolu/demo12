import { render, screen } from "@testing-library/react";
import AdminVenueDetailPage from "@/app/admin/venues/[id]/page";

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
  useParams: () => ({ id: "12" }),
}));

jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
  getCurrentUser: jest.fn(() => Promise.reject(new Error("unauthorized"))),
  getCsrfCookie: jest.fn(),
  logout: jest.fn(),
}));

const mockedApi = jest.requireMock("@/lib/api") as {
  apiFetch: jest.Mock;
  getCurrentUser: jest.Mock;
};

describe("AdminVenueDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads venue detail for admin", async () => {
    mockedApi.getCurrentUser.mockResolvedValueOnce({
      role: 1,
      name: "Admin",
      email: "admin@example.com",
    });

    mockedApi.apiFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 12,
            name: "Venue A",
            address: "123 Main Street",
            latitude: -33.865143,
            longitude: 151.2099,
            seat_count: 120,
            people_count: 80,
            rating: 4.5,
            rating_count: 10,
            price_level: 2,
            city_id: 1,
            venue_type_id: 2,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ id: 1, name: "Sydney" }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ id: 2, name: "Hotel" }],
        }),
      });

    render(<AdminVenueDetailPage />);

    expect(await screen.findByText("Chi tiết venue")).toBeInTheDocument();
    const nameInput = screen.getByLabelText("Tên venue") as HTMLInputElement;
    expect(nameInput).toBeDisabled();
    expect(nameInput.value).toBe("Venue A");
  });
});
