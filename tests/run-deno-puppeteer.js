#!/usr/bin/env bun

import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { readFileSync } from 'fs';

const SERVER_PORT = 8000;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;
const TEST_URL = `${SERVER_URL}/test.html`;

// Load and display input data
const inputData = JSON.parse(readFileSync('./input_data.json', 'utf8'));
console.log('='.repeat(60));
console.log('ASTROLOGICAL CALCULATION TEST');
console.log('='.repeat(60));
console.log('Input Data:');
console.log(`  Birth Date: ${inputData.month}/${inputData.day}/${inputData.year} at ${inputData.hour}:${inputData.minute.toString().padStart(2, '0')}`);
console.log(`  Location: ${inputData.latitude}°N, ${inputData.longitude}°E`);
console.log(`  House System: ${inputData.house} (Placidus)`);
console.log('='.repeat(60));

async function startDenoServer() {
    return new Promise((resolve, reject) => {
        console.log('Starting Deno HTTP server...');
        
        const serverProcess = spawn('deno', ['run', '--allow-net', '--allow-read', 'server.ts'], {
            cwd: process.cwd(),
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let serverReady = false;

        serverProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('Server:', output.trim());
            
            if (output.includes('Starting Deno HTTP server') && !serverReady) {
                serverReady = true;
                // Give server a moment to fully start
                setTimeout(() => resolve(serverProcess), 1000);
            }
        });

        serverProcess.stderr.on('data', (data) => {
            console.error('Server Error:', data.toString().trim());
        });

        serverProcess.on('error', (error) => {
            reject(new Error(`Failed to start Deno server: ${error.message}`));
        });

        serverProcess.on('exit', (code) => {
            if (code !== 0 && !serverReady) {
                reject(new Error(`Deno server exited with code ${code}`));
            }
        });

        // Timeout if server doesn't start
        setTimeout(() => {
            if (!serverReady) {
                serverProcess.kill();
                reject(new Error('Server startup timeout'));
            }
        }, 10000);
    });
}

async function runPuppeteerTest(serverProcess) {
    console.log('Launching Puppeteer...');
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging from the page
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error') {
            console.error(`Browser Error: ${text}`);
        } else if (type === 'log' && text.includes('Worker result received')) {
            console.log(`Browser: ${text}`);
        }
    });

    // Handle page errors
    page.on('pageerror', error => {
        console.error('Page Error:', error.message);
    });

    try {
        console.log(`Navigating to: ${TEST_URL}`);
        await page.goto(TEST_URL, { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 
        });

        console.log('Waiting for calculation results...');
        
        // Wait for either success or error result
        const result = await Promise.race([
            // Wait for successful result
            page.waitForSelector('#result[style*="block"]', { timeout: 30000 })
                .then(() => page.evaluate(() => document.getElementById('result-content').textContent)),
            
            // Wait for error
            page.waitForSelector('#error[style*="block"]', { timeout: 30000 })
                .then(() => page.evaluate(() => {
                    const errorContent = document.getElementById('error-content').textContent;
                    throw new Error(`Calculation failed: ${errorContent}`);
                }))
        ]);

        console.log('\n' + '='.repeat(60));
        console.log('CALCULATION RESULT:');
        console.log('='.repeat(60));
        console.log(result);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\nCalculation failed:', error.message);
        
        // Get current page status for debugging
        try {
            const status = await page.evaluate(() => document.getElementById('status').textContent);
            console.log('Current status:', status);
        } catch (e) {
            // Ignore if page is unresponsive
        }
    } finally {
        await browser.close();
    }
}

async function main() {
    let serverProcess;
    
    try {
        serverProcess = await startDenoServer();
        await runPuppeteerTest(serverProcess);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        if (serverProcess) {
            console.log('Stopping Deno server...');
            serverProcess.kill();
        }
    }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    process.exit(0);
});

main();