import { runSuite } from '../../test-utils/suite';
import suite from '../../e2e/suites/feedback.mjs';
import { App } from '../src/App';
import '../src/index.css';

runSuite(App, 'feedback', suite);
