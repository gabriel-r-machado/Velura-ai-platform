/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AuthProvider } from './AuthContext';

describe('AuthContext', () => {
  it('should render AuthProvider without crashing', () => {
    const { container } = render(
      <AuthProvider>
        <div>Test child</div>
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });
});
