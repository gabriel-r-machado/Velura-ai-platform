/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRealtimeProject } from './useRealtimeProject';

describe('useRealtimeProject', () => {
  it('should initialize hook without errors', () => {
    const { result } = renderHook(() => useRealtimeProject(null));
    
    // Hook should initialize without throwing
    expect(result).toBeDefined();
  });
});
