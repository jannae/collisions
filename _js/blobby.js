/*
  PROCESSINGJS.COM - BASIC EXAMPLE
  Delayed Mouse Tracking
  MIT License - Hyper-Metrix.com/F1LT3R
  Native Processing compatible
*/

// Global variables
float radius = 50.0;
int X, Y;

// Setup the Processing Canvas
void setup(){
  strokeWeight( 10 );
  frameRate( 15 );
}

// Main draw loop
void draw(){

  radius = radius + sin( frameCount / 4 );

  // Fill canvas grey
  background( 100 );

  // Set fill-color to blue
  fill( 0, 121, 184 );

  // Set stroke-color white
  stroke(255);

  // Draw circle
  ellipse( width / 2, width / 2, radius, radius );
}