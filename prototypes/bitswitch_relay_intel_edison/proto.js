/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:false */
/*global */
/*forked from: https://gist.github.com/makevoid/edcb65b679ddbd8c69fd */

var mraa = require('mraa');     
var request = require('request') // https://github.com/request/request
var _ = require('underscore')    // docs: http://underscorejs.org/

var addr2watch = '19e2eU15xKbM9pyDwjFsBJFaSeKoDxp8YT' // bitcoin address to watch 
//var loop_time  = 10000 // ms (check every 10 sec)
var loop_time  = 3000  // ms   (check every 3 sec)
var balance    = null
var relayPin   = new mraa.Gpio(13)

var check_balance = function(){
  // this version uses blockchain.info direct api - but I could've used blockr.io, chain.com or the awesome bitcore-explorers library
  request('https://blockchain.info/q/addressbalance/'+addr2watch, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var satoshi = parseInt(body)
      var btc = satoshi*Math.pow(10, -8)
      
      // this is the simplest approach, just check if the balance if different
      // you could check if the price is increased by X amount or better if you got a transaction exactly of x btc
      if (balance && balance != btc)
        activate()

      // TODO: different rules / behaviour when receiving a transaction - look at OP_RETURN json of the transactions for generic data if possible and/or a specific satoshi amount for a specific action (like a "view" that just a macro movement on the servo [rotate 10, delay 1, rotate -10] - #code #programming) 

      balance = btc
    }
    _.delay(check_balance, loop_time) // this is like setTimeout(check_balance, loop_Time)
  })
}

var activate = function() {
  console.log("Address balance changed, new one is:", balance, "BTC")
  console.log("Servo motor moving")
  relayPin.write(0) // set the servo to rotation degrees 0 (starting position)
  setTimeout(function(){
    relayPin.write(1)  // set the servo to rotation max (or turns a light on, or releases a product from a vending machine)
  }, 2000)
  setTimeout(function(){
    relayPin.write(0); 
  }, 6000)
  // TODO: use _.delay - also check if it's possible to use arduino's delay - https://learn.sparkfun.com/tutorials/galileo-experiment-guide/sik-galileo---part-8-driving-a-servo-motor
  // moves to (45?) degrees, waits 4 seconds, moves back to 0
}

var main = function() {
  console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the Intel XDK console
  relayPin.dir(mraa.DIR_OUT);
  relayPin.write(1);  // I have my relay as normally open (NO), so this pin is set to 1 (high)
  
  console.log("check_balance() initialized")
  check_balance()
}


main()
