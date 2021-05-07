const CHECKPOINTS = [
  {x:1216, y:186, s: false},
  {x:1646, y:210, s: false},
  {x:1571, y:708, s: false},
  {x:1396, y:349, s: false},
  {x:294, y:742, s: false},
  {x:539, y:380, s: false},
  {x:148, y:258, s: false}
];

let startLap;
let lastLap;
let record;
let beatRecord = false;
let clean = false;
let showTel = false;


function preload() {
  carBody = loadImage('./CarBody.png');
  trackMap = loadImage('./Map.png');
  // trackMap.loadPixels();
}

function setup() {
  createCanvas(640, 480);
  frameRate(30);
  car1 = new Car();
}


function draw() {
  
  background(77);
  push();
  translate(width/2-car1.p.x,height/2-car1.p.y);
  image(trackMap,0,0);
  smokeUpdate();
  pop();
  push();
  // translate(car1.p);
  
  if(showTel){
    car1.drawTelemetry();
  }
  
  car1.update();
  pop();
  check();
  // console.log(Date.now()-startLap);
  if(clean&&lastLap&&(Date.now()-startLap)<4000){
    showTime(beatRecord,lastLap);
  }
  
}

function formatTime(t) {
  if(!t) {
    return "-:--.---";
  }
  let placeholder = "";
  if(t%60000/1000<10){
    placeholder = "0";
  }
  return (t/60000|0)+":"+placeholder+(t%60000/1000).toFixed(3);
}

function showTime(r,s) {
      push();
      textAlign(CENTER, CENTER);
      textSize(20);
      fill(230);
      if(r){
        fill(255);
        textStyle(BOLD);
      }
      
      text(formatTime(s),width/2,height/4);
      pop();
}

function check() {
  if(!CHECKPOINTS[0].s&&dist(car1.p.x,car1.p.y,CHECKPOINTS[0].x,CHECKPOINTS[0].y)<48){
    if(CHECKPOINTS[CHECKPOINTS.length-1].s){
      
      lastLap = Date.now()-startLap;
      // console.log("clean: "+lastLap);
      clean = true;
      if(!record){
        record = lastLap;    
      }
      beatRecord = false;
      if(lastLap<=record){
        record = lastLap;
        beatRecord = true;
      }
    } else {
      clean = false;
    }
    startLap = Date.now();
    CHECKPOINTS[0].s = true;
    // clean = false;
    for(let i=1; i<CHECKPOINTS.length; i++) {
      CHECKPOINTS[i].s = false;
    }
  }
  for(let i=1; i<CHECKPOINTS.length; i++) {
    if(!CHECKPOINTS[i].s&&dist(car1.p.x,car1.p.y,CHECKPOINTS[i].x,CHECKPOINTS[i].y)<48&&CHECKPOINTS[i-1].s) {
      CHECKPOINTS[i].s = true;
      if(true) {
        CHECKPOINTS[0].s = false;
      }
      // console.log("pass: "+i);
    }
  }
}

function keyPressed(){
  if (keyCode === 84) {
    showTel = !showTel;
  }
}