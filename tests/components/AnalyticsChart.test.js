import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsChart from '../../components/AnalyticsChart';

// Mock recharts components
jest.mock('recharts', () => ({
  ComposedChart: ({ children, data }) => <div data-testid="composed-chart">{children}</div>,
  Line: ({ dataKey }) => <div data-testid={`line-${dataKey}`} />,
  Bar: ({ dataKey }) => <div data-testid={`bar-${dataKey}`} />,
  Area: ({ dataKey }) => <div data-testid={`area-${dataKey}`} />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ data }) => <div data-testid="pie" data-length={data?.length} />,
  Cell: () => <div data-testid="cell" />,
}));

describe('AnalyticsChart Component', () => {
  const mockData = [
    { name: 'Mon', calls: 10, success: 8, responseTime: 200 },
    { name: 'Tue', calls: 15, success: 12, responseTime: 250 },
    { name: 'Wed', calls: 20, success: 18, responseTime: 180 },
  ];

  const mockSkillDistribution = [
    { name: 'detect', value: 45 },
    { name: 'caption', value: 30 },
    { name: 'query', value: 25 },
  ];

  const mockPerformanceData = [
    { skill: 'detect', avgResponseTime: 200, successRate: 95 },
    { skill: 'caption', avgResponseTime: 180, successRate: 98 },
    { skill: 'query', avgResponseTime: 220, successRate: 92 },
  ];

  const defaultProps = {
    data: mockData,
    skillDistribution: mockSkillDistribution,
    performanceData: mockPerformanceData,
    title: 'Test Analytics',
  };

  it('renders chart container with title', () => {
    render(<AnalyticsChart {...defaultProps} />);
    
    expect(screen.getByText('Test Analytics')).toBeInTheDocument();
  });

  it('renders chart type selector buttons', () => {
    render(<AnalyticsChart {...defaultProps} />);
    
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Trends')).toBeInTheDocument();
    expect(screen.getByText('Distribution')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  it('starts with composed chart as default', () => {
    render(<AnalyticsChart {...defaultProps} />);
    
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    expect(screen.getByTestId('area-calls')).toBeInTheDocument();
    expect(screen.getByTestId('bar-success')).toBeInTheDocument();
    expect(screen.getByTestId('line-responseTime')).toBeInTheDocument();
  });

  it('switches to trends chart when trends button clicked', () => {
    render(<AnalyticsChart {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Trends'));
    
    expect(screen.getByTestId('area-calls')).toBeInTheDocument();
  });

  it('switches to pie chart when distribution button clicked', () => {
    render(<AnalyticsChart {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Distribution'));
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
  });

  it('displays legend for distribution chart', () => {
    render(<AnalyticsChart {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Distribution'));
    
    // Should show legend items
    expect(screen.getByText('detect')).toBeInTheDocument();
    expect(screen.getByText('caption')).toBeInTheDocument();
    expect(screen.getByText('query')).toBeInTheDocument();
    expect(screen.getByText('(45)')).toBeInTheDocument();
    expect(screen.getByText('(30)')).toBeInTheDocument();
    expect(screen.getByText('(25)')).toBeInTheDocument();
  });

  it('switches to performance chart when performance button clicked', () => {
    render(<AnalyticsChart {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Performance'));
    
    expect(screen.getByTestId('bar-avgResponseTime')).toBeInTheDocument();
    expect(screen.getByTestId('line-successRate')).toBeInTheDocument();
  });

  it('highlights active chart type button', () => {
    render(<AnalyticsChart {...defaultProps} />);
    
    const overviewButton = screen.getByText('Overview');
    const trendsButton = screen.getByText('Trends');
    
    // Overview should be active by default
    expect(overviewButton.closest('button')).toHaveClass('bg-white/[0.1]');
    
    // Click trends and check it becomes active
    fireEvent.click(trendsButton);
    expect(trendsButton.closest('button')).toHaveClass('bg-white/[0.1]');
  });

  it('handles empty data gracefully', () => {
    render(
      <AnalyticsChart 
        data={[]} 
        skillDistribution={[]} 
        performanceData={[]} 
        title="Empty Chart"
      />
    );
    
    expect(screen.getByText('Empty Chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <AnalyticsChart {...defaultProps} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('uses default title when none provided', () => {
    render(
      <AnalyticsChart 
        data={mockData}
        skillDistribution={mockSkillDistribution}
        performanceData={mockPerformanceData}
      />
    );
    
    expect(screen.getByText('Analytics Overview')).toBeInTheDocument();
  });

  it('shows responsive container for all chart types', () => {
    const { rerender } = render(<AnalyticsChart {...defaultProps} />);
    
    // Test all chart types have responsive container
    const chartTypes = ['Overview', 'Trends', 'Distribution', 'Performance'];
    
    chartTypes.forEach(chartType => {
      const button = screen.getByText(chartType);
      fireEvent.click(button);
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  it('hides button text on small screens', () => {
    render(<AnalyticsChart {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    
    buttons.forEach(button => {
      const textSpan = button.querySelector('span');
      if (textSpan) {
        expect(textSpan).toHaveClass('hidden');
        expect(textSpan).toHaveClass('sm:inline');
      }
    });
  });
}); 