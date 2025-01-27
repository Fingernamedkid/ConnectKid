import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import PedometerWithSensors from '../app/pedometer'; // Ensure the correct relative path
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { sendDatas, getIdFromJwt } from '../lib/axios';

jest.mock('expo-sensors', () => ({
  Accelerometer: {
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    isAvailableAsync: jest.fn(),
    setUpdateInterval: jest.fn(),
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: {
    Balanced: 'balanced',
  },
}));

jest.mock('../lib/axios', () => ({
  sendDatas: jest.fn(),
  getIdFromJwt: jest.fn(),
}));

describe('PedometerWithSensors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<PedometerWithSensors />);
    expect(getByText('Steps: 0')).toBeTruthy();
  });

  it('fetches user ID on mount', async () => {
    getIdFromJwt.mockResolvedValue(1);
    render(<PedometerWithSensors />);
    await waitFor(() => {
      expect(getIdFromJwt).toHaveBeenCalled();
    });
  });

  it('handles step detection correctly', async () => {
    Accelerometer.isAvailableAsync.mockResolvedValue(true);
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getIdFromJwt.mockResolvedValue(1);

    const { getByText } = render(<PedometerWithSensors />);
    const startButton = getByText('Start Tracking');

    await act(async () => {
      fireEvent.press(startButton);
    });

    await waitFor(() => {
      expect(Accelerometer.addListener).toHaveBeenCalled();
    });

    
  });

  it('increments steps when handleStepDetection detects a step', async () => {
    Accelerometer.isAvailableAsync.mockResolvedValue(true);
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getIdFromJwt.mockResolvedValue(1);

    const { getByText } = render(<PedometerWithSensors />);
    const startButton = getByText('Start Tracking');

    await act(async () => {
      fireEvent.press(startButton);
    });

    await waitFor(() => {
      expect(Accelerometer.addListener).toHaveBeenCalled();
    });

    const accelData = { x: 1, y: 1, z: 1 };
    const acceleration = Math.sqrt(accelData.x ** 2 + accelData.y ** 2 + accelData.z ** 2);
    const currentTime = Date.now();

    act(() => {
      Accelerometer.addListener.mock.calls[0][0](accelData);
    });

  });

  it('stops tracking when Stop Tracking button is pressed', async () => {
    Accelerometer.isAvailableAsync.mockResolvedValue(true);
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getIdFromJwt.mockResolvedValue(1);

    const { getByText } = render(<PedometerWithSensors />);
    const startButton = getByText('Start Tracking');

    await act(async () => {
      fireEvent.press(startButton);
    });

    await waitFor(() => {
      expect(Accelerometer.addListener).toHaveBeenCalled();
    });

    const stopButton = getByText('Stop Tracking');

    await act(async () => {
      fireEvent.press(stopButton);
    });

    await waitFor(() => {
      expect(Accelerometer.removeAllListeners).toHaveBeenCalled();

      });
    });
  });
  
