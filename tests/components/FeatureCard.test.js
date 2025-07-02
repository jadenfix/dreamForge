import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeatureCard from '../../components/FeatureCard';
import { Brain } from 'lucide-react';

describe('FeatureCard Component', () => {
  const defaultProps = {
    icon: Brain,
    title: 'Smart AI Planning',
    description: 'Anthropic AI automatically selects the optimal analysis method.',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-pink-500',
    features: [
      'Intelligent skill routing',
      'Context-aware processing',
      'Automatic optimization'
    ]
  };

  it('renders feature card with title and description', () => {
    render(<FeatureCard {...defaultProps} />);
    
    expect(screen.getByText('Smart AI Planning')).toBeInTheDocument();
    expect(screen.getByText(/Anthropic AI automatically selects/)).toBeInTheDocument();
  });

  it('displays all feature list items', () => {
    render(<FeatureCard {...defaultProps} />);
    
    expect(screen.getByText('Intelligent skill routing')).toBeInTheDocument();
    expect(screen.getByText('Context-aware processing')).toBeInTheDocument();
    expect(screen.getByText('Automatic optimization')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const mockOnClick = jest.fn();
    render(<FeatureCard {...defaultProps} onClick={mockOnClick} />);
    
    const card = screen.getByText('Smart AI Planning').closest('div').closest('div');
    fireEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(
      <FeatureCard {...defaultProps} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders without features list when features array is empty', () => {
    render(<FeatureCard {...defaultProps} features={[]} />);
    
    expect(screen.queryByText('Intelligent skill routing')).not.toBeInTheDocument();
  });

  it('has proper hover effects', () => {
    const { container } = render(<FeatureCard {...defaultProps} />);
    
    const card = container.firstChild;
    expect(card).toHaveClass('group');
    expect(card).toHaveClass('hover:scale-[1.02]');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('applies gradient classes correctly', () => {
    const { container } = render(<FeatureCard {...defaultProps} />);
    
    // Check that gradient classes are applied to background elements
    const gradientElements = container.querySelectorAll('.from-purple-500');
    expect(gradientElements.length).toBeGreaterThan(0);
  });

  it('renders icon component', () => {
    const { container } = render(<FeatureCard {...defaultProps} />);
    
    // Check that the Brain icon is rendered (lucide-react icons have specific SVG structure)
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('handles mouse events for hover state', () => {
    const { container } = render(<FeatureCard {...defaultProps} />);
    
    const card = container.firstChild;
    
    // Mouse enter should work without errors
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
    
    // Component should still be in document
    expect(screen.getByText('Smart AI Planning')).toBeInTheDocument();
  });

  it('renders with minimal props', () => {
    const minimalProps = {
      icon: Brain,
      title: 'Test Title',
      description: 'Test description',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-green-500'
    };
    
    render(<FeatureCard {...minimalProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });
}); 