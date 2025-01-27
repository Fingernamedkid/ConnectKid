import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileView from '../app/[user_id]/profileView';
import { ThemeProvider } from '../contexts/ThemeContext';
import { UserIdProvider } from '../contexts/UserIdContext';
import { fetchUserInfo } from '../lib/axios';
import { useFocusEffect } from 'expo-router';
import { useGlobalSearchParams, useRouter } from 'expo-router';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../lib/axios');
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useFocusEffect: jest.fn(() => ({})),
  };
});
jest.mock('expo-router', () => {
  const actualExpoRouter = jest.requireActual('expo-router'); // Import the actual module

  return {
    ...actualExpoRouter,
    useGlobalSearchParams: jest.fn(() => ({ userId: '1' })),
    useRouter: jest.fn(),
    useFocusEffect: (callback) => callback(),

  };
});
jest.mock('react-native-maps', () => {
  const MapView = () => null;
  return {
    ...jest.requireActual('react-native-maps'),
    MapView,
  };
});


const mockTheme = { theme: 'light' };
const mockColors = {
  background_c1: '#fff',
  text: '#000',
  primary: '#6200ee',
};

const mockUserIdContext = {
  userId: '123',
  setUserId: jest.fn(),
};

const mockRouter = {
  push: jest.fn(),
};

const mockGlobalSearchParams = {
  user_id: '123',
};

describe('ProfileView', () => {
  beforeEach(() => {
    useGlobalSearchParams.mockReturnValue(mockGlobalSearchParams);
    useRouter.mockReturnValue(mockRouter);
  });

  it('renders correctly with default data', () => {
    const { getByText } = render(
      <ThemeProvider>
        <UserIdProvider>
          <ProfileView />
        </UserIdProvider>
      </ThemeProvider>
    );

    expect(getByText('Your Profile')).toBeTruthy();
    expect(getByText('Default')).toBeTruthy();
    expect(getByText('No description')).toBeTruthy();
    expect(getByText('No profile picture')).toBeTruthy();
  });

  // it('fetches and displays user data correctly', async () => {
  //   const mockProfileData = {
  //     username: 'JohnDoe',
  //     description: 'Hello, I am John!',
  //     image64: 'base64ImageString',
  //     steps: 1000,
  //     routes: [
  //       {
  //         date: '2023-10-01T00:00:00Z',
  //         locations: [{ latitude: 37.78825, longitude: -122.4324 }],
  //       },
  //     ],
  //   };

  //   fetchUserInfo.mockResolvedValue(mockProfileData);

  //   const { getByText, getByTestId } = render(
  //     <ThemeProvider>
  //       <UserIdProvider>
  //         <ProfileView />
  //       </UserIdProvider>
  //     </ThemeProvider>
  //   );

  //   await waitFor(() => {
  //     expect(getByText('JohnDoe')).toBeTruthy();
  //     expect(getByText('Hello, I am John!')).toBeTruthy();
  //     expect(getByTestId('profile-image')).toBeTruthy();
  //     expect(getByText('1000')).toBeTruthy();
  //     expect(getByText('01/10/2023')).toBeTruthy();
  //   });
  // });

  
  // it('navigates through locations correctly', async () => {
  //   const mockProfileData = {
  //     username: 'JohnDoe',
  //     description: 'Hello, I am John!',
  //     image64: 'base64ImageString',
  //     steps: 1000,
  //     routes: [
  //       {
  //         date: '2023-10-01T00:00:00Z',
  //         locations: [{ latitude: 37.78825, longitude: -122.4324 }],
  //       },
  //       {
  //         date: '2023-10-02T00:00:00Z',
  //         locations: [{ latitude: 37.78825, longitude: -122.4324 }],
  //       },
  //     ],
  //   };

  //   fetchUserInfo.mockResolvedValue(mockProfileData);

  //   const { getByText } = render(
  //     <ThemeProvider>
  //       <UserIdProvider>
  //         <ProfileView />
  //       </UserIdProvider>
  //     </ThemeProvider>
  //   );

  //   await waitFor(() => {
  //     expect(getByText('01/10/2023')).toBeTruthy();
  //   });

  //   fireEvent.press(getByText('Next'));
  //   await waitFor(() => {
  //     expect(getByText('02/10/2023')).toBeTruthy();
  //   });

  //   fireEvent.press(getByText('Previous'));
  //   await waitFor(() => {
  //     expect(getByText('01/10/2023')).toBeTruthy();
  //   });
  // });
  
});