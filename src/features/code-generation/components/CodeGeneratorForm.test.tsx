import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CodeGeneratorForm } from "./CodeGeneratorForm";
import { useCodeGenerator } from "../hooks/useCodeGenerator";

vi.mock("../hooks/useCodeGenerator");

describe("CodeGeneratorForm", () => {
  const mockGenerateCode = vi.fn();

  beforeEach(() => {
    vi.mocked(useCodeGenerator).mockReturnValue({
      generateCode: mockGenerateCode,
      isGenerating: false,
      error: null,
      generatedFiles: null,
    });
  });

  it("should render form elements", () => {
    render(<CodeGeneratorForm />);

    expect(screen.getByPlaceholderText(/describe the landing page/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate code/i })).toBeInTheDocument();
  });

  it("should disable button when prompt is empty", () => {
    render(<CodeGeneratorForm />);

    const button = screen.getByRole("button", { name: /generate code/i });
    expect(button).toBeDisabled();
  });

  it("should enable button when prompt has text", async () => {
    render(<CodeGeneratorForm />);

    const textarea = screen.getByPlaceholderText(/describe the landing page/i);
    fireEvent.change(textarea, { target: { value: "Create a landing page" } });

    await waitFor(() => {
      const button = screen.getByRole("button", { name: /generate code/i });
      expect(button).not.toBeDisabled();
    });
  });

  it("should show loading state while generating", () => {
    vi.mocked(useCodeGenerator).mockReturnValue({
      generateCode: mockGenerateCode,
      isGenerating: true,
      error: null,
      generatedFiles: null,
    });

    render(<CodeGeneratorForm />);

    expect(screen.getByText(/generating/i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should display error message when generation fails", () => {
    const error = new Error("Generation failed");
    vi.mocked(useCodeGenerator).mockReturnValue({
      generateCode: mockGenerateCode,
      isGenerating: false,
      error,
      generatedFiles: null,
    });

    render(<CodeGeneratorForm />);

    expect(screen.getByRole("alert")).toHaveTextContent("Generation failed");
  });

  it("should call generateCode on form submission", async () => {
    render(<CodeGeneratorForm />);

    const textarea = screen.getByPlaceholderText(/describe the landing page/i);
    const button = screen.getByRole("button", { name: /generate code/i });

    fireEvent.change(textarea, { target: { value: "Create a landing page" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockGenerateCode).toHaveBeenCalledWith("Create a landing page");
    });
  });
});
