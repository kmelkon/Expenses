import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "./page";

// Mock Supabase client
const mockSignInWithOAuth = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders OurNest branding in left panel", () => {
    render(<LoginPage />);

    // OurNest appears twice: in branding panel and logo badge
    const ourNestTexts = screen.getAllByText("OurNest");
    expect(ourNestTexts.length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/Track expenses together and find financial harmony/i)
    ).toBeInTheDocument();
  });

  it("renders Welcome Back heading", () => {
    render(<LoginPage />);

    expect(screen.getByText("Welcome Back.")).toBeInTheDocument();
    expect(
      screen.getByText(/Sign in to manage your household budget/i)
    ).toBeInTheDocument();
  });

  it("renders Google sign-in button", () => {
    render(<LoginPage />);

    const googleButton = screen.getByRole("button", {
      name: /log in with google/i,
    });
    expect(googleButton).toBeInTheDocument();
  });

  it("calls signInWithOAuth when Google button is clicked", () => {
    render(<LoginPage />);

    const googleButton = screen.getByRole("button", {
      name: /log in with google/i,
    });
    fireEvent.click(googleButton);

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: expect.stringContaining("/auth/callback"),
      },
    });
  });

  it("renders Terms and Privacy Policy links", () => {
    render(<LoginPage />);

    expect(screen.getByText("Terms")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("renders cottage icon in branding section", () => {
    render(<LoginPage />);

    const cottageIcons = screen.getAllByText("cottage");
    expect(cottageIcons.length).toBeGreaterThan(0);
  });
});
