import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from './app'; // Ensure your app.js exports the Express app
import { run } from './database'; // Ensure your db.js exports the run function
import * as database from './database';  // Adjust the path accordingly
 const SECRET_KEY = 'your_secret_key';
let token;
let invalidToken = 'invalidToken';

describe('Backend API Tests', () => {
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

    afterAll(async () => {
        jest.clearAllMocks();
    }
    );

    test('POST /users/signin - success', async () => {
        const response = await request(app)
            .post('/users/signin')
            .send({ usernameOrEmail: 'mockUserencrypt', password: 'mockPassword' });

        console.log(response.body);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        token = response.body.token;
    });
    test('POST /users/signin - invalid credentials', async () => {
        const response = await request(app)
            .post('/users/signin')
            .send({ usernameOrEmail: 'fadafjlk;dsfaklasjklfdaljkdflsjk', password: 'wrongPassword' });
        expect(response.status).toBe(401);
        
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
        const response = await request(app)
            .get('/contacts')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('contacts');
        expect(Array.isArray(response.body.contacts)).toBe(true);
    });

    test('GET /contacts - unauthorized (no token)', async () => {
        const response = await request(app)
            .get('/contacts');

        expect(response.status).toBe(403);
        expect(response.text).toBe('Forbidden');
    });

    test('GET /contacts - unauthorized (invalid token)', async () => {
        const mockToken = jwt.sign(
            { example: '123' },  // Payload
            SECRET_KEY, 
            { expiresIn: '1h' } // Expiry time
        );
        const response = await request(app)
            .get('/contacts')
            .set('Authorization', `Bearer ${mockToken}`);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized: Invalid token');
    });


    test('GET /contacts - server error', async () => {
        // Mock the getUserContacts function in the imported module
        jest.spyOn(database, 'getUserContacts').mockImplementationOnce(() => {
            throw new Error('Database error');
        });
    
        const response = await request(app)
            .get('/contacts')
            .set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(500); // Assuming 500 is the expected status code for a server error
    });
    test("POST /users/authenticate - with token", async () => {
        const response = await request(app)
            .post('/users/authenticate')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
    });
    test("POST /users/authenticate - no token", async () => {
        const response = await request(app)
            .post('/users/authenticate')

        expect(response.status).toBe(403);
    });
    test("POST /users/authenticate - bad token", async () => {
        const mockToken = jwt.sign(
            { example: '123' },  // Payload
            SECRET_KEY, 
            { expiresIn: '1h' } // Expiry time
        );
        const response = await request(app)
            .post('/users/authenticate')
            .set('Authorization', `Bearer ${mockToken}`);
        expect(response.status).toBe(409);
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
            id: '3', 
        };

        const response = await request(app)
            .put(`/users/${userData.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(userData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Request body missing parameters");
    })
    test('DELETE /device - fails with no token', async () => {
        const response = await request(app)
            .delete('/device')
            .send({ device_id: 'device1' });

        expect(response.status).toBe(403);
    })
    test('DELETE /device - fails with missing params', async () => {
        const response = await request(app)
            .delete('/device')
            .set('Authorization', `Bearer ${token}`)
            .send({});
        expect(response.status).toBe(400);
    })
    test('PUT /pairDevice - fails with missing param', async () => {
        const response = await request(app)
            .put('/pairDevice')
            .set('Authorization', `Bearer ${token}`)

        expect(response.status).toBe(404);
    });
    test('PUT /messages/read - fails with missing token', async () => {
        const response = await request(app)
            .put('/messages/read')
            .send({ conversationId: 1, userId: 1 });

        expect(response.status).toBe(403);
    });
    test('POST /messages/send - fails with missing token', async () => {
        const response = await request(app)
            .post('/messages/send')
            .send({ conversationId: 1, senderId: 1, content: 'Hello, User 2!' });

        expect(response.status).toBe(403);
    });
    test('POST Conversation/add - fails with missing token', async () => {
        const response = await request(app)
            .post('/conversation/add')
            .send({ participant1: 1, participant2: 2 });

        expect(response.status).toBe(403);
    }
    );
    test('GET /conversation/:id - fails with missing token', async () => {
        const response = await request(app)
            .get('/conversation/1');

        expect(response.status).toBe(403);
    }
    );
    test('GET /messages/:id - fails with malformed token', async () => {
        const mocktoken = jwt.sign(
            { example: '123' },  // Payload
            SECRET_KEY, 
            { expiresIn: '1h' } // Expiry time
        );
        const response = await request(app)
            .get('/messages/1')
            .set('Authorization', `Bearer ${mocktoken}`);
        expect(response.status).toBe(409);
    });
    test('POST /messages/send - fails with malformed token', async () => {
        const mocktoken = jwt.sign(
            { example: '123' },  // Payload
            SECRET_KEY, 
            { expiresIn: '1h' } // Expiry time
        );
        const response = await request(app)
            .post('/messages/send')
            .set('Authorization', `Bearer ${mocktoken}`)
            .send({ conversationId: 1, senderId: 1, content: 'Hello, User 2!' });

        expect(response.status).toBe(409);
    });
    test('POST /conversation/add - fails with malformed token', async () => {
        const mocktoken = jwt.sign(
            { example: '123' },  // Payload
            SECRET_KEY, 
            { expiresIn: '1h' } // Expiry time
        );
        const response = await request(app)
            .post('/conversation/add')
            .set('Authorization', `Bearer ${mocktoken}`)
            .send({ participant1: 1, participant2: 2 });

        expect(response.status).toBe(409);
    });
    test('PUT /messages/read - fails with malformed token', async () => {
        const mocktoken = jwt.sign(
            { example: '123' },  // Payload
            SECRET_KEY,     
            { expiresIn: '1h' } // Expiry time
        );
        const response = await request(app)
            .put('/messages/read')
            .set('Authorization', `Bearer ${mocktoken}`)
            .send({ conversationId: 1, userId: 1 });

        expect(response.status).toBe(409);
    })
    test('GET /message/:id - fails with no token', async () => {
        const response = await request(app)
            .get('/messages/1');

        expect(response.status).toBe(403);
    }
    );

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

    test('PUT /users/:id - fails with no token', async () => {
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
            .send(userData);

        expect(response.status).toBe(403);
    })
    test('PUT /users/:id - fails with missing body', async () => {
        const userData = {
            id: '3',
            
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
    test('post /users/pair - pair two users but missing token', async () => {
        const postResponse = await request(app)
            .post('/users/pair')
            .send({ "pairId": 1 });
        expect(postResponse.status).toBe(403);
        expect(postResponse.text).toBe('Forbidden');
    });
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


    test('POST /pairDevice and methods that relate to it', async () => {
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
    
        const pairDeviceResponse = await request(app)
            .post('/pairDevice')
            .set('Authorization', `Bearer ${token}`)
            .send({
                pair_id: pairId,  
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

test('Conversations', async () => {
    // Step 1: Create User 1
    const createUserResponse1 = await request(app)
        .post('/users')
        .send({
            username: 'user1',
            password: 'password1',
            email: 'user1@example.com'
        });

    expect([200, 201]).toContain(createUserResponse1.status);

    // Step 2: Create User 2
    const createUserResponse2 = await request(app)
        .post('/users')
        .send({
            username: 'user2',
            password: 'password2',
            email: 'user2@example.com'
        });

    expect([200, 201]).toContain(createUserResponse2.status);

    // Step 3: Log in User 1 to get the JWT token
    const loginResponse1 = await request(app)
        .post('/users/signin')
        .send({ usernameOrEmail: 'user1', password: 'password1' });

    expect(loginResponse1.status).toBe(200);
    const token1 = loginResponse1.body.token;

    const loginResponse2 = await request(app)
        .post('/users/signin')
        .send({ usernameOrEmail: 'user2', password: 'password2' });

    expect(loginResponse2.status).toBe(200);
    const token2 = loginResponse2.body.token;
    const userId1 = jwt.verify(token1, SECRET_KEY).userId;
    const userId2 = jwt.verify(token2, SECRET_KEY).userId;
    console.log("Token1 ", token1);  
    console.log("Token2 ", token2);
    console.log("UserId2 ", userId2);
    console.log("UserId1 ", userId1);
    // Step 5: Create a conversation between User 1 and User 2
    const addConversationResponse = await request(app)
        .post('/conversation/add')
        .set('Authorization', `Bearer ${token1}`) // User 1's token
        .send({
            participant1: userId1,
            participant2: userId2
        });

    expect(addConversationResponse.status).toBe(200);
    expect(addConversationResponse.body[0].message).toBe('Succès');  // Assuming success message is "Succès"
    expect(addConversationResponse.body[0].conversation).toBeDefined();
    // Step 6: Retrieve the conversation for User 1 (use User 1's userId here)

    const getConversationResponse = await request(app)
        .get(`/conversation/${userId1}`)
        .set('Authorization', `Bearer ${token1}`);

    expect(getConversationResponse.status).toBe(200);
    expect(getConversationResponse.body).toHaveLength(1);
    console.log("THE CONVERSATION IS", getConversationResponse.body);
    const getSendmessageResponse = await request(app)
        .post('/messages/send')
        .set('Authorization', `Bearer ${token1}`)
        .send({
            conversationId: getConversationResponse.body[0].id,
            senderId: userId1,
            content: 'Hello, User 2!'
        });
    expect(getSendmessageResponse.status).toBe(200);
    const getMessageResponse = await request(app)
        .get(`/messages/${getConversationResponse.body[0].id}`)
        .set('Authorization', `Bearer ${token2}`);
    expect(getMessageResponse.status).toBe(200);
    const readmessageResponse = await request(app)
        .put(`/messages/read`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
            conversationId: getConversationResponse.body[0].id,
            userId: userId2});
    expect(readmessageResponse.status).toBe(200);
    // Step 7: Delete User 1
    const deleteUserResponse1 = await request(app)
        .delete(`/users/${userId1}`)
        .set('Authorization', `Bearer ${token1}`); // Use User 1's token for authentication
    expect(deleteUserResponse1.status).toBe(200);
    // Step 8: Delete User 2
    const deleteUserResponse2 = await request(app)
        .delete(`/users/${userId2}`)
        .set('Authorization', `Bearer ${token2}`); // Use User 2's token for authentication
    expect(deleteUserResponse2.status).toBe(200);
});
test('/location - missing params', async () => {
    const response = await request(app)
        .post('/location')
        .send({
            user_id: 1,
            lat: 40.7128,
            lon: -74.0060,
            velocity: 10
        });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('User ID, latitude, longitude, velocity, and device ID are required.');
}
);

});