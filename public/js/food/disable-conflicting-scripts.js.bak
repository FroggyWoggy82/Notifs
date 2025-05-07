/**
 * Disable Conflicting Scripts
 * Disables all the conflicting scripts that try to modify the Basic Information section
 */

(function() {
    // List of script IDs to disable
    const scriptsToDisable = [
        'edit-button-basic-info-fix',
        'fix-basic-info-on-load',
        'absolute-basic-info-fix',
        'extreme-basic-info-fix',
        'basic-info-complete-replacement',
        'aggressive-basic-info-replacement',
        'final-basic-info-fix',
        'replace-basic-info',
        'edit-button-handler',
        'horizontal-ingredient-edit',
        'force-basic-info-structure',
        'edit-ingredient-nutrition-style',
        'direct-basic-info-fix',
        'fix-basic-info-fields'
    ];
    
    // Function to disable scripts
    function disableConflictingScripts() {
        console.log('Disabling conflicting Basic Information scripts');
        
        // Set a global flag to prevent other scripts from running
        window._basicInfoScriptsDisabled = true;
        
        // Find all script elements
        const scripts = document.querySelectorAll('script');
        
        // Disable scripts by ID
        scripts.forEach(script => {
            if (script.id && scriptsToDisable.includes(script.id)) {
                console.log(`Disabling script: ${script.id}`);
                script.setAttribute('disabled', 'disabled');
                script.setAttribute('data-disabled', 'true');
            }
            
            // Also check src attribute
            if (script.src) {
                const src = script.src.toLowerCase();
                for (const scriptId of scriptsToDisable) {
                    if (src.includes(scriptId)) {
                        console.log(`Disabling script by src: ${script.src}`);
                        script.setAttribute('disabled', 'disabled');
                        script.setAttribute('data-disabled', 'true');
                    }
                }
            }
        });
        
        console.log('Conflicting scripts disabled');
    }
    
    // Run when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', disableConflictingScripts);
    } else {
        disableConflictingScripts();
    }
})();
