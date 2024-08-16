phina.globalize();

console.log = function () { };  // ログを出す時にはコメントアウトする

const FPS = 60;  // 60フレ
const TIMER_MAX = (3 * 60 + 34) * FPS; // 3分34秒

const SCREEN_WIDTH = 1080;              // スクリーン幅
const SCREEN_HEIGHT = 1920;              // スクリーン高さ
const SCREEN_CENTER_X = SCREEN_WIDTH / 2;   // スクリーン幅の半分
const SCREEN_CENTER_Y = SCREEN_HEIGHT / 2;  // スクリーン高さの半分

var FONT_FAMILY = "'Press Start 2P','Meiryo',sans-serif";
var ASSETS = {
    image: {
        "lily": "./resource/lily.png",
    },
    sound: {
        "wrong_se": 'https://iwasaku.github.io/test11/UT-404/SSS2/resource/t02/12.mp3',
        "correct_se": 'https://iwasaku.github.io/test11/UT-404/SSS1/resource/t04/27.mp3',
        "clear_se": 'https://iwasaku.github.io/test11/UT-404/SSS4/resource/t01/04.mp3',
    }
};

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
    END: {
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
        "FE",
    ],
];

var group0 = null;
var group1 = null;
var group2 = null;
var group3 = null;
var player = null;
var stageInitTimer = 0;
var stageNum = 0;
var stageTimer = 0;
var lilyNumArray = [];
var lilyArray = [];
var nowScore = 0;
var totalSec = 0;
var playableMode = 0;
var playMode = null;
var initStageNumBG = null;

// 共有ボタン用
let postText = null;
const postURL = "https://iwasaku.github.io/test12/FFF/";
const postTags = "#ネムレス #NEMLESSS";

phina.main(function () {
    var app = GameApp({
        startLabel: 'logo',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        assets: ASSETS,
        fps: FPS,
        backgroundColor: 'black',

        // シーンのリストを引数で渡す
        scenes: [
            {
                className: 'LogoScene',
                label: 'logo',
                nextLabel: 'title',
            },
            {
                className: 'TitleScene',
                label: 'title',
                nextLabel: 'game',
            },
            {
                className: 'GameScene',
                label: 'game',
                nextLabel: 'game',
            },
        ]
    });

    // iOSなどでユーザー操作がないと音がならない仕様対策
    // 起動後初めて画面をタッチした時に『無音』を鳴らす
    app.domElement.addEventListener('touchend', function dummy() {
        var s = phina.asset.Sound();
        s.loadFromBuffer();
        s.play().stop();
        app.domElement.removeEventListener('touchend', dummy);
    });

    // fps表示
    //app.enableStats();

    // 実行
    app.run();
});

/*
* ローディング画面をオーバーライド
*/
phina.define('LoadingScene', {
    superClass: 'DisplayScene',

    init: function (options) {
        this.superInit(options);
        // 背景色
        var self = this;
        var loader = phina.asset.AssetLoader();

        // 明滅するラベル
        let label = phina.display.Label({
            text: "",
            fontSize: 64,
            fill: 'white',
        }).addChildTo(this).setPosition(SCREEN_CENTER_X, SCREEN_CENTER_Y);

        // ロードが進行したときの処理
        loader.onprogress = function (e) {
            // 進捗具合を％で表示する
            label.text = "{0}%".format((e.progress * 100).toFixed(0));
        };

        // ローダーによるロード完了ハンドラ
        loader.onload = function () {
            // Appコアにロード完了を伝える（==次のSceneへ移行）
            self.flare('loaded');
        };

        // ロード開始
        loader.load(options.assets);
    },
});

/*
 * ロゴ
 */
phina.define("LogoScene", {
    superClass: 'DisplayScene',

    init: function (option) {
        this.superInit(option);
        this.localTimer = 0;
        this.font1 = false;
        this.font2 = false;
    },

    update: function (app) {
        // フォントロード完了待ち
        var self = this;
        document.fonts.load('10pt "Press Start 2P"').then(function () {
            self.font1 = true;
        });
        document.fonts.load('10pt "icomoon"').then(function () {
            self.font2 = true;
        });
        if (this.font1 && this.font2) {
            self.exit();
        }
    }
});

