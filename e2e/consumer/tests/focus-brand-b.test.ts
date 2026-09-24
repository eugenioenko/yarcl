import { runSuite } from '../../../test-utils/suite';
import suite from '../../suites/focus-brand-b.mjs';
import { App } from '../src/App';
import '../src/index.css';

runSuite(App, 'focus-brand-b', suite);
