import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import userEvent from "@testing-library/user-event";
import AdminVenuesListPage from "@/app/admin/venues/page";

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

jest.mock("datatables.net-dt", () => ({}));
jest.mock("datatables.net-dt/css/dataTables.dataTables.css", () => ({}));
jest.mock("datatables.net-react", () => {
  const DataTable = ({ children }: { children: ReactNode }) => (
    <table>{children}</table>
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (DataTable as any).use = jest.fn();
  return {
    __esModule: true,
    default: DataTable,
  };
});

jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
  getCurrentUser: jest.fn(() => Promise.reject(new Error("unauthorized"))),
  logout: jest.fn(),
}));

const mockedApi = jest.requireMock("@/lib/api") as {
  getCurrentUser: jest.Mock;
  logout: jest.Mock;
};
const mockGetCurrentUser = mockedApi.getCurrentUser;
const mockLogout = mockedApi.logout;

describe("AdminVenuesListPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows venues list for admin and handles logout", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({
      role: 1,
      name: "Admin",
      email: "admin@example.com",
    });
    mockLogout.mockResolvedValueOnce({});

    render(<AdminVenuesListPage />);

    expect(await screen.findByText("Danh sách venues")).toBeInTheDocument();

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

    render(<AdminVenuesListPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });
});
