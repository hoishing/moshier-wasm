# Test Suite for moshier-wasm

This directory contains tests for the moshier-wasm project, specifically testing the `sweph.js` web worker functionality.

## Test Files

### `sweph.test.js`

Comprehensive test suite for the `sweph.js` web worker that interfaces with the WASM module.

#### Test Coverage

**Web Worker Basic Functionality:**

- Worker creation and initialization
- Message posting and handling
- Worker termination
- Event handling (message events)

**Data Structure Validation:**

- Validates the expected 15-parameter data structure for the `get` function
- Tests edge cases with realistic astrological data
- Ensures correct parameter types (numbers and strings)
- Validates coordinate directions and time ranges

**Integration Testing:**

- Validates the worker script structure without executing in a worker context
- Tests the `get` function parameter handling
- Mocks the WASM module's `ccall` function to verify correct parameter passing

### `example-usage.js`

Example implementation showing how to use the `sweph.js` web worker in a real application.

## Running Tests

```bash
npm test
```

## Test Environment

The tests run in a Node.js environment using Jest. Since web workers are browser-specific, the tests use mocks to simulate worker behavior.

## Key Testing Considerations

1. **Worker Mocking**: The tests mock the `Worker` constructor to simulate web worker behavior in a Node.js environment.

2. **Parameter Validation**: The `get` function expects exactly 15 parameters with specific types:
   - Parameters 0-5: Date/time (year, month, day, hour, minute, second)
   - Parameters 6-9: Longitude (degrees, minutes, seconds, direction)
   - Parameters 10-13: Latitude (degrees, minutes, seconds, direction)
   - Parameter 14: House system (string)

3. **WASM Integration**: The tests mock the `Module.ccall` function to verify that the correct parameters are passed to the WASM module.

4. **Error Handling**: Tests cover basic error scenarios and message handling.

## Expected Data Structure

The `get` function in `sweph.js` expects an array with 15 elements for astrological calculations:

```javascript
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
```

### Common House Systems

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

## Usage Example

```javascript
import { createSwephWorker, calculateAstrologicalChart } from './tests/example-usage.js';

const worker = createSwephWorker();

// Calculate chart for New York City
const data = {
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
  houseSystem: "P" // Placidus
};

calculateAstrologicalChart(worker, data);
```

## Test Data Examples

The tests include realistic astrological data for various locations:

- **New York City**: 74° 0' 0" W, 40° 42' 51" N
- **London**: 0° 7' 39" W, 51° 30' 26" N
- **Tokyo**: 139° 46' 11" E, 35° 40' 6" N
- **Sydney**: 151° 12' 34" E, 33° 52' 10" S

## Notes

- The tests are designed to work in a Node.js environment and use mocks for browser-specific APIs
- Real web worker functionality would require a browser environment
- The WASM module integration is mocked to focus on testing the JavaScript interface
- All time parameters are validated for proper ranges (months 1-12, hours 0-23, etc.)
- Coordinate directions are validated to be either "E"/"W" for longitude and "N"/"S" for latitude
