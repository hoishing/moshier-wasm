import puppeteer from "puppeteer";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createServer } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class BrowserTestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.server = null;
    this.testResults = [];
  }

  async startServer() {
    const app = express();
    app.use(cors());

    // Serve static files from the project root
    app.use(express.static(join(__dirname, "..")));

    // Serve WASM files with correct MIME type
    app.get("*.wasm", (req, res) => {
      res.setHeader("Content-Type", "application/wasm");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.sendFile(join(__dirname, "..", req.path));
    });

    // Serve JS files with correct MIME type
    app.get("*.js", (req, res) => {
      res.setHeader("Content-Type", "application/javascript");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.sendFile(join(__dirname, "..", req.path));
    });

    return new Promise((resolve) => {
      this.server = createServer(app);
      this.server.listen(0, () => {
        const port = this.server.address().port;
        console.log(`Test server running on http://localhost:${port}`);
        resolve(port);
      });
    });
  }

  async startBrowser() {
    this.browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    this.page = await this.browser.newPage();

    // Enable console logging from the page
    this.page.on("console", (msg) => {
      console.log(`[Browser] ${msg.type()}: ${msg.text()}`);
    });

    // Handle page errors
    this.page.on("pageerror", (error) => {
      console.error(`[Browser Error] ${error.message}`);
    });

    // Handle request failures
    this.page.on("requestfailed", (request) => {
      console.error(
        `[Browser] Request failed: ${request.url()} - ${request.failure().errorText}`
      );
    });
  }

  async runTests(port) {
    const testUrls = [
      `http://localhost:${port}/tests/browser-tests.html`,
      `http://localhost:${port}/tests/browser-advanced-tests.html`,
    ];

    let allResults = {
      total: 0,
      passed: 0,
      failed: 0,
      failures: [],
      completed: true,
    };

    for (const testUrl of testUrls) {
      console.log(`Starting tests at: ${testUrl}`);

      await this.page.goto(testUrl, { waitUntil: "networkidle0" });

      // Wait for tests to complete
      await this.page.waitForFunction(
        () => {
          return window.testResults && window.testResults.completed;
        },
        { timeout: 60000 }
      ); // Increased timeout for advanced tests

      // Get test results
      const results = await this.page.evaluate(() => {
        return window.testResults;
      });

      // Aggregate results
      allResults.total += results.total;
      allResults.passed += results.passed;
      allResults.failed += results.failed;
      if (results.failures) {
        allResults.failures.push(...results.failures);
      }

      console.log(`Completed ${testUrl}: ${results.passed}/${results.total} passed`);
    }

    return allResults;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    if (this.server) {
      this.server.close();
    }
  }

  async run() {
    try {
      const port = await this.startServer();
      await this.startBrowser();

      const results = await this.runTests(port);

      // Print results
      console.log("\n=== Browser Test Results ===");
      console.log(`Total tests: ${results.total}`);
      console.log(`Passed: ${results.passed}`);
      console.log(`Failed: ${results.failed}`);

      if (results.failures && results.failures.length > 0) {
        console.log("\n=== Failures ===");
        results.failures.forEach((failure) => {
          console.log(`❌ ${failure.name}: ${failure.error}`);
        });
      }

      if (results.failed > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error("Test runner error:", error);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the tests
const runner = new BrowserTestRunner();
runner.run();
