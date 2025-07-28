import { createMocks } from 'node-mocks-http';
import exampleHandler from '../example';
import * as errorHandler from '@/utils/errorHandler';

describe('/api/example', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and success message on GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await exampleHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      message: 'API is working!',
    });
  });

  it('should return 405 for non-GET requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await exampleHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      message: 'Method not allowed',
    });
  });

  it('should handle errors with errorHandler', async () => {
    const error = new Error('Test error');
    const errorHandlerSpy = jest.spyOn(errorHandler, 'errorHandler');
    
    // Mock the handler to throw an error
    jest.mock('../example', () => (req: any, res: any) => {
      throw error;
    });

    const { req, res } = createMocks({
      method: 'GET',
    });

    // Re-import to get the mocked version
    const mockedHandler = (await import('../example')).default;
    await mockedHandler(req, res);

    expect(errorHandlerSpy).toHaveBeenCalledWith(error, res);
  });
});
