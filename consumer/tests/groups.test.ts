import { runSuite } from '../../test-utils/suite';
import suite from '../../e2e/suites/groups.mjs';
import { App } from '../src/App';
import '../src/index.css';

runSuite(App, 'groups', suite);
