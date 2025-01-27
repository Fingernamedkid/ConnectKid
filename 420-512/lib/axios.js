import axios from 'axios';
import { IP_BACKEND } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';



export const api = axios.create({
    baseURL:IP_BACKEND
})

// Function to set the JWT in AsyncStorage
export async function setToken(token) {
    try {
        await AsyncStorage.setItem('jwt', token);
    } catch (error) {
        console.error('Error setting token:', error);
    }
}

// Function to get the JWT from AsyncStorage
export async function getToken() {
    try {
        return await AsyncStorage.getItem('jwt');
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
}

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    async (config) => {
        const token = await getToken(); // Retrieve the token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Set the Authorization header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export async function signIn(usernameOrEmail, password){
    try {
        console.log(`Trying to signIn with username: ${usernameOrEmail} and password: ${password}`);

        const signInData = {
            usernameOrEmail: usernameOrEmail,
            password: password
        };

        const userAuth = await api.post(`/users/signin`, signInData,{
            header:{
                Authorization: 'none',
            },
        });
        if(!(userAuth.status == 200)) throw Error;
        
        // Store the token on successful sign-in
        await setToken(userAuth.data.token);

        return userAuth.data
    } catch (error){
        throw new Error(error)
    }
}

export async function signUp(username, email , password){
    try {
        console.log(`Trying to signUp with email: ${email}, username: ${username} and password: ${password}`);

        const signUpData = {
            email:email,
            username: username,
            password: password
        };

        const userAuth = await api.post(`/users`, signUpData,{
            header:{
                Authorization: 'none',
            },
        });
        if(!(userAuth.status == 201)) throw Error;
        
        // Store the token on successful sign-in
        await setToken(userAuth.data.token);

        return userAuth.data
    } catch (error){
        throw new Error(error)
    }
}

export async function fetchProfileData(id){
    try {
        console.log(`Trying to fetch profileData with id: ${id}`);
        
        const profileData = await api.get(`/users/${id}`);
        if(!(profileData.status == 200)) throw Error('Failed to fetch profile');
        return profileData.data
    } catch (error){
        console.error('Error fetching profile data:', error);
        throw new Error(error)
    }
}
export async function updateProfileData(userData){
    try {
        console.log(`Trying to update profileData with userData: ${userData}`);
        const updateData = await api.put(`/users/${userData.id}`,userData,{
            header:{
                Authorization: 'none',
            },
            
        });
        if(!(updateData.status == 200)) throw Error;
        
        return updateData.data
    } catch (error){
        throw new Error(error)
    }
} 

export async function deleteUserById(id){
    try{
        console.log(`axios.js : delete user with id : ${id}`)
        const deleteUser = await api.delete(`/users/${id}`)
        if(deleteUser.status != 200){
            throw new Error('axios.js : Failed to delete user')
        }
    }catch(error){
        console.log("Error deleting user : ",error)
        throw new Error(error)
    }
}
export async function getIdFromJwt(){
    try{
        console.log("Trying to get the id from jwt")
        const id = await api.post('/users/authenticate')

        if(!id ){
            throw new Error('no response : 404')
        }
        if( id.status != 200) throw new Error('responded with error')
        return id.data.id
    }
    catch(error){
        console.log(`axios.js : ${error}`)
    }
}
export async function fetchBlocks(){
    try{
        console.log(`axios.js : fetchBlocks`)
        const blocks = await api.get(`/blocks`)
        if(blocks.status != 200){
            throw new Error('axios.js : Failed to fetch blocks')
        }
        return blocks.data
    }catch(error){
        console.log("Error fetchingBlocks : ",error)
        throw new Error(error)
    }
}