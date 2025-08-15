# Browser Testing with Puppeteer

This document describes the browser-based testing setup for the Moshier WASM project using Puppeteer.

## Overview

The browser tests run the actual `astro.wasm` module in a real browser environment, testing the complete functionality including:

- Web Worker creation and communication
- WASM module loading and execution
- Actual astrological calculations
- Performance benchmarks
- Error handling and recovery

## Test Structure

### Basic Tests (`browser-tests.html`)

- Worker creation and basic communication
- WASM module loading
- Simple astrological calculations
- Multiple house systems
- Different geographic locations
- Error handling

### Advanced Tests (`browser-advanced-tests.html`)

- Calculation result validation
- House system comparison
- Performance benchmarking
- Geographic accuracy testing
- Date range validation
- Memory usage monitoring
- Error recovery testing

## Running the Tests

### Prerequisites

Install the required dependencies:

```bash
npm install
```

### Run Browser Tests Only

```bash
npm run test:browser
```

### Run All Tests (Node.js + Browser)

```bash
npm run test:all
```

### Run Node.js Tests Only

```bash
npm run test
```

## Test Architecture

### Browser Test Runner (`browser-test-runner.js`)

- Starts an Express server to serve static files
- Launches Puppeteer browser instance
- Runs both basic and advanced test suites
- Aggregates and reports results

### Test Framework

The browser tests use a custom test framework that:

- Runs tests sequentially in the browser
- Measures performance metrics
- Provides detailed error reporting
- Supports async/await test functions

## Test Data Format

The tests use the standard 15-parameter format for astrological calculations:

```javascript
[
  year,                    // Parameter 0: Year (number)
  month,                   // Parameter 1: Month (number, 1-12)
  day,                     // Parameter 2: Day (number)
  hour,                    // Parameter 3: Hour (number, 0-23)
  minute,                  // Parameter 4: Minute (number, 0-59)
  second,                  // Parameter 5: Second (number, always 0)
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

## Supported House Systems

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

## Performance Expectations

The tests include performance benchmarks with the following expectations:

- Average calculation time: < 5 seconds
- Memory usage: Stable across multiple calculations
- Worker creation: < 1 second
- WASM module loading: < 10 seconds

## Error Handling

The tests verify that the system handles various error conditions gracefully:

- Invalid or incomplete input data
- Invalid coordinates
- Invalid house systems
- Network errors during WASM loading
- Worker communication failures

## Debugging

### View Test Results in Browser

To see the test results visually, you can open the test HTML files directly in a browser:

1. Start the test server manually:

   ```bash
   node tests/browser-test-runner.js
   ```

2. Open the URLs shown in the console output in your browser

### Enable Puppeteer Debug Mode

To run tests with visible browser window, modify `browser-test-runner.js`:

```javascript
this.browser = await puppeteer.launch({
  headless: false, // Change from 'new' to false
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

### Console Logging

The test runner captures and displays console output from the browser, including:

- Test progress
- Calculation results
- Error messages
- Performance metrics

## CI/CD Integration

The browser tests are designed to work in CI/CD environments:

- Headless browser execution
- Proper exit codes for test failures
- Timeout handling for long-running calculations
- Resource cleanup after tests complete

## Troubleshooting

### Common Issues

1. **WASM Loading Failures**
   - Ensure `astro.wasm` file exists in `js/` directory
   - Check that the server serves WASM files with correct MIME type

2. **Worker Creation Failures**
   - Verify `sweph.js` file exists and is accessible
   - Check browser console for JavaScript errors

3. **Timeout Errors**
   - Increase timeout values in test configuration
   - Check system resources (CPU, memory)
   - Verify network connectivity for WASM loading

4. **Puppeteer Installation Issues**
   - On Linux, ensure required dependencies are installed
   - On macOS, ensure Xcode command line tools are installed
   - Try running with `--no-sandbox` flag

### Debug Commands

```bash
# Run with verbose logging
DEBUG=puppeteer:* npm run test:browser

# Run single test file
node tests/browser-test-runner.js --single-file browser-tests.html

# Run with custom timeout
node tests/browser-test-runner.js --timeout 120000
```

## Future Enhancements

Potential improvements to the browser testing setup:

1. **Visual Regression Testing**
   - Screenshot comparison for UI components
   - Chart rendering validation

2. **Cross-Browser Testing**
   - Firefox, Safari, Edge support
   - Mobile browser testing

3. **Load Testing**
   - Concurrent calculation testing
   - Memory leak detection

4. **Integration Testing**
   - End-to-end user workflow testing
   - API integration testing
