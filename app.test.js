const request = require('supertest');
const server = require('./server');

afterAll(() => {
    // Close the server after all tests are done
    server.close();
});

describe('User Registration and Authentication', () => {
    it('should register a new user successfully', async () => {
        const response = await request(server)
            .post('/register')
            .send({ username: 'testuser', firstName: 'Test', lastName: 'User', email: 'testuser@example.com', password: 'password123', bio: 'This is a bio' });

        expect(response.status).toBe(201);
    });

    it('should fail to register a user with missing required fields', async () => {
        const response = await request(server)
            .post('/register')
            .send({ username: 'testuser2' });

        expect(response.status).toBe(400);
    });

    it('should sign in a registered user successfully', async () => {
        const response = await request(server)
            .post('/signin')
            .send({ username: 'testuser', password: 'password123' });

        expect(response.status).toBe(200);
    });

    it('should fail to sign in with incorrect password', async () => {
        const response = await request(server)
            .post('/signin')
            .send({ username: 'testuser', password: 'wrongpassword' });

        expect(response.status).toBe(401);
    });
});

describe('Workspace Retrieval', () => {
    it('should return a list of workspaces for a user', async () => {
        const response = await request(server)
            .get('/myws/testuser');

        expect(response.status).toBe(200);
    });

    it('should return a 401 status code if user has no workspaces', async () => {
        const response = await request(server)
            .get('/myws/nonexistentuser');

        expect(response.status).toBe(401);
    });
});

describe('Workspace Management', () => {
    it('should create a new workspace', async () => {
        const response = await request(server)
            .post('/addws')
            .send({ username: 'testuser', workspaceName: 'New Workspace', workspaceDescription: 'Description of the new workspace' });

        expect(response.status).toBe(201);
    });

    it('should retrieve workspace information', async () => {
        const response = await request(server)
            .get('/getmywsInfo/some-workspace-uuid');

        expect(response.status).toBe(200);
    });

    it('should return 401 for non-existent workspace info', async () => {
        const response = await request(server)
            .get('/getmywsInfo/nonexistent-workspace');

        expect(response.status).toBe(401);
    });

    it('should retrieve workspace members', async () => {
        const response = await request(server)
            .get('/getmywsmembers/some-workspace-uuid');

        expect(response.status).toBe(200);
    });

    it('should return 401 for non-existent workspace members', async () => {
        const response = await request(server)
            .get('/getmywsmembers/nonexistent-workspace');

        expect(response.status).toBe(401);
    });
});

describe('Notifications', () => {
    it('should update notification read status', async () => {
        const response = await request(server)
            .get('/updatemyNotifMessages/testuser');

        expect(response.status).toBe(201);
    });

    it('should retrieve notification messages', async () => {
        const response = await request(server)
            .get('/myNotifMessages/testuser');

        expect(response.status).toBe(200);
    });

    it('should return 401 for user with no notifications', async () => {
        const response = await request(server)
            .get('/myNotifMessages/nonexistentuser');

        expect(response.status).toBe(401);
    });
});
