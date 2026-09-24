import { runSuite } from '../../../test-utils/suite';
import suite from '../../suites/brand-b.mjs';
import { App } from '../src/App';
import '../src/index.css';

runSuite(App, 'brand-b', suite);
