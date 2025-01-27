import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../app/Camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions, Camera } from 'expo-camera';
import { useRouter } from 'expo-router';
import { UserIdProvider } from '../contexts/UserIdContext';

jest.mock('expo-camera', () => ({
    CameraView: jest.fn().mockImplementation(({ children }) => children),
    Camera: {
        takePictureAsync: jest.fn().mockResolvedValue({ uri: 'test-uri', base64: 'test-base64' }),
    },
    useCameraPermissions: jest.fn(),
}));

jest.mock('expo', () => ({
    registerRootComponent: jest.fn(),
}));

jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
  );

describe('App', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

   

    it('requests camera permission when button is pressed', () => {
        const requestPermission = jest.fn();
        useCameraPermissions.mockReturnValue([{ granted: false }, requestPermission]);
        const { getByText } = render(<UserIdProvider>
                <App/></UserIdProvider>);
        fireEvent.press(getByText('grant permission'));
        expect(requestPermission).toHaveBeenCalled();
    });

    it('renders camera view when permission is granted', () => {
        useCameraPermissions.mockReturnValue([{ granted: true }, jest.fn()]);
        const { getByText } = render(<UserIdProvider>
                <App/></UserIdProvider>);
        expect(getByText('Flip')).toBeTruthy();
        expect(getByText('Take a photo')).toBeTruthy();
    });

    it('toggles camera facing when flip button is pressed', () => {
        useCameraPermissions.mockReturnValue([{ granted: true }, jest.fn()]);
        const { getByText } = render(<UserIdProvider>
                <App/></UserIdProvider>);
        const flipButton = getByText('Flip');
        fireEvent.press(flipButton);
    });

    
});