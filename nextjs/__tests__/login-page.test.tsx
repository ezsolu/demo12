import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";

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
  login: jest.fn(),
}));

const mockedApi = jest.requireMock("@/lib/api") as {
  getCurrentUser: jest.Mock;
  login: jest.Mock;
};
const mockGetCurrentUser = mockedApi.getCurrentUser;
const mockLogin = mockedApi.login;

const waitForChecking = async () => {
  await waitFor(() => {
    expect(
      screen.queryByText("Đang kiểm tra phiên đăng nhập..."),
    ).not.toBeInTheDocument();
  });
};

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form when unauthenticated", async () => {
    mockGetCurrentUser.mockRejectedValueOnce(new Error("unauthorized"));

    render(<LoginPage />);
    await waitForChecking();

    expect(screen.getByText("Đăng nhập quản trị")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mật khẩu")).toBeInTheDocument();
  });

  it("shows validation error when fields are missing", async () => {
    mockGetCurrentUser.mockRejectedValueOnce(new Error("unauthorized"));

    render(<LoginPage />);
    await waitForChecking();

    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(
      screen.getByText("Vui lòng nhập email và mật khẩu."),
    ).toBeInTheDocument();
  });

  it("redirects to dashboard after successful login", async () => {
    mockGetCurrentUser.mockRejectedValueOnce(new Error("unauthorized"));
    mockLogin.mockResolvedValueOnce({});

    render(<LoginPage />);
    await waitForChecking();

    await userEvent.type(screen.getByLabelText("Email"), "admin@example.com");
    await userEvent.type(screen.getByLabelText("Mật khẩu"), "password");
    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("shows error message when login fails", async () => {
    mockGetCurrentUser.mockRejectedValueOnce(new Error("unauthorized"));
    mockLogin.mockRejectedValueOnce({
      message: "Tài khoản không có quyền admin.",
    });

    render(<LoginPage />);
    await waitForChecking();

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Mật khẩu"), "password");
    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(
      await screen.findByText("Tài khoản không có quyền admin."),
    ).toBeInTheDocument();
  });

  it("redirects immediately when already admin", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({ role: 1 });

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/admin/dashboard");
    });
  });
});
