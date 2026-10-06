import { createRoot } from 'react-dom/client';
import { App } from './App';
import { flushOnHide, loadStore, startActivityTracker } from './app/store';
import { cRunner } from './runtime/client';
import './styles.css';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
void loadStore();
startActivityTracker();
flushOnHide();
// Warm up the compiler in the background so the first "Compiler et tester" is instant.
setTimeout(() => void cRunner.init(), 800);
