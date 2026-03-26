import "@testing-library/jest-dom";
import { vi } from "vitest";

// jsdom does not implement ResizeObserver — provide a no-op stub
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);
