
int bot = document.getElementById('sources').offsetHeight;
int top = document.getElementById('header').offsetHeight;
int cnvW = window.innerWidth;
int cnvH = window.innerHeight - bot - top;

document.getElementById('printData').style.top = top;
document.getElementById('printData').style.height = cnvH+'px';

function toHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += str.charCodeAt(i).toString(16);
    }
    return hex;
    console.log('toHex='+hex);
}

var worldinfo = {};
var blobcol = {};
var user;
var blobData = {};

World world;

float r = 50.0;  //radius of blob
float strokeW = 10;
float edge = r-(strokeW/2);
int X, Y; // for initial positioning
int s; // stabilization
float nX, nY, nZ, gA, gB, gG, arA, arB, arG;

color def = color(0,0,0);

socket.on('update', function(username, userdata, data) {
    user = cleanStr(username);    
    divTxt  = "<p>User : " + user + "</p>";
    $.each(data, function(key, value){
        iosData[key] = parseFloat(value);
        divTxt += "<p>"+key+" : " + parseFloat(value) + "</p>";
    });
    $('#data-'+user).html(divTxt);
    $.each(userdata, function(key, value){
        blobcol[key] = value;
    });
    $("#data-"+user).css("color","rgb("+blobcol['r']+","+blobcol['g']+","+blobcol['b']+")");
}); 

socket.on('useradded', function(username, userdata){
    $.each(userdata, function(key, value){
        blobcol[key] = value;
    });    
    color c = color(blobcol["r"],blobcol["g"],blobcol["b"]);
        
    world.born(random(cnvW),random(cnvH),c,username); 
});

void setup() {
    size(cnvW, cnvH);
    background(10);
	//strokeWeight(strokeW);
	world = new World(20, def);
	smooth();
}

void draw() { 
	//r = r + sin(frameCount / 4);

	noStroke();
	fill(10);
	rect(0, 0, width*2, height*2);
		
    socketData();
  
	world.run();
}

// We can add a creature manually if we so desire
void mousePressed() {
  world.born(mouseX,mouseY); 
}

// Evolution EcoSystem
// Daniel Shiffman <http://www.shiffman.net>

// Creature class

class Blob {
  PVector loc; 		// location
  DNA dna;          // DNA
  float health;     // Life timer
  float xoff;       // For perlin noise
  float yoff;
  int kids;
  
  // DNA will determine size and maxspeed
  float r,s,sw;
  float maxspeed;
  float rd,gr,bl;
  color fcolor;
  String name;

  // Create a "blob" creature
  Blob(PVector l, DNA dna_, color c, String n) {
    loc = l.get();
    health = 200;
    xoff = random(1000);
    yoff = random(1000);
    dna = dna_;
    name = n;
    kids = 0;
    // Gene 0 determines maxspeed and r
    // The bigger the blob, the slower it is
    maxspeed = map(dna.genes[0], 0, 1, 15, 0);
    r = map(dna.genes[0], 0, 1, 0, 50);
	s = random(3,10);
    if (c == def) {
        c = color(random(255),random(255),random(255));        
    }
    fcolor = c;
  }

  void run() {
    update();
    borders();
    display();
  }

  // A blob can find food and eat it
  void eat(Food f) {
    ArrayList<PVector> food = f.getFood();
    
    // Are we touching any food objects?
    for (int i = food.size()-1; i >= 0; i--) {
      PVector foodloc = food.get(i);
      float d = PVector.dist(loc, foodloc);
      
      // If we are, juice up our strength!
      if (d < r/2) {
        health += 100; 
        food.remove(i);
      }
    }
  }

  // At any moment there is a teeny, tiny chance a blob will reproduce
  Blob reproduce() {
    // asexual reproduction
    if (random(1) < 0.0005) {
        kids++;
      // Child is exact copy of single parent
      DNA childDNA = dna.copy();
      // Child DNA can mutate
      childDNA.mutate(0.01);
      return new Blob(loc, childDNA, fcolor, name);
      console.log(name+' kid'+kids);
    } 
    else {
      return null;
    }
  }

  // Method to update loc
  void update() {
    // Simple movement based on perlin noise
    float vx, vy;
    if(name == user){
        vx = nX;
        vy = nY;
    } else { 
        vx = map(noise(xoff),0,1,-maxspeed,maxspeed);
        vy = map(noise(yoff),0,1,-maxspeed,maxspeed);
        xoff += 0.01;
        yoff += 0.01;
    }
    
    PVector velocity = new PVector(vx,vy);
    loc.add(velocity);

    // Death always looming
    health -= 0.2;
  }

  // Wraparound
  void borders() {
    if (loc.x < -r) loc.x = width+r;
    if (loc.y < -r) loc.y = height+r;
    if (loc.x > width+r) loc.x = -r;
    if (loc.y > height+r) loc.y = -r;
  }

