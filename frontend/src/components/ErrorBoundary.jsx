import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch() {}
  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" style={{ padding: "1rem", border: "1px solid #fecaca", background: "#fee2e2", borderRadius: 12, color: "#991b1b" }}>
          <p>Something went wrong.</p>
          <button type="button" onClick={this.handleRetry}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
