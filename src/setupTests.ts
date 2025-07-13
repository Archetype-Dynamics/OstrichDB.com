import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

(globalThis as any).TextEncoder = TextEncoder;
(globalThis as any).TextDecoder = TextDecoder;
