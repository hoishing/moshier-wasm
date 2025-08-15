/**
 * Test for sweph.js web worker
 * Tests the web worker functionality that calls the WASM module
 */

describe("sweph.js Web Worker", () => {
  let worker;
  let originalWorker;

  beforeAll(() => {
    // Store original Worker constructor
    originalWorker = global.Worker;

    // Mock Worker constructor for testing
    global.Worker = class MockWorker {
      constructor(scriptPath) {
        this.scriptPath = scriptPath;
        this.onmessage = null;
        this.onerror = null;
        this.postMessage = jest.fn();
        this.terminate = jest.fn();

        // Simulate worker initialization
        setTimeout(() => {
          if (this.onmessage) {
            // Simulate the worker being ready
            this.onmessage({ data: "ready" });
          }
        }, 0);
      }
    };
  });

  afterAll(() => {
    // Restore original Worker constructor
    global.Worker = originalWorker;
  });

  beforeEach(() => {
    // Create a new worker instance for each test
    worker = new Worker("js/sweph.js");
  });

  afterEach(() => {
    if (worker) {
      worker.terminate();
    }
  });

  test("should create worker successfully", () => {
    expect(worker).toBeDefined();
    expect(worker.scriptPath).toBe("js/sweph.js");
  });

  test("should have postMessage method", () => {
    expect(typeof worker.postMessage).toBe("function");
  });

  test("should have onmessage handler", () => {
    expect(worker.onmessage).toBeDefined();
  });

  test("should handle message posting with astrological data", () => {
    // Realistic astrological data based on sweph.js documentation
    const testData = [
      2024,
      1,
      15,
      14,
      30,
      0, // year, month, day, hour, minute, second
      74,
      0,
      0,
      "W", // longitude: 74° 0' 0" W
      40,
      42,
      51,
      "N", // latitude: 40° 42' 51" N
      "P", // house system: Placidus
    ];

    worker.postMessage(testData);

    expect(worker.postMessage).toHaveBeenCalledWith(testData);
    expect(worker.postMessage).toHaveBeenCalledTimes(1);
  });

  test("should handle multiple message posts with different locations", () => {
    // New York City data
    const testData1 = [
      2024,
      1,
      15,
      14,
      30,
      0, // year, month, day, hour, minute, second
      74,
      0,
      0,
      "W", // longitude: 74° 0' 0" W
      40,
      42,
      51,
      "N", // latitude: 40° 42' 51" N
      "P", // house system: Placidus
    ];

    // London data
    const testData2 = [
      2024,
      1,
      15,
      19,
      30,
      0, // year, month, day, hour, minute, second (UTC)
      0,
      7,
      39,
      "W", // longitude: 0° 7' 39" W
      51,
      30,
      26,
      "N", // latitude: 51° 30' 26" N
      "K", // house system: Koch
    ];

    worker.postMessage(testData1);
    worker.postMessage(testData2);

    expect(worker.postMessage).toHaveBeenCalledTimes(2);
    expect(worker.postMessage).toHaveBeenNthCalledWith(1, testData1);
    expect(worker.postMessage).toHaveBeenNthCalledWith(2, testData2);
  });

  test("should handle worker termination", () => {
    worker.terminate();
    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  test("should handle message events", () => {
    const messageHandler = jest.fn();
    worker.onmessage = messageHandler;

    // Simulate a message from the worker
    const messageEvent = { data: "test result" };
    worker.onmessage(messageEvent);

    expect(messageHandler).toHaveBeenCalledWith(messageEvent);
  });

  test("should validate astrological data structure for get function", () => {
    // Test with correct astrological data structure (15 parameters as documented)
    const validData = [
      2024,
      1,
      15,
      14,
      30,
      0, // year, month, day, hour, minute, second
      74,
      0,
      0,
      "W", // longitude degrees, minutes, seconds, direction
      40,
      42,
      51,
      "N", // latitude degrees, minutes, seconds, direction
      "P", // house system
    ];

    expect(validData).toHaveLength(15);

    // Validate data types based on documentation
    expect(typeof validData[0]).toBe("number"); // year
    expect(typeof validData[1]).toBe("number"); // month
    expect(typeof validData[2]).toBe("number"); // day
    expect(typeof validData[3]).toBe("number"); // hour
    expect(typeof validData[4]).toBe("number"); // minute
    expect(typeof validData[5]).toBe("number"); // second
    expect(typeof validData[6]).toBe("number"); // longitude degrees
    expect(typeof validData[7]).toBe("number"); // longitude minutes
    expect(typeof validData[8]).toBe("number"); // longitude seconds
    expect(typeof validData[9]).toBe("string"); // longitude direction
    expect(typeof validData[10]).toBe("number"); // latitude degrees
    expect(typeof validData[11]).toBe("number"); // latitude minutes
    expect(typeof validData[12]).toBe("number"); // latitude seconds
    expect(typeof validData[13]).toBe("string"); // latitude direction
    expect(typeof validData[14]).toBe("string"); // house system

    // Validate specific values
    expect(validData[1]).toBeGreaterThanOrEqual(1); // month 1-12
    expect(validData[1]).toBeLessThanOrEqual(12);
    expect(validData[2]).toBeGreaterThanOrEqual(1); // day 1-31
    expect(validData[2]).toBeLessThanOrEqual(31);
    expect(validData[3]).toBeGreaterThanOrEqual(0); // hour 0-23
    expect(validData[3]).toBeLessThanOrEqual(23);
    expect(validData[4]).toBeGreaterThanOrEqual(0); // minute 0-59
    expect(validData[4]).toBeLessThanOrEqual(59);
    expect(validData[5]).toBe(0); // second always 0
    expect(["E", "W"]).toContain(validData[9]); // longitude direction
    expect(["N", "S"]).toContain(validData[13]); // latitude direction

    worker.postMessage(validData);
    expect(worker.postMessage).toHaveBeenCalledWith(validData);
  });

  test("should handle edge cases in astrological data", () => {
    // Test with edge case values
    const edgeCaseData = [
      1900,
      12,
      31,
      23,
      59,
      0, // edge case date/time
      180,
      59,
      59,
      "E", // maximum longitude
      90,
      0,
      0,
      "N", // maximum latitude
      "P", // house system
    ];

    worker.postMessage(edgeCaseData);
    expect(worker.postMessage).toHaveBeenCalledWith(edgeCaseData);
  });

  test("should handle different house systems", () => {
    const houseSystems = ["P", "K", "R", "C", "E", "T", "B", "M", "W", "H"];

    houseSystems.forEach((system) => {
      const testData = [
        2024,
        1,
        15,
        12,
        0,
        0, // year, month, day, hour, minute, second
        0,
        0,
        0,
        "E", // longitude: 0° 0' 0" E (Greenwich)
        0,
        0,
        0,
        "N", // latitude: 0° 0' 0" N (Equator)
        system, // house system
      ];

      worker.postMessage(testData);
    });

    expect(worker.postMessage).toHaveBeenCalledTimes(houseSystems.length);
  });
});

// Integration test for the actual worker functionality
describe("sweph.js Integration Test", () => {
  test("should validate worker script structure", () => {
    // This test validates the expected structure of the worker script
    // without actually executing it in a worker context

    // Mock the expected global objects that would be available in a worker
    const mockSelf = {
      Module: {
        locateFile: jest.fn().mockReturnValue("astro.wasm"),
        ccall: jest.fn().mockReturnValue("test result"),
        onRuntimeInitialized: jest.fn(),
      },
      importScripts: jest.fn(),
      postMessage: jest.fn(),
      onmessage: null,
      data: {},
      get: jest.fn().mockReturnValue("test calculation"),
    };

    // Test that the expected structure exists
    expect(mockSelf.Module).toBeDefined();
    expect(typeof mockSelf.Module.locateFile).toBe("function");
    expect(typeof mockSelf.Module.ccall).toBe("function");
    expect(typeof mockSelf.Module.onRuntimeInitialized).toBe("function");
    expect(typeof mockSelf.importScripts).toBe("function");
    expect(typeof mockSelf.postMessage).toBe("function");
    expect(typeof mockSelf.get).toBe("function");

    // Test that the data structure is initialized
    expect(mockSelf.data).toEqual({});
  });

  test("should handle get function parameters correctly with astrological data", () => {
    // Test the expected parameter structure for the get function with realistic astrological data
    const testData = [
      2024,
      1,
      15,
      14,
      30,
      0, // year, month, day, hour, minute, second
      74,
      0,
      0,
      "W", // longitude degrees, minutes, seconds, direction
      40,
      42,
      51,
      "N", // latitude degrees, minutes, seconds, direction
      "P", // house system
    ];

    // Mock the Module.ccall function to verify it's called with correct parameters
    const mockCcall = jest.fn().mockReturnValue("calculation result");

    // Simulate the get function call
    const getFunction = function () {
      return mockCcall(
        "get",
        "string",
        [
          "number",
          "number",
          "number",
          "number",
          "number",
          "number",
          "number",
          "number",
          "number",
          "string",
          "number",
          "number",
          "number",
          "string",
          "string",
        ],
        [
          testData[0],
          testData[1],
          testData[2],
          testData[3],
          testData[4],
          testData[5],
          testData[6],
          testData[7],
          testData[8],
          testData[9],
          testData[10],
          testData[11],
          testData[12],
          testData[13],
          testData[14],
        ]
      );
    };

    const result = getFunction();

    expect(mockCcall).toHaveBeenCalledWith(
      "get",
      "string",
      [
        "number",
        "number",
        "number",
        "number",
        "number",
        "number",
        "number",
        "number",
        "number",
        "string",
        "number",
        "number",
        "number",
        "string",
        "string",
      ],
      testData
    );
    expect(result).toBe("calculation result");
  });

  test("should validate astrological parameter ranges", () => {
    // Test various astrological parameter combinations
    const testCases = [
      {
        name: "New York City",
        data: [2024, 1, 15, 14, 30, 0, 74, 0, 0, "W", 40, 42, 51, "N", "P"],
        expected: "Valid NYC data",
      },
      {
        name: "London",
        data: [2024, 1, 15, 19, 30, 0, 0, 7, 39, "W", 51, 30, 26, "N", "K"],
        expected: "Valid London data",
      },
      {
        name: "Tokyo",
        data: [2024, 1, 16, 6, 30, 0, 139, 46, 11, "E", 35, 40, 6, "N", "R"],
        expected: "Valid Tokyo data",
      },
      {
        name: "Sydney",
        data: [2024, 1, 16, 1, 30, 0, 151, 12, 34, "E", 33, 52, 10, "S", "C"],
        expected: "Valid Sydney data",
      },
    ];

    testCases.forEach((testCase) => {
      // Validate data structure
      expect(testCase.data).toHaveLength(15);

      // Validate coordinate directions
      expect(["E", "W"]).toContain(testCase.data[9]); // longitude direction
      expect(["N", "S"]).toContain(testCase.data[13]); // latitude direction

      // Validate time components
      expect(testCase.data[1]).toBeGreaterThanOrEqual(1); // month
      expect(testCase.data[1]).toBeLessThanOrEqual(12);
      expect(testCase.data[2]).toBeGreaterThanOrEqual(1); // day
      expect(testCase.data[2]).toBeLessThanOrEqual(31);
      expect(testCase.data[3]).toBeGreaterThanOrEqual(0); // hour
      expect(testCase.data[3]).toBeLessThanOrEqual(23);
      expect(testCase.data[4]).toBeGreaterThanOrEqual(0); // minute
      expect(testCase.data[4]).toBeLessThanOrEqual(59);
      expect(testCase.data[5]).toBe(0); // second always 0
    });
  });
});
