import { render, fireEvent } from '@testing-library/react-native';
import Leaderboard from '../app/leaderboard/leaderboard';
import { useTheme } from '../contexts/ThemeContext';
import { useLeaderboard } from '../contexts/LeaderboardContext';
import { useRouter } from 'expo-router';
import { NavigationContainer } from '@react-navigation/native'; // Import NavigationContainer

jest.mock('../contexts/ThemeContext');
jest.mock('../contexts/LeaderboardContext');
jest.mock('expo-router');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock('react-native-vector-icons/FontAwesome5', () => {
  const React = require('react');
  const { Text } = require('react-native');
  // Mock Icon Component
  const MockIcon = ({ name }) => <Text>{name}</Text>;
  return MockIcon;
});

const mockFetchLeaderboard = jest.fn();
const mockPush = jest.fn();

describe('Leaderboard', () => {
  beforeEach(() => {
    useTheme.mockReturnValue({ theme: 'light' });
    useLeaderboard.mockReturnValue({
      blocks: [
        { _id: '1', username: 'User1', steps: 1000, image64: 'image1' },
        { _id: '2', username: 'User2', steps: 2000, image64: 'image2' },
      ],
      fetchLeaderboard: mockFetchLeaderboard,
    });
    useRouter.mockReturnValue({ push: mockPush });
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <NavigationContainer> {/* Wrap with NavigationContainer */}
        <Leaderboard />
      </NavigationContainer>
    );
    expect(getByText('Leaderboard')).toBeTruthy();
    expect(getByText('User1')).toBeTruthy();
    expect(getByText('User2')).toBeTruthy();
  });

  

  it('navigates to user profile on name press', () => {
    const { getByText } = render(
      <NavigationContainer> {/* Wrap with NavigationContainer */}
        <Leaderboard />
      </NavigationContainer>
    );
    fireEvent.press(getByText('User1'));
    expect(mockPush).toHaveBeenCalledWith('/1/profileView');
  });
});
