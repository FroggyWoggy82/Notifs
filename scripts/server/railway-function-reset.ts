// Railway Function for Habit Reset
// This function will call your habit reset API endpoint

import { fetch } from 'undici';

interface ResetResponse {
  success: boolean;
  message?: string;
  result?: any;
  error?: string;
  errorDetails?: string;
  timestamp: string;
  centralTime: string;
}

// Main function that Railway will execute
export default async function(): Promise<ResetResponse> {
  console.log('Running habit reset function at:', new Date().toISOString());
  
  // Get current time in Central Time
  const now = new Date();
  const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  console.log('Current Central Time:', centralTime.toISOString());
  
  try {
    // Call your habit reset API endpoint
    const response = await fetch('https://notifs-production.up.railway.app/api/habit-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Habit reset successful:', result);
      return { 
        success: true, 
        message: 'Habit reset completed successfully',
        timestamp: new Date().toISOString(),
        centralTime: centralTime.toISOString(),
        result 
      };
    } else {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (textError) {
        errorText = 'Could not read error response';
      }
      
      console.error('Habit reset failed with status:', response.status, errorText);
      return { 
        success: false, 
        error: `Failed with status ${response.status}`,
        errorDetails: errorText,
        timestamp: new Date().toISOString(),
        centralTime: centralTime.toISOString()
      };
    }
  } catch (error) {
    console.error('Error calling habit reset API:', error);
    
    // Safely extract error message
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      errorMessage = String(error);
    }
    
    return { 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      centralTime: centralTime.toISOString()
    };
  }
}
