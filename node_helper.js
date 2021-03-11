const mqtt = require("mqtt");
const NodeHelper = require("node_helper");

var servers = [];

module.exports = NodeHelper.create({
  log: function (...args) {
    if (this.config.logging) {
      console.log(args);
    }
  },

  start: function () {
    console.log(this.name + ": Starting node helper");
    this.loaded = false;
  },

  makeServerKey: function (server) {
    return "" + server.address + ":" + (server.port | ("1883" + server.user));
  },

  addServer: function (server) {
    console.log(this.name + ": Adding server: ", server);
    var serverKey = this.makeServerKey(server);
    var mqttServer = {};
    var foundServer = false;
    for (i = 0; i < servers.length; i++) {
      if (servers[i].serverKey === serverKey) {
        mqttServer = servers[i];
        foundServer = true;
      }
    }
    if (!foundServer) {
      mqttServer.serverKey = serverKey;
      mqttServer.address = server.address;
      mqttServer.port = server.port;
      mqttServer.options = {};
      mqttServer.topics = [];
      mqttServer.payloads = [];
      if (server.user) mqttServer.options.username = server.user;
      if (server.password) mqttServer.options.password = server.password;
    }

    for (i = 0; i < server.subscriptions.length; i++) {
      mqttServer.topics.push(server.subscriptions[i].topic);
      mqttServer.payloads.push(server.subscriptions[i].payload);
    }

    servers.push(mqttServer);
    this.startClient(mqttServer);
  },

  addConfig: function (config) {
    for (i = 0; i < config.mqttServers.length; i++) {
      this.addServer(config.mqttServers[i]);
    }
  },

  startClient: function (server) {
    console.log(this.name + ": Starting client for: ", server);

    var self = this;

    var mqttServer =
      (server.address.match(/^mqtts?:\/\//) ? "" : "mqtt://") + server.address;
    if (server.port) {
      mqttServer = mqttServer + ":" + server.port;
    }
    console.log(self.name + ": Connecting to " + mqttServer);

    server.client = mqtt.connect(mqttServer, server.options);

    server.client.on("error", function (err) {
      console.log(self.name + " " + server.serverKey + ": Error: " + err);
    });

    server.client.on("reconnect", function (err) {
      server.value = "reconnecting"; // Hmmm...
      console.log(self.name + ": " + server.serverKey + " reconnecting");
    });

    server.client.on("connect", function (connack) {
      console.log(self.name + " connected to " + mqttServer);
      console.log(self.name + ": subscribing to " + server.topics);
      server.client.subscribe(server.topics);
    });

    server.client.on("message", (topic, payload) => {

      // just to make sure... (but should also work only with subscribe selection)
      if (server.topics.includes(topic) && server.payloads.includes(payload.toString())) {
        // add some debug information
        console.log(self.name + ": MQTT EXIT message detected");
        console.log(self.name + ": intentional stopping server");

        // kill server
        process.exit(1);
      }

      this.sendSocketNotification("MQTT_PAYLOAD", {
        serverKey: server.serverKey,
        topic: topic,
        value: payload.toString(),
        time: Date.now(),
      });
    });
  },

  socketNotificationReceived: function (notification, payload) {
    var self = this;
    if (notification === "MQTT_CONFIG") {
      var config = payload;
      self.addConfig(config);
      self.loaded = true;
    }
  },
});
