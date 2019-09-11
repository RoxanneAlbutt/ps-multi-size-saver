//Multi-size save. Save a single image into multiple dimensions as defined in an external text file.

// Copyright 2019
// September 10, 2019 
// Written by Roxanne Albutt
// http://www.roxannealbutt.org
// e-mail: roxanne.albutt@gmail.com

//==================================== GLOBALS ============================================
var errorMsgArray= [];
var XMLFileName = "dimensions.xml";
var textFileName = "dimensions.txt";
var doc = app.activeDocument;

var PNGSaveFormat = new PNGSaveOptions();
PNGSaveFormat.PNG8 = false;
PNGSaveFormat.transparency = true;

var rootOutputFolder =  app.activeDocument.path;
var rootFileName = app.activeDocument.name.slice(0, app.activeDocument.name.lastIndexOf('.'));

//==================================== MAIN ================================================
// enable double clicking from the
// Macintosh Finder or the Windows Explorer
#target photoshop

// Make Photoshop the frontmost application
app.bringToFront();

// Save the user's layout
var startRulerUnits = app.preferences.rulerUnits;
var startDisplayDialogs = app.displayDialogs;

// Set the units to pixels and set no dialogs
app.preferences.rulerUnits = Units.PIXELS;
app.displayDialogs = DialogModes.NO;

Main();

// Restore the user's preferences
app.preferences.rulerUnits = startRulerUnits;
app.displayDialogs = startDisplayDialogs;

//====

function Main() {
    var dimensions = ParseTextFile(ReadTextFile());   
    var sourceName = doc;
    
    for each(dimension in dimensions) {
        // Duplicate into a new document to edit and save
        var newDocument = doc.duplicate(rootFileName + "_" + dimension.width + "x" + dimension.height + ".png");
        app.activeDocument = newDocument;
        
        // Manipulate document copy
        newDocument.resizeImage(dimension.width + "px", dimension.height + "px", 72, ResampleMethod.BICUBICSHARPER);
        newDocument.saveAs(new File(rootOutputFolder + "/" + newDocument.name), PNGSaveFormat);  
        newDocument.close();
        
        // Return to original image
        app.activeDocument = doc;
    }

}

//====================================  FUNCTIONS ==========================================
function ReadTextFile() {
    // Look for dimension text file in script directory.
    var config = new File ((new File($.fileName)).parent + "/" + textFileName); 
    if (config.exists) {
        config.open("r");
        return config.read();
        config.close();
    } else {
        // Ask user to specify text file if dimensions.txt is not found.
        config = File.openDialog("'dimensions.txt' Not found. Choose target TXT File","TXT:*.txt");
    }     
}

function ParseTextFile(textString) {
    var sizeArray = [];      
    
    textString = textString.replace(/\s/g, ''); // Remove all spaces.
    var parsedText = textString.split (","); // Split string into each size.
    
    // Create an object for each size
    for each(size in parsedText) {
        var parsedText = size.split("x");
        sizeArray.push(new ImageSize(parsedText[0], parsedText[1]));
    }

    sizeArray.sort(compareNumbers); // sort dimension by ascending height
    
    return sizeArray;
}

function compareNumbers(a, b) {
  return b.height - a.height;
}

//====================================  OBJECTS ==========================================
function ImageSize(width, height) {
    this.width = width;
    this.height = height;
}