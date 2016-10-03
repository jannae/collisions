var bot = document.getElementById('sources').offsetHeight;
var top = document.getElementById('header').offsetHeight;
var cnvW = window.innerWidth;
var cnvH = window.innerHeight - bot - top;

document.getElementById('printData').style.top = top;
document.getElementById('printData').style.height = cnvH+'px';

var names = ["Aidan","Alastair","Amos","Anderson","Andrew","Annabel","Aquilina","Araminta","Archibald","Arthur","Asher","August","Balthazar","Basie","Bechet","Bessie","Billie","Bix","Butch","Byron","Caleb","Calloway","Calvin","Cassandra","Cassian","Charlie","Christian","Clay","Clementine","Cole","Coleman","Colin","Coltrane","Cornelia","Cressida","Daisy","Dante","Dashiell","Delilah","Dexter","Dinah","Dixie","Dominic","Duke","Duncan","Edie","Edwin","Eli","Elias","Elijah","Ella","Ellington","Elvis","Emmanuel","Ethan","Etta","Ezra","Felix","Finn","Flora","Frances","Francis","Frank","Frederick","Gabriel","Georgia","Graham","Gregory","Gus","Harper","Harrison","Harry","Hayden","Hazel","Henry","Hester","Homer","Hopper","Hudson","Hugh","Hugo","Hunter","Ida","India","Iris","Isaac","Isla","Ivy","Jack","Jacob","Jarrett","Jasper","Jaz","Jazz","Jessamy","Jethro","Joe","Jonah","Joplin","Jude","Julian","June","Kai","Kenton","Kingston","Lennon","Leonora","Leopold","Levi","Lewis","Liam","Lila","Linus","Lola","Louis","Luca","Lucas","Lucius","Lulu","Mabel","Magnus","Malachi","Malcolm","Mamie","Matilda","Maud","Max","Mercer","Micah","Miles","Millie","Milo","Minnie","Moses","Nathan","Nathaniel","Ned","Nicholas","Noah","Oliver","Orson","Otis","Otto","Owen","Pansy","Patrick","Pearl","Persephone","Philip","Phineas","Phoebe","Quentin","Quincy","Ray","Reed","Roman","Romy","Roscoe","Rufus","Rupert","Sadie","Samuel","Sawyer","Sebastian","Simon","Stellan","Talullah","Thelonius","Tobias","Tristan","Truman","Tyree","Violet","Vita","Walker","Zachary"];
var blobDNA = {};
var user = "sys";
var blobData = {};
var worldData = {};

World world;
float nX, nY, nZ, gA, gB, gG, arA, arB, arG;
//var nX, nY, nZ, gA, gB, gG, arA, arB, arG;
int s;
DNA blobgenes, click;

socket.on('update', function(username, userdata, data){
    var blobArr = [];
    user = cleanStr(username);
    divTxt  = "<p>Blob : " + user + "</p>";
    $.each(data, function(key, value){
        iosData[key] = value;
        divTxt += "<p>"+key+" : " + value + "</p>";
    });
    $('#data-'+user).html(divTxt);
    $.each(userdata, function(key, value){
        blobDNA[key] = value;
        blobArr.push(value);
    });

    $("#data-"+user).css("color","rgb("+parseInt(blobArr[1]*255)+","+parseInt(blobArr[2]*255)+","+parseInt(blobArr[3]*255)+")");
});

socket.on('useradded', function(username, userdata){
    var blobArr = [];
    $.each(userdata, function(key, value){
        blobArr.push(value);
    });
    blobgenes = blobArr;
    world.born(random(cnvW),random(cnvH),blobgenes,cleanStr(username));
});

void setup() {
    size(cnvW, cnvH);
    background(10);
  world = new World(25);
  smooth();
}

void draw() {
  noStroke();
  fill(10);
  rect(0, 0, width*2, height*2);

    socketData();

    if(s == 1) {
        world.born(random(cnvW),random(cnvH),blobgenes,user);
        s = 0;
    }

  world.run();
}

// We can add a creature manually if we so desire
void mousePressed() {
    world.born(mouseX,mouseY,null,"sys");
}

// Evolution EcoSystem
// Daniel Shiffman <http://www.shiffman.net>

// Creature class

class Blob {
  PVector loc,vel,acc;  // location
  DNA dna;              // DNA
  float health;         // Life timer
  float xoff;           // For perlin noise
  float yoff;
  int kids;
  int control;

  // DNA will determine size and maxspeed
  float r,s,sw;
  float maxspeed;
  float rd,gr,bl;
  color fcolor;
  String name;

