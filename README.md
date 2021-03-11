# MQTT-Exit

Module for [MagicMirror](https://github.com/MichMich/MagicMirror/) stopping the magic mirror server when receiving specific messages.

## Installation

Go to `MagicMirror/modules` and write
```bash
    git clone https://github.com/JonasGoebel/MMM-MQTT-Exit
    cd MMM-MQTT-Exit
    npm install
```
## Configuration

Here is an example configuration with description. Put it in the `MagicMirror/config/config.js` file:

```javascript
{
    module: 'MMM-MQTT-Exit',
    config: {
        logging: false,
        useWildcards: false,
        mqttServers: [
            {
                address: 'localhost',  // Server address or IP address
                port: '1883',          // Port number if other than default
                user: 'user',          // Leave out for no user
                password: 'password',  // Leave out for no password
                subscriptions: [
                    {
                        topic: 'server/1/',         // topic to look for
                        payload: 'exit'             // message to listen to (String format)
                    },
                    {
                        topic: 'my/custom/topic',   // topic to look for
                        payload: 'myCustomMessage'  // message to listen to (String format)
                    }
                ]
            }
        ],
    }
}
```

## WHY?
Some modules need a camera attached in order to work (for example [MMM-Facial-Recognition](https://github.com/JonasGoebel/MMM-Facial-Recognition)). Running another program that needs the same camera while the mirror is running causes the second program to fail.  
In order to use the second program, I'll stop the magic mirror, run the second program and start it again.  
I've tested this installation inside a [Docker container](https://hub.docker.com/r/bastilimbach/docker-magicmirror/).  


## Fork

MMM-MQTT-Exit is a fork of the [MMM-MQTT project](https://github.com/ottopaulsen/MMM-MQTT) from [Otto Paulsen](https://github.com/ottopaulsen).  

## Collaborate

Pull requests are welcome.