import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUp from '../app/auth/signup';
import { Link, useRouter } from 'expo-router';
import { signUp } from '../lib/axios';
import * as Crypto from 'expo-crypto';
import { ThemeProvider } from '../contexts/ThemeContext'; // Adjust the import path as necessary

jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('../lib/axios', () => ({
    signUp: jest.fn(),
}));
jest.mock('react-native-vector-icons/FontAwesome5', () => {
    const React = require('react');
    const { Text } = require('react-native');
    const MockIcon = ({ name }) => <Text>{name}</Text>;
    return MockIcon;
  });
jest.mock('expo-crypto', () => ({
    digestStringAsync: jest.fn(),
    CryptoDigestAlgorithm: {
        SHA256: 'SHA-256',
    },
}));
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    Link: jest.fn(),
}));
jest.mock('react-native-paper', () => ({
    useTheme: jest.fn().mockReturnValue({
        colors: {
            primary: 'blue',
            accent: 'yellow',
            background: 'white',
            surface: 'white',
            text: 'black',
            disabled: 'gray',
            placeholder: 'gray',
            backdrop: 'gray',
        },
    }),
}));

describe('SignUp Screen', () => {
    const mockRouterPush = jest.fn();

    beforeEach(() => {
        useRouter.mockReturnValue({ push: mockRouterPush });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const renderWithProviders = (ui) => {
        return render(<ThemeProvider>{ui}</ThemeProvider>);
    };

    it('renders correctly', () => {
        const { getByPlaceholderText } = renderWithProviders(<SignUp />);
        expect(getByPlaceholderText("Entrez votre courriel")).toBeTruthy();
        expect(getByPlaceholderText("Entrez l'identifiant")).toBeTruthy();
        expect(getByPlaceholderText("Entrez le mot de passe")).toBeTruthy();
    });

    it('shows alert when fields are empty', async () => {
        const { getByText, getByPlaceholderText } = renderWithProviders(<SignUp />);
        fireEvent.press(getByText("Créez le compte"));

        await waitFor(() => {
            expect(getByText("Courriel : Ce champs doit être rempli")).toBeTruthy();
            expect(getByText("Identifiant : Ce champs doit être rempli")).toBeTruthy();
            expect(getByText("Mot de passe : Ce champs doit être rempli")).toBeTruthy();
        });
    });

    it('calls signUp function with correct parameters', async () => {
        Crypto.digestStringAsync.mockResolvedValue('hashedPassword');
        signUp.mockResolvedValue({ id: '123' });

        const { getByPlaceholderText, getByText } = renderWithProviders(<SignUp />);
        fireEvent.changeText(getByPlaceholderText("Entrez votre courriel"), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText("Entrez l'identifiant"), 'testuser');
        fireEvent.changeText(getByPlaceholderText("Entrez le mot de passe"), 'password123');
        fireEvent.press(getByText("Créez le compte"));

        await waitFor(() => {
            expect(Crypto.digestStringAsync).toHaveBeenCalledWith(Crypto.CryptoDigestAlgorithm.SHA256, 'password123');
            expect(signUp).toHaveBeenCalledWith('testuser', 'test@example.com', 'hashedPassword');
            expect(mockRouterPush).toHaveBeenCalledWith('../123/profile');
        });
    });

   
});