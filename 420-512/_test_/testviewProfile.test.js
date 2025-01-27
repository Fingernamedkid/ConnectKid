import React, { use } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useUserId } from '../contexts/UserIdContext';
import ViewProfile from '../app/[user]/viewProfile';
// Mock the necessary hooks
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useFocusEffect: (callback) => callback(),
}));

jest.mock('../contexts/UserIdContext', () => ({
  useUserId: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});
describe('ViewProfile', () => {
  it('should redirect to profileView if userId is available', async () => {
    const mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });
    useUserId.mockReturnValue({ userId: '123' });

    render(<ViewProfile />);

    // Since we are using useFocusEffect, we wait for the router.push to be called
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/123/profileView');
    });
  });

  it('should redirect to signin if userId is not available', async () => {
    const mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });
    useUserId.mockReturnValue({ userId: null });

    render(<ViewProfile />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/signin');
    });
  });
});
