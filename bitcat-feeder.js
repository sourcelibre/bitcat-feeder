/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:false */
/*global */
/*forked from: https://gist.github.com/makevoid/edcb65b679ddbd8c69fd */


// Import modules
var request = require('request'); // https://github.com/request/request
var _ = require('underscore'); // docs: http://underscorejs.org/


// Variables
var BITCOIN_ADDRESS_TO_WATCH = '13Zr4ArhsSx31kEXqn88ob655yyqk1vHYq';
var loop_time  = 3000; // ms   (check every 3 sec)
var balance = null;


var trigger_food_dispenser = function()
{
  console.log("Address balance changed, new one is:", balance, "BTC");
  console.log("TODO: DO IT");
}


/**
 * Periodically checks how much bitcoin there are in the accound.
 */
var check_balance = function()
{
    // this version uses blockchain.info direct api
    // but I could've used blockr.io, chain.com or the
    // awesome bitcore-explorers library
    request('https://blockchain.info/q/addressbalance/' +
            BITCOIN_ADDRESS_TO_WATCH,
            function (error, response, body)
    {
        if (! error && response.statusCode == 200)
        {
            var satoshi = parseInt(body);
            var btc = satoshi * Math.pow(10, -8);
            var do_it = false;
            console.log("Balance is " + btc);
            // this is the simplest approach:
            // just check if the balance if different
            // you could check if the price is increased by X amount
            // or better if you got a transaction exactly of x btc
            if (balance != null && balance != btc)
            {
                do_it = true;
            }

            // TODO: different rules / behaviour when receiving a transaction
            // look at OP_RETURN json of the transactions for generic data
            // if possible and/or a specific satoshi amount for a specific
            // action (like a "view" that just a macro movement on the servo
            // [rotate 10, delay 1, rotate -10] - #code #programming) 
            balance = btc;

            if (do_it)
            {
                trigger_food_dispenser();
            }
        }
        _.delay(check_balance, loop_time);
        // this is like setTimeout(check_balance, loop_Time)
    })
}


var main = function()
{
    console.log("check_balance() initialized")
    console.log("Watching bitcoin address " + BITCOIN_ADDRESS_TO_WATCH);
    check_balance()
}


main()

