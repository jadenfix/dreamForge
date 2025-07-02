import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MetricCard from '../../components/MetricCard';
import { TrendingUp } from 'lucide-react';

// Mock recharts
jest.mock('recharts', () => ({
  LineChart: ({ children, data }) => <div data-testid="line-chart">{children}</div>,
  Line: ({ dataKey }) => <div data-testid={`line-${dataKey}`} />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
}));

describe('MetricCard Component', () => {
  const defaultProps = {
    title: 'Total Calls',
    value: '1,234',
    icon: TrendingUp,
    trend: [
      { time: 0, value: 10 },
      { time: 1, value: 20 },
      { time: 2, value: 15 },
    ],
  };

  it('renders basic metric card with title and value', () => {
    render(<MetricCard {...defaultProps} />);
    
    expect(screen.getByText('Total Calls')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('displays change indicator when provided', () => {
    render(
      <MetricCard 
        {...defaultProps} 
        change="+12%" 
        changeType="positive" 
      />
    );
    
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('displays subtitle when provided', () => {
    render(
      <MetricCard 
        {...defaultProps} 
        subtitle="vs last period" 
      />
    );
    
    expect(screen.getByText('vs last period')).toBeInTheDocument();
  });

  it('renders trend chart when trend data is provided', () => {
    render(<MetricCard {...defaultProps} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    const { container } = render(<MetricCard {...defaultProps} loading={true} />);
    
    // Loading state should have skeleton elements
    const skeletonElements = container.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('applies correct change color for positive change', () => {
    const { container } = render(
      <MetricCard 
        {...defaultProps} 
        change="+12%" 
        changeType="positive" 
      />
    );
    
    const changeElement = screen.getByText('+12%');
    expect(changeElement).toHaveClass('text-emerald-400');
  });

  it('applies correct change color for negative change', () => {
    const { container } = render(
      <MetricCard 
        {...defaultProps} 
        change="-5%" 
        changeType="negative" 
      />
    );
    
    const changeElement = screen.getByText('-5%');
    expect(changeElement).toHaveClass('text-red-400');
  });

  it('applies hover effects correctly', () => {
    const { container } = render(<MetricCard {...defaultProps} />);
    
    const cardElement = container.querySelector('.group');
    expect(cardElement).toHaveClass('hover:from-white/[0.12]');
    expect(cardElement).toHaveClass('hover:to-white/[0.04]');
  });

  it('handles custom className prop', () => {
    const { container } = render(
      <MetricCard {...defaultProps} className="custom-class" />
    );
    
    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('custom-class');
  });

  it('does not render trend chart when no trend data', () => {
    render(<MetricCard {...defaultProps} trend={[]} />);
    
    expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
  });

  it('displays correct change icons', () => {
    const { rerender } = render(
      <MetricCard 
        {...defaultProps} 
        change="+12%" 
        changeType="positive" 
      />
    );
    
    expect(screen.getByText('↗')).toBeInTheDocument();

    rerender(
      <MetricCard 
        {...defaultProps} 
        change="-5%" 
        changeType="negative" 
      />
    );
    
    expect(screen.getByText('↘')).toBeInTheDocument();

    rerender(
      <MetricCard 
        {...defaultProps} 
        change="0%" 
        changeType="neutral" 
      />
    );
    
    expect(screen.getByText('→')).toBeInTheDocument();
  });
}); 