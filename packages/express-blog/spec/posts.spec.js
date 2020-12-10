const { http, expect, def, $ } = require('./specHelper');

describe('posts API', () => {
  subject(() => http.as($.username));
  def('anotherHttp', () => http.as('another.writer@casl.io'));
  def('article', {
    title: 'CASL rocks!',
    body: 'super article'
  });

  sharedExamplesFor('managing own articles', () => {
    it('can create own article', async () => {
      const created = await $.subject.post('/articles', $.article);
      const session = await $.subject.login();

      expect(created.status).to.equal(200);
      expect(created.data.item.title).to.equal($.article.title);
      expect(created.data.item.body).to.equal($.article.body);
      expect(created.data.item.author).to.equal(session.userId);
    })

    it('can update own article', async () => {
      const created = await $.subject.post('/articles', $.article);
      const response = await $.subject.patch(`/articles/${created.data.item.id}`, {
        title: 'New Article'
      });

      expect(response.status).to.equal(200);
      expect(response.data.item.title).to.equal('New Article');
    })

    it('can delete own article', async () => {
      const created = await $.subject.post('/articles', $.article);
      const deleteResponse = await $.subject.delete(`/articles/${created.data.item.id}`);

      expect(deleteResponse.status).to.equal(200);

      const response = await $.subject.get(`/articles/${created.data.item.id}`);
      expect(response.status).to.equal(404);
    })

    it('can publish own article', async () => {
      const created = await $.subject.post('/articles', $.article);
      const response = await $.subject.patch(`/articles/${created.data.item.id}`, { published: true });

      expect(response.status).to.equal(200);
      expect(response.data.item.published).to.be.true;
    })
  });

  sharedExamplesFor('accessing somebody else articles', () => {
    it('cannot publish somebody else article', async () => {
      const created = await $.anotherHttp.post('/articles', $.article);
      const response = await $.subject.patch(`/articles/${created.data.item.id}`, {
        published: true,
      });

      expect(response.status).to.equal(403);
    });

    it('cannot read someone else drafts', async () => {
      const created = await $.anotherHttp.post('/articles', $.article);
      const response = await $.subject.get(`/articles/${created.data.item.id}`);

      expect(response.status).to.equal(403);
    });

    it('can read published articles', async () => {
      const created = await $.anotherHttp.post('/articles', {
        ...$.article,
        published: true,
      });
      const response = await $.subject.get(`/articles/${created.data.item.id}`);

      expect(response.status).to.equal(200);
      expect(response.data.item).to.deep.equal(created.data.item);
    });
  });

  describe('admin@casl.io', () => {
    def('username', 'admin@casl.io');

    includeExamplesFor('managing own articles');

    it('can update somebody else article', async () => {
      const created = await $.anotherHttp.post('/articles', $.article);
      const response = await $.subject.patch(`/articles/${created.data.item.id}`, {
        title: 'updated title by admin'
      });

      expect(response.status).to.equal(200);
      expect(response.data.item.title).to.equal('updated title by admin');
    })

    it('can delete somebody else article', async () => {
      const created = await $.anotherHttp.post('/articles', $.article);
      const deleteResponse = await $.subject.delete(`/articles/${created.data.item.id}`);

      expect(deleteResponse.status).to.equal(200);

      const response = await $.subject.get(`/articles/${created.data.item.id}`);
      expect(response.status).to.equal(404);
    });

    it('can publish somebody else article', async () => {
      const created = await $.anotherHttp.post('/articles', $.article);
      const response = await $.subject.patch(`/articles/${created.data.item.id}`, {
        published: true,
      });

      expect(response.status).to.equal(200);
      expect(response.data.item.published).to.be.true;

    })

    it('can read drafts', async () => {
      const created = await $.anotherHttp.post('/articles', $.article);
      const response = await $.subject.get(`/articles/${created.data.item.id}`);

      expect(response.status).to.equal(200);
      expect(response.data.item).to.deep.equal(created.data.item);
    })

    it('can read published articles', async () => {
      const created = await $.anotherHttp.post('/articles', {
        ...$.article,
        published: true,
      });
      const response = await $.subject.get(`/articles/${created.data.item.id}`);

      expect(response.status).to.equal(200);
      expect(response.data.item).to.deep.equal(created.data.item);
    });
  })

  describe('writer@casl.io', () => {
    def('username', 'writer@casl.io');

    includeExamplesFor('managing own articles');
    includeExamplesFor('accessing somebody else articles');
  })

  describe('anonymous', () => {
    subject(() => http);

    includeExamplesFor('accessing somebody else articles');

    it('cannot create articles', async () => {
      const response = await $.subject.post('/articles', $.article);

      expect(response.status).to.equal(403);
    })
  })
})
