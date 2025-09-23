import React from 'react';
import { render, screen } from '@testing-library/react';
import AccountSkeleton from '@/components/accounts/AccountSkeleton';

describe('AccountSkeleton', () => {
  it('renders skeleton elements with proper structure', () => {
    render(<AccountSkeleton />);

    // Check that skeleton container exists
    const container = screen.getByRole('generic');
    expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm');
  });

  it('renders all skeleton elements for account card structure', () => {
    const { container } = render(<AccountSkeleton />);

    // Check for multiple skeleton elements (we expect several for different parts)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBe(8); // Icon, name, type, balance label, balance, created label, created date, 3 buttons
  });

  it('applies animation class to skeleton elements', () => {
    const { container } = render(<AccountSkeleton />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('animate-pulse');
    });
  });
});
