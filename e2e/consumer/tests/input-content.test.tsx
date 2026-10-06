import { testInputContent } from '../../../test-utils/input-content';
import { runSuite } from '../../../test-utils/suite';
import suite from '../../../e2e/suites/input-content.mjs';
import { App } from '../src/App';
import '../src/index.css';

testInputContent();
runSuite(App, 'input content demo', suite);
