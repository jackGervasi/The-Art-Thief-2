import kaplay from "kaplay";


const FLOOR_HEIGHT = 48;
const JUMP_FORCE = 900; //const JUMP_FORCE = 800;
const SPEED = 480;


let COP_SPEED=400;
const MAX_SPEED=1000;
const SPEED_INCREASE=20;
// initialize context
kaplay({ width: 1920, height: 1080, });
const k=kaplay();
//debug.inspect = true;
//setBackground(255, 255, 255); //setBackground(141, 183, 255);
//layers(["clouds", "bg"], "game");
// load assets

loadSprite("bg","/sprites/bgadjusted_transparent.png");
loadSprite("clouds", "/sprites/clouds.png");
loadSprite("player", "/sprites/spritesheet_4_transparent.png", 
    {

    sliceX: 4,
    anims: {
        run: { from: 0, to: 3, loop: true, speed: 15},
        idle: {from: 0, to: 0}
    }
    });

loadSprite("cop","/sprites/spritesheet_policecar.png",//loadSprite("cop", "/sprites/spritesheet_cop_transparent.png",
    {
        sliceX:4, //sliceX; 4
        anims: {
            run: { from:0, to: 3, loop: true, speed:12}, //loop : true from:0 to: 3
            idle: {from: 0, to:0}
        }
    });

scene("intro", () => {
    setBackground(192, 192, 192);
    add([
        text("Press SPACE to Start", { size: 32 }),
        text("Arrow Keys to move, SPACE or left click to jump", { size: 22 }),
        color(0, 0, 0),
        pos(center().x, center().y + 40), // 40 pixels lower
        anchor("center")
    ]);
    onKeyPress("space", () => go("game"));
});



scene("game", () => {

    const CLOUD_WIDTH = 1920;
    const CLOUD_SPEED = 60;
    

    add([
        sprite("bg"),
        //layer("bg"),
        pos(0, 0),
        scale(width() / 1920, height() / 1080), // adjust to your image size
        //layer("bg"),
        z(-10),
    ]);

    const cloud1 = add([
        sprite("clouds"),
        //layer("clouds"),
        pos(0,0),
        z(-20),
    ]);

    const cloud2= add([
        sprite("clouds"),
        //layer("clouds"),
        pos(CLOUD_WIDTH,0),
        z(-20),
    ]);


   

    // define gravity
    setGravity(2400);
    // add a game object to screen

    

    const player = add([
        // list of components
        sprite("player", {scale:.1}),
        pos(80, 40),
        area({
             shape: new Rect(vec2(0),40,90),
        }
        ),
        anchor("bot"),
        body(),
    ]);

    // floor
    add([
        rect(width(), FLOOR_HEIGHT),
        outline(4),
        pos(0, height()),
        anchor("botleft"),
        area(),
        body({ isStatic: true }),
        color(128,128,128),//color(132, 101, 236),
    ]);

    onUpdate(() => {
    if (!player.isGrounded()) {
        player.stop();
        player.frame = 0;   // your jump frame
    }
    });

    onUpdate(()=>{
        cloud1.move(-CLOUD_SPEED, 0);
        cloud2.move(-CLOUD_SPEED, 0);

        if (cloud1.pos.x <= -CLOUD_WIDTH) {
            cloud1.pos.x = cloud2.pos.x + CLOUD_WIDTH;
        }

        if (cloud2.pos.x <= -CLOUD_WIDTH){
            cloud2.pos.x = cloud1.pos.x + CLOUD_WIDTH;
        }
    });

    player.onGround(() => {
        player.play("run");
    });
    
    function jump() {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE);
            
        }
    }

    // jump when user press space
    onKeyPress("space", jump);
    onClick(jump);
    player.play("run");
    
    onKeyDown("left", () => { 
        player.move(-SPEED, 0);
    }); 
    
    onKeyDown("right", () => { 
        player.move(SPEED, 0); 
    });
    
    onUpdate(() => { 
        // Keep player inside the screen 
       player.pos.x = clamp(player.pos.x, 0, width()); 
       player.pos.y = clamp(player.pos.y, 0, height()); 
       });


    function spawnTree() {
        // add tree obj
        add([
            sprite("cop", { anim: "run"}), //rect(48, rand(32, 96)),
            area(
                {
                shape: new Rect(vec2(0),50,92)
                }
            ),//area({scale:.85}),
            pos(width(), height() - FLOOR_HEIGHT),
            anchor("bot"),
            move(LEFT,COP_SPEED),//move(LEFT, SPEED),  //thats what makes it move
            offscreen({ destroy: true }),
            "tree",
        ]);

        // wait a random amount of time to spawn next tree
        wait(rand(0.8, 1.5), spawnTree); //wait(rand(0.5, 1.5), spawnTree);
    }

    // start spawning trees
    spawnTree();

    loop(1, () => { if (COP_SPEED < MAX_SPEED) { COP_SPEED += SPEED_INCREASE; } });

    
    // lose if player collides with any game obj with tag "tree"
    player.onCollide("tree", () => {
        // go to "lose" scene and pass the score
        go("lose", score);
        //burp();
        //addKaboom(player.pos);
    });

    // keep track of score
    let score = 0;

    const scoreLabel = add([
        text(score.toString()),
        pos(5,5),//pos(24, 24),
        color(0,0,0)
    ]);

    // increment score every frame
    onUpdate(() => {
        score++;
        scoreLabel.text = score.toString();
    });
});

scene("lose", (score) => {
    setBackground(192,192,192);
    
    add([
        sprite("player"),
        pos(width() / 2+30, height() / 2 - 64),
        scale(2),
        anchor("center"),
        
    ]);

    // display score
    add([
        text(score),
        color(0,0,0),
        pos(width() / 2, height() / 2 + 64),
        scale(2),
        anchor("center"),
    ]);
    COP_SPEED=400;
    // go back to game with space is pressed
    onKeyPress("space", () => go("game"));
    onClick(() => go("game"));
});

go("intro");