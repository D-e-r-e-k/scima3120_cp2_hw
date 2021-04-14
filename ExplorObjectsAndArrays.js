var people = [
    {
      name: "J.D. Zamfirescu",
      food: "宫保鸡丁",
      color: "blue",
      size: 40
    },
    {
      name: "Adam Smith",
      food: "小笼包",
      color: "red",
      size: 35
    },
    {
      name: "Derek Zhang",
      food: "夫妻肺片",
      color: "red",
      size: 30
    },
    {
      name: "Peter York",
      food: "水煮肉片",
      color: "black",
      size: 45
    }
  ];
  
  var curHeart = 0;
  var hearts = ["🤎", "🖤", "🤍","💛","🧡", "❤️", "💜", "💙", "💚"];
  
  function setup() {
    createCanvas(400, 400);
    
    textAlign(CENTER);
  
    render();
  }
  
  function draw() {
    //background(220);
  }
  
  function verticalText(s, x, y) {
    push();
    translate(width/2, height/2);
    rotate(PI/2);
    translate(-height/2, width/2);
    text(s, y, -x);
    pop();
  }
  
  function userInput() {
    var inputName = prompt("Your name?");
    var inputFood = prompt("Food you like?");
    var inputColor = prompt("A color you want?");
    people.push(
      {
      name: inputName,
      food: inputFood,
      color: inputColor,
      size: 40
      }
    );
  }
  
  function render() {
    background(220);
    for (var i = 0; i < people.length; i += 1) {
      fill(0);
      textSize(15);
      text(hearts[curHeart], width/2, height/2-10);
      textSize(people[i].size);
      fill(0);
      verticalText(people[i].name, width/2+30, height/2);
      fill(people[i].color);
      verticalText(people[i].food, width/2-50, height/2);
    }
  }
  
  function mousePressed() {
    curHeart = (curHeart+1) % hearts.length;
    render();
  }