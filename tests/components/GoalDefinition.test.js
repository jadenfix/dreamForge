import { render, screen, fireEvent } from '@testing-library/react';
import GoalDefinition from '../../components/train/GoalDefinition.jsx';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ curriculum: [{ stage: 'warmup', epochs: 1 }] }),
  })
);

describe('GoalDefinition', () => {
  it('calls API and shows curriculum', async () => {
    const handleChange = jest.fn();
    render(<GoalDefinition value={[]} onChange={handleChange} datasetDesc="desc" rewardName="iou" />);

    fireEvent.change(screen.getByPlaceholderText(/detect small/i), { target: { value: 'my goal' } });

    fireEvent.click(screen.getByText('Generate Curriculum'));

    await screen.findByText(/Generate Curriculum/); // wait
    expect(handleChange).toHaveBeenCalledWith([{ stage: 'warmup', epochs: 1 }]);
  });
}); 