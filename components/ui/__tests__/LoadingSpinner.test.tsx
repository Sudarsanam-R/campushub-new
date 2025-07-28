import { render, screen } from '../../__tests__/test-utils';
import { LoadingSpinner, PageLoading, SkeletonLoader } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-8 w-8'); // default size
    expect(spinner).toHaveClass('border-t-blue-500'); // default color
  });

  it('applies custom size and color', () => {
    render(<LoadingSpinner size="sm" color="muted" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-4 w-4'); // sm size
    expect(spinner).toHaveClass('border-t-gray-400'); // muted color
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('custom-class');
  });
});

describe('PageLoading', () => {
  it('renders with default message', () => {
    render(<PageLoading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const message = 'Custom loading message';
    render(<PageLoading message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});

describe('SkeletonLoader', () => {
  it('renders default number of rows', () => {
    render(<SkeletonLoader />);
    const rows = document.querySelectorAll('.animate-pulse');
    expect(rows).toHaveLength(3); // default 3 rows
  });

  it('renders custom number of rows', () => {
    const rows = 5;
    render(<SkeletonLoader rows={rows} />);
    const skeletonRows = document.querySelectorAll('.animate-pulse');
    expect(skeletonRows).toHaveLength(rows);
  });

  it('renders circular placeholders when circular prop is true', () => {
    render(<SkeletonLoader circular />);
    const circles = document.querySelectorAll('.rounded-full');
    expect(circles.length).toBeGreaterThan(0);
  });
});
