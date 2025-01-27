export const useGlobalSearchParams = jest.fn(() => ({
    userId: '1',
  }));
  
  export const useRouter = jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }));