const request = require('supertest');
const server = require('./server');

afterAll(() => {
    // Close the server after all tests are done
    server.close();
});

describe('Workspace Management', () =>{

    it('should retrieve workspace information', async () => {
        const response = await request(server)
            .get('/getmywsInfo/5192bd33-dc5f-4a41-a62d-eed622d2c8cd');

        expect(response.status).toBe(200);
    });

    it('should return 401 for non-existent workspace info', async () => {
        const response = await request(server)
            .get('/getmywsInfo/nonexistent-workspace');

        expect(response.status).toBe(401);
    });

    it('should retrieve workspace members', async () => {
        const response = await request(server)
            .get('/getmywsmembers/5192bd33-dc5f-4a41-a62d-eed622d2c8cd');

        expect(response.status).toBe(200);
    });

    it('should return 401 for non-existent workspace members', async () => {
        const response = await request(server)
            .get('/getmywsmembers/nonexistent-workspace');

        expect(response.status).toBe(401);
    });
});