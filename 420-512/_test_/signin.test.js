import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignIn from '../app/auth/signin';
import { useTheme } from '../contexts/ThemeContext';
import { signIn } from '../lib/axios';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';

jest.mock('../contexts/ThemeContext', () => ({
    useTheme: jest.fn(),
}));

jest.mock('../lib/axios', () => ({
    signIn: jest.fn(),
}));

jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    Link: jest.fn(),
}));
jest.mock('expo-crypto', () => ({
    digestStringAsync: jest.fn(),
    CryptoDigestAlgorithm: {
        SHA256: 'SHA-256',
    },
}));
jest.mock('react-native-vector-icons/FontAwesome5', () => {
    const React = require('react');
    const { Text } = require('react-native');
  
    // Mock Icon Component
    const MockIcon = ({ name }) => <Text>{name}</Text>;
    return MockIcon;
  });
describe('SignIn Screen', () => {
    const mockTheme = {
        theme: 'light',
    };

    const mockRouter = {
        push: jest.fn(),
    };

    beforeEach(() => {
        useTheme.mockReturnValue(mockTheme);
        useRouter.mockReturnValue(mockRouter);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByPlaceholderText, getByText } = render(<SignIn />);
        expect(getByText('FitTrackr')).toBeTruthy();
        expect(getByPlaceholderText("Entrez l'identifiant")).toBeTruthy();
        expect(getByPlaceholderText('Entrez le mot de passe')).toBeTruthy();
    });

    it('shows error messages when fields are empty', async () => {
        const { getByText, getByPlaceholderText } = render(<SignIn />);
        const signInButton = getByText('Se connectez');

        fireEvent.press(signInButton);

        await waitFor(() => {
            expect(getByText("Identifiant : Ce champs doit être rempli")).toBeTruthy();
            expect(getByText("Mot de passe : Ce champs doit être rempli")).toBeTruthy();
        });
    });

    it('calls signIn function with correct parameters', async () => {
        const { getByPlaceholderText, getByText } = render(<SignIn />);
        const usernameInput = getByPlaceholderText("Entrez l'identifiant");
        const passwordInput = getByPlaceholderText('Entrez le mot de passe');
        const signInButton = getByText('Se connectez');

        fireEvent.changeText(usernameInput, 'testuser');
        fireEvent.changeText(passwordInput, 'password123');
        Crypto.digestStringAsync.mockResolvedValue('hashedpassword123');
        signIn.mockResolvedValue({ id: '123' });

        fireEvent.press(signInButton);

        await waitFor(() => {
            expect(Crypto.digestStringAsync).toHaveBeenCalledWith(
                Crypto.CryptoDigestAlgorithm.SHA256,
                'password123'
            );
            expect(signIn).toHaveBeenCalledWith('testuser', 'hashedpassword123');
            expect(mockRouter.push).toHaveBeenCalledWith('../123/profileView');
        });
    });

    it('shows error message on signIn failure', async () => {
        const { getByPlaceholderText, getByText } = render(<SignIn />);
        const usernameInput = getByPlaceholderText("Entrez l'identifiant");
        const passwordInput = getByPlaceholderText('Entrez le mot de passe');
        const signInButton = getByText('Se connectez');

        fireEvent.changeText(usernameInput, 'testuser');
        fireEvent.changeText(passwordInput, 'wrongpassword');
        Crypto.digestStringAsync.mockResolvedValue('hashedwrongpassword');
        signIn.mockRejectedValue(new Error('AxiosError: Request failed with status code 401'));

        fireEvent.press(signInButton);

        await waitFor(() => {
            expect(getByText('Identifiant ou mot de passe incorrect')).toBeTruthy();
        });
    });
});