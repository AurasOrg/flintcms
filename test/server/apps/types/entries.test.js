const mocks = require('../../../mocks');
const common = require('../common');
const mongoose = require('mongoose');

describe('Entries', () => {
  let agent;

  beforeAll(async () => {
    agent = await common.before();
  });

  afterAll((done) => {
    mongoose.disconnect();
    done();
  });

  it('returns a list of entries', (done) => {
    agent
      .post('/graphql')
      .send({
        query: `
        {
          entries {
            _id
            title
          }
        }`,
      })
      .end((err, res) => {
        if (err) { return done(err); }
        expect(res.body).toEqual({
          data: {
            entries: mocks.entries.map(entry => ({
              _id: entry._id,
              title: entry.title,
            })),
          },
        });
        return done();
      });
  });

  it('can query for all entries in a section by sectionSlug', (done) => {
    const section = mocks.sections[0];
    agent
      .post('/graphql')
      .send({
        query: `query ($sectionSlug: String!) {
          entries (sectionSlug: $sectionSlug) {
            _id
            title
          }
        }`,
        variables: {
          sectionSlug: section.slug,
        },
      })
      .end((err, res) => {
        if (err) { return done(err); }
        expect(res.body).toEqual({
          data: {
            entries: mocks.entries.filter(e => e.section === section._id).map(e => ({
              _id: e._id,
              title: e.title,
            })),
          },
        });
        return done();
      });
  });

  test(
    'returns an error when querying for entries by a sectionSlug that does not exist',
    (done) => {
      agent
        .post('/graphql')
        .send({
          query: `query ($sectionSlug: String!) {
            entries (sectionSlug: $sectionSlug) {
              _id
            }
          }`,
          variables: {
            sectionSlug: 'non-existant-section',
          },
        })
        .end((err, res) => {
          if (err) { return done(err); }
          expect(res.body.errors).to.include.an.item.toHaveProperty('message', 'There is no section with that slug.');
          return done();
        });
    },
  );

  it('can query for a specific entry by _id', (done) => {
    agent
      .post('/graphql')
      .send({
        query: `
        query ($_id: ID!) {
          entry (_id: $_id) {
            _id
          }
        }`,
        variables: { _id: mocks.entries[1]._id },
      })
      .end((err, res) => {
        if (err) { return done(err); }
        expect(res.body).toEqual({
          data: {
            entry: { _id: mocks.entries[1]._id },
          },
        });
        return done();
      });
  });

  test(
    'can query for a specific entry by slug and sectionSlug',
    (done) => {
      agent
        .post('/graphql')
        .send({
          query: `query ($slug: String!, $sectionSlug: String!) {
            entry (slug: $slug, sectionSlug: $sectionSlug) {
              _id
            }
          }`,
          variables: {
            slug: mocks.entries[1].slug,
            sectionSlug: mocks.sections.find(s => s._id === mocks.entries[1].section).slug,
          },
        })
        .end((err, res) => {
          if (err) { return done(err); }
          expect(res.body).toEqual({
            data: {
              entry: { _id: mocks.entries[1]._id },
            },
          });
          return done();
        });
    },
  );

  test(
    'returns an error when querying an entry by slug without a sectionSlug',
    (done) => {
      agent
        .post('/graphql')
        .send({
          query: `query ($slug: String!) {
            entry (slug: $slug) {
              _id
            }
          }`,
          variables: { slug: mocks.entries[1].slug },
        })
        .end((err, res) => {
          if (err) { return done(err); }
          expect(res.body.errors).to.include.an.item.toHaveProperty(
            'message',
            'When querying for an entry by slug, you must also query by sectionSlug.',
          );
          return done();
        });
    },
  );

  test(
    'returns an error when querying an entry by slug with a sectionSlug that does not exist',
    (done) => {
      agent
        .post('/graphql')
        .send({
          query: `query ($slug: String!, $sectionSlug: String!) {
            entry (slug: $slug, sectionSlug: $sectionSlug) {
              _id
            }
          }`,
          variables: {
            slug: mocks.entries[1].slug,
            sectionSlug: 'non-existant-section',
          },
        })
        .end((err, res) => {
          if (err) { return done(err); }
          expect(res.body.errors).to.include.an.item.toHaveProperty('message', 'That section does not exist.');
          return done();
        });
    },
  );

  it('can delete an entry from the database', (done) => {
    agent
      .post('/graphql')
      .send({
        query: `
        mutation ($_id: ID!) {
          removeEntry (_id: $_id) {
            _id
          }
        }`,
        variables: { _id: mocks.entries[1]._id },
      })
      .end((err, res) => {
        if (err) { return done(err); }
        expect(res.body).toEqual({
          data: {
            removeEntry: { _id: mocks.entries[1]._id },
          },
        });
        return done();
      });
  });

  it('can save an entry to the database', (done) => {
    agent
      .post('/graphql')
      .send({
        query: `
        mutation ($data: EntriesInput!) {
          addEntry (data: $data) {
            title
          }
        }`,
        variables: {
          data: {
            title: mocks.entries[1].title,
            status: mocks.entries[1].status,
            author: mocks.users[0]._id,
            section: mocks.sections[0]._id,
            fields: [{
              fieldId: mocks.fields[0]._id,
              handle: mocks.fields[0].handle,
              value: 'Hello!',
            }],
          },
        },
      })
      .end((err, res) => {
        if (err) { return done(err); }
        expect(res.body).toEqual({
          data: {
            addEntry: {
              title: mocks.entries[1].title,
            },
          },
        });
        return done();
      });
  });

  it('returns an error when saving with an empty title', async () => {
    const res = await agent
      .post('/graphql')
      .send({
        query: `
        mutation ($data: EntriesInput!) {
          addEntry (data: $data) {
            title
          }
        }`,
        variables: {
          data: {
            title: '    ',
            status: mocks.entries[1].status,
            author: mocks.users[0]._id,
            section: mocks.sections[0]._id,
            fields: [{
              fieldId: mocks.fields[0]._id,
              handle: mocks.fields[0].handle,
              value: 'Hello!',
            }],
          },
        },
      });

    expect(res.body.errors).to.include.an.item.toHaveProperty('message', 'Your entry\'s title must have some real characters');
  });

  it('can update an entry in the database', (done) => {
    agent
      .post('/graphql')
      .send({
        query: `
        mutation ($_id: ID!, $data: EntriesInput!) {
          updateEntry (_id: $_id, data: $data) {
            title
          }
        }`,
        variables: {
          _id: mocks.entries[0]._id,
          data: {
            title: 'New title!',
            author: mocks.users[0]._id,
            section: mocks.sections[0]._id,
            fields: [{
              fieldId: mocks.fields[0]._id,
              handle: mocks.fields[0].handle,
              value: 'Hello!',
            }],
          },
        },
      })
      .end((err, res) => {
        if (err) { return done(err); }
        expect(res.body).toEqual({
          data: {
            updateEntry: {
              title: 'New title!',
            },
          },
        });
        return done();
      });
  });

  it('returns an error when updating a non-existent entry', async () => {
    const res = await agent
      .post('/graphql')
      .send({
        query: `
        mutation ($_id: ID!, $data: EntriesInput!) {
          updateEntry (_id: $_id, data: $data) {
            title
          }
        }`,
        variables: {
          _id: mocks.users[0]._id,
          data: {
            title: 'New title!',
            author: mocks.users[0]._id,
            section: mocks.sections[0]._id,
            fields: [{
              fieldId: mocks.fields[0]._id,
              handle: mocks.fields[0].handle,
              value: 'Hello!',
            }],
          },
        },
      });

    expect(res.body.errors).to.include.an.item.toHaveProperty('message', 'There is no Entry with that id');
  });

  describe('Permissions', () => {
    beforeAll(common.setNonAdmin);

    it('throws when user is not allowed to add a new entry', (done) => {
      agent
        .post('/graphql')
        .send({
          query: `mutation ($data: EntriesInput!) {
            addEntry (data: $data) {
              title
            }
          }`,
          variables: {
            data: {
              title: 'This should not work',
              author: mocks.users[0]._id,
              section: mocks.sections[0]._id,
              fields: [{
                fieldId: mocks.fields[0]._id,
                handle: mocks.fields[0].handle,
                value: 'Hello!',
              }],
            },
          },
        })
        .end((err, res) => {
          if (err) { return done(err); }
          expect(res.body.errors).to.include.an.item.toHaveProperty('message', 'You do not have permission to create new Entries');
          return done();
        });
    });

    test(
      'throws when user is not allowed to update an entry\'s status',
      (done) => {
        agent
          .post('/graphql')
          .send({
            query: `mutation ($_id: ID!, $data: EntriesInput!) {
              updateEntry (_id: $_id, data: $data) {
                title
              }
            }`,
            variables: {
              _id: mocks.entries[0]._id,
              data: {
                title: mocks.entries[0].title,
                author: mocks.users[0]._id,
                section: mocks.sections[0]._id,
                status: mocks.entries[0].status,
                fields: [{
                  fieldId: mocks.fields[0]._id,
                  handle: mocks.fields[0].handle,
                  value: 'Hello!',
                }],
              },
            },
          })
          .end((err, res) => {
            if (err) { return done(err); }
            expect(res.body.errors).to.include.an.item.toHaveProperty('message', 'You are not allowed to change the status of entries. Sorry!');
            return done();
          });
      },
    );

    it('throws when user edits an entry not their own', (done) => {
      agent
        .post('/graphql')
        .send({
          query: `mutation ($_id: ID!, $data: EntriesInput!) {
            updateEntry (_id: $_id, data: $data) {
              title
            }
          }`,
          variables: {
            _id: mocks.entries[2]._id,
            data: {
              title: mocks.entries[2].title,
              author: mocks.users[1]._id,
              section: mocks.entries[2].section,
              status: 'live',
              fields: [{
                fieldId: mocks.fields[0]._id,
                handle: mocks.fields[0].handle,
                value: 'Hello!',
              }],
            },
          },
        })
        .end((err, res) => {
          if (err) { return done(err); }
          expect(res.body.errors).to.include.an.item.toHaveProperty('message', 'You are not allowed to edit this entry. Sorry!');
          return done();
        });
    });

    it('throws when user edits a live entry', (done) => {
      agent
        .post('/graphql')
        .send({
          query: `mutation ($_id: ID!, $data: EntriesInput!) {
            updateEntry (_id: $_id, data: $data) {
              title
            }
          }`,
          variables: {
            _id: mocks.entries[3]._id,
            data: {
              title: 'A title!',
              author: mocks.users[0]._id,
              section: mocks.entries[3].section,
              status: mocks.entries[3].status,
              fields: [{
                fieldId: mocks.fields[0]._id,
                handle: mocks.fields[0].handle,
                value: 'Hello!',
              }],
            },
          },
        })
        .end((err, res) => {
          if (err) { return done(err); }
          expect(res.body.errors).to.include.an.item.toHaveProperty('message', 'You are not allowed to edit a live entry. Sorry!');
          return done();
        });
    });

    it('does not return a draft entry', (done) => {
      agent
        .post('/graphql')
        .send({
          query: `{
            entries {
              status
            }
          }`,
        })
        .end((err, res) => {
          if (err) { return done(err); }
          const data = res.body.data.entries;
          expect(data).not.toMatchObject({ status: 'draft' });
          expect(data).not.toMatchObject({ status: 'disabled' });
          expect(data).toMatchObject({ status: 'live' });
          return done();
        });
    });

    it('throws when deleting an entry', (done) => {
      agent
        .post('/graphql')
        .send({
          query: `mutation removeEntry ($_id: ID!) {
            removeEntry (_id: $_id) {
              _id
            }
          }`,
          variables: { _id: mocks.entries[0]._id },
        })
        .end((err, res) => {
          if (err) { return done(err); }
          const data = res.body;
          expect(data.errors).to.include.an.item.toHaveProperty('message', 'You do not have permission to delete Entries');
          return done();
        });
    });

    test(
      'returns an error when querying for a specific entry by _id',
      (done) => {
        agent
          .post('/graphql')
          .send({
            query: `
            query ($_id: ID!) {
              entry (_id: $_id) {
                _id
              }
            }`,
            variables: { _id: mocks.entries[1]._id },
          })
          .end((err, res) => {
            if (err) { return done(err); }

            // eslint-disable-next-line no-unused-expressions
            expect(res.body.data.entry).toBeNull();
            return done();
          });
      },
    );

    afterAll(common.setAdmin);
  });
});
