import React from 'react';
import { render } from '@testing-library/react-native';
import Recovery from '../app/auth/recovery'; 
import { ThemeProvider } from '../contexts/ThemeContext'; 
jest.mock('react-native-vector-icons/FontAwesome5', () => {
    const React = require('react');
    const { Text } = require('react-native');
  
    // Mock Icon Component
    const MockIcon = ({ name }) => <Text>{name}</Text>;
    return MockIcon;
  });
  jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    Link: jest.fn(),
}));
describe('Recovery Screen', () => {
    it('renders PageUnderConstruction component with correct text', () => {
        const { getByText } = render(
        <ThemeProvider>
          <Recovery />
        </ThemeProvider>
      );
  
      expect(getByText('Veuillez nous contactez au numéro suivant afin de récupérer votre mot de passe:')).toBeTruthy();
      expect(getByText('911-213-1231')).toBeTruthy();
    });
  });