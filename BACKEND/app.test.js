import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from './app'; // Ensure your app.js exports the Express app
import { run } from './database'; // Ensure your db.js exports the run function
const SECRET_KEY = 'your_secret_key';
const MONGO_URI = 'your_mongodb_uri'; // Replace with your MongoDB URI

describe('Backend API Tests', () => {
    let token;

    beforeAll(async () => {
        // Connect to MongoDB
        await run()
        const loginResponse = await request(app)
            .post('/users/signin')
            .send({
                usernameOrEmail: 'mockUserencrypt',
                password: 'mockPassword'
            });

        token = loginResponse.body.token;
        expect(token).toBeDefined();
    });



    test('POST /users/signin - success', async () => {
        const response = await request(app)
            .post('/users/signin')
            .send({ usernameOrEmail: 'mockUserencrypt', password: 'mockPassword' });

        console.log(response.body);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        token = response.body.token;
    });

    test('POST /users/signin - missing fields', async () => {
        const response = await request(app)
            .post('/users/signin')
            .send({ usernameOrEmail: 'testuser' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Username or email and password are required.');
    });

    test('POST /users - success and DELETE /users/id --success', async () => {
        const response = await request(app)
            .post('/users')
            .send({ username: 'newuser2', password: 'newpassword', email: 'newuser@example.com' });

        expect([201, 409]).toContain(response.status);
        if (response.status === 201) {
            const userId = createResponse.body.userId;
            const token = jwt.sign({ userId: userId }, SECRET_KEY, { expiresIn: '1h' });
            const deleteResponse = await request(app)
                .delete(`/users/${userId}`)
                .set('Authorization', `Bearer ${token}`) 
                .send();
    
            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body.message).toBe("Success");
        }
    });

    test('POST /users - missing fields', async () => {
        const response = await request(app)
            .post('/users')
            .send({ username: 'newuser' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Username, password, and email are required.');
    });

    test('DELETE /users/:id - no token', async () => {
        const response = await request(app)
            .delete(`/users/${3}`)
            .send();

        expect(response.status).toBe(403);
        expect(response.text).toBe("Forbidden");
    })
    
    test('DELETE /users/:id - invalid token', async () => {
        const mockToken = jwt.sign(
            { example: '123' },  // Payload
            SECRET_KEY, 
            { expiresIn: '1h' } // Expiry time
        );
        const response = await request(app)
            .delete(`/users/3`)
            .set('Authorization', `Bearer ${mockToken}`)
            .send();

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized: Invalid token');
    })

    test('DELETE /users/:id - user not found', async () => {
        const mockToken = jwt.sign(
            { userId: '3' },  // Payload
            SECRET_KEY, 
            { expiresIn: '1h' } // Expiry time
        );
        const response = await request(app)
            .delete(`/users/999`) // Non-existent user ID
            .set('Authorization', `Bearer ${mockToken}`)
            .send();

        expect(response.status).toBe(403);
    })

    test('GET /users/:id - success', async () => {
        const loginResponse = await request(app)
            .post('/users/signin')
            .send({ usernameOrEmail: 'mockUserencrypt', password: 'mockPassword' });

        token = loginResponse.body.token;
        const response = await request(app)
            .get('/users/3')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', 3);
    });

    test('GET /users/:id - unauthorized', async () => {

        const response = await request(app)
            .get('/users/3');

        expect(response.status).toBe(403);
    });

    test('GET /contacts - success', async () => {
        const loginResponse = await request(app)
            .post('/users/signin')
            .send({ usernameOrEmail: 'mockUserencrypt', password: 'mockPassword' });

        token = loginResponse.body.token;
        const response = await request(app)
            .get('/contacts')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
    });


    test('GET /contacts - unauthorized', async () => {
        const response = await request(app)
            .get('/contacts')
        expect(response.status).toBe(403);
    });

    test('PUT /users/:id - success', async () => {
        const userData = {
            id: '3',
            username: 'mockUserencrypt',
            email: 'mockuser@gmail.com',
            profilePic: 'mockPicUrl',
            description: 'Mock User Description'
        };

        const response = await request(app)
            .put(`/users/${userData.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(userData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Success");
    })

    test('PUT /users/:id - fails with missing fields', async () => {
        const userData = {
            id: '3', // Missing username, email...
        };

        const response = await request(app)
            .put(`/users/${userData.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(userData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Request body missing parameters");
    })

    test('PUT /users/:id - fails with wrong token', async () => {
        const userData = {
            id: '3',
            username: 'mockUserencrypt',
            email: 'mockuser@gmail.com',
            profilePic: 'mockPicUrl',
            description: 'Mock User Description'
        };
        const mockToken = jwt.sign(
            { example: '123' },  // Payload
            SECRET_KEY, 
            { expiresIn: '1h' } // Expiry time
        );
        const response = await request(app)
            .put(`/users/${userData.id}`)
            .set('Authorization', `Bearer ${mockToken}`)
            .send(userData);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Forbidden: badToken");
    })

    test('PUT /users/:id - fails with stolen token', async () => {
        const userData = {
            id: '3',
            username: 'mockUserencrypt',
            email: 'mockuser@gmail.com',
            profilePic: 'mockPicUrl',
            description: 'Mock User Description'
        };
        const mockToken = jwt.sign(
            { userId: '123' },  // Payload
            SECRET_KEY, 
            { expiresIn: '1h' } // Expiry time
        );
        const response = await request(app)
            .put(`/users/${userData.id}`)
            .set('Authorization', `Bearer ${mockToken}`)
            .send(userData);

        expect(response.status).toBe(409);
        expect(response.body.error).toBe("Forbidden: you are not allowed to get this info");
    })

    test('POST /users/pair - pair two users successfully and delete them after', async () => {
        let createUser1 = await request(app)
        .post('/users')
        .send({
            username: 'user1',
            password: 'password1',
            email: 'user1@example.com'
        });

    // Step 2: Create user2
    let createUser2 = await request(app)
        .post('/users')
        .send({
            username: 'user2',
            password: 'password2',
            email: 'user2@example.com'
        });

    // If 409 Conflict (user exists), login instead
    if (createUser1.status === 409) {
        const loginResponse1 = await request(app)
            .post('/users/signin')
            .send({ usernameOrEmail: 'user1', password: 'password1' });

        createUser1 = { body: { userId: loginResponse1.body.userId }, status: 200 }; // Mock user creation response
    }

    if (createUser2.status === 409) {
        const loginResponse2 = await request(app)
            .post('/users/signin')
            .send({ usernameOrEmail: 'user2', password: 'password2' });

        createUser2 = { body: { userId: loginResponse2.body.userId }, status: 200 }; // Mock user creation response
    }

    // Check user creation or login success
    expect([200, 201]).toContain(createUser1.status);
    expect([200, 201]).toContain(createUser2.status);


    const user1Id = createUser1.body.userId;
    const user2Id = createUser2.body.userId;

    // Step 3: Login as user1 and get JWT token
    const loginResponse1 = await request(app)
        .post('/users/signin')
        .send({ usernameOrEmail: 'user1', password: 'password1' });

    expect(loginResponse1.status).toBe(200);
    const loginResponse2 = await request(app)
        .post('/users/signin')
        .send({ usernameOrEmail: 'user2', password: 'password2' });

    expect(loginResponse2.status).toBe(200);

    const token1 = loginResponse1.body.token;

    const token2 = loginResponse2.body.token;
    // Step 4: Decode the JWT to get userId
    const decoded = jwt.verify(token2, SECRET_KEY);
    const userId = decoded.userId;
    const decoded1 = jwt.verify(token1, SECRET_KEY);
    const userId1 = decoded1.userId;

    // Step 5: Get user2's pairId using user1's token
    const user2Response = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${token2}`);

    expect(user2Response.status).toBe(200);
    const pairId = user2Response.body.pairId; // Assuming pairId is part of the user data
    // Step 6: Pair user1 with user2
    const pairResponse = await request(app)
        .post('/users/pair')
        .set('Authorization', `Bearer ${token1}`)
        .send({ "pairId": pairId });

    expect(pairResponse.status).toBe(200);
    expect(pairResponse.body.message).toBe('Success');
    // Step 7: Delete user1
    const deleteUser1 = await request(app)
        .delete(`/users/${userId1}`)
        .set('Authorization', `Bearer ${token1}`);
    expect(deleteUser1.status).toBe(200);

    // Step 8: Delete user2
    const deleteUser2 = await request(app)
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${token2}`);
    expect(deleteUser2.status).toBe(200);
    });


    test('POST /pairDevice - pair a device with the user', async () => {
        // Step 1: Create a new user
        const createUserResponse = await request(app)
            .post('/users')
            .send({
                username: 'user1',
                password: 'password1',
                email: 'user1@example.com'
            });
    
        // Check for valid status codes (200 or 201)
        expect([200, 201]).toContain(createUserResponse.status);
    
        // Step 2: Log in to get the JWT token
        const loginResponse = await request(app)
            .post('/users/signin')
            .send({ usernameOrEmail: 'user1', password: 'password1' });
    
        expect(loginResponse.status).toBe(200);
        const token = loginResponse.body.token;
    
        const userId = jwt.verify(token, SECRET_KEY).userId;
        console.log("THE USER ID IS", userId);
        
        // Step 3: Get the pairId from the user information
        const userInfoResponse = await request(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`);
    
        expect(userInfoResponse.status).toBe(200);
        const pairId = userInfoResponse.body.pairId;  // Assuming pairId is part of the user info response
        console.log("THE PAIR ID IS", pairId);
    
        // Step 4: Pair the device using the retrieved pairId
        const pairDeviceResponse = await request(app)
            .post('/pairDevice')
            .set('Authorization', `Bearer ${token}`)
            .send({
                pair_id: pairId,  // Use the pairId retrieved from the GET request
                device_id: 'device1'
            });
    
        // Check if pairing is successful
        expect(pairDeviceResponse.status).toBe(200);
        expect(pairDeviceResponse.body.message).toBe('Device paired successfully.');
    
        // Step 5: Save location for the user
        const locationResponse = await request(app)
            .post('/location')
            .set('Authorization', `Bearer ${token}`)
            .send({
                user_id: pairId,
                lat: 40.7128,  // Example latitude
                lon: -74.0060, // Example longitude
                velocity: 10,   // Example velocity (in km/h or m/s)
                device_id: 'device1'
            });
    
        // Check if location was saved successfully
        expect(locationResponse.status).toBe(200);
        expect(locationResponse.body.message).toBe('Location saved successfully.');
    
        // Step 6: Delete the paired device
        const deleteDeviceResponse = await request(app)
            .delete('/device')
            .set('Authorization', `Bearer ${token}`)
            .send({
                device_id: 'device1' // Ensure you're passing the correct device_id in the body
            });
    
        expect(deleteDeviceResponse.status).toBe(200);
        expect(deleteDeviceResponse.body.message).toBe('Device deleted successfully.');
    
        // Step 7: Delete the user
        const deleteUserResponse = await request(app)
            .delete(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(deleteUserResponse.status).toBe(200);
        expect(deleteUserResponse.body.message).toBe('Success');
    });
    
});