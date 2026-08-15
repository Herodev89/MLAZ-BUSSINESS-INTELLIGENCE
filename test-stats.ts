import { getDashboardStatsAction } from './lib/actions/dashboard';

async function run() {
  try {
    const res = await getDashboardStatsAction();
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}
run();
