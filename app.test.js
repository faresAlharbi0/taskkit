const request = require('supertest');
const server = require('./server');

afterAll(() => {
    // Close the server after all tests are done
    server.close();
});

describe('work space retrival set', () => {
    it('should return a 200 status code for a valid form submission', async () => {
      const response = await request(server)
        .get('/myws/'+"@hf")
  
      expect(response.status).toBe(401);
    });
});