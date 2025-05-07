/**
 * Server Availability Check
 *
 * This script checks if the server is available and provides fallback mechanisms
 * for when the server is not available.
 */

window._serverAvailable = true;

async function checkServerAvailability() {
    try {


        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        const response = await fetch(`/api/recipes?timestamp=${timestamp}&random=${random}`, {
            method: 'GET',

            headers: { 'Cache-Control': 'no-cache' }
        });

        window._serverAvailable = true;
        return true;
    } catch (error) {

        window._serverAvailable = false;
        console.log('Server appears to be unavailable - some features will be simulated');
        return false;
    }
}

async function safeFetch(url, options = {}) {

    if (!window._serverAvailable) {
        console.log(`Server unavailable - simulating response for: ${url}`);
        return new Response(JSON.stringify({
            success: true,
            simulated: true,
            message: "This is a simulated response because the server is unavailable"
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        return await fetch(url, options);
    } catch (error) {
        console.log(`Error fetching ${url}: ${error.message}`);

        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            message: "Error occurred while fetching data"
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

document.addEventListener('DOMContentLoaded', async function() {

    await checkServerAvailability();
});
