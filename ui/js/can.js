
const Can = require('@csllc/cs-pcan-usb');

window.addEventListener('DOMContentLoaded', () => {

    let can = new Can({
        canRate: 50000,
    });

    deviceCardService.setCan(can)

    console.log('Create CAN instance done.');

    console.log('List CAN ports ...');

    can.list().then((ports) => {

        console.log(ports);

        if (ports.length === 0) {
            return null;
        }

        return can.open(ports[0].path)
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
    })
    .then(() => {
        // can.write({ id: 0x10EF8001,
        //             ext: true,
        //             buf: Buffer.from([0x45, 0x00, 0x00, 0x04, 0x00, 0x00]) });
    })
    .catch((err) => {
        console.error(err);
        can.close();
        process.exit(1);
    });

    console.log('List CAN ports done.');

    let msgCount = 0;

    can.on('data', function(msg) {

        //console.log('deviceCardService: ' + deviceCardService);
        //console.log('onData - on can data');

        msgCount++;
        //logMessage(msgCount, msg);

        // 0x3F == 0011 1111b (= lower 6 bit store the device can address)
        let deviceCanAddress = msg.id & 0x3F;

        // 0x7C0 == 0111 1100 0000b (upper 5 bit store the device type and the message type bit (= bit 8))
        let deviceType = msg.id & 0x7C0;
        deviceType = deviceType >>> 6;

        //console.log('deviceCardService: ' + deviceCardService);

        // hand the can message over to the deviceCardService
        deviceCardService.onCanMessage(deviceType, deviceCanAddress, msg);

    });
});

function logMessage(msgCount, msg) {

    //console.log('');
    //console.log('CAN onData(). #' + msgCount);

    // output the message as json string
    // console.log(JSON.stringify(msg, (key, value) => {
    //     if ((typeof value === 'number') && (key == "id")) {
    //         return value.toString(16).toUpperCase().padStart(8, '0');
    //     } else if (typeof value === 'number') {
    //         return value.toString(16).toUpperCase().padStart(2, '0');
    //     } else {
    //         return value;
    //     }
    // }));

    let id = msg.id;

    deviceType = id & 0x7C0;
    deviceType = deviceType >>> 6;

    switch (deviceType) {

    case 3:
        console.log("[DEVICE TYPE   ] RWS (Control/Steuer) Message)");
        break;

    case 7:
        console.log("[DEVICE TYPE   ] RWS (Lifetime Message)");
        break;

    case 19:
        console.log("[DEVICE TYPE   ] DCU Light (Control/Steuer) Message)");
        break;

    case 23:
        console.log("[DEVICE TYPE   ] DCU Light (Lifetime Message) Message)");
        break;

    default:
        console.log("Unknown Device Type: " + deviceType);
        break;
    }

    deviceCanAddress = id & 0x3F;
    console.log("[DEVICE ADDRESS] Device CAN Address: " + deviceCanAddress);

    let buffer = msg.buf;
    let byte_0 = buffer[0];
    let rwsLockState = byte_0 & 0x0F;

    switch (rwsLockState) {

    case 0:
        console.log("[LOCK          ] UNLOCKED / [SCHLOSS] ENTRIEGELT");
        break;

    case 1:
        console.log("[LOCK          ] ZSU / [SCHLOSS] ZSU (Zeitschaltuhr)");
        break;

    case 2:
        console.log("[LOCK          ] PRELOCKED / [SCHLOSS] VORVERRIEGELT");
        break;

    case 3:
        console.log("[LOCK          ] LOCKED / [SCHLOSS] VERRIEGELT");
        break;

    case 4:
        console.log("[LOCK          ] EMA / [SCHLOSS] EMA (Einbruchmeldeanlage)");
        break;

    case 5:
        console.log("[LOCK          ] KZF / [SCHLOSS] KZF (Kurzzeitfreigabe)");
        break;

    case 6:
        console.log("[LOCK          ] Service / [SCHLOSS] Service");
        break;

    case 7:
        console.log("[LOCK          ] RUN ALARM / [SCHLOSS] RUN ALARM");
        break;

    case 8:
        console.log("[LOCK          ] RUN STOERUNG / [SCHLOSS] RUN STOERUNG");
        break;

    case 9:
        console.log("[LOCK          ] AKTIV SCHLEUSE / [SCHLOSS] AKTIV SCHLEUSE");
        break;

    case 10:
        console.log("[LOCK          ] PASSIV SCHLEUSE (passiv) / [SCHLOSS] PASSIV SCHLEUSE (passiv)");
        break;

    case 11:
        console.log("[LOCK          ] PASSIV SCHLEUSE (belegt) / [SCHLOSS] PASSIV SCHLEUSE (belegt)");
        break;

    default:
        console.log("[LOCK          ] Unknown RWS Lock state!");
        break;

    }

    let rwsDoorState = byte_0 & 0x10;
    console.log(rwsDoorState ? '[DOOR          ] CLOSED' : '[DOOR          ] OPEN');

    let rwsDoorPreAlarm = byte_0 & 0x20;
    console.log(rwsDoorPreAlarm ? '[PREALARM      ] PREALARM' : '[PREALARM      ] NO PREALARM');

    let rwsMasterFunction = byte_0 & 0x40;
    console.log(rwsMasterFunction ? '[MASTER-FUNC   ] ACTIVE' : '[MASTER-FUNC   ] NOT ACTIVE');

    // Rückmeldung verriegelung
    let rwsFeedbackLocking = byte_0 & 0x80;
    console.log(rwsFeedbackLocking ? '[FEEDBACK LOCK ] ACTIVE' : '[FEEDBACK LOCK ] NOT ACTIVE');

  }
