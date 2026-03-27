import "@testing-library/jest-dom";
import { vi } from "vitest";

// jsdom does not implement ResizeObserver — provide a stub that fires the
// callback on observe() so overflow detection in components actually runs
vi.stubGlobal(
  "ResizeObserver",
  class {
    private callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe(target: Element) {
      this.callback(
        [{ target, contentRect: target.getBoundingClientRect() } as ResizeObserverEntry],
        this as unknown as ResizeObserver
      );
    }
    unobserve() {}
    disconnect() {}
  }
);
