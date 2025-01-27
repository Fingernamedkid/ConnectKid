import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { getIdFromJwt } from '../lib/axios';
import Index from '../app/index';
jest.mock('../contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  Link: jest.fn(),
  useFocusEffect: (callback) => callback(),
}));

jest.mock('../lib/axios', () => ({
  getIdFromJwt: jest.fn(),
}));

jest.mock('../lib/redirect', () => () => null); 

describe('Index Screen', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({ push: mockPush });
    useTheme.mockReturnValue({ theme: 'light' });
  });

  it('renders correctly', () => {
    const { getByText, getByTestId } = render(<Index />);
    expect(getByText('FitTrackr')).toBeTruthy();
    expect(getByText('Sign-in')).toBeTruthy();
    expect(getByText("If you don't already have an account")).toBeTruthy();
  });

  it('navigates to signin page on Sign-in button click', () => {
    const { getByText } = render(<Index />);

    fireEvent.press(getByText('Sign-in'));

    expect(mockPush).toHaveBeenCalledWith('./auth/signin');
  });



  it('does not redirect if no user ID is found', async () => {
    getIdFromJwt.mockResolvedValue(null); 

    const { getByText } = render(<Index />);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('./auth/signin'));
  });
});
