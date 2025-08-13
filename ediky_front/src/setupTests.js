// ediky_frontend/src/setupTests.js

import '@testing-library/jest-dom';

// Polyfills
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = require('stream/web').ReadableStream;
}

// Firebase mocks
jest.mock('firebase/app', () => ({ initializeApp: jest.fn(() => ({})) }));
jest.mock('firebase/auth', () => ({ getAuth: jest.fn(() => ({})) }));
jest.mock('firebase/firestore', () => ({ getFirestore: jest.fn(() => ({})) }));

// ogl mock – no useless constructors
jest.mock('ogl', () => {
  class Renderer {}
  class Camera {}
  class Transform {}
  return { Renderer, Camera, Transform };
});

// Three.js RoomEnvironment mock – no useless constructor
jest.mock(
  'three/examples/jsm/environments/RoomEnvironment.js',
  () => {
    class RoomEnvironment {}
    return { RoomEnvironment };
  },
  { virtual: true }
);
