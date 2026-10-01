import { runSuite } from '../../../test-utils/suite';
import suite from '../../suites/file-navigation.mjs';
import { App } from '../src/App';
import '../src/index.css';

runSuite(App, 'file-navigation-brand-b', suite);
