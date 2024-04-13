/**
 * @license
 * InkyBot v0.4.3
 * Copyright 2024 rennysoares and other contributors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

const connectInky = require('./src/connection/connection')

/**
 * Socket configured to render the QR code for connection by node.
 * 
 * TODO: Thought the 'src/config/config.js' file, create a boolean key
 * in the 'configBot' constant for session creation by pairing code.
 */

async function startInky() {

    try{
        await connectInky()
    } catch (error){
        console.error('Execution error:', error)
    }
    
}

startInky();
