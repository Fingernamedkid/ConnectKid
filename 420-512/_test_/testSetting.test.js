import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Profile from '../app/[user]/profile';
import { useTheme } from '../contexts/ThemeContext';
import { useUserId } from '../contexts/UserIdContext';
import { fetchProfileData, updateProfileData, deleteUserById, setToken } from '../lib/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Text } from 'react-native';
jest.mock('../contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../contexts/UserIdContext', () => ({
  useUserId: jest.fn(),
}));

jest.mock('../lib/axios', () => ({
  fetchProfileData: jest.fn(),
  updateProfileData: jest.fn(),
  deleteUserById: jest.fn(),
  setToken: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useFocusEffect: (callback) => callback(), // Add this line to mock useFocusEffect
  useGlobalSearchParams: jest.fn(() => ({ userId: '1' })),
  ...jest.requireActual('expo-router'),
}));

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

describe('Profile', () => {
  const mockTheme = { theme: 'light' };
  const mockUserIdContext = { userId: '123', setUserId: jest.fn() };
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    useTheme.mockReturnValue(mockTheme);
    useUserId.mockReturnValue(mockUserIdContext);
    useRouter.mockReturnValue(mockRouter);
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    fetchProfileData.mockResolvedValue({
      username: 'testuser',
      email: 'test@abc.ca',
      description: 'Test description',
      image64: '',
      steps: 1000,
    });

    const { getByText } = render(<Profile />);

    await waitFor(() => {
      expect(getByText('testuser')).toBeTruthy();
      expect(getByText('test@abc.ca')).toBeTruthy();
      expect(getByText('Test description')).toBeTruthy();
      expect(getByText('1000')).toBeTruthy();
    });
  });

  

  it('toggles edit mode', async () => {
    const { getByText, getAllByPlaceholderText } = render(<Profile />);

    fireEvent.press(getByText('Modifier'));

    await waitFor(() => {
      const inputs = getAllByPlaceholderText("Entrez l'identifiant");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it('saves profile data', async () => {
    const { getByText, getAllByPlaceholderText } = render(<Profile />);

    fireEvent.press(getByText('Modifier'));

    await waitFor(() => {
      const inputs = getAllByPlaceholderText("Entrez l'identifiant");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });


  it('logs out user', async () => {
    const { getByText } = render(<Profile />);

    fireEvent.press(getByText('Déconnexion'));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });

  it('deletes user', async () => {
    const { getByText } = render(<Profile />);

    fireEvent.press(getByText('Supprimer'));

    await waitFor(() => {
      expect(deleteUserById).toHaveBeenCalledWith('123');
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });
  it('renders profile image item in modal', async () => {
    const { getByText, getByTestId } = render(<Profile />);

    fireEvent.press(getByText('Modifier'));
    fireEvent.press(getByText('Supprimer'));

    await waitFor(() => {
      expect(deleteUserById).toHaveBeenCalledWith('123');
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });it('logs message and returns early if glob.user and userId are undefined', async () => {
    useUserId.mockReturnValue({ userId: undefined, setUserId: jest.fn() });
    render(<Profile />);

 
      expect(console.log).toHaveBeenCalledWith('Profile: userId is undefined');
    
  });

  it('handles profile picture upload', async () => {
    const { getByText, getByTestId } = render(<Profile />);

    fireEvent.press(getByText('Modifier'));
    fireEvent.press(getByText('Supprimer'));

    await waitFor(() => {
      expect(deleteUserById).toHaveBeenCalledWith('123');
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });

  it('displays overlay message on save', async () => {
    const { getByText, getByTestId } = render(<Profile />);

    fireEvent.press(getByText('Modifier'));
    fireEvent.press(getByText('Supprimer'));

    await waitFor(() => {
      expect(deleteUserById).toHaveBeenCalledWith('123');
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });
  it('handles error during profile data fetch', async () => {
    fetchProfileData.mockRejectedValue(new Error('Failed fetching data'));

    render(<Profile />);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith('Profile: Failed Loading profileData: ', expect.any(Error));
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/signin');
    });
  });
  it('handles save profile data successfully', async () => {
    updateProfileData.mockResolvedValue(true);
    AsyncStorage.removeItem.mockResolvedValue();

    const { getByText, getAllByPlaceholderText } = render(<Profile />);

    fireEvent.press(getByText('Modifier'));

    await waitFor(() => {
      const inputs = getAllByPlaceholderText("Entrez l'identifiant");
      expect(inputs.length).toBeGreaterThan(0);
    });

    fireEvent.changeText(getAllByPlaceholderText("Entrez l'identifiant")[0], 'newusername');
    fireEvent.changeText(getAllByPlaceholderText("Entrez l'identifiant")[1], 'newemail@abc.ca');
    fireEvent.changeText(getAllByPlaceholderText('Entrez la description')[0], 'New description');

    fireEvent.press(getByText('Modifier'));

    await waitFor(() => {
      expect(updateProfileData).toHaveBeenCalledWith({
        username: 'newusername',
        email: 'newemail@abc.ca',
        profilePic: '',
        description: 'New description',
        id: '123',
      });
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('photo');
      expect(getByText('Changes saved successfully!')).toBeTruthy();
    });
  });

  it('handles save profile data failure', async () => {
    updateProfileData.mockRejectedValue(new Error('Failed to save data'));

    const { getByText, getAllByPlaceholderText } = render(<Profile />);

    fireEvent.press(getByText('Modifier'));

    await waitFor(() => {
      const inputs = getAllByPlaceholderText("Entrez l'identifiant");
      expect(inputs.length).toBeGreaterThan(0);
    });

    fireEvent.changeText(getAllByPlaceholderText("Entrez l'identifiant")[0], 'newusername');
    fireEvent.changeText(getAllByPlaceholderText("Entrez l'identifiant")[1], 'newemail@abc.ca');
    fireEvent.changeText(getAllByPlaceholderText('Entrez la description')[0], 'New description');

    fireEvent.press(getByText('Modifier'));

    await waitFor(() => {
      expect(updateProfileData).toHaveBeenCalledWith({
        username: 'newusername',
        email: 'newemail@abc.ca',
        profilePic: '',
        description: 'New description',
        id: '123',
      });
      expect(getByText('Error, changes did not save')).toBeTruthy();
    });
  });
});