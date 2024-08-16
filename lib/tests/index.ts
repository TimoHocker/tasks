import { dynamic_test } from './dynamic';
import { linear_test } from './linear';
import { run_schedule } from './schedule';

async function main () {
  const tests = process.argv.slice (2);
  if (tests.length === 0 || tests.includes ('linear'))
    await linear_test ();
  if (tests.length === 0 || tests.includes ('dynamic'))
    await dynamic_test ();
  if (tests.length === 0 || tests.includes ('schedule'))
    await run_schedule ();
}

main ();
