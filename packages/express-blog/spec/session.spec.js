const { http, expect } = require('./specHelper');

describe('session API', () => {
  describe('POST /session', () => {
    it('responds with error if passed email or password is empty', async () => {
      const response = await http.post('/session');
      expect(response.status).to.equal(400);
    })

    it('responds with error if user does not exist', async () => {
      const response = await http.post('/session', {
        email: 'some.strage@example.com',
        password: '123456'
      });
      expect(response.status).to.equal(400);
      expect(response.data.message).to.equal('Invalid login or password');
    })

    it('responds with error if user password is invalid', async () => {
      const response = await http.post('/session', {
        email: 'admin@casl.io',
        password: '___invalid__password__'
      });
      expect(response.status).to.equal(400);
      expect(response.data.message).to.equal('Invalid login or password');
    })

    it('responds with "token", "email" and permissions if credentials are valid', async () => {
      const response = await http.post('/session', {
        email: 'admin@casl.io',
        password: '123456'
      });
      expect(response.status).to.equal(200);
      expect(response.data.email).to.equal('admin@casl.io');
      expect(response.data).to.have.keys('email', 'token', 'rules', 'userId');
    })
  })
})
