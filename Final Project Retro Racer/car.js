const STEERING_LIMIT = 0.3;
const MAX_TRACTION = 0.5;
const MASS = 2;
const ROTATIONAL_INERTIA = 600;
const POWER = 16;
const BRAKE_POWER = 0.1;

let smokes = [];

class Car {
  constructor() {
    // raw input
    this.control = {
      left: 37,
      right: 39,
      up: 38,
      down: 40
    };
    
    // input
    this.throttle = 0;
    this.brake = 0;
    this.steering = 0;
    
    // property
    this.p = createVector(200, 190); // position
    this.d = p5.Vector.fromAngle(0, 1); // direction (a,l)
    this.v = p5.Vector.fromAngle(1, 0); // velocity
    this.a = 0; // angular velocity
    this.nf = createVector(0,0); // net force
    this.nt = 0; // net torque
    this.es = 0; // engine speed
    
    
    // tyres using relative position to the center of car
    let frontLeft = new Tyre(this, true, -15, -30);
    let frontRight = new Tyre(this, true, 15, -30);
    let rearRight = new Tyre(this, false, 15, 10);
    let rearLeft = new Tyre(this, false, -15, 10);
    this.tyres = [frontLeft, frontRight, rearRight, rearLeft];
    
    
    
  }
  
  handleInput() {

    // 37 Left arrow 39 Right
    if(keyIsDown(this.control.left) || keyIsDown(this.control.right)) {
      if(keyIsDown(this.control.right) && !keyIsDown(this.control.left)) {
        this.steering = min(this.steering+=0.1,1);
      } else if(keyIsDown(this.control.left) && !keyIsDown(this.control.right)) {
        this.steering = max(this.steering-=0.1,-1);
      }
    } else {
      this.steering -= map(this.steering, -1,1,-0.2,0.2);
    }


    // Up arrow
    if(keyIsDown(this.control.up)) {
      this.throttle = min(this.throttle+0.05,1);
    } else {
      this.throttle = max(this.throttle-0.1,0);
    }

    // Down arrow
    if(keyIsDown(this.control.down)) {
      this.brake = min(this.brake+0.2,1);
    } else {
      this.brake = max(this.brake-0.4,0);
    }

  
  }
  
  simulateDynamic() {
    
    this.nf.set(0,0);
    this.nt = 0;
    
    for(let i=0; i<4; i++) {
      this.tyres[i].update();
    }   
         
    this.es += map(max((this.throttle-this.brake),0) * POWER-this.es,-4,4,-2,2,true);
    
    // this.nf.rotate(this.d.heading()+HALF_PI);

    this.v.add(this.nf.div(MASS));
    this.p.add(this.v);
  
    
    this.a += this.nt/ROTATIONAL_INERTIA;
    // console.log("car.a:"+this.a);
    this.d.rotate(this.a);
    this.a *= 0.5;
  }
  
  drawTelemetry() {
    fill(255);
    text("Throttle:",0,10);
    rect(55, 2, map(this.throttle,0,1,0,80),10);

    text("Brake:",0,25);
    rect(55, 17, map(this.brake,0,1,0,80),10);

    text("Steering:",0,40);
    rect(55, 32, map(this.steering,-1,1,0,80),10);
    
    this.tyres[0].drawTelemetry(0, 55);
    this.tyres[1].drawTelemetry(80, 55);
    this.tyres[2].drawTelemetry(80, 135);
    this.tyres[3].drawTelemetry(0, 135);
    
    text("Speed: "+this.v.mag().toFixed(2), 0, 230);
    text("Engine Speed: "+this.es.toFixed(2), 0, 245);
    text("Record:  "+formatTime(record),0,260);
    text("Current:"+formatTime(Date.now()-startLap),0,275);
  }
  
  debugRender() {
    push();
    
    translate(this.p);
    push();
    rotate(this.d.heading()+HALF_PI);
    
    rectMode(CENTER);
    let carWidth = this.tyres[1].p.x - this.tyres[0].p.x;
    let carLength = this.tyres[2].p.y - this.tyres[0].p.y;
    rect(0,0, carWidth, carLength );
    
    // line(0,-15,this.nt*20,-15); // torque
    let relWD = this.tyres[0].d.copy().rotate(-this.d.heading()-HALF_PI);
    line(0,-20, relWD.x*20, relWD.y*20-20); // wheel direction
    pop();
    line(0,0, this.v.x*40, this.v.y*40); // velocity
    pop();
  }
  
