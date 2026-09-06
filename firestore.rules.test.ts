import { assertFails, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-test',
    firestore: {
      rules: readFileSync('DRAFT_firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Dirty Dozen Payloads', () => {
  it('1. User Profile Creation with admin role (invalid field)', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertFails(db.collection('users').doc('alice').set({
      uid: 'alice',
      username: 'alice123',
      displayName: 'Alice',
      isAdmin: true, // Ghost Field
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  });
  
  it('2. Profile Update spoofing uid', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertFails(db.collection('users').doc('alice').update({
      uid: 'bob',
      updatedAt: new Date()
    }));
  });

  it('3. Post Creation with another authorId', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertFails(db.collection('posts').doc('post1').set({
      type: 'blog',
      title: 'Hello',
      content: 'World',
      authorId: 'bob',
      authorUsername: 'alice123',
      clapsCount: 0,
      commentsCount: 0,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  });

  it('4. Post Update changing authorId', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    // Assuming it exists, update should fail if trying to change authorId
    await assertFails(db.collection('posts').doc('post1').update({
      authorId: 'bob',
      updatedAt: new Date()
    }));
  });
});
