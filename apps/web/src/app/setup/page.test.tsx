import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SetupPage from "./page";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("SetupPage", () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();
  const mockRpc = vi.fn();
  const mockGetUser = vi.fn();
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    } as any);
    mockGetUser.mockResolvedValue({
      data: { user: { user_metadata: { full_name: "Test User" } } },
    });
    mockSignOut.mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue({
      rpc: mockRpc,
      auth: {
        getUser: mockGetUser,
        signOut: mockSignOut,
      },
    } as any);
  });

  describe("Initial Render", () => {
    it("displays welcome message and both option cards", async () => {
      render(<SetupPage />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome/)).toBeInTheDocument();
      });
      expect(screen.getByText("Start a Home")).toBeInTheDocument();
      expect(screen.getByText("Join a Home")).toBeInTheDocument();
    });

    it("does not show any form initially", () => {
      render(<SetupPage />);

      expect(
        screen.queryByPlaceholderText(/The Smith's Home/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText("------")).not.toBeInTheDocument();
    });

    it("displays user first name in welcome message", async () => {
      render(<SetupPage />);

      await waitFor(() => {
        expect(screen.getByText("Welcome, Test.")).toBeInTheDocument();
      });
    });
  });

  describe("Create Household Flow", () => {
    it("shows create form when clicking Start a Home", async () => {
      render(<SetupPage />);

      fireEvent.click(screen.getByText("Start a Home"));

      expect(
        screen.getByPlaceholderText(/The Smith's Home/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Create Home/i })
      ).toBeInTheDocument();
    });

    it("returns to initial state when clicking back", () => {
      render(<SetupPage />);

      fireEvent.click(screen.getByText("Start a Home"));
      fireEvent.click(screen.getByText("Back to options"));

      expect(screen.getByText("Start a Home")).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText(/The Smith's Home/i)
      ).not.toBeInTheDocument();
    });

    it("submits create household and redirects on success", async () => {
      mockRpc.mockResolvedValue({ data: "household-uuid", error: null });

      render(<SetupPage />);

      fireEvent.click(screen.getByText("Start a Home"));
      fireEvent.change(screen.getByPlaceholderText(/The Smith's Home/i), {
        target: { value: "Test Family" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Create Home/i }));

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith("create_household", {
          p_name: "Test Family",
        });
        expect(mockRefresh).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });

    it("displays error message on RPC error", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      render(<SetupPage />);

      fireEvent.click(screen.getByText("Start a Home"));
      fireEvent.change(screen.getByPlaceholderText(/The Smith's Home/i), {
        target: { value: "Test Family" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Create Home/i }));

      await waitFor(() => {
        expect(screen.getByText("Database error")).toBeInTheDocument();
      });
    });

    it("displays generic error when data is null", async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      render(<SetupPage />);

      fireEvent.click(screen.getByText("Start a Home"));
      fireEvent.change(screen.getByPlaceholderText(/The Smith's Home/i), {
        target: { value: "Test Family" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Create Home/i }));

      await waitFor(() => {
        expect(
          screen.getByText("Failed to create household. Please try again.")
        ).toBeInTheDocument();
      });
    });

    it("shows loading state while creating", async () => {
      let resolveRpc: (value: any) => void;
      mockRpc.mockReturnValue(
        new Promise((resolve) => {
          resolveRpc = resolve;
        })
      );

      render(<SetupPage />);

      fireEvent.click(screen.getByText("Start a Home"));
      fireEvent.change(screen.getByPlaceholderText(/The Smith's Home/i), {
        target: { value: "Test Family" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Create Home/i }));

      expect(screen.getByText("Creating...")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Creating/i })
      ).toBeDisabled();

      resolveRpc!({ data: "household-uuid", error: null });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });

  describe("Join Household Flow", () => {
    it("shows join form when clicking Join a Home", () => {
      render(<SetupPage />);

      fireEvent.click(screen.getByText("Join a Home"));

      expect(screen.getByPlaceholderText("------")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Join Home/i })
      ).toBeInTheDocument();
    });

    it("returns to initial state when clicking back", () => {
      render(<SetupPage />);

      fireEvent.click(screen.getByText("Join a Home"));
      fireEvent.click(screen.getByText("Back"));

      expect(screen.getByText("Join a Home")).toBeInTheDocument();
      expect(screen.queryByPlaceholderText("------")).not.toBeInTheDocument();
    });

    it("submits join household with lowercased code and redirects on success", async () => {
      mockRpc.mockResolvedValue({ data: "household-uuid", error: null });

      render(<SetupPage />);

      fireEvent.click(screen.getByText("Join a Home"));
      fireEvent.change(screen.getByPlaceholderText("------"), {
        target: { value: "ABC123" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Join Home/i }));

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith("join_household", {
          p_join_code: "abc123",
        });
        expect(mockRefresh).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });

    it("displays error message on invalid join code", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "Invalid join code" },
      });

      render(<SetupPage />);

      fireEvent.click(screen.getByText("Join a Home"));
      fireEvent.change(screen.getByPlaceholderText("------"), {
        target: { value: "BADCOD" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Join Home/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid join code")).toBeInTheDocument();
      });
    });

    it("displays generic error when data is null", async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      render(<SetupPage />);

      fireEvent.click(screen.getByText("Join a Home"));
      fireEvent.change(screen.getByPlaceholderText("------"), {
        target: { value: "ABCDEF" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Join Home/i }));

      await waitFor(() => {
        expect(
          screen.getByText("Failed to join household. Please try again.")
        ).toBeInTheDocument();
      });
    });

    it("shows loading state while joining", async () => {
      let resolveRpc: (value: any) => void;
      mockRpc.mockReturnValue(
        new Promise((resolve) => {
          resolveRpc = resolve;
        })
      );

      render(<SetupPage />);

      fireEvent.click(screen.getByText("Join a Home"));
      fireEvent.change(screen.getByPlaceholderText("------"), {
        target: { value: "ABCDEF" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Join Home/i }));

      expect(screen.getByText("Joining...")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Joining/i })
      ).toBeDisabled();

      resolveRpc!({ data: "household-uuid", error: null });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });

  describe("Sign Out", () => {
    it("signs out and redirects to login", async () => {
      render(<SetupPage />);

      fireEvent.click(screen.getByText("Log out of account"));

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/login");
      });
    });
  });
});