  render() {
    push();
    
    translate(width/2,height/2);
    push();
    rotate(this.d.heading()+HALF_PI);
    
    imageMode(CENTER);
    image(carBody, 0,-10,64,64);
    
    for(let i=0; i<4; i++) {
      this.tyres[i].render();
    } 

    pop();

    pop();
  }
  
  update() {
    this.handleInput();
    this.simulateDynamic();
    // this.drawTelemetry();  
    this.render();
  }
}

class Tyre {
  constructor(car,isFrontWheel, x, y) {
    
    this.car = car;
    this.isFrontWheel = isFrontWheel;
    this.p = createVector(x,y); // position
    this.d = createVector(0,-1); // direction
    this.t = createVector(0,0); // traction
    this.lockedUp = false;
    
  }
  
  get absP() {
    return this.car.p.copy().add(this.p.copy().rotate(this.car.d.heading()+HALF_PI));
  }
  
  get offTrack() {
    let p = this.absP;
    if(p.x>0&&p.x<1920&&p.y>0&&p.y<1080){
      if(trackMap.get(p.x,p.y)[0]!=153){
        return true;
      }
      
    } 
    
  return false;

  }
  
  update() {
    this.d = this.car.d.copy();
    this.t.set(0,0);
    
    if(this.isFrontWheel) {
      // how front wheels steer
      this.d.rotate(this.car.steering*STEERING_LIMIT);     
     
    } else {
      // how rear wheels drive the car
      let drive = this.car.es-this.car.v.dot(this.car.d);
      if(drive > 0) {
        this.t.add(this.d.copy().setMag(-drive*1));
        // console.log("traction: "+this.t.mag());
      }    
    }
    // Lateral force
    let tangent = this.d.copy().rotate(HALF_PI);     
    let relV = this.car.v.copy();    
    this.t.add(tangent.setMag(relV.dot(tangent)).mult(0.5));
 
    // Off track
    if(this.offTrack){
      let friction
      if(this.isFrontWheel){
        friction = this.car.v.copy().mult(0.1);
      } else {
        friction = this.car.v.copy().mult(0.3);
      }
       
      this.t.add(friction);
    }
    
    // Brake
    let brakePower = map(this.car.brake,0,1,0,this.car.v.dot(this.d)*BRAKE_POWER,true);
      // console.log(brakePower);
      this.t.add(this.d.copy().mult(brakePower));
    
      this.t.mult(-0.5);
    
    // Lockup
    if (this.t.mag()>MAX_TRACTION) {
      smokes.push({p:this.absP.add(random(-3,3),random(-3,3)),i:1});
      this.lockedUp = true;
      // console.log("traction: "+this.t.mag());
      this.t.setMag(MAX_TRACTION/2);
    } else {
      this.lockedUp = false;
    }
    
    this.car.nf.add(this.t);
    // console.log(this.t);
    // console.log("p: "+this.p + " cross " + this.t + " = " + this.p.cross(this.t).z);
    this.car.nt += -this.p.copy().rotate(this.car.d.heading()-HALF_PI).cross(this.t).z;
   
    
  }
  
  drawTelemetry(x, y) {
    // takes 80*80 pt
    push();
    
    translate(x+40, y+40);
    push();
    rotate(this.d.heading()-this.car.d.heading()-HALF_PI);
    
    rectMode(CENTER);
    rect(0, 0, 60, 10, 4);
    pop();
    rotate(-this.car.d.heading()-HALF_PI);
    if(this.lockedUp) {
      stroke(255,0,0);
    }
    line(0,0,this.t.x*40/MAX_TRACTION,this.t.y*40/MAX_TRACTION);
    
    pop();
  }
  
  render() { 
    push();
    translate(this.p.x,this.p.y);
    rotate(this.d.heading()-this.car.d.heading());
    noStroke();
    fill(0);
    rectMode(CENTER);
    rect(0, 0, 4, 14, 2);
    pop();

  }
}

function smokeUpdate() {
  push();
  noStroke();
  ellipseMode(CENTER);

  if(smokes.length>20){
    smokes = smokes.slice(smokes.length-20);
  }

  let smoke;
  for(let i=0; i<min(smokes.length,30); i++) {  
    smoke = smokes[smokes.length-i-1];
    fill(255,255,255,max(128-smoke.i*20,0));
    ellipse(smoke.p.x,smoke.p.y,smoke.i*3,smoke.i*3);
    smoke.i++;
  }
  pop();
}