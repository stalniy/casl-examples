const { http, expect } = require('./specHelper');

describe('Users API', () => {
  let newUserResponse;
  const newUserPayload = {
    role: 'writer',
    email: `create.test.${process.pid}@example.com`,
    password: '123456'
  };

  before(async () => {
    newUserResponse = await http.as('admin@casl.io').post('/users', newUserPayload);
  })

  describe('admin@casl.io', () => {
    it('can create a user', () => {
      expect(newUserResponse.status).to.equal(201);
      const { role, email, password } = newUserResponse.data.item;
      expect({ role, email, password }).to.deep.equal(newUserPayload)
    })

    it('can read any user', async () => {
      const response = await http.as('admin@casl.io').get(`/users/${newUserResponse.data.item.id}`);

      expect(response.status).to.equal(200);
      expect(response.data.item).to.deep.equal(newUserResponse.data.item);
    })

    it('can update a user', async () => {
      const response = await http.as('admin@casl.io').patch(`/users/${newUserResponse.data.item.id}`, {
        password: '654321'
      });

      expect(response.status).to.equal(200);
      expect(response.data.item.password).to.equal('654321');
    })
  })

  describe('writer@casl.io', () => {
    it('can read itself', async () => {
      const session = await http.as('writer@casl.io').login();
      const response = await http.as('writer@casl.io').get(`/users/${session.userId}`);

      expect(response.status).to.equal(200);
      expect(response.data.item.id).to.equal(session.userId);
      expect(response.data.item.email).to.equal(session.email);
    })

    it('cannot read others', async () => {
      const response = await http.as('writer@casl.io').get(`/users/${newUserResponse.data.item.id}`);
      expect(response.status).to.equal(403);
    })

    it('can update itself', async () => {
      const session = await http.as('writer@casl.io').login();
      const payload = { name: `John.${process.pid}` };
      const response = await http.as('writer@casl.io').patch(`/users/${session.userId}`, payload);

      expect(response.status).to.equal(200);
      expect(response.data.item.name).to.equal(payload.name);
    })

    it('cannot update others', async () => {
      const response = await http.as('writer@casl.io').patch(`/users/${newUserResponse.data.item.id}`, {
        name: 'test me'
      });
      expect(response.status).to.equal(403);
    })

    it('cannot create a user', async () => {
      const response = await http.as('writer@casl.io').post('/users', {
        role: 'writer',
        email: `create.test.${process.pid}@example.com`,
        password: '123456'
      });
      expect(response.status).to.equal(403);
    })
  })
})
