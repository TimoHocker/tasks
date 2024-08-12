import { dynamic_test } from './dynamic';
import { linear_test } from './linear';

async function main () {
  await linear_test ();
  await dynamic_test ();
}

main ();
