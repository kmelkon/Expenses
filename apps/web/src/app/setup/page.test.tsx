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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    } as any);
    vi.mocked(createClient).mockReturnValue({
      rpc: mockRpc,
    } as any);
  });

  describe("Initial Render", () => {
    it("displays welcome message and both option buttons", () => {
      render(<SetupPage />);

      expect(screen.getByText("Welcome!")).toBeInTheDocument();
      expect(screen.getByText("Create a new household")).toBeInTheDocument();
      expect(screen.getByText("Join an existing household")).toBeInTheDocument();
    });

    it("does not show any form initially", () => {
      render(<SetupPage />);

      expect(screen.queryByLabelText(/household name/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/join code/i)).not.toBeInTheDocument();
    });
  });

  describe("Create Household Flow", () => {
    it("shows create form when clicking create button", () => {
      render(<SetupPage />);

      fireEvent.click(screen.getByText("Create a new household"));

      expect(screen.getByLabelText(/household name/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
    });

    it("returns to initial state when clicking back", () => {
      render(<SetupPage />);

      fireEvent.click(screen.getByText("Create a new household"));
      fireEvent.click(screen.getByText("Back"));

      expect(screen.getByText("Create a new household")).toBeInTheDocument();
      expect(screen.queryByLabelText(/household name/i)).not.toBeInTheDocument();
    });

    it("submits create household and redirects on success", async () => {
      mockRpc.mockResolvedValue({ data: "household-uuid", error: null });

      render(<SetupPage />);

      fireEvent.click(screen.getByText("Create a new household"));
      fireEvent.change(screen.getByLabelText(/household name/i), {
        target: { value: "Test Family" },
      });
      fireEvent.click(screen.getByRole("button", { name: /create/i }));

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

      fireEvent.click(screen.getByText("Create a new household"));
      fireEvent.change(screen.getByLabelText(/household name/i), {
        target: { value: "Test Family" },
      });
      fireEvent.click(screen.getByRole("button", { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByText("Database error")).toBeInTheDocument();
      });
    });

    it("displays generic error when data is null", async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      render(<SetupPage />);

      fireEvent.click(screen.getByText("Create a new household"));
      fireEvent.change(screen.getByLabelText(/household name/i), {
        target: { value: "Test Family" },
      });
      fireEvent.click(screen.getByRole("button", { name: /create/i }));

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

      fireEvent.click(screen.getByText("Create a new household"));
      fireEvent.change(screen.getByLabelText(/household name/i), {
        target: { value: "Test Family" },
      });
      fireEvent.click(screen.getByRole("button", { name: /create/i }));

      expect(screen.getByText("Creating...")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled();

      resolveRpc!({ data: "household-uuid", error: null });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });

  describe("Join Household Flow", () => {
    it("shows join form when clicking join button", () => {
      render(<SetupPage />);

      fireEvent.click(screen.getByText("Join an existing household"));

      expect(screen.getByLabelText(/join code/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /join/i })).toBeInTheDocument();
    });

    it("returns to initial state when clicking back", () => {
      render(<SetupPage />);

      fireEvent.click(screen.getByText("Join an existing household"));
      fireEvent.click(screen.getByText("Back"));

      expect(screen.getByText("Join an existing household")).toBeInTheDocument();
      expect(screen.queryByLabelText(/join code/i)).not.toBeInTheDocument();
    });

    it("submits join household with lowercased code and redirects on success", async () => {
      mockRpc.mockResolvedValue({ data: "household-uuid", error: null });

      render(<SetupPage />);

      fireEvent.click(screen.getByText("Join an existing household"));
      fireEvent.change(screen.getByLabelText(/join code/i), {
        target: { value: "ABC123XY" },
      });
      fireEvent.click(screen.getByRole("button", { name: /join/i }));

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith("join_household", {
          p_join_code: "abc123xy",
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

      fireEvent.click(screen.getByText("Join an existing household"));
      fireEvent.change(screen.getByLabelText(/join code/i), {
        target: { value: "invalid" },
      });
      fireEvent.click(screen.getByRole("button", { name: /join/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid join code")).toBeInTheDocument();
      });
    });

    it("displays generic error when data is null", async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      render(<SetupPage />);

      fireEvent.click(screen.getByText("Join an existing household"));
      fireEvent.change(screen.getByLabelText(/join code/i), {
        target: { value: "validcode" },
      });
      fireEvent.click(screen.getByRole("button", { name: /join/i }));

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

      fireEvent.click(screen.getByText("Join an existing household"));
      fireEvent.change(screen.getByLabelText(/join code/i), {
        target: { value: "testcode" },
      });
      fireEvent.click(screen.getByRole("button", { name: /join/i }));

      expect(screen.getByText("Joining...")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /joining/i })).toBeDisabled();

      resolveRpc!({ data: "household-uuid", error: null });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });
});
