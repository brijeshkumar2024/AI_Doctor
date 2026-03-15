import { execSync } from "node:child_process";

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const run = (command) => {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: "inherit" });
};

const fetchJson = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${url} (${response.status})`);
  }

  return response.json();
};

const fetchText = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${url} (${response.status})`);
  }

  return response.text();
};

const waitFor = async (label, checker, { attempts = 24, delayMs = 5000 } = {}) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await checker();
      console.log(`OK: ${label}`);
      return;
    } catch (error) {
      lastError = error;
      console.log(`Waiting for ${label} (${attempt}/${attempts})`);
      await sleep(delayMs);
    }
  }

  throw lastError || new Error(`Timed out waiting for ${label}`);
};

const verify = async () => {
  run("docker compose build");
  run("docker compose up -d");

  await waitFor("backend health endpoint", async () => {
    const data = await fetchJson("http://localhost:8080/health");
    if (data.status !== "ok") {
      throw new Error("Backend health status is not ok yet");
    }
    if (data.database?.state !== "connected") {
      throw new Error("MongoDB is not connected yet");
    }
  });

  await waitFor("frontend availability", async () => {
    const html = await fetchText("http://localhost:8080");
    if (!html.includes("<!doctype html") && !html.includes("<!DOCTYPE html")) {
      throw new Error("Frontend HTML did not load");
    }
  });

  await waitFor("API connectivity", async () => {
    const data = await fetchJson("http://localhost:8080/api/health");
    if (!data.success) {
      throw new Error("API health endpoint did not return success");
    }
  });

  await waitFor("API documentation route", async () => {
    const html = await fetchText("http://localhost:8080/api/docs");
    if (!html.toLowerCase().includes("swagger")) {
      throw new Error("Swagger UI did not load");
    }
  });

  console.log("\nDocker verification passed.");
  console.log("Frontend: http://localhost:8080");
  console.log("Health: http://localhost:8080/health");
  console.log("API docs: http://localhost:8080/api/docs");
};

verify().catch((error) => {
  console.error("\nDocker verification failed.");
  console.error(error.message);
  process.exit(1);
});
