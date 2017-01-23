//
'use strict';
var NobleDevice = require('noble-device');

// UUIDs
var SmartConnectService_UUID = 'F05ABAC0393611E587A60002A5D5C51B';
var SmartConnectEnvData_UUID = 'F05ABAD0393611E587A60002A5D5C51B';
var SmartConnectEnvODR_UUID = 'F05ABAD1393611E587A60002A5D5C51B';

var SmartConnectLowBattery_UUID = 'F05ABADC393611E587A60002A5D5C51B';


var SmartConnect = function(peripheral){

	NobleDevice.call(this, peripheral);

	this.onEnvChangeBinded = this.onEnvChange.bind(this);
	this.onLowBatteryChangeBinded = this.onLowBatteryChange.bind(this);
};

SmartConnect.SCAN_UUIDS = [SmartConnectService_UUID];

/********************************************************/
SmartConnect.prototype.onEnvChange = function(data) {
	// Unpack data
	// These values are all in offset fixed format.
	var temperature = data.readInt16LE(0) * 0.01;  // ºC
	var pressure = data.readInt16LE(2) * 1.0;  // mbar
	var uv = data.readInt32LE(4) * 100000.0;  // lx
	var humidity = data.readInt8(8) * 1.0;  // %RH

	// emit data for listeners.
	this.emit('environmentChange', temperature, pressure, uv, humidity);
};

SmartConnect.prototype.notifyEnvironment = function(callback) {
	this.notifyCharacteristic(SmartConnectService_UUID, SmartConnectEnvData_UUID,
		true, this.onEnvChangeBinded, callback);
};

SmartConnect.prototype.unnotifyEnvironment = function(callback) {
	this.notifyCharacteristic(SmartConnectService_UUID, SmartConnectEnvData_UUID,
		false, this.onEnvChangeBinded, callback);
};

SmartConnect.prototype.setEnvionmentDataRate = function(rate, callback) {
	// Data is index of values.
	// We want the slowest, which is index 0 for 1Hz sampling.
	this.writeUint8Characteristic(SmartConnectService_UUID, SmartConnectEnvODR_UUID, 0, callback);
};

/********************************************************/
SmartConnect.prototype.onLowBatteryChange = function() {
	this.emit('lowBattery');
};

SmartConnect.prototype.notifyLowBattery = function(callback) {
	this.notifyCharacteristic(SmartConnectService_UUID, SmartConnectLowBattery_UUID,
		true, this.onLowBatteryChangeBinded, callback);
};

SmartConnect.prototype.unnotifyLowBattery = function(callback) {
	this.notifyCharacteristic(SmartConnectService_UUID, SmartConnectLowBattery_UUID,
		false, this.onLowBatteryChangeBinded, callback);
};

/********************************************************/
// inherit noble device
NobleDevice.Util.inherits(SmartConnect, NobleDevice);

// you can mixin other existing service classes here too,
// noble device provides battery and device information,
// add the ones your device provides

// XXX looks like Atmel didn't use the BatteryService Standard for this demo.
//NobleDevice.Util.mixin(SmartConnect, NobleDevice.BatteryService);

NobleDevice.Util.mixin(SmartConnect, NobleDevice.DeviceInformationService);

// export your device
module.exports = SmartConnect;


//	vim: set sw=4 ts=4 :
