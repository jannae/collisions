int bot = document.getElementById('sources').offsetHeight;
int top = document.getElementById('header').offsetHeight;
int cnvW = window.innerWidth;
int cnvH = window.innerHeight - bot - top;

document.getElementById('printData').style.top = top;


Mover m;
float r = 50.0;  //radius of blob
float strokeW = 10;
float edge = r-(strokeW/2);
int X, Y; // for initial positioning
int s; // stabilization
float nX, nY, nZ, gA, gB, gG, arA, arB, arG;

socket.on('update', function(username, data) {
    user = cleanStr(username);
    
    divTxt  = "<p>User : " + user + "</p>";
    $.each(data, function(key, value){
        iosData[key] = parseFloat(value);
        divTxt += "<p>"+key+" : " + parseFloat(value) + "</p>";
    });
    $('#data-'+user).html(divTxt);
});	


void setup() {
    size(cnvW, cnvH);
	background(10);
	strokeWeight(strokeW);
	frameRate(15);
	X = width / 2;
	Y = height / 2;
	smooth();
	m = new Mover(X, Y);
	m.display(r);
}

void draw() { 
	r = r + sin(frameCount / 4);

	noStroke();
	fill(10, 40);
	rect(0, 0, width, height);
    
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

	PVector moved = new PVector(nX, nY);
	PVector accel = new PVector(0,0);
	
	if (moved != m.loc) {
		PVector accel = new PVector(arA,arB);
	}
	else {
		PVector accel = new PVector(0,0);
	}
	
	if (s == 1) {
		PVector accel = new PVector(0,0);			
		m.vel = accel;
	}

	m.applyForce(accel);
	m.move(moved);
	m.update();
	m.display(r);
	m.checkEdges();
}

class Mover {
	
	PVector loc;
	PVector vel;
	PVector acc;
	float mass;
	
	Mover(float x, float y) {
		loc = new PVector(x, y);
		vel = new PVector(0, 0);
		acc = new PVector(0, 0);
		mass = 10;
	}
	
	void applyForce(PVector force) {
		PVector f = PVector.div(force, mass);
		acc.add(f);
	}
	
	void move(PVector move) {
		loc.add(move);
	}
	
	void update() {
		vel.add(acc);
		loc.add(vel);
		acc.mult(0);
	}
	
	void display(float r) {
		fill(121, 0, 184);
		stroke(255);
		ellipse(loc.x, loc.y, r, r);
	}
	
	void checkEdges() {
		if (loc.x > width-edge) {
			vel.x *= -1;
			loc.x = width-edge;
		} else if (loc.x < edge) {
			vel.x *= -1;
			loc.x = edge;
		}
		if (loc.y > height-edge) {
			vel.y *= -1;
			loc.y = height-edge;
		} else if (loc.y < edge) {
			vel.y *= -1;
			loc.y = edge;
		}
	}
}

void printData(u, data) {
    divTxt  = "<p>User : " + u + "</p>";
    console.log('data: '+data['x']);
    $.each(data, function(key, value){
        console.log(key);
	    divTxt += "<p>"+key+" : " + value + "</p>";
    });
	/*
    
    divTxt += "<p>Y : " + y + "</p>";
	divTxt += "<p>Z : " + z + "</p>";
	divTxt += "<p>A : " + a + "</p>";
	divTxt += "<p>B : " + b + "</p>";
	divTxt += "<p>G : " + g + "</p>";
	divTxt += "<p>arA : " + alph + "</p>";
	divTxt += "<p>arB : " + bet + "</p>";
	divTxt += "<p>arG : " + gam + "</p>";
	if (stab == 1) { divTxt += "<p>Stabilized!</p>"; }
    $('<div/>', { 'id' : user}).appendTo('#printData');
    $('#'+user).html(divTxt);
	//$('#'+user).html(divTxt);*/
    $('#printData').html(divTxt);
} 

/* notes for later, gator: 
	http://ditio.net/2008/11/04/php-string-to-hex-and-hex-to-string-functions/
	http://www.html5rocks.com/en/mobile/touch/
*/
