const Agenda = require('agenda');
const moment = require('moment');

module.exports = () => {

  let AgendaClient = new Agenda({db: {address: process.env.MONGO_ATLAS_URI, collection: 'jobs', options: { useUnifiedTopology: true }}, defaultLockLifetime: 300000});

  AgendaClient.define('heartbeat-check-job', require('./heartbeat-check-job'));

  AgendaClient.on('start', (job) => {
    job.startTime = moment();
    console.log(`[Job] - Starting ${job.attrs.name}`);
  });

  AgendaClient.on('complete', (job) => {
    let endTime = moment();
    let duration = Math.round(moment.duration(endTime.diff(job.startTime)).asSeconds() * 100) / 100;

    console.log(`[Job] - Completed ${job.attrs.name} - ${duration}s`);
  });

  AgendaClient.on('fail', (err, job) => {
    console.error(`[Job] - Error occurred when running ${job.attrs.name}`, err);
  });

  AgendaClient.on('ready', async () => {

    AgendaClient.every('60 seconds', 'heartbeat-check-job');

    await AgendaClient.start();

    console.log(`[Job] - Initializing all jobs`);

  });

  /**
   * Cleanly reset all of the lockedAt when shutting down a server
   */
  process.on('SIGTERM', async () => {
    console.log('[Job] - Stopping all jobs and resetting the locks by system');
    await AgendaClient.stop();
    process.exit(0);
  });

  /**
   * Cleanly reset all of the lockedAt when shutting down a server
   */
  process.on('SIGINT', async () => {
    console.log('[Job] - Stopping all jobs and resetting the locks by user');
    await AgendaClient.stop();
    process.exit(0);
  });

};