import { runSuite } from '../../test-utils/suite';
import suite from '../../e2e/suites/focus.mjs';
import { App } from '../src/App';
import '../src/index.css';

runSuite(App, 'focus', suite);
