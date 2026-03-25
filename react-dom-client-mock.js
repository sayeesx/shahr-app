// Mock for react-dom/client in React Native
// Expo's log-box tries to import this but it's not available in RN

module.exports = {
  createRoot: () => ({
    render: () => {},
    unmount: () => {},
  }),
  hydrateRoot: () => ({
    render: () => {},
    unmount: () => {},
  }),
};
