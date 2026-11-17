import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ValidationPage from "../ValidationPage";

const { mockUseProject } = vi.hoisted(() => ({
  mockUseProject: vi.fn(),
}));

vi.mock("../../../context/useProject", () => ({
  useProject: mockUseProject,
}));

describe("ValidationPage - Actionable QA Findings", () => {
  beforeEach(() => {
    mockUseProject.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the pending message when no analysis results exist", () => {
    mockUseProject.mockReturnValue({
      results: null,
      validation: null,
    });

    render(<ValidationPage />);

    expect(
      screen.getByText("Run an analysis to view detailed QA findings.")
    ).toBeInTheDocument();

    expect(screen.getByText("0 Findings")).toBeInTheDocument();
  });

  it("displays QA finding code, severity, status and phase", () => {
    mockUseProject.mockReturnValue({
      results: {
        validation: {
          overall_status: "WARN",
          flags: [
            {
              code: "QA-011",
              severity: "HIGH",
              status: "FAIL",
              phase: "Alignment",
              message: "Spatial alignment check failed.",
            },
          ],
        },
        warnings: [],
      },
      validation: null,
    });

    render(<ValidationPage />);

    expect(screen.getByText("QA-011")).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument();
    expect(screen.getByText("FAIL")).toBeInTheDocument();
    expect(screen.getByText("Phase: Alignment")).toBeInTheDocument();
    expect(
      screen.getByText("Spatial alignment check failed.")
    ).toBeInTheDocument();
    expect(screen.getByText("1 Finding")).toBeInTheDocument();
  });

  it("displays the recommended action for a QA finding", () => {
    mockUseProject.mockReturnValue({
      results: {
        validation: {
          flags: [
            {
              code: "QA-012",
              severity: "MEDIUM",
              status: "WARN",
              message: "Temporal interval needs review.",
              recommended_action: "Review the selected observation dates.",
            },
          ],
        },
        warnings: [],
      },
      validation: null,
    });

    render(<ValidationPage />);

    expect(screen.getByText("Recommended Action")).toBeInTheDocument();
    expect(
      screen.getByText("Review the selected observation dates.")
    ).toBeInTheDocument();
  });

  it("shows an empty-state message when results contain no QA findings", () => {
    mockUseProject.mockReturnValue({
      results: {
        validation: {
          overall_status: "PASS",
          flags: [],
        },
        warnings: [],
      },
      validation: null,
    });

    render(<ValidationPage />);

    expect(
      screen.getByText(
        "No structured QA findings were returned for this analysis."
      )
    ).toBeInTheDocument();

    expect(screen.getByText("0 Findings")).toBeInTheDocument();
  });

  it("uses safe fallback values when finding details are missing", () => {
    mockUseProject.mockReturnValue({
      results: {
        validation: {
          flags: [
            {
              code: "QA-014",
            },
          ],
        },
        warnings: [],
      },
      validation: null,
    });

    render(<ValidationPage />);

    expect(screen.getByText("QA-014")).toBeInTheDocument();
    expect(screen.getByText("UNSPECIFIED")).toBeInTheDocument();
    expect(screen.getAllByText("NOT_REPORTED").length).toBeGreaterThan(0);
    expect(
      screen.getByText("No finding description was provided.")
    ).toBeInTheDocument();
  });
});
