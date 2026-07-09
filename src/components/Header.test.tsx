import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from './Header';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock next-auth session hook (AuthButton renders inside Header)
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

describe('Header Component', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (usePathname as any).mockReturnValue('/');
    (useSearchParams as any).mockReturnValue(new URLSearchParams());
    (useSession as any).mockReturnValue({ data: null, status: 'unauthenticated' });
  });

  it('renders the logo and search bar', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /serendex/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search something else...')).toBeInTheDocument();
  });

  it('navigates to feed on search submit', () => {
    render(<Header />);
    const input = screen.getByPlaceholderText('Search something else...');
    const form = input.closest('form')!;
    
    fireEvent.change(input, { target: { value: 'Quantum' } });
    fireEvent.submit(form);

    expect(mockPush).toHaveBeenCalledWith('/feed?q=Quantum');
  });

  it('renders breadcrumb links', () => {
    render(<Header />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
  });
});
