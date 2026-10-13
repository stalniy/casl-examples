const { http, expect, def, $ } = require('./specHelper');

describe('posts API', () => {
  subject(() => http.as($.username));
  def('anotherHttp', () => http.as('another.writer@casl.io'));
  def('article', {
    title: 'CASL rocks!',
    body: 'super article'
  });

  describe('GET /articles', () => {
    let writerId;
    let anotherWriterId;
    const articles = [];
    const initialCounts = {};

    before(async () => {
      writerId = (await http.as('writer@casl.io').login()).userId;
      anotherWriterId = (await http.as('another.writer@casl.io').login()).userId;
      for (const username of ['admin@casl.io', 'writer@casl.io', 'anonymous']) {
        const client = username === 'anonymous' ? http : http.as(username);
        const response = await client.get('/articles', { params: { page: 1, pageSize: 100 } });
        expect(response.status).to.equal(200);
        initialCounts[username] = response.data.count;
      }

      for (let i = 0; i < 6; i++) {
        for (const [email, published] of [
          ['writer@casl.io', false],
          ['another.writer@casl.io', false],
          ['another.writer@casl.io', true]
        ]) {
          const response = await http.as(email).post('/articles', {
            title: `List article ${process.pid}.${i}`,
            body: 'List visibility and pagination fixture',
            published
          });
          expect(response.status).to.equal(200);
          articles.push(response.data.item);
        }
      }
    });

    after(async () => {
      for (const article of articles) {
        await http.as('admin@casl.io').delete(`/articles/${article.id}`);
      }
    });

    describe('admin@casl.io', () => {
      def('username', 'admin@casl.io');
      includeExamplesFor(listingArticles);
    });

    describe('writer@casl.io', () => {
      def('username', 'writer@casl.io');
      includeExamplesFor(listingArticles);
    });

    describe('anonymous', () => {
      def('username', 'anonymous');
      subject(() => http);
      includeExamplesFor(listingArticles);
    });

    function listingArticles() {
      it('lists only accessible articles and counts the same records', async () => {
        const expected = articles.filter(article => $.username === 'admin@casl.io'
          || article.published || ($.username === 'writer@casl.io' && article.author === writerId));
        const response = await $.subject.get('/articles', { params: { page: 1, pageSize: 100 } });

        expect(response.data.items.filter(item => articles.some(article => article.id === item.id)).map(item => item.id))
          .to.have.members(expected.map(article => article.id));
        expect(response.data.items.every(article => article.published
          || ($.username === 'writer@casl.io' && article.author === writerId) || $.username === 'admin@casl.io')).to.be.true;
      });

      it('includes author details under createdBy', async () => {
        const response = await $.subject.get('/articles', { params: { page: 1, pageSize: 100 } });

        expect(response.data.items[0].createdBy.id).to.exist;
        expect(response.data.items[0].createdBy.email).to.exist;
      });
    }
  });

  describe('missing articles', () => {
    let missingId;

    before(async () => {
      const created = await http.as('admin@casl.io').post('/articles', {
        title: 'Deleted article', body: 'Missing identifier fixture'
      });
      expect(created.status).to.equal(200);
      missingId = created.data.item.id;
      const deleted = await http.as('admin@casl.io').delete(`/articles/${missingId}`);
      expect(deleted.status).to.equal(200);
    });

    it('returns 404 when reading a missing article', async () => {
      const response = await http.as('admin@casl.io').get(`/articles/${missingId}`);
      expect(response.status).to.equal(404);
    });

    it('returns 404 when updating a missing article', async () => {
      const response = await http.as('admin@casl.io').patch(`/articles/${missingId}`, { title: 'Missing' });
      expect(response.status).to.equal(404);
    });

    it('returns 404 when deleting a missing article', async () => {
      const response = await http.as('admin@casl.io').delete(`/articles/${missingId}`);
      expect(response.status).to.equal(404);
    });
  });

  describe('admin@casl.io', () => {
    def('username', 'admin@casl.io');

    includeExamplesFor(managingOwnArticles);

    it('can update somebody else article', async () => {
      const created = await $.anotherHttp.post('/articles', $.article);
      const response = await $.subject.patch(`/articles/${created.data.item.id}`, {
        title: 'updated title by admin'
      });

      expect(response.status).to.equal(200);
      expect(response.data.item.title).to.equal('updated title by admin');
      const stored = await $.anotherHttp.get(`/articles/${created.data.item.id}`);
      expect(stored.status).to.equal(200);
      expect(stored.data.item.title).to.equal('updated title by admin');
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
      const stored = await $.anotherHttp.get(`/articles/${created.data.item.id}`);
      expect(stored.status).to.equal(200);
      expect(stored.data.item.published).to.be.true;
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

    includeExamplesFor(managingOwnArticles);
    includeExamplesFor(accessingSomebodyElseArticles);
  })

  describe('anonymous', () => {
    subject(() => http);

    includeExamplesFor(accessingSomebodyElseArticles);

    it('cannot create articles', async () => {
      const response = await $.subject.post('/articles', $.article);

      expect(response.status).to.equal(403);
    })
  })

  function managingOwnArticles() {
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
      const stored = await $.subject.get(`/articles/${created.data.item.id}`);
      expect(stored.status).to.equal(200);
      expect(stored.data.item.title).to.equal('New Article');
    })

    it('rejects invalid update bodies without changing the article', async () => {
      const created = await $.subject.post('/articles', $.article);
      expect(created.status).to.equal(200);
      const response = await $.subject.patch(`/articles/${created.data.item.id}`, { title: {} });
      expect(response.status).to.equal(400);
      const stored = await $.subject.get(`/articles/${created.data.item.id}`);
      expect(stored.status).to.equal(200);
      expect(stored.data.item).to.deep.equal(created.data.item);
    })

    it('keeps an article published when updating only its title', async () => {
      const created = await $.subject.post('/articles', { ...$.article, published: true });
      expect(created.status).to.equal(200);
      const response = await $.subject.patch(`/articles/${created.data.item.id}`, { title: 'Updated published article' });
      expect(response.status).to.equal(200);
      expect(response.data.item.published).to.be.true;
      const stored = await $.subject.get(`/articles/${created.data.item.id}`);
      expect(stored.status).to.equal(200);
      expect(stored.data.item).to.deep.equal(response.data.item);
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
      const stored = await $.subject.get(`/articles/${created.data.item.id}`);
      expect(stored.status).to.equal(200);
      expect(stored.data.item.published).to.be.true;
    })
  }

  function accessingSomebodyElseArticles() {
    it('cannot publish somebody else article', async () => {
      const created = await $.anotherHttp.post('/articles', $.article);
      expect(created.status).to.equal(200);
      const response = await $.subject.patch(`/articles/${created.data.item.id}`, {
        published: true,
      });

      expect(response.status).to.equal(403);
      const stored = await $.anotherHttp.get(`/articles/${created.data.item.id}`);
      expect(stored.status).to.equal(200);
      expect(stored.data.item).to.deep.equal(created.data.item);
    });

    it('cannot update somebody else article', async () => {
      const created = await $.anotherHttp.post('/articles', $.article);
      expect(created.status).to.equal(200);
      const response = await $.subject.patch(`/articles/${created.data.item.id}`, { title: 'Unauthorized change' });
      expect(response.status).to.equal(403);
      const stored = await $.anotherHttp.get(`/articles/${created.data.item.id}`);
      expect(stored.status).to.equal(200);
      expect(stored.data.item).to.deep.equal(created.data.item);
    });

    it('cannot delete somebody else article', async () => {
      const created = await $.anotherHttp.post('/articles', $.article);
      expect(created.status).to.equal(200);
      const response = await $.subject.delete(`/articles/${created.data.item.id}`);
      expect(response.status).to.equal(403);
      const stored = await $.anotherHttp.get(`/articles/${created.data.item.id}`);
      expect(stored.status).to.equal(200);
      expect(stored.data.item).to.deep.equal(created.data.item);
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
  }
})
