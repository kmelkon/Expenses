import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./card";

describe("Card", () => {
  it("renders with default white background", () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("bg-white");
  });

  it("renders with mint variant background", () => {
    render(
      <Card variant="mint" data-testid="card">
        Content
      </Card>
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("bg-[var(--pastel-mint)]");
  });

  it("renders with peach variant background", () => {
    render(
      <Card variant="peach" data-testid="card">
        Content
      </Card>
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("bg-[var(--pastel-peach)]");
  });

  it("renders with blue variant background", () => {
    render(
      <Card variant="blue" data-testid="card">
        Content
      </Card>
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("bg-[var(--pastel-blue)]");
  });

  it("renders with lavender variant background", () => {
    render(
      <Card variant="lavender" data-testid="card">
        Content
      </Card>
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("bg-[var(--pastel-lavender)]");
  });

  it("renders with transparent variant (no background)", () => {
    render(
      <Card variant="transparent" data-testid="card">
        Content
      </Card>
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("bg-transparent");
  });

  it("applies additional className alongside variant", () => {
    render(
      <Card variant="mint" className="p-4" data-testid="card">
        Content
      </Card>
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("bg-[var(--pastel-mint)]");
    expect(card).toHaveClass("p-4");
  });
});