/*
 * タイトル
 */
phina.define("TitleScene", {
    superClass: 'DisplayScene',

    init: function (option) {
        this.superInit(option);

        var playableModeStr = localStorage.getItem("fff.playableMode");
        if (playableModeStr === null) playableModeStr = "0";
        playableMode = parseInt(playableModeStr);

        var easyButtonText = (playableMode === 0) ? "START" : "EASY";

        this.titleLabel = Label({
            text: "0xFFFFFF",
            fontSize: 64,
            fontFamily: FONT_FAMILY,
            align: "center",
            fill: "#fff",
            x: SCREEN_CENTER_X,
            y: SCREEN_CENTER_Y - (SCREEN_CENTER_Y / 4),
        }).addChildTo(this);

        this.easyModeButton = Button({
            text: easyButtonText,
            fontSize: 32,
            fontFamily: FONT_FAMILY,
            fill: "hsl(240, 100.0%, 49.6%)",
            x: SCREEN_CENTER_X,
            y: SCREEN_CENTER_Y + 128 * 1,
            cornerRadius: 8,
        }).addChildTo(this);
        this.normalModeButton = Button({
            text: "NORMAL",
            fontSize: 32,
            fontFamily: FONT_FAMILY,
            fill: "hsl(275, 100.0%, 31.6%)",
            x: SCREEN_CENTER_X,
            y: SCREEN_CENTER_Y + 128 * 2,
            cornerRadius: 8,
        }).addChildTo(this);
        this.hardModeButton = Button({
            text: "HARD",
            fontSize: 32,
            fontFamily: FONT_FAMILY,
            fill: "hsl(338, 100.0%, 36.5%)",
            x: SCREEN_CENTER_X,
            y: SCREEN_CENTER_Y + 128 * 3,
            cornerRadius: 8,
        }).addChildTo(this);
        this.extremeModeButton = Button({
            text: "EXTREME",
            fontSize: 32,
            fontFamily: FONT_FAMILY,
            fill: "hsl(0, 100.0%, 50.0%)",
            x: SCREEN_CENTER_X,
            y: SCREEN_CENTER_Y + 128 * 4,
            cornerRadius: 8,
        }).addChildTo(this);

        this.localTimer = 0;
        this.easyModeButton.alpha = 0.0;
        this.easyModeButton.sleep();
        this.normalModeButton.alpha = 0.0;
        this.normalModeButton.sleep();
        this.hardModeButton.alpha = 0.0;
        this.hardModeButton.sleep();
        this.extremeModeButton.alpha = 0.0;
        this.extremeModeButton.sleep();
        switch (playableMode) {
            case 3:
                this.extremeModeButton.alpha = 1.0;
                this.extremeModeButton.wakeUp();
            // FALL THRU
            case 2:
                this.hardModeButton.alpha = 1.0;
                this.hardModeButton.wakeUp();
            // FALL THRU
            case 1:
                this.normalModeButton.alpha = 1.0;
                this.normalModeButton.wakeUp();
            // FALL THRU
            case 0:
                this.easyModeButton.alpha = 1.0;
                this.easyModeButton.wakeUp();
        }
        var self = this;
        this.easyModeButton.onpointstart = function () {
            playMode = PLAY_MODE.EASY;
            stageTimer = playMode.timer_max;
            self.exit();
        };
        this.normalModeButton.onpointstart = function () {
            playMode = PLAY_MODE.NORMAL;
            stageTimer = playMode.timer_max;
            self.exit();
        };
        this.hardModeButton.onpointstart = function () {
            playMode = PLAY_MODE.HARD;
            stageTimer = playMode.timer_max;
            self.exit();
        };
        this.extremeModeButton.onpointstart = function () {
            playMode = PLAY_MODE.EXTREME;
            stageTimer = playMode.timer_max;
            self.exit();
        };
    },

    update: function (app) {
        app.background = "rgba(0, 0, 0, 1.0)"; // 背景色
        // 時間が来たらデモへ
        //        if(++this.localTimer >= 5*app.fps){
        //            this.exit();DemoScene());
        //        }
    }
});

