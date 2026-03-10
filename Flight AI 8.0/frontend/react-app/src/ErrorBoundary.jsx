import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error if needed
  }

  render() {
    if (this.state.hasError) {
      return <div style={{color:'#d32f2f',fontSize:18,padding:'32px',textAlign:'center'}}>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}
