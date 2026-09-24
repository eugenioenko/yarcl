import { runSuite } from '../../test-utils/suite';
import suite from '../../e2e/suites/accordion.mjs';
import { App } from '../src/App';
import '../src/index.css';

runSuite(App, 'accordion', suite);
