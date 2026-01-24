import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Button } from "@/shared/components/ui/button";

describe("Button Component", () => {
  it("should render with children", () => {
    render(<Button>Click Me</Button>);
    
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("should handle click events", async () => {
    const handleClick = vi.fn();
    
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should apply variant styles", () => {
    render(<Button variant="destructive">Delete</Button>);
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-destructive");
  });

  it("should show loading state", () => {
    render(<Button disabled>Loading...</Button>);
    
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});
