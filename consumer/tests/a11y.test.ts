import { runSuite } from '../../test-utils/suite';
import suite from '../../e2e/suites/a11y.mjs';
import { App } from '../src/App';
import '../src/index.css';

runSuite(App, 'a11y', suite);
