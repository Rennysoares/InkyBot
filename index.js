/**
 * @license
 * InkyBot v0.6.5
 * Copyright 2024 rennysoares and other contributors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import connectInky from './src/connection.js';

/**
 * Socket configured to render the QR code or pairing code.
 */

async function startInky() {

    try{
        await connectInky()
    } catch (error){
        console.error('Execution error:', error)
    }
    
}

startInky();