/*
 * ゲーム
 */
phina.define("GameScene", {
    superClass: 'DisplayScene',

    init: function (option) {
        this.superInit(option);

        group0 = DisplayElement().addChildTo(this);
        group1 = DisplayElement().addChildTo(this);
        group2 = DisplayElement().addChildTo(this);
        group3 = DisplayElement().addChildTo(this);

        clearArrays();
        player = new Player().addChildTo(group0);

        this.initStageNumLabel = Label({
            text: "STAGE\n\n1",
            fontSize: 128,
            fontFamily: FONT_FAMILY,
            align: "center",
            fill: "#fff",
            shadow: "#000",
            shadowBlur: 10,
            x: SCREEN_CENTER_X,
            y: SCREEN_CENTER_Y - 128,
        }).addChildTo(group3);
        this.timeStrLabel = Label({
            text: "TIME",
            fontSize: 64,
            fontFamily: FONT_FAMILY,
            align: "center",
            fill: "#fff",
            shadow: "#000",
            shadowBlur: 10,
            x: SCREEN_WIDTH - 160,
            y: 64,
        }).addChildTo(group3);
        this.nowStageTimerLabel = Label({
            text: "",
            fontSize: 64,
            fontFamily: FONT_FAMILY,
            align: "right",
            fill: "#fff",
            shadow: "#000",
            shadowBlur: 10,
            x: SCREEN_WIDTH - 48,
            y: 128,
        }).addChildTo(group3);
        this.nowStageNumStrLabel = Label({
            text: "STAGE",
            fontSize: 64,
            fontFamily: FONT_FAMILY,
            align: "left",
            fill: "#fff",
            shadow: "#000",
            shadowBlur: 10,
            x: 0 + 16,
            y: 64,
        }).addChildTo(group3);
        this.nowStageNumLabel = Label({
            text: "1",
            fontSize: 64,
            fontFamily: FONT_FAMILY,
            align: "left",
            fill: "#fff",
            shadow: "#000",
            shadowBlur: 10,
            x: 0 + 16,
            y: 128,
        }).addChildTo(group3);
        this.gameClearLabel = Label({
            text: "GAME CLEAR",
            fontSize: 64,
            fontFamily: FONT_FAMILY,
            align: "center",
            fill: "#fff",
            shadow: "#000",
            shadowBlur: 10,
            x: SCREEN_CENTER_X,
            y: (SCREEN_CENTER_Y / 2) - 180,
        }).addChildTo(group3);
        this.gameOverLabel = Label({
            text: "GAME OVER",
            fontSize: 64,
            fontFamily: FONT_FAMILY,
            align: "center",
            fill: "#fff",
            shadow: "#000",
            shadowBlur: 10,
            x: SCREEN_CENTER_X,
            y: (SCREEN_CENTER_Y / 2) - 180,
        }).addChildTo(group3);
        this.colorLabel = Label({
            text: "",
            fontSize: 64,
            fontFamily: FONT_FAMILY,
            align: "center",
            fill: "#fff",
            shadow: "#000",
            shadowBlur: 10,
            x: SCREEN_CENTER_X,
            y: SCREEN_CENTER_Y,
        }).addChildTo(group3);

        this.tweetButton = Button({
        }).addChildTo(group3);


        // X
        this.xButton = Button({
            text: String.fromCharCode(0xe902),
            fontSize: 32,
            fontFamily: "icomoon",
            fill: "#7575EF",
            x: SCREEN_CENTER_X - (SCREEN_CENTER_X / 2) - 80,
            y: SCREEN_CENTER_Y + (SCREEN_CENTER_Y / 2) + 180,
            cornerRadius: 8,
            width: 60,
            height: 60,
        }).addChildTo(group3);
        this.xButton.onclick = function () {
            // https://developer.x.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent
            let shareURL = "https://x.com/intent/tweet?text=" + encodeURIComponent(postText + "\n" + postTags + "\n") + "&url=" + encodeURIComponent(postURL);
            window.open(shareURL);
        };
        this.xButton.alpha = 0.0;
        this.xButton.sleep();

        // threads
        this.threadsButton = Button({
            text: String.fromCharCode(0xe901),
            fontSize: 32,
            fontFamily: "icomoon",
            fill: "#7575EF",
            x: SCREEN_CENTER_X - (SCREEN_CENTER_X / 2),
            y: SCREEN_CENTER_Y + (SCREEN_CENTER_Y / 2) + 180,
            cornerRadius: 8,
            width: 60,
            height: 60,
        }).addChildTo(group3);
        this.threadsButton.onclick = function () {
            // https://developers.facebook.com/docs/threads/threads-web-intents/
            // web intentでのハッシュタグの扱いが環境（ブラウザ、iOS、Android）によって違いすぎるので『#』を削って通常の文字列にしておく
            let shareURL = "https://www.threads.net/intent/post?text=" + encodeURIComponent(postText + "\n\n" + postTags.replace(/#/g, "")) + "&url=" + encodeURIComponent(postURL);
            window.open(shareURL);
        };
        this.threadsButton.alpha = 0.0;
        this.threadsButton.sleep();

        // bluesky
        this.bskyButton = Button({
            text: String.fromCharCode(0xe900),
            fontSize: 32,
            fontFamily: "icomoon",
            fill: "#7575EF",
            x: SCREEN_CENTER_X - (SCREEN_CENTER_X / 2) + 80,
            y: SCREEN_CENTER_Y + (SCREEN_CENTER_Y / 2) + 180,
            cornerRadius: 8,
            width: 60,
            height: 60,
        }).addChildTo(group3);
        this.bskyButton.onclick = function () {
            // https://docs.bsky.app/docs/advanced-guides/intent-links
            let shareURL = "https://bsky.app/intent/compose?text=" + encodeURIComponent(postText + "\n" + postTags + "\n" + postURL);
            window.open(shareURL);
        };
        this.bskyButton.alpha = 0.0;
        this.bskyButton.sleep();


        this.restartButton = Button({
            text: "RESTART",
            fontSize: 32,
            fontFamily: FONT_FAMILY,
            fill: "#B2B2B2",
            x: SCREEN_CENTER_X + (SCREEN_CENTER_X / 2),
            y: SCREEN_CENTER_Y + (SCREEN_CENTER_Y / 2) + 180,
            cornerRadius: 8,
            width: 240,
            height: 60,
        }).addChildTo(group3);

        this.gameClearLabel.alpha = 0.0;
        this.gameOverLabel.alpha = 0.0;
        this.colorLabel.alpha = 0.0;
        this.restartButton.alpha = 0.0;
        this.restartButton.sleep();

        initStageNumBG = phina.display.RectangleShape({
            width: SCREEN_WIDTH,
            height: SCREEN_WIDTH,
            fill: "#000000",
            stroke: "#000000",
            strokeWidth: 0
        });
        initStageNumBG.setPosition(SCREEN_CENTER_X, SCREEN_CENTER_Y);
        initStageNumBG.setScale(1.0, 1.0);
        initStageNumBG.interactive = false;
        initStageNumBG.alpha = 1.0;
        initStageNumBG.addChildTo(group2);

        var self = this;
        this.restartButton.onpointstart = function () {
            stageTimer = playMode.timer_max;
            self.exit();
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
                this.initStageNumLabel.alpha = 1.0;
                initStageNumBG.alpha = 1.0;
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
                    var tmpLilyBG = phina.display.RectangleShape({
                        width: 360,
                        height: 360,
                        fill: tmpFillStyle,
                        stroke: "#000000",
                        strokeWidth: 0
                    });
                    tmpLilyBG.setPosition(tmpPos.x, tmpPos.y);
                    tmpLilyBG.setScale(0.9, 0.9);
                    tmpLilyBG.interactive = true;
                    tmpLilyBG.boundingType = "rect";
                    tmpLilyBG.colorStr = tmpFillStyle.substr(1, 2) + "\n" + tmpFillStyle.substr(3, 2) + "\n" + tmpFillStyle.substr(5, 2);
                    //tmpLilyBG.checkHierarchy = true;
                    if (buttonIdx === 7) {
                        tmpLilyBG.onpointstart = function () {
                            if (player.status.isStart) {
                                // NGの後にタップされても無視する
                                if (player.result !== PL_RESULT.NG) {
                                    player.result = PL_RESULT.OK;
                                    console.log("OK");
                                };
                            }
                        }
                    } else {
                        tmpLilyBG.onpointstart = function () {
                            if (player.status.isStart) {
                                player.result = PL_RESULT.NG;
                                player.color = this.colorStr;
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
                this.initStageNumLabel.alpha = 0.0;
                initStageNumBG.alpha = 0.0;
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
                player.status = PL_STATUS.END;
            }
            if (player.result === PL_RESULT.OK) {
                if ((stageNum < 15) || (playMode === PLAY_MODE.EXTREME)) {
                    // next stage
                    player.status = PL_STATUS.INIT;
                    player.result = PL_RESULT.NONE;
                    SoundManager.play("correct_se");
                } else {
                    // game clear
                    player.status = PL_STATUS.END;
                }
            } else if (player.result === PL_RESULT.NG) {
                // game over
                player.status = PL_STATUS.END;
            }
            this.nowStageTimerLabel.text = Math.floor(stageTimer / app.fps);
        } else {
            if (!this.stopBGM) {
                if (player.result === PL_RESULT.OK) {
                    SoundManager.play("clear_se");
                } else {
                    SoundManager.play("wrong_se");
                }
                this.stopBGM = true;

                var self = this;
                // tweet ボタン
                postText = "0xFFFFFF" + playMode.tweet_txt + "\n";
                if (player.result === PL_RESULT.OK) {
                    postText += "全ステージクリア\nクリアタイム" + ((playMode.timer_max - stageTimer) / app.fps).toPrecision(5) + "秒";
                } else {
                    if (stageNum === 1) {
                        postText += "記録無し";
                    } else {
                        postText += "ステージ" + (stageNum - 1) + "　クリア";
                    }
                }

                // モード開放
                if (player.result === PL_RESULT.OK) {
                    switch (playMode) {
                        case PLAY_MODE.EASY:
                            if (playableMode <= 0) localStorage.setItem("fff.playableMode", "1");
                            break;
                        case PLAY_MODE.NORMAL:
                            if (playableMode <= 1) localStorage.setItem("fff.playableMode", "2");
                            break;
                        case PLAY_MODE.HARD:
                            if (playableMode <= 2) localStorage.setItem("fff.playableMode", "3");
                            break;
                    }
                }
            }

            this.colorLabel.alpha = 1.0;
            this.colorLabel.text = player.color;
            this.buttonAlpha += 0.05;
            if (this.buttonAlpha > 1.0) {
                this.buttonAlpha = 1.0;
            }
            if (player.result === PL_RESULT.OK) {
                this.gameClearLabel.alpha = this.buttonAlpha;
            } else {
                this.gameOverLabel.alpha = this.buttonAlpha;
            }
            this.xButton.alpha = this.buttonAlpha;
            this.threadsButton.alpha = this.buttonAlpha;
            this.bskyButton.alpha = this.buttonAlpha;
            this.restartButton.alpha = this.buttonAlpha;
            if (this.buttonAlpha > 0.7) {
                this.xButton.wakeUp();
                this.threadsButton.wakeUp();
                this.bskyButton.wakeUp();
                this.restartButton.wakeUp();
            }
        }
    }
});


/*
 * Player
 */
phina.define("Player", {
    superClass: "Sprite",

    init: function (option) {
        this.superInit("lily");
        this.setPosition(SCREEN_CENTER_X, SCREEN_CENTER_Y).setSize(360, 360).setScale(0, 0);
        this.setInteractive(false);
        this.status = PL_STATUS.INIT;
        this.result = PL_RESULT.NONE;
        this.color = "";
    },

    update: function (app) {
    },
});

/*
 * ジャケ絵
 */
phina.define("LilyFG", {
    superClass: "Sprite",

    init: function (posX, posY) {
        this.superInit("lily");
        this.direct = '';
        this.setInteractive(false);
        this.setPosition(posX, posY).setSize(360, 360).setScale(0.9, 0.9);
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
