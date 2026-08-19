import { getSaleByIdAction } from './lib/actions/sales';

async function test() {
  const res = await getSaleByIdAction('TX-2934');
  console.log(JSON.stringify(res, null, 2));
}

test();
