const express = require("express");
const app = express();
const { Worker } = require("worker_threads");
const THREAD_COUNT = 2;

app.get("/non-blocking", (req, res) => {
  res.status(200).send("This page in non blocking");
});
function createWorker() {
  return new Promise(function (resolve, reject) {
    const worker = new Worker("./four_workers.js", {
      workerData: { thread_count: THREAD_COUNT },
    });
    worker.on("message", (data) => {
      resolve(data);
    });
    worker.on("error", (msg) => {
      reject(`An error occured ${msg}`);
    });
  });
}

app.get("/blocking", async (req, res) => {
  const workerPromises = [];
  for (let i = 0; i < THREAD_COUNT; i++) {
    workerPromises.push(createWorker());
  }
  const thread_results = await Promise.all(workerPromises);
  const total = thread_results[0];
  +thread_results[1] + thread_results[2] + thread_results[3];
  res.status(200).send(`result is ${total}`);
});
app.listen(4000, () => {
  console.log("listening to port 4000");
});
