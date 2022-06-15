//console.log = function () { };  // ログを出す時にはコメントアウトする

const FPS = 60;  // 60フレ
const TIMER_MAX = (3 * 60 + 34) * FPS; // 3分34秒

const SCREEN_WIDTH = 1080;              // スクリーン幅
const SCREEN_HEIGHT = 1920;              // スクリーン高さ
const SCREEN_CENTER_X = SCREEN_WIDTH / 2;   // スクリーン幅の半分
const SCREEN_CENTER_Y = SCREEN_HEIGHT / 2;  // スクリーン高さの半分

var FONT_FAMILY = "'Press Start 2P','Meiryo',sans-serif";
var ASSETS = {
    "lily": "./resource/lily.png",
};
const wrongSE = new Howl({
    src: 'https://iwasaku.github.io/test11/UT-404/SSS2/resource/t02/12.mp3'
});
const correctSE = new Howl({
    src: 'https://iwasaku.github.io/test11/UT-404/SSS1/resource/t04/27.mp3'
});
const clearSE = new Howl({
    src: 'https://iwasaku.github.io/test11/UT-404/SSS4/resource/t01/04.mp3'
});

// 定義
var PLAY_MODE = defineEnum({
    EASY: {
        idx: 0,
        play_cnt: 0,
        timer_max: 30 * FPS,
        tweet_txt: '',
    },
    NORMAL: {
        idx: 1,
        play_cnt: 10,
        timer_max: 30 * FPS,
        tweet_txt: '(NORMAL)',
    },
    HARD: {
        idx: 2,
        play_cnt: 20,
        timer_max: 30 * FPS,
        tweet_txt: '(HARD)',
    },
    EXTREME: {
        idx: 3,
        play_cnt: 30,
        timer_max: 223 * FPS,   // 3分43秒
        tweet_txt: '(EXTREME)',
    },
});

var PL_STATUS = defineEnum({
    INIT: {
        value: 0,
        isStart: Boolean(0),
        isDead: Boolean(0),
        string: 'init'
    },
    START: {
        value: 1,
        isStart: Boolean(1),
        isDead: Boolean(0),
        string: 'start'
    },
    DEAD: {
        value: 2,
        isStart: Boolean(0),
        isDead: Boolean(1),
        string: 'dead'
    },
});
var PL_RESULT = defineEnum({
    NONE: {
        value: 0,
    },
    OK: {
        value: 1,
    },
    NG: {
        value: 2,
    },
});

var group0 = null;
var group1 = null;
var group2 = null;
var player = null;
var stageInitTimer = 0;
var stageNum = 0;
var stageTimer = 0;
var lilyNumArray = [];
var lilyArray = [];
var nowScore = 0;
var totalSec = 0;
var playMode = null;
var initStageNumBG = null;

const buttonPosTbl = [
    { x: SCREEN_CENTER_X - 360, y: SCREEN_CENTER_Y - 360 },
    { x: SCREEN_CENTER_X, y: SCREEN_CENTER_Y - 360 },
    { x: SCREEN_CENTER_X + 360, y: SCREEN_CENTER_Y - 360 },

    { x: SCREEN_CENTER_X - 360, y: SCREEN_CENTER_Y },
    //{x:SCREEN_CENTER_X, y:SCREEN_CENTER_Y},   // 中央は空ける  
    { x: SCREEN_CENTER_X + 360, y: SCREEN_CENTER_Y },

    { x: SCREEN_CENTER_X - 360, y: SCREEN_CENTER_Y + 360 },
    { x: SCREEN_CENTER_X, y: SCREEN_CENTER_Y + 360 },
    { x: SCREEN_CENTER_X + 360, y: SCREEN_CENTER_Y + 360 }
];
const buttonColorBaseTbl = [
    "#xxyyzz",
    "#xxyyFF",
    "#xxFFyy",
    "#xxFFFF",
    "#FFxxyy",
    "#FFxxFF",
    "#FFFFxx",
    "#FFFFFF",
];
const buttonColorTbl = [
    // EASY
    [
        "00",
        "00",
        "00",
        "00",
        "00",
        "00",
        "00",
        "00",
        "00",
        "00",
        "00",
        "00",
        "00",
        "00",
        "00",
    ],
    // NORMAL
    [
        "0F",
        "1F",
        "2F",
        "3F",
        "4F",
        "5F",
        "6F",
        "7F",
        "8F",
        "9F",
        "AF",
        "BF",
        "CF",
        "DF",
        "EF",
    ],
    // HARD
    [
        "F0",
        "F1",
        "F2",
        "F3",
        "F4",
        "F5",
        "F6",
        "F7",
        "F8",
        "F9",
        "FA",
        "FB",
        "FC",
        "FD",
        "FE",
    ],
    // EXTREME
    [
        "00",
        //        "FE",
    ],
];

