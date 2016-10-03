
int bot = document.getElementById('sources').offsetHeight;
int top = document.getElementById('header').offsetHeight;
int cnvW = window.innerWidth;
int cnvH = window.innerHeight - bot - top;

document.getElementById('printData').style.top = top;
document.getElementById('printData').style.height = cnvH+'px';

var blobcol = {};
var user;
var blobData = {};
var worldinfo = {};

World world;
float nX, nY, nZ, gA, gB, gG, arA, arB, arG;
int s;

color def = color(0,0,0);

socket.on('useradded', function(username, userdata){
    user = cleanStr(username);
    $.each(userdata, function(key, value){
        blobcol[key] = value;
    });
    color c = color(blobcol["r"],blobcol["g"],blobcol["b"]);

    world.born(random(cnvW),random(cnvH),c,username);
});

socket.on('update', function(username, userdata, data) {
    user = cleanStr(username);
    divTxt  = "<p>Blob : " + user + "</p>";
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

void setup() {
    size(cnvW, cnvH);
    background(10);
  world = new World(20, def);
  smooth();
}

void draw() {
  noStroke();
  fill(10);
  rect(0, 0, width*2, height*2);

    socketData();

    if(s == 1) {
        world.born(random(cnvW),random(cnvH),def,user);
        s = 0;
    }

  world.run();
}

// We can add a creature manually if we so desire
void mousePressed() {
    world.born(mouseX,mouseY,def,'Blobby');
}

// Evolution EcoSystem
// Daniel Shiffman <http://www.shiffman.net>

// Creature class

class Blob {
  PVector loc,vel,acc;  // location
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
    dna = dna_;
    name = n;
    kids = 0;

    console.log(name+', '+user);

    if(name != user) {
        xoff = random(1000);
        yoff = random(1000);
    }
    // Gene 0 determines maxspeed and r
    // The bigger the blob, the slower it is
    maxspeed = map(dna.genes[0], 0, 1, 15, 0);
    r = map(dna.genes[0], 0, 1, 5, 50);
  s = random(1,4);




    //if the color isn't user-defined
    //if (c == def) {
    c = color(255*genes[1],255*genes[2],255*genes[3]);
        //c = color(random(255),random(255),random(255));
    //} else {

    //}
    fcolor = c;
  }

  void run() {
    //flock(blobs);
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
  Blob reproduce(Blob mate) {
    //sexual reproduction
    if (random(1) < 0.0005) {
    kids++;
    DNA childDNA = dna.crossover(mate.dna);
    // Child DNA can mutate
    childDNA.mutate(0.01);
    return new Blob(loc, childDNA, fcolor, name);
    console.log(name+' kid'+kids);
    } else {
        return null;
    }

    //asexual reproduction
    /*if (random(1) < 0.0005) {
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
    }*/
  }

  // Method to update loc
  void update() {
    // Simple movement based on perlin noise
    float vx, vy;
    // if this is a user-born object, control ourselves
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
    // eyes below!
    strokeWeight(1);
    fill(200, health+20);
    ellipse(loc.x-(r/7), loc.y-(r/7), r/3.5, r/3);
    ellipse(loc.x+(r/7), loc.y-(r/7), r/3.5, r/3);
    fill(red(fcolor),0,0,health);
    ellipse(loc.x, loc.y+(r/15), r/4, r/5.5);
    fill(10);
    ellipse(loc.x-(r/7), loc.y-(r/12), r/4, r/5);
    ellipse(loc.x+(r/7), loc.y-(r/12), r/4, r/5);

    fill(fcolor, health);
    if(name != 'sys') {
        text(name, loc.x-(r/2), loc.y-r)
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

    ArrayList getBlobs() {
    return food;
  }
}

// Evolution EcoSystem
// Daniel Shiffman <http://www.shiffman.net>

// Class to describe DNA
// Has more features for two parent mating (not used in this example)

class DNA {

    // The genetic sequence
    float[] genes;
    float fitness;

    // Constructor (makes a random DNA)
    DNA() {
        // DNA is random floating point values between 0 and 1 (!!)
        genes = new float[4];
        for (int i = 0; i < genes.length; i++) {
          genes[i] = random(0,1);
        }
    }

    DNA(float[] newgenes) {
        genes = newgenes;
    }

    void fitness() {
        int score = 0;
        for (int i = 0; i < genes.length; i++) {
            //what is making these blobs "fit"??
        }
    }

    DNA copy() {
        float[] newgenes = new float[genes.length];
        arrayCopy(genes,newgenes);
        return new DNA(newgenes);
    }

    DNA crossover(DNA mate) {
        float[] newgenes = new float[genes.length];
        int midpoint = int(random(genes.length));
        for(int i=0;i<genes.length;i++) {
            if(i>midpoint) {
                newgenes[i] = genes[i];
            } else {
                newgenes[i] = mate.genes[i];
            }
        }
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
    PVector l = new PVector(x,y);
    DNA dna = new DNA();
    blobs.add(new Blob(l,dna,col,nm));
  }

  // Run the world
  void run() {
    // Deal with food
    food.run();

    // Cycle through the ArrayList backwards b/c we are deleting
    for (int i = blobs.size()-1; i >= 0; i--) {
      // All blobs run and eat
      Blob b = blobs.get(i);
      //cycle through every other blob for sexual reproduction
      for (int j = blobs.size()-1; j >= 0; j--) {
          Blob m = blobs.get(j);
          float d = PVector.dist(b.loc, m.loc);

          if (d < b.r/2 && b != m) {
            Blob child = b.reproduce(m);
            if (child != null) blobs.add(child);
          }
      }
      b.run();
      b.eat(food);
      // If it's dead, kill it and make food
      if (b.dead()) {
        blobs.remove(i);
        food.add(b.loc);
      }
      // Asexual, random reproduction
      //Blob child = b.reproduce();

      //if (child != null) blobs.add(child);
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