  // Create a "blob" creature
  Blob(PVector l, DNA dna_, String n) {
    loc = l.get();
    health = parseInt(random(150,255));
    dna = dna_;
    name = n;
    kids = 0;
    xoff = random(1000);
    yoff = random(1000);
    // Gene 0 determines maxspeed and r
    // The bigger the blob, the slower it is
    maxspeed = map(dna.genes[0], 0, 1, 15, 0);
    r = map(dna.genes[0], 0, 1, 5, 50);
  s = random(1,4);
    fcolor = color(parseInt(255*dna.genes[1]),parseInt(255*dna.genes[2]),parseInt(255*dna.genes[3]));

    if (name == 'sys') {
        int rn = int(random(names.length));
        name = cleanStr(names[rn]);
    }
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
        status(name+' ate some food for '+parseInt(health)+' health');
        food.remove(i);
      }
    }
  }

  // At any moment there is a teeny, tiny chance a blob will reproduce
  Blob reproduce(Blob mate, int chance) {
    //sexual reproduction
    if (chance < 0.005) {
        kids++;
        chance = 1;
        status(name+' and '+mate.name+' had a baby!');
        //console.log(name+' has '+kids+' kids!');
        //console.log('parent 1: '+health+'; parent 2: '+mate.health);
        DNA childDNA = dna.crossover(mate.dna);
        // give the parents a little life boost
        health += random(50,100);
        mate.health += random(50,100);
        // Child DNA can mutate
        childDNA.mutate(0.01);
        return new Blob(new PVector(random(width),random(height)), childDNA, 'sys');
    } else {
        return null;
    }
  }

  // Method to update loc
  void update() {
    // Simple movement based on perlin noise
    float vx, vy;
    // if this is a user-born object, control ourselves
    if(users[name]){
        console.log(name+' is controlled');
        vx = nX;
        vy = nY;
    } else {
        vx = map(noise(xoff),0,1,-maxspeed,maxspeed);
        vy = map(noise(yoff),0,1,-maxspeed,maxspeed);
    }

    PVector velocity = new PVector(vx,vy);
    xoff += 0.01;
    yoff += 0.01;

    loc.add(velocity);

    // Death always looming
    health -= 0.2;

    //blobData = {"name": name, "health": health, "kids": kids};
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
    h = map(health,0,400,0,255);
    ellipseMode(CENTER);
  strokeWeight(s);
    stroke(255,h);
    fill(fcolor, h);
    ellipse(loc.x, loc.y, r, r);

    // eyes below!
    strokeWeight(1);
    fill(200);
    ellipse(loc.x-(r/7), loc.y-(r/7), r/3.5, r/3);
    ellipse(loc.x+(r/7), loc.y-(r/7), r/3.5, r/3);
    fill(red(fcolor),0,0,h);
    ellipse(loc.x, loc.y+(r/15), r/4, r/5.5);
    fill(10);
    ellipse(loc.x-(r/7), loc.y-(r/12), r/4, r/5);
    ellipse(loc.x+(r/7), loc.y-(r/12), r/4, r/5);

    fill(fcolor, health);
    if(name != 'sys') {
        textAlign(CENTER);
        text(name, loc.x, loc.y+(r+s+3));
    }
  }

  // Death
  boolean dead() {
    if (health < 0.0) {
        socket.emit('kill', name);
        status(name+' has died. :(');
        return true;
    } else {
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
  World(int num) {
    // Start with initial food and creatures
    food = new Food(num);
    blobs = new ArrayList<Blob>();              // Initialize the arraylist

    for (int i = 0; i < num; i++) {
      PVector l = new PVector(random(width),random(height));
      DNA dna = new DNA();
      blobs.add(new Blob(l,dna,'sys'));
    }
  }

  // Make a new creature
  void born(float x, float y, DNA d, String nm) {
    PVector l = new PVector(x,y);
    if (d == null) {
        DNA dna = new DNA();
    } else { DNA dna = new DNA(d); }
    blobs.add(new Blob(l,dna,nm));
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
            int baby = random(1);
            if (d < b.r/2 && b != m) {
                //status("Let's go "+b.name+" and "+m.name+"!");
                Blob child = b.reproduce(m,baby);
                if (child != null) {blobs.add(child);}
            }
      }
      b.run();
      b.eat(food);
      // If it's dead, kill it and make food
      if (b.dead()) {
        blobs.remove(i);
        food.add(b.loc);
      }
      worldData = { "food": food.getFood().size(), "blobs": blobs.size() };
      $('#worldData').html('Food: '+worldData['food']+'<br/>Blobs: '+worldData['blobs']);
    }
  }

  // Return the list of other blobs
  ArrayList getBlobs() {
    return blobs;
  }
}

void status(var s) {
    $('#status').html(s);
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