tm.main(function () {
    // アプリケーションクラスを生成
    var app = tm.display.CanvasApp("#world");
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);    // サイズ(解像度)設定
    app.fitWindow();                            // 自動フィッティング有効
    app.background = "rgba(77, 136, 255, 1.0)"; // 背景色
    app.fps = FPS;                               // フレーム数

    var loading = tm.ui.LoadingScene({
        assets: ASSETS,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    });

    // 読み込み完了後に呼ばれるメソッドを登録
    loading.onload = function () {
        app.replaceScene(LogoScene());
    };

    // ローディングシーンに入れ替える
    app.replaceScene(loading);

    // 実行
    app.run();
});

/*
 * ロゴ
 */
tm.define("LogoScene", {
    superClass: "tm.app.Scene",

    init: function () {
        this.superInit();
        this.fromJSON({
            children: [
                {
                    type: "Label", name: "logoLabel",
                    x: SCREEN_CENTER_X,
                    y: SCREEN_CENTER_Y,
                    fillStyle: "#888",
                    fontSize: 64,
                    fontFamily: FONT_FAMILY,
                    text: "UNOFFICIAL GAME",
                    align: "center",
                },
            ]
        });
        this.localTimer = 0;
    },

    update: function (app) {
        // 時間が来たらタイトルへ
        //        if (++this.localTimer >= 5 * app.fps)
        this.app.replaceScene(TitleScene());
    }
});

/*
 * タイトル
 */
