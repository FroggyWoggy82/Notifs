/**
 * Console Log Suppressor
 *
 * This script reduces console log output by suppressing repetitive logs
 * and providing a summary of suppressed logs.
 */

(function() {
    // Store the original console methods
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug
    };

    // Configuration
    const config = {
        enabled: false,                // Whether log suppression is enabled (TEMPORARILY DISABLED FOR DEBUGGING)
        suppressionThreshold: 2,      // Number of similar logs before suppression (reduced from 5)
        summaryInterval: 100,         // How often to show summary (in terms of suppressed logs)
        logLevel: 'warn',             // Minimum log level to show: 'debug', 'info', 'warn', 'error'
        showSuppressedCount: true,    // Whether to show count of suppressed logs in summary
        excludePatterns: [            // Patterns to never suppress
            /\[CRITICAL\]/i,
            /\[ERROR\]/i,
            /\[IMPORTANT\]/i,
            /\[SECURITY\]/i,
            /\[AUTH\]/i,
            /\[DATABASE ERROR\]/i
        ],
        includePatterns: [            // Patterns to always suppress (even below threshold)
            // Recipe related logs
            /\[Recipe Adjust Buttons Fix\]/i,
            /Found adjustment button/i,
            /Found Set button/i,
            /Found calorie input field/i,
            /Updated field/i,
            /Created\/updated hidden field/i,
            /\[Recipe Ingredient Fix\]/i,
            /\[Recipe Table Dark Fix\]/i,
            /\[Recipe View\/Edit Dark Fix\]/i,
            /Adding ingredient to recipe/i,
            /Ingredient added successfully/i,
            /Using standard endpoint/i,
            /Updating ingredient list/i,
            /Refreshing ingredients/i,
            /Fetching ingredients for recipe/i,
            /Displaying ingredients/i,
            /Updating recipe calories/i,

            // Nutrition related logs
            /\[NutritionFieldMapper\]/i,
            /\[Nutrition Save Debug\]/i,
            /Updating nutrition fields/i,
            /Stored complete nutrition data/i,
            /Stored DB format nutrition data/i,
            /\[Package Amount Validation Fix\]/i,
            /Setting package amount/i,
            /Package amount validation/i,
            /Updating hidden fields/i,
            /Updated hidden field/i,
            /Mapping .* to standardized column/i,

            // Cronometer related logs
            /\[Cronometer Parser Fix\]/i,
            /\[Cronometer Data Fix\]/i,
            /\[Cronometer Debug\]/i,
            /Processing Cronometer text/i,
            /Parsed nutrition data/i,
            /Parse button clicked/i,
            /Processing text from global handler/i,
            /Using fixed processCronometerText function/i,
            /Successfully processed Cronometer text/i,
            /Found complete nutrition data/i,
            /Database format data/i,
            /Ensuring micronutrient data is saved/i,
            /Updating detailed nutrition fields/i,
            /Updated detailed nutrition field/i,

            // Form related logs
            /\[Form Submission Override\]/i,
            /\[Form Submission Fix\]/i,
            /\[Simple Form Handler\]/i,
            /Form submitted/i,
            /Handling form submit/i,
            /Validating form/i,
            /Form validation/i,
            /Serializing form data/i,
            /Submitting form/i,

            // UI related logs
            /\[Ingredient Edit Dark Fix\]/i,
            /\[Food Bottom Nav Fix\]/i,
            /\[Chart Controls Fix\]/i,
            /\[Dark Theme Fix\]/i,
            /\[UI Component Fix\]/i,
            /\[Layout Fix\]/i,
            /\[Style Fix\]/i,
            /\[Modal Fix\]/i,
            /\[Button Fix\]/i,
            /\[Input Fix\]/i,
            /\[Table Fix\]/i,
            /\[Form Fix\]/i,
            /\[Navigation Fix\]/i,
            /\[Sidebar Fix\]/i,
            /\[Header Fix\]/i,
            /\[Footer Fix\]/i,
            /\[Tooltip Fix\]/i,
            /\[Dropdown Fix\]/i,
            /\[Checkbox Fix\]/i,
            /\[Radio Fix\]/i,
            /\[Select Fix\]/i,
            /\[Slider Fix\]/i,
            /\[Progress Fix\]/i,
            /\[Tab Fix\]/i,
            /\[Accordion Fix\]/i,
            /\[Card Fix\]/i,
            /\[List Fix\]/i,
            /\[Grid Fix\]/i,
            /\[Flex Fix\]/i,
            /\[Container Fix\]/i,
            /\[Spacing Fix\]/i,
            /\[Margin Fix\]/i,
            /\[Padding Fix\]/i,
            /\[Border Fix\]/i,
            /\[Shadow Fix\]/i,
            /\[Color Fix\]/i,
            /\[Font Fix\]/i,
            /\[Text Fix\]/i,
            /\[Icon Fix\]/i,
            /\[Image Fix\]/i,
            /\[Animation Fix\]/i,
            /\[Transition Fix\]/i,
            /\[Transform Fix\]/i,
            /\[Position Fix\]/i,
            /\[Z-Index Fix\]/i,
            /\[Overflow Fix\]/i,
            /\[Visibility Fix\]/i,
            /\[Opacity Fix\]/i,
            /\[Display Fix\]/i,
            /\[Width Fix\]/i,
            /\[Height Fix\]/i,
            /\[Size Fix\]/i,
            /\[Alignment Fix\]/i,
            /\[Centering Fix\]/i,
            /\[Responsive Fix\]/i,
            /\[Mobile Fix\]/i,
            /\[Desktop Fix\]/i,
            /\[Tablet Fix\]/i,
            /\[Landscape Fix\]/i,
            /\[Portrait Fix\]/i,
            /\[RTL Fix\]/i,
            /\[LTR Fix\]/i,
            /\[Accessibility Fix\]/i,
            /\[A11y Fix\]/i,
            /\[ARIA Fix\]/i,
            /\[Keyboard Fix\]/i,
            /\[Focus Fix\]/i,
            /\[Hover Fix\]/i,
            /\[Active Fix\]/i,
            /\[Disabled Fix\]/i,
            /\[Loading Fix\]/i,
            /\[Error Fix\]/i,
            /\[Success Fix\]/i,
            /\[Warning Fix\]/i,
            /\[Info Fix\]/i,
            /\[Notification Fix\]/i,
            /\[Alert Fix\]/i,
            /\[Toast Fix\]/i,
            /\[Snackbar Fix\]/i,
            /\[Dialog Fix\]/i,
            /\[Popup Fix\]/i,
            /\[Overlay Fix\]/i,
            /\[Backdrop Fix\]/i,
            /\[Mask Fix\]/i,
            /\[Drawer Fix\]/i,
            /\[Menu Fix\]/i,
            /\[Submenu Fix\]/i,
            /\[Navbar Fix\]/i,
            /\[Toolbar Fix\]/i,
            /\[Pagination Fix\]/i,
            /\[Breadcrumb Fix\]/i,
            /\[Stepper Fix\]/i,
            /\[Timeline Fix\]/i,
            /\[Tree Fix\]/i,
            /\[Tag Fix\]/i,
            /\[Badge Fix\]/i,
            /\[Label Fix\]/i,
            /\[Hint Fix\]/i,
            /\[Placeholder Fix\]/i,
            /\[Validation Fix\]/i,
            /\[Error Message Fix\]/i,
            /\[Help Text Fix\]/i,
            /\[Description Fix\]/i,
            /\[Caption Fix\]/i,
            /\[Legend Fix\]/i,
            /\[Fieldset Fix\]/i,
            /\[Group Fix\]/i,
            /\[Row Fix\]/i,
            /\[Column Fix\]/i,
            /\[Cell Fix\]/i,
            /\[Header Cell Fix\]/i,
            /\[Data Cell Fix\]/i,
            /\[Footer Cell Fix\]/i,
            /\[Heading Fix\]/i,
            /\[Paragraph Fix\]/i,
            /\[Link Fix\]/i,
            /\[Anchor Fix\]/i,
            /\[Button Group Fix\]/i,
            /\[Input Group Fix\]/i,
            /\[Form Group Fix\]/i,
            /\[Form Row Fix\]/i,
            /\[Form Column Fix\]/i,
            /\[Form Field Fix\]/i,
            /\[Form Label Fix\]/i,
            /\[Form Input Fix\]/i,
            /\[Form Textarea Fix\]/i,
            /\[Form Select Fix\]/i,
            /\[Form Checkbox Fix\]/i,
            /\[Form Radio Fix\]/i,
            /\[Form Switch Fix\]/i,
            /\[Form Slider Fix\]/i,
            /\[Form Range Fix\]/i,
            /\[Form File Fix\]/i,
            /\[Form Date Fix\]/i,
            /\[Form Time Fix\]/i,
            /\[Form DateTime Fix\]/i,
            /\[Form Color Fix\]/i,
            /\[Form Number Fix\]/i,
            /\[Form Password Fix\]/i,
            /\[Form Email Fix\]/i,
            /\[Form Tel Fix\]/i,
            /\[Form URL Fix\]/i,
            /\[Form Search Fix\]/i,
            /\[Form Submit Fix\]/i,
            /\[Form Reset Fix\]/i,
            /\[Form Button Fix\]/i,
            /\[Form Action Fix\]/i,
            /\[Form Method Fix\]/i,
            /\[Form Enctype Fix\]/i,
            /\[Form Target Fix\]/i,
            /\[Form Autocomplete Fix\]/i,
            /\[Form Validation Fix\]/i,
            /\[Form Error Fix\]/i,
            /\[Form Success Fix\]/i,
            /\[Form Warning Fix\]/i,
            /\[Form Info Fix\]/i,
            /\[Form Disabled Fix\]/i,
            /\[Form Readonly Fix\]/i,
            /\[Form Required Fix\]/i,
            /\[Form Optional Fix\]/i,
            /\[Form Pattern Fix\]/i,
            /\[Form Min Fix\]/i,
            /\[Form Max Fix\]/i,
            /\[Form Step Fix\]/i,
            /\[Form Length Fix\]/i,
            /\[Form Size Fix\]/i,
            /\[Form Placeholder Fix\]/i,
            /\[Form Label Fix\]/i,
            /\[Form Legend Fix\]/i,
            /\[Form Fieldset Fix\]/i,
            /\[Form Group Fix\]/i,
            /\[Form Row Fix\]/i,
            /\[Form Column Fix\]/i,
            /\[Form Field Fix\]/i,
            /\[Form Input Fix\]/i,
            /\[Form Textarea Fix\]/i,
            /\[Form Select Fix\]/i,
            /\[Form Checkbox Fix\]/i,
            /\[Form Radio Fix\]/i,
            /\[Form Switch Fix\]/i,
            /\[Form Slider Fix\]/i,
            /\[Form Range Fix\]/i,
            /\[Form File Fix\]/i,
            /\[Form Date Fix\]/i,
            /\[Form Time Fix\]/i,
            /\[Form DateTime Fix\]/i,
            /\[Form Color Fix\]/i,
            /\[Form Number Fix\]/i,
            /\[Form Password Fix\]/i,
            /\[Form Email Fix\]/i,
            /\[Form Tel Fix\]/i,
            /\[Form URL Fix\]/i,
            /\[Form Search Fix\]/i,
            /\[Form Submit Fix\]/i,
            /\[Form Reset Fix\]/i,
            /\[Form Button Fix\]/i,
            /\[Form Action Fix\]/i,
            /\[Form Method Fix\]/i,
            /\[Form Enctype Fix\]/i,
            /\[Form Target Fix\]/i,
            /\[Form Autocomplete Fix\]/i,
            /\[Form Validation Fix\]/i,
            /\[Form Error Fix\]/i,
            /\[Form Success Fix\]/i,
            /\[Form Warning Fix\]/i,
            /\[Form Info Fix\]/i,
            /\[Form Disabled Fix\]/i,
            /\[Form Readonly Fix\]/i,
            /\[Form Required Fix\]/i,
            /\[Form Optional Fix\]/i,
            /\[Form Pattern Fix\]/i,
            /\[Form Min Fix\]/i,
            /\[Form Max Fix\]/i,
            /\[Form Step Fix\]/i,
            /\[Form Length Fix\]/i,
            /\[Form Size Fix\]/i,
            /\[Form Placeholder Fix\]/i,

            // Generic debug logs
            /Initializing/i,
            /Initialized/i,
            /Loading/i,
            /Loaded/i,
            /Starting/i,
            /Started/i,
            /Stopping/i,
            /Stopped/i,
            /Processing/i,
            /Processed/i,
            /Updating/i,
            /Updated/i,
            /Creating/i,
            /Created/i,
            /Deleting/i,
            /Deleted/i,
            /Fetching/i,
            /Fetched/i,
            /Sending/i,
            /Sent/i,
            /Receiving/i,
            /Received/i,
            /Validating/i,
            /Validated/i,
            /Checking/i,
            /Checked/i,
            /Testing/i,
            /Tested/i,
            /Debugging/i,
            /Debugged/i,
            /Logging/i,
            /Logged/i,
            /Rendering/i,
            /Rendered/i,
            /Mounting/i,
            /Mounted/i,
            /Unmounting/i,
            /Unmounted/i,
            /Attaching/i,
            /Attached/i,
            /Detaching/i,
            /Detached/i,
            /Binding/i,
            /Bound/i,
            /Unbinding/i,
            /Unbound/i,
            /Connecting/i,
            /Connected/i,
            /Disconnecting/i,
            /Disconnected/i,
            /Opening/i,
            /Opened/i,
            /Closing/i,
            /Closed/i,
            /Showing/i,
            /Shown/i,
            /Hiding/i,
            /Hidden/i,
            /Enabling/i,
            /Enabled/i,
            /Disabling/i,
            /Disabled/i,
            /Activating/i,
            /Activated/i,
            /Deactivating/i,
            /Deactivated/i,
            /Focusing/i,
            /Focused/i,
            /Blurring/i,
            /Blurred/i,
            /Hovering/i,
            /Hovered/i,
            /Clicking/i,
            /Clicked/i,
            /Dragging/i,
            /Dragged/i,
            /Dropping/i,
            /Dropped/i,
            /Scrolling/i,
            /Scrolled/i,
            /Resizing/i,
            /Resized/i,
            /Moving/i,
            /Moved/i,
            /Rotating/i,
            /Rotated/i,
            /Scaling/i,
            /Scaled/i,
            /Transforming/i,
            /Transformed/i,
            /Animating/i,
            /Animated/i,
            /Transitioning/i,
            /Transitioned/i,
            /Fading/i,
            /Faded/i,
            /Sliding/i,
            /Slid/i,
            /Flipping/i,
            /Flipped/i,
            /Zooming/i,
            /Zoomed/i,
            /Panning/i,
            /Panned/i,
            /Pinching/i,
            /Pinched/i,
            /Swiping/i,
            /Swiped/i,
            /Tapping/i,
            /Tapped/i,
            /Pressing/i,
            /Pressed/i,
            /Releasing/i,
            /Released/i,
            /Gesturing/i,
            /Gestured/i,
            /Touching/i,
            /Touched/i,
            /Typing/i,
            /Typed/i,
            /Keydown/i,
            /Keyup/i,
            /Keypress/i,
            /Mousedown/i,
            /Mouseup/i,
            /Mousemove/i,
            /Mouseenter/i,
            /Mouseleave/i,
            /Mouseover/i,
            /Mouseout/i,
            /Touchstart/i,
            /Touchend/i,
            /Touchmove/i,
            /Touchcancel/i,
            /Pointerdown/i,
            /Pointerup/i,
            /Pointermove/i,
            /Pointerenter/i,
            /Pointerleave/i,
            /Pointerover/i,
            /Pointerout/i,
            /Pointercancel/i,
            /Wheel/i,
            /Scroll/i,
            /Resize/i,
            /Load/i,
            /Unload/i,
            /Beforeunload/i,
            /DOMContentLoaded/i,
            /Readystatechange/i,
            /Visibilitychange/i,
            /Focus/i,
            /Blur/i,
            /Input/i,
            /Change/i,
            /Submit/i,
            /Reset/i,
            /Select/i,
            /Cut/i,
            /Copy/i,
            /Paste/i,
            /Contextmenu/i,
            /Dblclick/i,
            /Drag/i,
            /Dragstart/i,
            /Dragend/i,
            /Dragenter/i,
            /Dragleave/i,
            /Dragover/i,
            /Drop/i,
            /Play/i,
            /Pause/i,
            /Ended/i,
            /Timeupdate/i,
            /Durationchange/i,
            /Volumechange/i,
            /Ratechange/i,
            /Seeking/i,
            /Seeked/i,
            /Waiting/i,
            /Canplay/i,
            /Canplaythrough/i,
            /Stalled/i,
            /Suspend/i,
            /Abort/i,
            /Error/i,
            /Emptied/i,
            /Cuechange/i,
            /Loadstart/i,
            /Loadeddata/i,
            /Loadedmetadata/i,
            /Progress/i,
            /Animationstart/i,
            /Animationend/i,
            /Animationiteration/i,
            /Transitionstart/i,
            /Transitionend/i,
            /Transitionrun/i,
            /Transitioncancel/i,
            /Fullscreenchange/i,
            /Fullscreenerror/i,
            /Orientationchange/i,
            /Deviceorientation/i,
            /Devicemotion/i,
            /Online/i,
            /Offline/i,
            /Popstate/i,
            /Hashchange/i,
            /Pagehide/i,
            /Pageshow/i,
            /Storage/i,
            /Message/i,
            /Messageerror/i,
            /Beforeprint/i,
            /Afterprint/i,
            /Beforeinstallprompt/i,
            /Appinstalled/i,
            /Beforexrselect/i,
            /Abort/i,
            /Blur/i,
            /Cancel/i,
            /Canplay/i,
            /Canplaythrough/i,
            /Change/i,
            /Click/i,
            /Close/i,
            /Contextmenu/i,
            /Cuechange/i,
            /Dblclick/i,
            /Drag/i,
            /Dragend/i,
            /Dragenter/i,
            /Dragleave/i,
            /Dragover/i,
            /Dragstart/i,
            /Drop/i,
            /Durationchange/i,
            /Emptied/i,
            /Ended/i,
            /Error/i,
            /Focus/i,
            /Focusin/i,
            /Focusout/i,
            /Formdata/i,
            /Input/i,
            /Invalid/i,
            /Keydown/i,
            /Keypress/i,
            /Keyup/i,
            /Load/i,
            /Loadeddata/i,
            /Loadedmetadata/i,
            /Loadstart/i,
            /Mousedown/i,
            /Mouseenter/i,
            /Mouseleave/i,
            /Mousemove/i,
            /Mouseout/i,
            /Mouseover/i,
            /Mouseup/i,
            /Pause/i,
            /Play/i,
            /Playing/i,
            /Progress/i,
            /Ratechange/i,
            /Reset/i,
            /Resize/i,
            /Scroll/i,
            /Securitypolicyviolation/i,
            /Seeked/i,
            /Seeking/i,
            /Select/i,
            /Slotchange/i,
            /Stalled/i,
            /Submit/i,
            /Suspend/i,
            /Timeupdate/i,
            /Toggle/i,
            /Volumechange/i,
            /Waiting/i,
            /Wheel/i,
            /Auxclick/i,
            /Gotpointercapture/i,
            /Lostpointercapture/i,
            /Pointerdown/i,
            /Pointermove/i,
            /Pointerup/i,
            /Pointercancel/i,
            /Pointerover/i,
            /Pointerout/i,
            /Pointerenter/i,
            /Pointerleave/i,
            /Selectionchange/i,
            /Selectstart/i,
            /Selectionchange/i,
            /Animationend/i,
            /Animationiteration/i,
            /Animationstart/i,
            /Transitionend/i,
            /Transitionstart/i,
            /Transitionrun/i,
            /Transitioncancel/i,
            /Afterprint/i,
            /Beforeprint/i,
            /Beforeunload/i,
            /Hashchange/i,
            /Languagechange/i,
            /Message/i,
            /Messageerror/i,
            /Offline/i,
            /Online/i,
            /Pagehide/i,
            /Pageshow/i,
            /Popstate/i,
            /Rejectionhandled/i,
            /Storage/i,
            /Unhandledrejection/i,
            /Unload/i,
            /Devicemotion/i,
            /Deviceorientation/i,
            /Deviceorientationabsolute/i,
            /Orientationchange/i,
            /Fullscreenchange/i,
            /Fullscreenerror/i,
            /Pointerlockchange/i,
            /Pointerlockerror/i,
            /Readystatechange/i,
            /Visibilitychange/i,
            /Beforeinstallprompt/i,
            /Appinstalled/i,
            /Beforexrselect/i,
            /Abort/i,
            /Blur/i,
            /Cancel/i,
            /Canplay/i,
            /Canplaythrough/i,
            /Change/i,
            /Click/i,
            /Close/i,
            /Contextmenu/i,
            /Cuechange/i,
            /Dblclick/i,
            /Drag/i,
            /Dragend/i,
            /Dragenter/i,
            /Dragleave/i,
            /Dragover/i,
            /Dragstart/i,
            /Drop/i,
            /Durationchange/i,
            /Emptied/i,
            /Ended/i,
            /Error/i,
            /Focus/i,
            /Focusin/i,
            /Focusout/i,
            /Formdata/i,
            /Input/i,
            /Invalid/i,
            /Keydown/i,
            /Keypress/i,
            /Keyup/i,
            /Load/i,
            /Loadeddata/i,
            /Loadedmetadata/i,
            /Loadstart/i,
            /Mousedown/i,
            /Mouseenter/i,
            /Mouseleave/i,
            /Mousemove/i,
            /Mouseout/i,
            /Mouseover/i,
            /Mouseup/i,
            /Pause/i,
            /Play/i,
            /Playing/i,
            /Progress/i,
            /Ratechange/i,
            /Reset/i,
            /Resize/i,
            /Scroll/i,
            /Securitypolicyviolation/i,
            /Seeked/i,
            /Seeking/i,
            /Select/i,
            /Slotchange/i,
            /Stalled/i,
            /Submit/i,
            /Suspend/i,
            /Timeupdate/i,
            /Toggle/i,
            /Volumechange/i,
            /Waiting/i,
            /Wheel/i,
            /Auxclick/i,
            /Gotpointercapture/i,
            /Lostpointercapture/i,
            /Pointerdown/i,
            /Pointermove/i,
            /Pointerup/i,
            /Pointercancel/i,
            /Pointerover/i,
            /Pointerout/i,
            /Pointerenter/i,
            /Pointerleave/i,
            /Selectionchange/i,
            /Selectstart/i,
            /Selectionchange/i,
            /Animationend/i,
            /Animationiteration/i,
            /Animationstart/i,
            /Transitionend/i,
            /Transitionstart/i,
            /Transitionrun/i,
            /Transitioncancel/i,
            /Afterprint/i,
            /Beforeprint/i,
            /Beforeunload/i,
            /Hashchange/i,
            /Languagechange/i,
            /Message/i,
            /Messageerror/i,
            /Offline/i,
            /Online/i,
            /Pagehide/i,
            /Pageshow/i,
            /Popstate/i,
            /Rejectionhandled/i,
            /Storage/i,
            /Unhandledrejection/i,
            /Unload/i,
            /Devicemotion/i,
            /Deviceorientation/i,
            /Deviceorientationabsolute/i,
            /Orientationchange/i,
            /Fullscreenchange/i,
            /Fullscreenerror/i,
            /Pointerlockchange/i,
            /Pointerlockerror/i,
            /Readystatechange/i,
            /Visibilitychange/i,
            /Beforeinstallprompt/i,
            /Appinstalled/i,
            /Beforexrselect/i
        ]
    };

    // Counters for suppressed logs
    const suppressedCounts = {};
    let totalSuppressed = 0;

    // Function to determine if a log should be suppressed
    function shouldSuppress(args, level = 'log') {
        if (!config.enabled) return false;

        // Convert args to string for comparison
        const logString = Array.from(args).join(' ');

        // Check log level - never suppress logs above the configured level
        if (shouldShowBasedOnLogLevel(level)) return false;

        // Never suppress logs matching exclude patterns
        for (const pattern of config.excludePatterns) {
            if (pattern.test(logString)) return false;
        }

        // Always suppress logs matching include patterns
        for (const pattern of config.includePatterns) {
            if (pattern.test(logString)) {
                // Increment counter for this log
                suppressedCounts[logString] = (suppressedCounts[logString] || 0) + 1;
                totalSuppressed++;

                // Show summary if needed
                if (totalSuppressed % config.summaryInterval === 0) {
                    showSummary();
                }

                return true;
            }
        }

        // Check if this log has been seen before
        if (suppressedCounts[logString]) {
            suppressedCounts[logString]++;
            totalSuppressed++;

            // Only suppress if we've seen it enough times
            if (suppressedCounts[logString] > config.suppressionThreshold) {
                // Show summary if needed
                if (totalSuppressed % config.summaryInterval === 0) {
                    showSummary();
                }

                return true;
            }
        } else {
            suppressedCounts[logString] = 1;
        }

        return false;
    }

    // Function to determine if a log should be shown based on log level
    function shouldShowBasedOnLogLevel(level) {
        const levels = {
            'debug': 0,
            'log': 1,
            'info': 2,
            'warn': 3,
            'error': 4
        };

        const configLevel = levels[config.logLevel] || 1;
        const messageLevel = levels[level] || 1;

        // Show the log if its level is >= the configured level
        return messageLevel >= configLevel;
    }

    // Function to show summary of suppressed logs
    function showSummary() {
        if (!config.showSuppressedCount) return;

        // Get the top 5 most suppressed log types
        const topSuppressed = Object.entries(suppressedCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([log, count]) => {
                // Truncate long log messages
                const truncatedLog = log.length > 50 ? log.substring(0, 47) + '...' : log;
                return `"${truncatedLog}": ${count}`;
            })
            .join(', ');

        originalConsole.log(`[Log Reducer] Summary: Suppressed ${totalSuppressed} logs total. Top suppressed: ${topSuppressed}`);
    }

    // Override console methods
    console.log = function(...args) {
        if (!shouldSuppress(args, 'log')) {
            originalConsole.log.apply(console, args);
        }
    };

    console.warn = function(...args) {
        if (!shouldSuppress(args, 'warn')) {
            originalConsole.warn.apply(console, args);
        }
    };

    console.info = function(...args) {
        if (!shouldSuppress(args, 'info')) {
            originalConsole.info.apply(console, args);
        }
    };

    console.debug = function(...args) {
        if (!shouldSuppress(args, 'debug')) {
            originalConsole.debug.apply(console, args);
        }
    };

    // Don't suppress errors by default, but still count them
    console.error = function(...args) {
        if (!shouldSuppress(args, 'error')) {
            originalConsole.error.apply(console, args);
        }
    };

    // Add a method to dynamically adjust log level
    window.consoleLogReducer = {
        setLogLevel: function(level) {
            if (['debug', 'info', 'log', 'warn', 'error'].includes(level)) {
                config.logLevel = level;
                originalConsole.log(`[Log Reducer] Log level set to: ${level}`);
                return true;
            } else {
                originalConsole.error(`[Log Reducer] Invalid log level: ${level}. Valid levels are: debug, info, log, warn, error`);
                return false;
            }
        },

        enable: function() {
            config.enabled = true;
            originalConsole.log('[Log Reducer] Enabled');
        },

        disable: function() {
            config.enabled = false;
            originalConsole.log('[Log Reducer] Disabled');
        },

        getStats: function() {
            const topLogs = Object.entries(suppressedCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([log, count]) => ({ log, count }));

            return {
                enabled: config.enabled,
                logLevel: config.logLevel,
                totalSuppressed,
                topSuppressedLogs: topLogs
            };
        },

        showStats: function() {
            const stats = this.getStats();
            originalConsole.log('=== Console Log Reducer Stats ===');
            originalConsole.log(`Status: ${stats.enabled ? 'Enabled' : 'Disabled'}`);
            originalConsole.log(`Log Level: ${stats.logLevel}`);
            originalConsole.log(`Total Suppressed: ${stats.totalSuppressed}`);
            originalConsole.log('Top Suppressed Logs:');
            stats.topSuppressedLogs.forEach(({ log, count }, index) => {
                const truncatedLog = log.length > 100 ? log.substring(0, 97) + '...' : log;
                originalConsole.log(`${index + 1}. [${count}] ${truncatedLog}`);
            });
            originalConsole.log('================================');
        },

        reset: function() {
            Object.keys(suppressedCounts).forEach(key => delete suppressedCounts[key]);
            totalSuppressed = 0;
            originalConsole.log('[Log Reducer] Stats reset');
        }
    };

    // Initialize
    originalConsole.log('[Log Reducer] Initialized - reducing repetitive logs while keeping important ones');
})();
