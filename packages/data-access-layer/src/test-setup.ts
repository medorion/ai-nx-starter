// Mock TypeORM's ObjectId to use MongoDB's ObjectId directly
// This is needed because TypeORM's re-export doesn't work properly in Jest
jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  const { ObjectId } = jest.requireActual('mongodb');

  return {
    ...actual,
    ObjectId,
  };
});
