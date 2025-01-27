import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { api, setToken, getToken, signIn, signUp, fetchProfileData, updateProfileData, deleteUserById, getIdFromJwt, fetchBlocks, fetchUserInfo, fetchTop102Weeks, sendDatas } from '../lib/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
  );    
const mock = new MockAdapter(api);

describe('API tests', () => {
    beforeEach(() => {
        mock.reset();
    });

    it('should sign in a user', async () => {
        const token = 'test-token';
        const response = { token };
        mock.onPost('/users/signin').reply(200, response);

        const result = await signIn('testuser', 'password');
        expect(result.token).toBe(token);
    });

    it('should sign up a user', async () => {
        const token = 'test-token';
        const response = { token };
        mock.onPost('/users').reply(201, response);

        const result = await signUp('testuser', 'test@example.com', 'password');
        expect(result.token).toBe(token);
    });

    it('should fetch profile data', async () => {
        const profileData = { id: 1, name: 'Test User' };
        mock.onGet('/users/1').reply(200, profileData);

        const result = await fetchProfileData(1);
        expect(result).toEqual(profileData);
    });

    it('should update profile data', async () => {
        const userData = { id: 1, name: 'Updated User' };
        mock.onPut('/users/1').reply(200, userData);

        const result = await updateProfileData(userData);
        expect(result).toEqual(userData);
    });

    it('should delete a user by id', async () => {
        mock.onDelete('/users/1').reply(200);

        await expect(deleteUserById(1)).resolves.not.toThrow();
    });

    it('should fetch blocks', async () => {
        const blocks = [{ id: 1, name: 'Block 1' }];
        mock.onGet('/blocks').reply(200, blocks);

        const result = await fetchBlocks();
        expect(result).toEqual(blocks);
    });

    it('should fetch user info', async () => {
        const userInfo = { id: 1, name: 'User Info' };
        mock.onGet('/userInfo/1').reply(200, userInfo);

        const result = await fetchUserInfo(1);
        expect(result).toEqual(userInfo);
    });

    it('should fetch top 10 for 2 weeks', async () => {
        const top10 = [{ id: 1, name: 'Top User' }];
        mock.onGet('/top10').reply(200, top10);

        const result = await fetchTop102Weeks();
        expect(result).toEqual(top10);
    });

    it('should send data', async () => {
        const data = { listcoordnate: [], id: 1, steps: 1000 };
        const response = { success: true };
        mock.onPost('/trip').reply(200, response);

        const result = await sendDatas([], 1, 1000);
        expect(result).toEqual(response);
    });

    it('should set and get token', async () => {
        const token = 'test-token';
        await setToken(token);
        const result = await getToken();
        expect(result).toBe(token);
    });

    it('should get id from jwt', async () => {
        const id = { id: 1 };
        mock.onPost('/users/authenticate').reply(200, id);

        const result = await getIdFromJwt();
        expect(result).toBe(id.id);
    });
});