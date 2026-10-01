import { runSuite } from '../../../test-utils/suite';
import suite from '../../suites/prose.mjs';
import { App } from '../src/App';
import '../src/index.css';

runSuite(App, 'prose', suite);
