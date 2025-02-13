process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';
import { getUserByUsernameOrEmailAndPassword } from '../database.js';
import jwt from 'jsonwebtoken';
import { run } from '../database.js';
import { stop } from '../app.js';
const { expect } = chai;
chai.use(chaiHttp);
let jwtToken;
describe('User API - Login', function() {
    this.timeout(6000); // Increase timeout to 6000ms
    this.beforeAll((done) => {
        run().then(() => done()).catch(done);
    });

  describe('POST /users/signin', () => {
    it('should return 400 if usernameOrEmail or password is missing', (done) => {
      chai.request.agent(app)
        .post('/users/signin')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal("Username or email and password are required.");
          done();
        });
    });

    it('should return 401 if invalid username/email or password', (done) => {
      // Mock the getUserByUsernameOrEmailAndPassword function
      chai.request.agent(app)
        .post('/users/signin')
        .send({ usernameOrEmail: 'test', password: 'test' })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.error).to.equal("Invalid username/email or password.");
          done();
        });
    });

    it('should return 200 and a token if valid username/email and password', (done) => {
      // Mock the getUserByUsernameOrEmailAndPassword function++++
      chai.request.agent(app)
        .post('/users/signin')
        .send({ usernameOrEmail: 'mockUserencrypt', password: 'mockPassword' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          done();
        });
    });
  });
  describe('POST /users', () => {
    it('should return 400 if username, email or password is missing', (done) => {
      chai.request.agent(app)
        .post('/users')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal("Username, password, and email are required.");
          done();
        });
    });

    it('should return 409 if username or email already exists', (done) => {
      // Mock the getUserByUsernameOrEmail function
      chai.request.agent(app)
        .post('/users')
        .send({ username: 'mockUserencrypt', email: 'mockUserencrypt@example.com', password: 'mockPassword' })
        .end((err, res) => {
          expect(res).to.have.status(409);
          expect(res.body.error).to.equal("Username or email already exists.");
          done();
        });
    });
    it('should return 201 and create a new user if valid data is provided', (done) => {
      chai.request.agent(app)
        .post('/users')
        .send({ username: 'newUser', email: 'newUser@example.com', password: 'newPassword' })
        .end((err, res) => {
          expect([201, 409]).to.include(res.status);
          if (res.status === 201) {
            expect(res.body).to.have.property('message').that.equals('User created successfully.');
          } else if (res.status === 409) {
            expect(res.body.error).to.equal("Username or email already exists.");
          }
          done();
        });
    })
  });
describe('GET /users/:id', () => {
    it('should return 403 if no token is provided', (done) => {
        chai.request.agent(app)
            .get('/users/123')
            .end((err, res) => {
                expect(res).to.have.status(403);
                expect(res.text).to.equal('Forbidden');
                done();
            });
    });

    it('should return 401 if token is invalid', (done) => {
        chai.request.agent(app)
            .get('/users/123')
            .set('Authorization', 'Bearer invalid_token')
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });

    it('should return 400 if userId is missing', (done) => {
        const token = jwt.sign({ userId: '123' }, 'your_secret_key', { expiresIn: '1h' });
        chai.request.agent(app)
            .get('/users/')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(404);
                done();
            });
    });

    it('should return 409 if userId in token does not match requested userId', (done) => {
        const token = jwt.sign({ userId: '123' }, 'your_secret_key', { expiresIn: '1h' });
        chai.request.agent(app)
            .get('/users/456')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(409);
                expect(res.body.error).to.equal('Forbidden: you are not allowed to get this info');
                done();
            });
    });
    it('should return 200 and user data if valid token and userId', (done) => {
        chai.request.agent(app)
            .post('/users/signin')
            .send({ usernameOrEmail: 'mockUserencrypt', password: 'mockPassword' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('token');
                const token = res.body.token;
                chai.request.agent(app)
                    .get('/users/3')
                    .set('Authorization', `Bearer ${token}`)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.have.property('id');
                        expect(res.body).to.have.property('username');
                        expect(res.body).to.have.property('email');
                        done();
                    });
            });
    });
});

});
