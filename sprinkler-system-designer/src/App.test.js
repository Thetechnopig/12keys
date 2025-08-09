import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the Google Maps API
jest.mock('@react-google-maps/api', () => ({
  useJsApiLoader: () => ({ isLoaded: true }),
  GoogleMap: ({ children }) => <div>{children}</div>,
  DrawingManager: () => null,
  Polygon: () => null,
  Marker: () => null,
  Circle: () => null,
}));

test('renders the main application heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Lawn Sprinkler Design/i);
  expect(headingElement).toBeInTheDocument();
});
