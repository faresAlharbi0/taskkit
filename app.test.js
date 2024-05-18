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
    it('should return a 200 status code for a valid form submission', async () => {
        const response = await request(server)
          .get('/myws/'+"@fares")
    
        expect(response.status).toBe(200);
      });
});

describe('work space retrival set', () => {
    it('should return a 200 status code for a valid form submission', async () => {
      const response = await request(server)
        .post("/addws")
        .send({username:"@fares", workspaceName:"my workspace", workspaceDescription:"description"})
  
      expect(response.status).toBe(201);
    });
});