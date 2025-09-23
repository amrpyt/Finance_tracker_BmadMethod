import React from 'react';
import { render, screen } from '@testing-library/react';
import AccountsLoadingSkeleton from '@/components/accounts/AccountsLoadingSkeleton';

describe('AccountsLoadingSkeleton', () => {
  it('renders default number of skeleton cards', () => {
    const { container } = render(<AccountsLoadingSkeleton />);
    
    // Should render 3 skeleton cards by default
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer?.children).toHaveLength(3);
  });

  it('renders custom number of skeleton cards', () => {
    const { container } = render(<AccountsLoadingSkeleton count={6} />);
    
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer?.children).toHaveLength(6);
  });

  it('renders with proper grid classes', () => {
    const { container } = render(<AccountsLoadingSkeleton />);
    
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toHaveClass('gap-6', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('renders zero skeleton cards when count is 0', () => {
    const { container } = render(<AccountsLoadingSkeleton count={0} />);
    
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer?.children).toHaveLength(0);
  });
});