tm.define("TitleScene", {
    superClass: "tm.app.Scene",

    init: function () {
        this.superInit();
        var playableModeStr = localStorage.getItem("fff.playableMode");
        if (playableModeStr === null) playableModeStr = "0";

        var easyButtonText = (playableModeStr === "0") ? "START" : "EASY";
        this.fromJSON({
            children: [
                {
                    type: "Label", name: "titleLabel",
                    x: SCREEN_CENTER_X,
                    y: SCREEN_CENTER_Y - (SCREEN_CENTER_Y / 4),
                    fillStyle: "#fff",
                    fontSize: 64,
                    fontFamily: FONT_FAMILY,
                    text: "0xFFFFFF",
                    align: "center",
                },
                {
                    type: "FlatButton", name: "easyModeButton",
                    init: [
                        {
                            text: easyButtonText,
                            fontFamily: FONT_FAMILY,
                            fontSize: 32,
                            bgColor: "hsl(240, 100.0%, 49.6%)",
                        }
                    ],
                    x: SCREEN_CENTER_X,
                    y: SCREEN_CENTER_Y + 128 * 1,
                    alpha: 0.0,
                },
                {
                    type: "FlatButton", name: "normalModeButton",
                    init: [
                        {
                            text: "NORMAL",
                            fontFamily: FONT_FAMILY,
                            fontSize: 32,
                            bgColor: "hsl(275, 100.0%, 31.6%)",
                        }
                    ],
                    x: SCREEN_CENTER_X,
                    y: SCREEN_CENTER_Y + 128 * 2,
                    alpha: 0.0,
                },
                {
                    type: "FlatButton", name: "hardModeButton",
                    init: [
                        {
                            text: "HARD",
                            fontFamily: FONT_FAMILY,
                            fontSize: 32,
                            bgColor: "hsl(338, 100.0%, 36.5%)",
                        }
                    ],
                    x: SCREEN_CENTER_X,
                    y: SCREEN_CENTER_Y + 128 * 3,
                    alpha: 0.0,
                },
                {
                    type: "FlatButton", name: "extremeModeButton",
                    init: [
                        {
                            text: "EXTREME",
                            fontFamily: FONT_FAMILY,
                            fontSize: 32,
                            bgColor: "hsl(0, 100.0%, 50.0%)",
                        }
                    ],
                    x: SCREEN_CENTER_X,
                    y: SCREEN_CENTER_Y + 128 * 4,
                    alpha: 0.0,
                },
            ]
        });

        this.localTimer = 0;
        this.easyModeButton.sleep();
        this.normalModeButton.sleep();
        this.hardModeButton.sleep();
        this.extremeModeButton.sleep();
        switch (playableModeStr) {
            case "3":
                this.extremeModeButton.setAlpha(1, 0);
                this.extremeModeButton.wakeUp();
            case "2":
                this.hardModeButton.setAlpha(1, 0);
                this.hardModeButton.wakeUp();
            case "1":
                this.normalModeButton.setAlpha(1, 0);
                this.normalModeButton.wakeUp();
            case "0":
                this.easyModeButton.setAlpha(1, 0);
                this.easyModeButton.wakeUp();
        }
        var self = this;
        this.easyModeButton.onpointingstart = function () {
            playMode = PLAY_MODE.EASY;
            stageTimer = playMode.timer_max;
            self.app.replaceScene(GameScene());
        };
        this.normalModeButton.onpointingstart = function () {
            playMode = PLAY_MODE.NORMAL;
            stageTimer = playMode.timer_max;
            self.app.replaceScene(GameScene());
        };
        this.hardModeButton.onpointingstart = function () {
            playMode = PLAY_MODE.HARD;
            stageTimer = playMode.timer_max;
            self.app.replaceScene(GameScene());
        };
        this.extremeModeButton.onpointingstart = function () {
            playMode = PLAY_MODE.EXTREME;
            stageTimer = playMode.timer_max;
            self.app.replaceScene(GameScene());
        };
    },

    update: function (app) {
        app.background = "rgba(0, 0, 0, 1.0)"; // 背景色
        // 時間が来たらデモへ
        //        if(++this.localTimer >= 5*app.fps){
        //            this.app.replaceScene(DemoScene());
        //        }
    }
});

/*
 * デモ
 */
tm.define("DemoScene", {
    superClass: "tm.app.Scene",

    init: function () {
        this.superInit();
        this.fromJSON({
            children: [
                {
                    type: "Label", name: "demoLabel",
                    x: SCREEN_CENTER_X,
                    y: 320,
                    fillStyle: "#888",
                    fontSize: 64,
                    fontFamily: FONT_FAMILY,
                    text: "",
                    align: "center",
                },
            ]
        });
        this.localTimer = 0;
    },

    update: function (app) {
        // 時間が来たらタイトルへ
        if (++this.localTimer >= 5 * app.fps) {
            this.app.replaceScene(TitleScene());
        }

        // タッチしたらタイトルへ
        var pointing = app.pointing;
        // タッチしているかを判定
        if (pointing.getPointing()) {
            this.app.replaceScene(TitleScene());
        }
    }
});

/*
 * ゲーム
 */
