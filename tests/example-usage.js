/**
 * Example usage of the sweph.js web worker
 * This demonstrates how to use the web worker in a real application
 */

// Example of how to use the sweph.js web worker
function createSwephWorker() {
  // Create a new web worker
  const worker = new Worker("js/sweph.js");

  // Set up message handler to receive results from the worker
  worker.onmessage = function (event) {
    console.log("Received result from worker:", event.data);
    // Handle the calculation result here
  };

  // Set up error handler
  worker.onerror = function (error) {
    console.error("Worker error:", error);
  };

  return worker;
}

// Example function to call the get function with astrological data
function calculateAstrologicalChart(worker, chartData) {
  // The get function expects 15 parameters as documented in sweph.js:
  // - 6 numbers: year, month, day, hour, minute, second
  // - 4 values: longitude degrees, minutes, seconds, direction ("E" or "W")
  // - 4 values: latitude degrees, minutes, seconds, direction ("N" or "S")
  // - 1 string: house system (e.g., "P" for Placidus, "K" for Koch, etc.)

  const calculationData = [
    chartData.year || 2024,
    chartData.month || 1,
    chartData.day || 15,
    chartData.hour || 12,
    chartData.minute || 0,
    0, // second (always 0 - not needed for accuracy)
    chartData.longitudeDegrees || 0,
    chartData.longitudeMinutes || 0,
    chartData.longitudeSeconds || 0,
    chartData.longitudeDirection || "E", // "E" or "W"
    chartData.latitudeDegrees || 0,
    chartData.latitudeMinutes || 0,
    chartData.latitudeSeconds || 0,
    chartData.latitudeDirection || "N", // "N" or "S"
    chartData.houseSystem || "P", // house system
  ];

  // Send data to the worker
  worker.postMessage(calculationData);
}

// Example usage with New York City data
function exampleUsage() {
  const worker = createSwephWorker();

  // Wait for worker to be ready
  setTimeout(() => {
    // Calculate chart for New York City
    calculateAstrologicalChart(worker, {
      year: 2024,
      month: 1,
      day: 15,
      hour: 14,
      minute: 30,
      longitudeDegrees: 74,
      longitudeMinutes: 0,
      longitudeSeconds: 0,
      longitudeDirection: "W",
      latitudeDegrees: 40,
      latitudeMinutes: 42,
      latitudeSeconds: 51,
      latitudeDirection: "N",
      houseSystem: "P", // Placidus
    });
  }, 100);

  // Clean up when done
  setTimeout(() => {
    worker.terminate();
  }, 5000);
}

// Example with different locations and house systems
function calculateMultipleCharts() {
  const worker = createSwephWorker();

  const charts = [
    {
      name: "New York City",
      data: {
        year: 2024,
        month: 1,
        day: 15,
        hour: 14,
        minute: 30,
        longitudeDegrees: 74,
        longitudeMinutes: 0,
        longitudeSeconds: 0,
        longitudeDirection: "W",
        latitudeDegrees: 40,
        latitudeMinutes: 42,
        latitudeSeconds: 51,
        latitudeDirection: "N",
        houseSystem: "P", // Placidus
      },
    },
    {
      name: "London",
      data: {
        year: 2024,
        month: 1,
        day: 15,
        hour: 19,
        minute: 30,
        longitudeDegrees: 0,
        longitudeMinutes: 7,
        longitudeSeconds: 39,
        longitudeDirection: "W",
        latitudeDegrees: 51,
        latitudeMinutes: 30,
        latitudeSeconds: 26,
        latitudeDirection: "N",
        houseSystem: "K", // Koch
      },
    },
    {
      name: "Tokyo",
      data: {
        year: 2024,
        month: 1,
        day: 16,
        hour: 6,
        minute: 30,
        longitudeDegrees: 139,
        longitudeMinutes: 46,
        longitudeSeconds: 11,
        longitudeDirection: "E",
        latitudeDegrees: 35,
        latitudeMinutes: 40,
        latitudeSeconds: 6,
        latitudeDirection: "N",
        houseSystem: "R", // Regiomontanus
      },
    },
  ];

  let chartIndex = 0;
  const sendNextChart = () => {
    if (chartIndex < charts.length) {
      const chart = charts[chartIndex];
      console.log(`Calculating chart for ${chart.name}...`);
      calculateAstrologicalChart(worker, chart.data);
      chartIndex++;
      setTimeout(sendNextChart, 1000); // Send next chart after 1 second
    } else {
      worker.terminate();
    }
  };

  setTimeout(sendNextChart, 100);
}

// Export for use in tests or other modules
export {
  createSwephWorker,
  calculateAstrologicalChart,
  exampleUsage,
  calculateMultipleCharts,
};

// Example of the expected data structure for the get function:
/*
The get function in sweph.js expects an array with 15 elements:

[
  year,                    // Parameter 0: Year (number)
  month,                   // Parameter 1: Month (number, 1-12)
  day,                     // Parameter 2: Day (number)
  hour,                    // Parameter 3: Hour (number, 0-23)
  minute,                  // Parameter 4: Minute (number, 0-59)
  second,                  // Parameter 5: Second (number, always 0 - not needed for accuracy)
  longitudeDegrees,        // Parameter 6: Longitude degrees (number)
  longitudeMinutes,        // Parameter 7: Longitude minutes (number)
  longitudeSeconds,        // Parameter 8: Longitude seconds (number)
  longitudeDirection,      // Parameter 9: Longitude direction (string, "E" or "W")
  latitudeDegrees,         // Parameter 10: Latitude degrees (number)
  latitudeMinutes,         // Parameter 11: Latitude minutes (number)
  latitudeSeconds,         // Parameter 12: Latitude seconds (number)
  latitudeDirection,       // Parameter 13: Latitude direction (string, "N" or "S")
  houseSystem              // Parameter 14: House system (string, e.g., "P" for Placidus)
]

Common house systems:
- "P" = Placidus
- "K" = Koch
- "R" = Regiomontanus
- "C" = Campanus
- "E" = Equal House
- "T" = Topocentric
- "B" = B (Bianchini)
- "M" = Meridian
- "W" = Whole Sign
- "H" = Horizontal

The worker will:
1. Receive this data via postMessage
2. Store it in self.data
3. Call the WASM module's get function with these parameters
4. Return the calculation result via postMessage back to the main thread
*/
