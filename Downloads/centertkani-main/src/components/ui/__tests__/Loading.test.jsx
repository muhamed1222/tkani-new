import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from '../Loading/Loading';

describe('Loading Component', () => {
  it('should render loading text', () => {
    render(<Loading text="Загрузка данных..." />);
    expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
  });

  it('should render spinner with aria-label', () => {
    render(<Loading />);
    const spinner = screen.getByRole('status', { name: 'Загрузка' });
    expect(spinner).toBeInTheDocument();
  });

  it('should render without text when text prop is empty', () => {
    const { container } = render(<Loading text="" />);
    const textElement = container.querySelector('p');
    expect(textElement).not.toBeInTheDocument();
  });

  it('should render with custom text', () => {
    render(<Loading text="Пожалуйста, подождите..." />);
    expect(screen.getByText('Пожалуйста, подождите...')).toBeInTheDocument();
  });
});
