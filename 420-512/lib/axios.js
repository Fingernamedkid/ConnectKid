import axios from 'axios';
import { IP_BACKEND, IP_BACKEND_PH } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';




export const api = axios.create({
    baseURL:IP_BACKEND_PH
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
export async function status(status, id, piId){
    try {
        console.log(`Trying to update status with status: ${status}, id: ${id}, pairId: ${piId}`);
        const statusData = {
            status: status,
            id: id,
            pairId: piId
        };
        const updateData = await api.post(`/users/status`, statusData,{
            header:{
                Authorization: 'none',
            },
        });
        if(!(updateData.status == 200)) throw Error;
        else{
            return updateData.data
        }
    } catch (error){
        throw new Error(error)
    }
}

export async function signUp(username, email , password, type, phonenum){
    try {
        console.log(`Trying to signUp with email: ${email}, username: ${username}, type:${type}, phonenum:${phonenum} and password: ${password}`);

        const signUpData = {
            email:email,
            username: username,
            password: password,
            type: type,
            phonenum: phonenum
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
        await AsyncStorage.setItem('userId', id);
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
export async function getLed(){
    try {
        console.log(`Trying to get led`);
        const ledData = await api.get(`/leds`);
        if(!(ledData.status == 200)) throw Error;
        
        return ledData.data
    } catch (error){
        throw new Error(error)
    }
}
export async function turnLed(state){
    try {
        console.log(`Trying to turn on led`);
        const body = { state: state };
        const updateData = await api.post(`/leds`,body);
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
export async function addConversation(participantUn,participantDeux){
    try {
        const conversationData = {
            participant1 : participantUn,
            participant2 : participantDeux,
        }
        console.log("Trying to create a conversation");
        console.log(conversationData)
        const conversation =  await api.post("/conversation/add", conversationData)
        if (!conversation){
            throw new Error('no response : 404')
        }
        if( conversation.status != 200) throw new Error('responded with error')
            return conversation
    } catch (error) {
        console.log(`axios.js : ${error}`)
    }

}
export async function getConversation(id){
    try {
        console.log("Trying to get a conversation");

        const conversation =  await api.get(`/conversation/${id}`)
        if (!conversation){
            throw new Error('no response : 404')
        }
        if( conversation.status != 200) throw new Error('responded with error')
            return conversation;
    } catch (error) {
        console.log(`axios.js : ${error}`)
    }

}
export async function fetchContactsLocation(){
    try {
        console.log("Trying to get contacts location");
        const contacts =  await api.get(`/location`)
        if (!contacts){
            throw new Error('no response : 404')
        }
        console.log("Contacts got", contacts.data)
        if( contacts.status != 200) throw new Error('responded with error')
            return contacts.data.location;
    }catch(error){
        console.log(`axios.js : ${error}`)
    }
}
export async function fetchDevice(){
    try {
        console.log("Trying to get device");
        const device =  await api.get(`/device`)
        if (!device){
            throw new Error('no response : 404')
        }
        if (device.status === 404) {
            return null;
        }
        if( device.status != 200) throw new Error('responded with error')
            return device.data;
    }catch(error){
        console.log(`axios.js : ${error}`)
    }
}
export async function deleteDevice(id){
    try {
        console.log("Trying to delete device");
        const device =  await api.delete(`/device`, {
            device_id: id
        });
        if (!device){
            return false;

        }
        if( device.status != 200) throw new Error('responded with error')
        return true;
    }
    catch(error){
        return false;
        console.log(`axios.js : ${error}`)
    }
}
export async function sendMessages(senderId, conversationId, content) {
    try {
        
        const messageData = {
            senderId: senderId, 
            conversationId: conversationId,
            content: content
        };
        console.log(senderId)

        const message = await api.post("/messages/send", messageData, {
            headers: {
                Authorization: 'none',
                'Content-Type': 'application/json'
            }
        });

        return message.data;
    } catch (error) {
        console.error(`Axios error: ${error.response ? error.response.data : error.message}`);
    }
}

export async function getMessages(conversationId){
    try {
        console.log("Trying to get a conversation");
    
        const message =  await api.get(`/messages/${conversationId}`);
        
        if (!message){
            throw new Error('no response : 404')
        }
        if( message.status != 200) throw new Error('responded with error')
            return message;
    } catch (error) {
        console.log(`axios.js : ${error}`)
    }

}

export async function getIdFromJwt(){
    try{
        console.log("Trying to get the id from jwt")
        const id = await api.post('/users/authenticate')

        if(!id ){
            return null
        }
        if( id.status != 200) return null
        return id.data.id
    }
    catch(error){
        if (error.response && error.response.status === 401) {
            console.log("No JWT provided");
        } else {
            console.log(`axios.js : ${error}`);
        }
    }
}
export async function fetchBlocks(){
    try{
        console.log(`axios.js : fetchBlocks`)
        const blocks = await api.get(`/blocks`)
        if (blocks.status === 404) {
            throw new Error('axios.js : Data not found (404)');
        } else if (blocks.status !== 200) {
            throw new Error('axios.js : Failed to fetch blocks');
        }
        return blocks.data
    }catch(error){
        console.log("Error fetchingBlocks : ",error)
        throw new Error(error)
    }
}
export async function fetchUserInfo(id){
    try{ 
        const token = await getToken();
        console.log(`JWT token: ${token}`);
        console.log(`axios.js : fetchUserInfo`)
        const userInfo = await api.get(`/users/${id}`)
        if (userInfo.status == 409) {
            throw new Error('axios.js : Failed to fetch userInfo, user not found')
        }
        if(userInfo.status != 200 ){
            throw new Error('axios.js : Failed to fetch userInfo')
        }
        return userInfo.data
    }catch(error){
        console.log("Error fetchingUserInfo : ",error)
        throw new Error(error)
    }
}
export async function pairWith( pairId){
    try{
        console.log(`axios.js : pairWith`)
        const token = await getToken();
        console.log(`JWT token: ${token}`);
        console.log(`axios.js : pairing`)
        const pairData = {
            pairId: pairId
        };
        const response = await api.post(`/users/pair`, pairData);
        if (response.status == 409) {
            throw new Error('axios.js : Failed to fetch userInfo, user not found')
        } else if (response.status == 404) {
            throw new Error('axios.js : Cant find user to pair');
        } else if (response.status != 200) {
            throw new Error('axios.js : Failed to pair with user')
        }
        return response.data
    }catch(error){
        console.log("Error paring: ",error)
        if (error.response && error.response.status === 404) {
            return 'Failed to pair';
        }
        throw new Error(error)
    }
}

export async function fetchContacts(){
    try{
        console.log(`axios.js : fetchContacts`)
        const contacts = await api.get(`/contacts`)
        if(contacts.status != 200){
            throw new Error('axios.js : Failed to fetch contacts')
        }
<<<<<<< HEAD
        return contacts.data.contacts
=======
        console.log("Contact got. Fetching image")
        for (let i = 0; i < contacts.data.contacts.length; i++) {
            console.log(`Fetching image for ${contacts.data.contacts[i]._id}`)
            const image = await fetchImage(contacts.data.contacts[i]._id)
            contacts.data.contacts[i].image64 = image.image64
        }
        console.log(contacts.data)
        return contacts.data
>>>>>>> origin
    }catch(error){
        console.log("Error fetchingContacts : ",error)
    }
}
export async function fetchImage(id){
    try{
        console.log(`axios.js : fetchImage`)
        const image = await api.get(`/users/image/${id}`)
        if(image.status != 200){
            throw new Error('axios.js : Failed to fetch image')
        }
        
        return image.data
    }catch(error){
        console.log("Error fetchingImage : ",error)
        throw new Error(error)
    }
}

export async function sendDatas(listcoordnate, id, steps){
    try{
        console.log(`axios.js : sendDatas`)
        const data = {
            listcoordnate: listcoordnate,
            id: id,
            steps: steps
        }
        const blocks = await api.post(`/trip`, data)
        if(blocks.status != 200){
            throw new Error('axios.js : Failed to fetch blocks')
        }
        return blocks.data
    }catch(error){
        console.log("Error fetchingBlocks : ",error)
        throw new Error(error)
    }
<<<<<<< HEAD
}

// Server to receive HTTP requests on port 3001

=======
} 
>>>>>>> origin
