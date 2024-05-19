const request = require('supertest');
const server = require('./server');

afterAll(() => {
    // Close the server after all tests are done
    server.close();
});

describe('Workspace Management', () =>

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
