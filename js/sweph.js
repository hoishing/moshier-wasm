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
// second (number, always 0 - not needed for accuracy)
// longitude degrees (number)
// longitude minutes (number)
// longitude seconds (number)
// longitude direction (string, "E" or "W")
// latitude degrees (number)
// latitude minutes (number)
// latitude seconds (number)
// latitude direction (string, "N" or "S")
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
      self.data[0],
      self.data[1],
      self.data[2],
      self.data[3],
      self.data[4],
      self.data[5],
      self.data[6],
      self.data[7],
      self.data[8],
      self.data[9],
      self.data[10],
      self.data[11],
      self.data[12],
      self.data[13],
      self.data[14],
    ]
  );
  return calc;
};