tm.define("GameScene", {
    superClass: "tm.app.Scene",

    init: function () {
        this.superInit();

        group0 = tm.display.CanvasElement().addChildTo(this);
        group1 = tm.display.CanvasElement().addChildTo(this);
        group2 = tm.display.CanvasElement().addChildTo(this);

        clearArrays();
        player = new Player().addChildTo(group0);

        this.fromJSON({
            children: [
                {
                    type: "Label", name: "initStageNumLabel",
                    x: SCREEN_CENTER_X,
                    y: SCREEN_CENTER_Y - 128,
                    fillStyle: "#fff",
                    shadowColor: "#000",
                    shadowBlur: 10,
                    fontSize: 128,
                    fontFamily: FONT_FAMILY,
                    text: "STAGE\n\n1",
                    align: "center",
                },
                {
                    type: "Label", name: "timeStrLabel",
                    x: SCREEN_WIDTH - 160,
                    y: 64,
                    fillStyle: "#fff",
                    shadowColor: "#000",
                    shadowBlur: 10,
                    fontSize: 64,
                    fontFamily: FONT_FAMILY,
                    text: "TIME",
                    align: "center",
                },
                {
                    type: "Label", name: "nowStageTimerLabel",
                    x: SCREEN_WIDTH - 48,
                    y: 128,
                    fillStyle: "#fff",
                    shadowColor: "#000",
                    shadowBlur: 10,
                    fontSize: 64,
                    fontFamily: FONT_FAMILY,
                    text: "214",
                    align: "right",
                },
                {
                    type: "Label", name: "nowStageNumStrLabel",
                    x: 0 + 16,
                    y: 64,
                    fillStyle: "#fff",
                    shadowColor: "#000",
                    shadowBlur: 10,
                    fontSize: 64,
                    fontFamily: FONT_FAMILY,
                    text: "STAGE",
                    align: "left",
                },
                {
                    type: "Label", name: "nowStageNumLabel",
                    x: 0 + 16,
                    y: 128,
                    fillStyle: "#fff",
                    shadowColor: "#000",
                    shadowBlur: 10,
                    fontSize: 64,
                    fontFamily: FONT_FAMILY,
                    text: "1",
                    align: "left",
                },
                {
                    type: "Label", name: "gameClearLabel",
                    x: SCREEN_CENTER_X,
                    y: (SCREEN_CENTER_Y / 2) - 180,
                    fillStyle: "#fff",
                    shadowColor: "#000",
                    shadowBlur: 10,
                    fontSize: 64,
                    fontFamily: FONT_FAMILY,
                    text: "GAME CLEAR",
                    align: "center",
                },
                {
                    type: "Label", name: "gameOverLabel",
                    x: SCREEN_CENTER_X,
                    y: (SCREEN_CENTER_Y / 2) - 180,
                    fillStyle: "#fff",
                    shadowColor: "#000",
                    shadowBlur: 10,
                    fontSize: 64,
                    fontFamily: FONT_FAMILY,
                    text: "GAME OVER",
                    align: "center",
                },
                {
                    type: "FlatButton", name: "tweetButton",
                    init: [
                        {
                            text: "TWEET",
                            fontFamily: FONT_FAMILY,
                            fontSize: 32,
                            bgColor: "hsl(240, 80%, 70%)",
                        }
                    ],
                    x: SCREEN_CENTER_X - (SCREEN_CENTER_X / 2),
                    y: SCREEN_CENTER_Y + (SCREEN_CENTER_Y / 2) + 180,
                    alpha: 0.0,
                },
                {
                    type: "FlatButton", name: "restartButton",
                    init: [
                        {
                            text: "RESTART",
                            fontFamily: FONT_FAMILY,
                            fontSize: 32,
                            cornerRadius: 8,
                            bgColor: "hsl(240, 0%, 70%)",
                        }
                    ],
                    x: SCREEN_CENTER_X + (SCREEN_CENTER_X / 2),
                    y: SCREEN_CENTER_Y + (SCREEN_CENTER_Y / 2) + 180,
                    alpha: 0.0,
                },
            ]
        });

        this.gameClearLabel.setAlpha(0.0);
        this.gameOverLabel.setAlpha(0.0);
        this.tweetButton.sleep();
        this.restartButton.sleep();

        initStageNumBG = tm.display.RoundRectangleShape(SCREEN_WIDTH, SCREEN_WIDTH, {
            fillStyle: "#000000",   // 塗り潰し色
            strokeStyle: "#000000", // 縁の色
            lineWidth: 0
        });
        initStageNumBG.setPosition(SCREEN_CENTER_X, SCREEN_CENTER_Y);
        initStageNumBG.setScale(1.0, 1.0);
        initStageNumBG.interactive = false;
        initStageNumBG.setAlpha(1.0);
        initStageNumBG.addChildTo(group2);

        var self = this;
        this.restartButton.onpointingstart = function () {
            self.app.replaceScene(GameScene());
            stageTimer = TIMER_MAX;
        };

        this.buttonAlpha = 0.0;
        nowScore = 0;
        stageInitTimer = 0;
        stageNum = 0;
        this.frame = 0;
        this.stopBGM = false;
    },

    update: function (app) {

        if (player.status === PL_STATUS.INIT) {
            if (stageInitTimer === 0) {
                stageNum++;
                this.initStageNumLabel.text = "STAGE\n\n" + stageNum;
                this.initStageNumLabel.setAlpha(1.0);
                initStageNumBG.setAlpha(1.0);
                this.nowStageTimerLabel.text = Math.floor(stageTimer / app.fps);
                this.nowStageNumLabel.text = stageNum;

                // 一旦クリア
                clearArrays();

                // ボタンの並びをシャッフル
                var buttonArray = shuffle([0, 1, 2, 3, 4, 5, 6, 7]);
                console.log(">>>" + buttonArray);
                // ステージ数に応じた色のパネルを配置
                for (var ii = 0; ii <= 7; ii++) {
                    var buttonIdx = buttonArray[ii];
                    var tmpPos = buttonPosTbl[ii];
                    var tmpColorBase = buttonColorBaseTbl[buttonIdx];
                    var tmpColor = buttonColorTbl[playMode.idx][playMode === PLAY_MODE.EXTREME ? 0 : (stageNum - 1)];
                    var tmpFillStyle = tmpColorBase.replaceAll('xx', tmpColor).replaceAll('yy', tmpColor).replaceAll('zz', tmpColor);
                    console.log(">>>" + tmpFillStyle);
                    var tmpLilyBG = tm.display.RoundRectangleShape(360, 360, {
                        fillStyle: tmpFillStyle,   // 塗り潰し色
                        strokeStyle: "#000000", // 縁の色
                        lineWidth: 0
                    });
                    tmpLilyBG.setPosition(tmpPos.x, tmpPos.y);
                    tmpLilyBG.setScale(0.9, 0.9);
                    tmpLilyBG.interactive = true;
                    tmpLilyBG.boundingType = "rect";
                    //tmpLilyBG.checkHierarchy = true;
                    if (buttonIdx === 7) {
                        tmpLilyBG.onpointingstart = function () {
                            if (player.status.isStart) {
                                // NGの後にタップされても無視する
                                if (player.result !== PL_RESULT.NG) {
                                    player.result = PL_RESULT.OK;
                                    console.log("OK");
                                };
                            }
                        }
                    } else {
                        tmpLilyBG.onpointingstart = function () {
                            if (player.status.isStart) {
                                player.result = PL_RESULT.NG;
                                console.log("NG");
                            }
                        };
                    }
                    tmpLilyBG.addChildTo(group0);
                    lilyArray.push(tmpLilyBG);

                    var tmpLilyFG = LilyFG(tmpPos.x, tmpPos.y);
                    tmpLilyFG.addChildTo(group0);
                    lilyArray.push(tmpLilyFG);
                }
            }
            if (++stageInitTimer > 1 * app.fps) {
                stageInitTimer = 0;
                player.status = PL_STATUS.START;
                this.initStageNumLabel.setAlpha(0.0);
                initStageNumBG.setAlpha(0.0);
            }
            return;
        }

        if (!player.status.isDead) {
            if (player.status.isStart) {
                this.frame++;
                stageTimer--;
            }
            if (stageTimer < 0) {
                stageTimer = 0;
                player.status = PL_STATUS.DEAD;
            }
            if (player.result === PL_RESULT.OK) {
                if ((stageNum < 15) || (playMode === PLAY_MODE.EXTREME)) {
                    // next stage
                    player.status = PL_STATUS.INIT;
                    player.result = PL_RESULT.NONE;
                    correctSE.play();
                } else {
                    // game clear
                    player.status = PL_STATUS.DEAD;
                }
            } else if (player.result === PL_RESULT.NG) {
                // game over
                player.status = PL_STATUS.DEAD;
            }
            this.nowStageTimerLabel.text = Math.floor(stageTimer / app.fps);
        } else {
            if (!this.stopBGM) {
                if (player.result === PL_RESULT.OK) {
                    clearSE.play();
                } else {
                    wrongSE.play();
                }
                this.stopBGM = true;

                var self = this;
                // tweet ボタン
                var tweetText = "0xFFFFFF" + playMode.tweet_txt + "\n";
                if (player.result === PL_RESULT.OK) {
                    tweetText += "全ステージクリア\nクリアタイム" + ((TIMER_MAX - stageTimer) / app.fps).toPrecision(5) + "秒\n";
                } else {
                    if (stageNum === 1) {
                        tweetText += "記録無し\n";
                    } else {
                        tweetText += "ステージ" + (stageNum - 1) + "　クリア\n";
                    }
                }
                this.tweetButton.onclick = function () {
                    var twitterURL = tm.social.Twitter.createURL({
                        type: "tweet",
                        text: tweetText,
                        hashtags: ["ネムレス", "NEMLESSS"],
                        url: "https://iwasaku.github.io/test12/FFF/",
                    });
                    window.open(twitterURL);
                };
                // モード開放
                if (stageNum >= 15) {
                    switch (playMode) {
                        case PLAY_MODE.EASY:
                            localStorage.setItem("fff.playableMode", "1");
                            break;
                        case PLAY_MODE.NORMAL:
                            localStorage.setItem("fff.playableMode", "2");
                            break;
                        case PLAY_MODE.HARD:
                            localStorage.setItem("fff.playableMode", "3");
                            break;
                    }
                }
            }

            this.buttonAlpha += 0.05;
            if (this.buttonAlpha > 1.0) {
                this.buttonAlpha = 1.0;
            }
            if (player.result === PL_RESULT.OK) {
                this.gameClearLabel.setAlpha(this.buttonAlpha);
            } else {
                this.gameOverLabel.setAlpha(this.buttonAlpha);
            }
            this.tweetButton.setAlpha(this.buttonAlpha);
            this.restartButton.setAlpha(this.buttonAlpha);
            if (this.buttonAlpha > 0.7) {
                this.tweetButton.wakeUp();
                this.restartButton.wakeUp();
            }
        }
    }
});


/*
 * Player
 */
tm.define("Player", {
    superClass: "tm.app.Sprite",

    init: function () {
        this.superInit("lily", 360, 360);
        this.setPosition(SCREEN_CENTER_X, SCREEN_CENTER_Y).setScale(0, 0);
        this.setInteractive(false);
        this.status = PL_STATUS.INIT;
        this.result = PL_RESULT.NONE;
    },

    update: function (app) {
    },
});

/*
 * ジャケ絵
 */
tm.define("LilyFG", {
    superClass: "tm.app.Sprite",

    init: function (posX, posY) {
        this.spriteName = "lily";
        this.superInit(this.spriteName, 360, 360);
        this.direct = '';
        this.setInteractive(false);
        this.setPosition(posX, posY).setScale(0.9, 0.9);
    },

    update: function (app) {
    },
});

function clearArrays() {
    var self = this;

    for (var ii = self.lilyArray.length - 1; ii >= 0; ii--) {
        var tmp = self.lilyArray[ii];
        if (tmp.parent === null) console.log("NULL!!");
        else tmp.remove();
        self.lilyArray.erase(tmp);
    }
}

// Fisher–Yates shuffle
const shuffle = ([...array]) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
