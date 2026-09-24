import { runSuite } from '../../test-utils/suite';
import suite from '../../e2e/suites/label.mjs';
import { App } from '../src/App';
import '../src/index.css';

runSuite(App, 'label', suite);
