import { testPagination } from '../../test-utils/pagination';
import { runSuite } from '../../test-utils/suite';
import suite from '../../e2e/suites/pagination.mjs';
import { App } from '../src/App';
import '../src/index.css';

testPagination();
runSuite(App, 'compact pagination demo', suite);
