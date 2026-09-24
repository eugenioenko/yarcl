import { runSuite } from '../../../test-utils/suite';
import suite from '../../suites/a11y-brand-b.mjs';
import { App } from '../src/App';
import '../src/index.css';

runSuite(App, 'a11y-brand-b', suite);
