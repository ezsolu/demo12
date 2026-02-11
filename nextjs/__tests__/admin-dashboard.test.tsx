import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminDashboardPage from "@/app/admin/dashboard/page";

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

jest.mock("@/lib/api", () => ({
  getCurrentUser: jest.fn(() => Promise.reject(new Error("unauthorized"))),
  logout: jest.fn(),
}));

const mockedApi = jest.requireMock("@/lib/api") as {
  getCurrentUser: jest.Mock;
  logout: jest.Mock;
};
const mockGetCurrentUser = mockedApi.getCurrentUser;
const mockLogout = mockedApi.logout;

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows dashboard for admin and handles logout", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({
      role: 1,
      name: "Admin",
      email: "admin@example.com",
    });
    mockLogout.mockResolvedValueOnce({});

    render(<AdminDashboardPage />);

    expect(await screen.findByText("Xin chào Admin")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Đăng xuất" }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("redirects non-admin users to login", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({
      role: 0,
      name: "User",
      email: "user@example.com",
    });

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });
});
