import { k } from "../App";

export function createVelkozQuizScene() {
  k.scene("velkoz-quiz", () => {
    
    // Load assets
    k.loadSprite("velkoz", "assets/velkoz.png");
    k.loadSound("velkoz_voice", "assets/jaemin.m4a");

    let gameStarted = false;

    // Define dialogue data [text, effect]
    const dialogs = [
      { text: "[default]Greetings, mortals...[/default]", effect: null },
      { text: "[default]I am Velkoz, and I find your gameplay... [velkoz]fascinating[/velkoz].[/default]", effect: null },
      { text: "[default]Tell me, do you truly [surprised]remember[/surprised] your failures from this season?[/default]", effect: null },
      { text: "[default]Let us test the limits of your memory.[/default]", effect: null },
      { text: "[default]I have analyzed your match history...[/default]", effect: null },
      { text: "[default]And I have prepared [velkoz]questions[/velkoz] about your performance.[/default]", effect: null },
      { text: "[surprised]Answer incorrectly...[/surprised]", effect: "pulse" },
      { text: "[velkoz]And you shall be DISINTEGRATED![/velkoz]", effect: "shake" },
      { text: "[default]Amusing, is it not?[/default]", effect: null },
      { text: "[default]Let the quiz... begin.[/default]", effect: "glow" },
    ];

    let curDialog = 0;
    let isTalking = false;

    // Background
    k.add([
      k.rect(k.width(), k.height()),
      k.color(32, 20, 48), // Dark purple void theme
      k.z(-10),
    ]);

    // Start screen
    const startScreen = k.add([
      k.rect(k.width(), k.height()),
      k.color(32, 20, 48),
      k.z(100),
    ]);

    const startTitle = k.add([
      k.text("Velkoz's Quiz", {
        size: 48,
      }),
      k.pos(k.center().x, k.center().y - 50),
      k.anchor("center"),
      k.color(k.Color.fromHex("#a855f7")),
      k.z(101),
    ]);

    const startButton = k.add([
      k.rect(200, 60, { radius: 8 }),
      k.pos(k.center().x, k.center().y + 50),
      k.anchor("center"),
      k.color(k.Color.fromHex("#8b5cf6")),
      k.outline(3, k.Color.fromHex("#a855f7")),
      k.area(),
      k.opacity(1),
      k.z(101),
      "startButton",
    ]);

    const startButtonText = k.add([
      k.text("Click to Start", {
        size: 24,
      }),
      k.pos(k.center().x, k.center().y + 50),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.z(102),
    ]);

    // Pulsing animation for start button
    startButton.onUpdate(() => {
      startButton.opacity = k.wave(0.8, 1, k.time() * 2);
    });

    startButton.onClick(() => {
      if (!gameStarted) {
        gameStarted = true;
        k.destroy(startScreen);
        k.destroy(startTitle);
        k.destroy(startButton);
        k.destroy(startButtonText);
        updateDialog();
      }
    });

    // Text bubble
    const textbox = k.add([
      k.rect(k.width() - 140, 160, { radius: 8 }),
      k.anchor("center"),
      k.pos(k.center().x, k.height() - 120),
      k.outline(4, k.Color.fromHex("#8b5cf6")),
      k.color(20, 15, 30),
      k.z(10),
    ]);

    // Text with styled effects
    const txt: any = k.add([
      k.text("", {
        size: 28,
        width: k.width() - 230,
        align: "center",
        styles: {
          "default": {
            color: k.Color.fromHex("#e0d8f0"),
          },
          "velkoz": (idx: number) => ({
            color: k.Color.fromHex("#a855f7"),
            pos: k.vec2(0, k.wave(-4, 4, k.time() * 6 + idx * 0.5)),
            scale: k.wave(1, 1.15, k.time() * 3 + idx),
          }),
          "surprised": (idx: number) => ({
            color: k.Color.fromHex("#ef4444"),
            scale: k.wave(1, 1.3, k.time() * 2 + idx),
            pos: k.vec2(0, k.wave(0, 6, k.time() * 8)),
          }),
        },
        transform: (idx: number): any => {
          return {
            opacity: idx < txt.letterCount ? 1 : 0,
          };
        },
      }),
      k.pos(textbox.pos),
      k.anchor("center"),
      k.z(11),
      {
        letterCount: 0,
      },
    ]);

    // Character avatar (Velkoz) - positioned to the left and above textbox
    const baseAvatarPos = k.vec2(200, k.height() - 300);
    const avatar = k.add([
      k.sprite("velkoz"),
      k.scale(0.4),
      k.anchor("center"),
      k.pos(baseAvatarPos),
      k.color(255, 255, 255),
      k.z(5),
      k.rotate(0),
      {
        baseY: baseAvatarPos.y,
        floatOffset: 0,
      },
    ]);

    // Floating animation for Velkoz
    avatar.onUpdate(() => {
      // Gentle floating motion
      avatar.pos.y = avatar.baseY + Math.sin(k.time() * 1.5) * 12;
      // Subtle rotation
      avatar.angle = Math.sin(k.time() * 0.8) * 3;
    });

    function nextDialog() {
      curDialog = (curDialog + 1);
      
      // After last dialog, transition to actual quiz would happen
      if (curDialog >= dialogs.length) {
        k.add([
          k.text("(Demo complete - would transition to quiz)", {
            size: 20,
          }),
          k.pos(k.center().x, 50),
          k.anchor("center"),
          k.color(255, 200, 100),
        ]);
        return;
      }
      
      updateDialog();
    }

    function updateDialog() {
      const dialog = dialogs[curDialog];
      startWriting(dialog.text);
      
      // Apply effect if specified
      if (dialog.effect) {
        applyEffect(dialog.effect);
      }
    }

    function applyEffect(effect: string) {
      switch(effect) {
        case "shake":
          // Screen shake
          k.shake(12);
          // Make Velkoz pulse red
          const origColor = avatar.color?.clone() || k.rgb(255, 255, 255);
          avatar.color = k.rgb(255, 80, 80);
          k.wait(0.3, () => {
            avatar.color = origColor;
          });
          break;
        case "pulse":
          // Quick scale pulse
          const origScale = avatar.scale.x;
          k.tween(
            origScale,
            origScale * 1.15,
            0.15,
            (val) => avatar.scale = k.vec2(val, val),
            k.easings.easeOutQuad
          ).onEnd(() => {
            k.tween(
              origScale * 1.15,
              origScale,
              0.15,
              (val) => avatar.scale = k.vec2(val, val),
              k.easings.easeInQuad
            );
          });
          break;
        case "glow":
          // Purple glow particles around Velkoz
          for (let i = 0; i < 20; i++) {
            k.wait(i * 0.05, () => {
              const angle = k.rand(0, 360);
              const dist = k.rand(50, 100);
              const particle = k.add([
                k.circle(k.rand(4, 8)),
                k.pos(avatar.pos.add(k.Vec2.fromAngle(angle).scale(dist))),
                k.color(k.Color.fromHex("#a855f7")),
                k.opacity(0.8),
                k.lifespan(1),
                k.z(6),
              ]);
              
              // Fade out animation
              k.tween(0.8, 0, 0.5, (val) => {
                particle.opacity = val;
              });
            });
          }
          break;
      }
    }

    function startWriting(dialog: string) {
      isTalking = true;
      txt.letterCount = 0;
      txt.text = dialog;
      
      const formattedText = txt.text;
      // Approximate length (not perfect but works)
      const len = formattedText.replace(/\[.*?\]/g, '').length;

      const writing = k.loop(0.04, () => {
        txt.letterCount = Math.min(
          txt.letterCount + 1,
          len,
        );
        
        // Play voice sound
        k.play("velkoz_voice", {
          volume: 0.15,
        });

        if (txt.letterCount >= len) {
          isTalking = false;
          writing.cancel();
          
          // Auto-advance after a pause (1.5 seconds after text finishes)
          k.wait(1.5, () => {
            nextDialog();
          });
        }
      });
    }

    // Ambient particles for void effect
    k.loop(0.5, () => {
      k.add([
        k.circle(k.rand(2, 6)),
        k.pos(k.rand(0, k.width()), k.rand(0, k.height())),
        k.color(k.Color.fromHex("#8b5cf6")),
        k.opacity(k.rand(0.2, 0.5)),
        k.lifespan(k.rand(2, 4)),
        k.z(1),
        k.move(k.rand(0, 360), k.rand(20, 40)),
      ]);
    });
  });
}
