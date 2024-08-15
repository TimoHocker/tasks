import { dynamic_test } from './dynamic';
import { linear_test } from './linear';
import { run_schedule } from './schedule';

async function main () {
  await linear_test ();
  await dynamic_test ();
  await run_schedule ();
}

main ();
