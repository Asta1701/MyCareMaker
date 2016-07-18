//This page contains general functions applied throughout the MyCareMaker App.
//Most importantly the initDocument function that styles and sizes the fonts of
//the App.

/**
 * Gets the string after the ? in the url.
 * 
 * @returns {string}
 */
function GET() {
    return window.location.href.split("?")[1];
}

function getPlatformPath() {
    var platform;
    console.log(screen.width + " " + screen.height);
    console.log(getPPI());
    if (ionic.Platform.isAndroid()) {
        platform = "android/res/drawable-xhdpi/powered_by_google_on_non_white.png";
    } else if (ionic.Platform.isIOS()) {
        platform = "ios/powered_by_google_on_non_white@2x.png";
    } else {
        platform = "desktop/powered_by_google_on_non_white_hdpi.png";
    }
    return platform;
}

function getPPI() {
    // create an empty element
    var div = document.createElement("div");
    // give it an absolute size of one inch
    div.style.width = "1in";
    // append it to the body
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(div);
    // read the computed width
    var ppi = document.defaultView.getComputedStyle(div, null).getPropertyValue('width');
    // remove it again
    body.removeChild(div);
    // and return the value
    return parseFloat(ppi);
}

//Used for the calendar API. Note, 8 input parameters to the constructor.
function dateConstruct(date) {
//    alert(date);
    if (typeof date === "string")
        date = new Date(date.replace(" ", "T"));
    
    return (new Date(date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            0, 0, 0));
}

//Returns a string in the form <day of week>, <date> <month> <year> 
function formatDate(date) {
//    alert(date);
    if (typeof date === "string")
        date = new Date(date.replace(" ", "T"));
    
    var strDate = date.toGMTString();
    var array = strDate.split(" ");
    strDate = array[0] + " " + array[1] + " " + array[2] + " " + array[3];

    return strDate;
}
function formatTime(date) {
//    alert(date);
    if (typeof date === "string")
        date = new Date(date.replace(" ", "T"));
    
    var timeStr = date.toTimeString();
    var splitAr = timeStr.split(" ");
    timeStr = splitAr[0];
    splitAr = timeStr.split(":");

    return splitAr[0] + ":" + splitAr[1];
}

/**
 * Used to style and size html content. It runs all functions required to be run
 * on each page for continuity. If an individual function needs to be run the function
 * name and parameters can be specified. The purpose of this is to reduce globals
 * allowing the functions required elements to be configured easily. 
 * 
 * @param {object} configurationData - The same configuration object from the factory.
 * @param {string} functionName - Name of the function required.
 * @param {array} functionParams - A list of the functions parameters.
 * @returns {undefined}
 */
function initDocument(configurationData, functionName, functionParams) {
    
//    $("mcm_button_large").css({"fontsize":"20px"}); //Can do in CSS with !important
    //but that stops the resizing working.
    
    //For colour styling.
    var backgroundArray = ["input", "ion-header-bar", "h1", "ion-content", "ion-scroll", "h3", "h4"];
    var foregroundArray = ["a.button", "button","label", "input.Slider", "span.input-label"
            ,"div.section_title", "h2.section_title", "div.item-divider","div.item-toggle"
            ,"p", "h2", "a"];
    var middlegroundArray = ["div.item-body"];    
    
    //For font size changing.
    var fontSizeArray = ["h3", "a.button", "button.button", "span.input-label", "div.item-divider"
            ,"div.item-body", "input"];

    //If configurationData is parsed as null then individual functions can be run.
    if (configurationData !== null) {
        
        setStyling(configurationData.getStyleOption());
        setFontSizes(configurationData.getFontSize());
        
    } else {
        console.log("Function params " + functionParams[0]);
        switch (functionName) {
            case "removeStyling":
                removeStyling(functionParams[0]);
                break;
            case "setStyling":
                setStyling(functionParams[0]);
                break;
            case "setFontSizes":
                setFontSizes(functionParams[0]);
                break;
            default:
                break;
        }
        
    }
    
    function removeStyling(style) {
        var background = style + "_background";
        var middleground = style + "_middleground";
        var foreground = style + "_foreground";

        for (var i=0; i < backgroundArray.length; i++) {
            var el = backgroundArray[i];
            $(el).removeClass(background);
        }
        for (var i=0; i < middlegroundArray.length; i++) {
            var el = middlegroundArray[i];
            $(el).removeClass(middleground);
        }   
        for (var i=0; i < foregroundArray.length; i++) {
            var el = foregroundArray[i];
            $(el).removeClass(foreground);
        }
        
        console.log("Styling removed");
    }    

    function setStyling(style) {

        var background = style + "_background";
        var middleground = style + "_middleground";
        var foreground = style + "_foreground";

        for (var i=0; i < backgroundArray.length; i++) {
            var el = backgroundArray[i];
            $(el).addClass(background);
        }
        for (var i=0; i < middlegroundArray.length; i++) {
            var el = middlegroundArray[i];
            $(el).addClass(middleground);
        }   
        for (var i=0; i < foregroundArray.length; i++) {
            var el = foregroundArray[i];
            $(el).addClass(foreground);
        }
        
        console.log("Styling set!");
        //All styling on requested lists of data, e.g. the GooglePlaces, Calendar Data,
        //MyCarePlan data must but have the style added to them in the html templates
        //However this can still be dynamic with the use of a $scope style variable.
    }

    function setFontSizes(newFontSize) {
        //Example on paragraphs but this needs to be on everything.
        //I think this should be done relative to screen size because of tablets.
        
        //Also similarly to the CSS styling ngRepeats aree not affected as the items 
        //are not on the screen until the controller has run.
        var fontSize = newFontSize;

        console.log(fontSize);
        
        var baseFontSizeRatio = $("p").css("font-size");

        console.log("Base vals " + baseFontSizeRatio + " " + fontSize);

        for (var i=0; i<fontSizeArray.length; i++) {
            var el = fontSizeArray[i];
            
            //Iterates through the elements chosen to get relative ratio to scale up
            //the fontsizes.
            var ratio = parseFloat($(el).css("font-size"))/parseFloat(baseFontSizeRatio);
            
            console.log("Before: " + el + " fontsize:" + parseFloat($(el).css("font-size")) + " " + ratio);
            
            $(el).css({"font-size":  (fontSize*ratio) + "px"});

            console.log("After: " + el + " fontsize:" + parseFloat($(el).css("font-size")));

        }

        $("p").css({"font-size": ( fontSize + "px")}); //Sets last to keep the ration.

        console.log("Font sizes set.");
        
    }
}


function sleep(seconds) {
    var e = new Date().getTime() + (seconds*1000);
    
    
    while(new Date().getTime() <= e) {
        setTimeout(function(){
            console.log("test");
        }, 1000);
    };
    
   
}

function setTest() {
    sessionStorage.removeItem("result");

    sessionStorage.setItem("result", "{result:finished}");
    console.log("result is set " + sessionStorage.getItem("result"));
}

function timeOut(seconds) {
    var e = new Date().getTime() + (seconds*1000);
    var value = sessionStorage.getItem("result");
    console.log(value);
    while(new Date().getTime() <= e && value === null)
        value = sessionStorage.getItem("result");
    
    if (value !== null) {
        console.log("returned value");
        return JSON.parse(value);
    } else {
        console.log("Timeout...");
        return {
            result: "Timeout"
        };
    }
        
}