self.Module = {
  locateFile: function (s) {
    // In worker context, we need to provide the full path
    if (s.endsWith(".wasm")) {
      return "astro.wasm";
    }
    return s;
  },
  // Add this function
  onRuntimeInitialized: function () {
    var query = get();
    postMessage(query);
  },
};

self.importScripts("astro.js");

self.data = {};

// to pass data from the main JS file
self.onmessage = function (messageEvent) {
  self.data = messageEvent.data; // save the data
};

// self.data is an array of the following:
// year (number)
// month (number, 1-12)
// day (number)
// hour (number, 0-23)
// minute (number, 0-59)
// longitude (number, float degrees, negative for West)
// latitude (number, float degrees, negative for South)
// house system (string, e.g., "P" for Placidus)
self.get = function () {
  var calc = self.Module.ccall(
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
      "string",
    ],
    [
      self.data[0],
      self.data[1],
      self.data[2],
      self.data[3],
      self.data[4],
      self.data[5],
      self.data[6],
      self.data[7],
    ]
  );
  return calc;
};
