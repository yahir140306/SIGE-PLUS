// Processor for Artillery - Custom hooks and data generation

module.exports = {
  setup: function (context, ee, next) {
    // Called once at the start
    console.log("Starting Artillery load test...");
    next();
  },

  generateId: function (context, ee, next) {
    // Generate random folio for payment tests
    context.vars.folio = `RCB-${Math.floor(Math.random() * 10000000)}`;
    context.vars.timestamp = Date.now();
    next();
  },

  processResponse: function (requestParams, response, context, ee, next) {
    // Check if response includes expected data
    if (response.statusCode === 200) {
      try {
        const body = JSON.parse(response.body);
        if (body.success === false) {
          console.warn(`API returned success=false: ${JSON.stringify(body)}`);
        }
      } catch (e) {
        // Non-JSON response
      }
    }
    next();
  },

  cleanup: function (context, ee, next) {
    // Called at the end
    console.log("Artillery load test completed.");
    next();
  },
};
