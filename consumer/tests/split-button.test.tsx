import { testSplitButton } from '../../test-utils/split-button';
import { runSuite } from '../../test-utils/suite';
import suite from '../../e2e/suites/split-button.mjs';
import { App } from '../src/App';
import '../src/index.css';

testSplitButton();
runSuite(App, 'split-button demo', suite);