  // Method to display
  void display() {
    ellipseMode(CENTER);
	strokeWeight(s);
    stroke(255,health);
    fill(fcolor, health);
    ellipse(loc.x, loc.y, r, r);
    if(name != 'sys') {
        text(name, loc.x-r, loc.y+r) 
    }
  }
  
  // Death
  boolean dead() {
    if (health < 0.0) {
      return true;
      socket.emit('kill', name);
    } 
    else {
      return false;
    }
  }
}

// Evolution EcoSystem
// Daniel Shiffman <http://www.shiffman.net>

// Class to describe DNA
// Has more features for two parent mating (not used in this example)

class DNA {

  // The genetic sequence
  float[] genes;
  
  // Constructor (makes a random DNA)
  DNA() {
    // DNA is random floating point values between 0 and 1 (!!)
    genes = new float[1];
    for (int i = 0; i < genes.length; i++) {
      genes[i] = random(0,1);
    }
  }
  
  DNA(float[] newgenes) {
    genes = newgenes;
  }
  
  DNA copy() {
    float[] newgenes = new float[genes.length];
    arrayCopy(genes,newgenes);
    return new DNA(newgenes);
  }
  
  // Based on a mutation probability, picks a new random character in array spots
  void mutate(float m) {
    for (int i = 0; i < genes.length; i++) {
      if (random(1) < m) {
         genes[i] = random(0,1);
      }
    }
  }
}

// Evolution EcoSystem
// Daniel Shiffman <http://www.shiffman.net>

// A collection of food in the world

class Food {
  ArrayList<PVector> food;
 
  Food(int num) {
    // Start with some food
    food = new ArrayList();
    for (int i = 0; i < num; i++) {
       food.add(new PVector(random(width),random(height))); 
    }
  } 
  
  // Add some food at a loc
  void add(PVector l) {
     food.add(l.get()); 
  }
  
  // Display the food
  void run() {
    for (PVector f : food) {
       rectMode(CENTER);
       stroke(255);
       fill(175);
       rect(f.x,f.y,8,8);
    } 
    
    // There's a small chance food will appear randomly
    if (random(1) < 0.001) {
       food.add(new PVector(random(width),random(height))); 
    }
  }
  
  // Return the list of food
  ArrayList getFood() {
    return food;
  }
}

// Evolution EcoSystem
// Daniel Shiffman <http://www.shiffman.net>
// Spring 2007, The Nature of Code

// The World we live in has blobs and food

class World {

  ArrayList<Blob> blobs;    // An arraylist for all the creatures
  Food food;

  // Constructor
  World(int num, color c) {
    // Start with initial food and creatures
    food = new Food(num);
    blobs = new ArrayList<Blob>();              // Initialize the arraylist
    for (int i = 0; i < num; i++) {
      PVector l = new PVector(random(width),random(height));
      DNA dna = new DNA();
      blobs.add(new Blob(l,dna,c,'sys'));
    }
  }
  
  // Make a new creature
  void born(float x, float y, color col, String nm) {
    console.log(x+', '+y+', '+col);
    PVector l = new PVector(x,y);
    DNA dna = new DNA();
    blobs.add(new Blob(l,dna,col,nm));
  }

  // Run the world
  void run() {
    // Deal with food
    food.run();
    
    //$('#blobs').html(getBlobs().size()+' Blobs');    
    //$('#foods').html(food.getFood().size()+' Foods');
    
    // Cycle through the ArrayList backwards b/c we are deleting
    for (int i = blobs.size()-1; i >= 0; i--) {
      // All blobs run and eat
      Blob b = blobs.get(i);
      b.run();
      b.eat(food);
      // If it's dead, kill it and make food
      if (b.dead()) {
        blobs.remove(i);
        food.add(b.loc);
      }
      // Perhaps this blob would like to make a baby?
      Blob child = b.reproduce();
      
      if (child != null) blobs.add(child);     
    }
  }
  
  // Return the list of other blobs
  ArrayList getBlobs() {
    return blobs;
  }
} 


// getting/setting all the data from the socket connection
void socketData() {
	
    nX = iosData['x'];
    nY = iosData['y'];
    nZ = iosData['z'];
    //r = abs(nZ)*10;  // possibly for 3D effect?
    
    gA = iosData['a'];
    gB = iosData['b'];
    gG = iosData['g'];
    
    arA = iosData['ar'] / 100;
    arB = iosData['br'] / 100;
    arG = iosData['gr'] / 100;
    
    s = int(iosData['s']);
}

/* notes for later, gator: 
	http://ditio.net/2008/11/04/php-string-to-hex-and-hex-to-string-functions/
	http://www.html5rocks.com/en/mobile/touch/
*/
