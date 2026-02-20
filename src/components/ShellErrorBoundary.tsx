"use client";
import React, { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ShellErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ShellErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center py-3 px-4 bg-red-500/10 border-b border-red-500/20">
          <span className="text-sm text-red-400">
            Shell error —{" "}
            <button
              onClick={() => window.location.reload()}
              className="underline hover:text-red-300"
            >
              refresh
            </button>
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}
