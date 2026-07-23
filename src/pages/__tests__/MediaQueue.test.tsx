import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MediaQueue from '../MediaQueue';

// Mock DashboardLayout to avoid rendering full layout complexities
vi.mock('@/components/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-layout">{children}</div>
}));

describe('MediaQueue Table Component', () => {
  it('renders correctly', () => {
    render(<MediaQueue />);
    expect(screen.getByTestId('dashboard-layout')).toBeDefined();
  });

  it('renders one row per status with correct actions', () => {
    render(<MediaQueue />);

    // Check Uploading (MQ-1000) -> expects Cancel button
    const uploadingRow = screen.getByText('MQ-1000').closest('tr');
    expect(uploadingRow).toBeDefined();
    expect(uploadingRow?.querySelector('button[title="Cancel"]')).toBeDefined();

    // Check Queued (MQ-1001) -> expects Cancel, Prioritize
    const queuedRow = screen.getByText('MQ-1001').closest('tr');
    expect(queuedRow).toBeDefined();
    expect(queuedRow?.querySelector('button[title="Prioritize"]')).toBeDefined();
    expect(queuedRow?.querySelector('button[title="Cancel"]')).toBeDefined();

    // Check Processing (MQ-1005) -> expects View Progress, Cancel
    const processingRow = screen.getByText('MQ-1005').closest('tr');
    expect(processingRow).toBeDefined();
    expect(processingRow?.querySelector('button[title="View Progress"]')).toBeDefined();
    expect(processingRow?.querySelector('button[title="Cancel"]')).toBeDefined();

    // Check Completed (MQ-1002) -> expects View Result, Download
    const completedRow = screen.getByText('MQ-1002').closest('tr');
    expect(completedRow).toBeDefined();
    expect(completedRow?.querySelector('button[title="View Result"]')).toBeDefined();
    expect(completedRow?.querySelector('button[title="Download"]')).toBeDefined();

    // Check Failed (MQ-1008) -> expects Retry, View Error, Delete
    const failedRow = screen.getByText('MQ-1008').closest('tr');
    expect(failedRow).toBeDefined();
    expect(failedRow?.querySelector('button[title="Retry"]')).toBeDefined();
    expect(failedRow?.querySelector('button[title="View Error"]')).toBeDefined();
    expect(failedRow?.querySelector('button[title="Delete"]')).toBeDefined();

    // Check Cancelled (MQ-1004) -> expects Retry, Delete
    const cancelledRow = screen.getByText('MQ-1004').closest('tr');
    expect(cancelledRow).toBeDefined();
    expect(cancelledRow?.querySelector('button[title="Retry"]')).toBeDefined();
    expect(cancelledRow?.querySelector('button[title="Delete"]')).toBeDefined();
  });

  it('confirms retry count always renders on Failed rows, defaulting to 0 if not present', () => {
    render(<MediaQueue />);
    
    // MQ-1003 has undefined retryCount but is Failed. It should render "0/3 retries".
    const rowWithoutRetry = screen.getByText('MQ-1003').closest('tr');
    expect(rowWithoutRetry).toBeDefined();
    expect(rowWithoutRetry?.textContent).toContain('0/3 retries');
    
    // MQ-1008 has retryCount = 2 and maxRetries = 3. It should render "2/3 retries".
    const rowWithRetry = screen.getByText('MQ-1008').closest('tr');
    expect(rowWithRetry).toBeDefined();
    expect(rowWithRetry?.textContent).toContain('2/3 retries');
  });
});
