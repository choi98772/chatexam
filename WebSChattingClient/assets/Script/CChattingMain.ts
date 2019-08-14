// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
import CChattingItem from "./CChattingItem";
import CTimeUtil from "./CTimeUtil";
import CWebSocket from "./CWebSocket";
import Base64 = require("./webtoolkit.base64");

const {ccclass, property} = cc._decorator;

@ccclass
export default class CChatringMain extends cc.Component {

    @property(cc.Node)
    mContent: cc.Node = null;

    @property(cc.Prefab)
    mBubble1 : cc.Prefab = null;

    @property(cc.Prefab)
    mBubble2 : cc.Prefab = null;

    @property(cc.EditBox)
    mEditBox : cc.EditBox = null;

    static mInstance : CChatringMain = null;

    static GetInstance() : CChatringMain
    {
        return this.mInstance;
    }

    mCurrentHeight : number = 0;

    mTimeInfo : CTimeUtil = null;
    mWebsocket : CWebSocket = null;
    mMyName : string = null;
    mUserId : number = -1;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        CChatringMain.mInstance = this;

        this.mTimeInfo = new CTimeUtil();
        this.mTimeInfo.Catch();

        this.mWebsocket = new CWebSocket();

        //아래에서 서버 주소를 바꿔야합니다.
        this.mWebsocket.Init("ws://서버주소:33777", this.OnConnected, this.OnMsgArrived, this.OnConnectionClosed);

        this.mMyName = "Guest" + Math.floor((Math.random() * 1000000));

        console.log("user name : " + this.mMyName);
    }

    update (dt)
    {
        /*if (!this.mEditBox.isFocused)
        {
            console.log("set edit focus");
            this.mEditBox.setFocus();
        }*/

        /*if (this.mTimeInfo.GetPassedTime() >= 1.0)
        {
            this.mTimeInfo.Catch();

            console.log("update loop");
        }*/
    }

    AddBubble(bubbleType : number, text : string)
    {
        var baseObj : cc.Prefab = null;

        switch(bubbleType)
        {
            case 0:
                baseObj = this.mBubble1;
                break;
            case 1:
                baseObj = this.mBubble2;
                break;
        }

        if (baseObj == null)
        {
            console.log("base object not found");
            return;
        }

        var obj : cc.Node = cc.instantiate(baseObj);

        if (obj == null)
        {
            console.log("instantiate failed.");
            return;
        }

        var item : CChattingItem = obj.getComponent(CChattingItem);

        if (item == null)
        {
            console.log("Chatting item component not found.");

            obj.destroy();

            return;
        }

        this.mContent.addChild(obj);
        item.SetString(text, bubbleType);

        var itemWidth : number = item.GetWidth();
        var itemHeight : number = item.GetHeight();

        var contentSize : cc.Size = this.mContent.getContentSize();
        
        var x, y = this.mCurrentHeight + 5 + (itemHeight * 0.5);

        this.mCurrentHeight = y + (itemHeight * 0.5) + 5;

        var left : number = contentSize.width * -0.5;
        var right : number = contentSize.width * 0.5;

        contentSize.height = this.mCurrentHeight;

        this.mContent.setContentSize(contentSize);

        if (this.mCurrentHeight > 505)
            this.mContent.setPositionY(this.mCurrentHeight - 505 + 253);

        switch(bubbleType)
        {
            case 0:
                {
                    x = left + (itemWidth * 0.5) + 20;
                }
                break;
            case 1:
                {
                    x = right - (itemWidth * 0.5) - 20;
                }
                break;
        }

        item.SetPos(x, -y);

        console.log("item added : " + x + ", " + y + ", maxheight = " + this.mCurrentHeight + "cs : " + contentSize.width);
    }

    OnMessageEntered()
    {
        if (this.mEditBox.string != null && this.mEditBox.string.length > 0)
        {
            this.AddBubble(1, this.mEditBox.string);

            this.SendChattingMsg(this.mEditBox.string);
            this.mEditBox.string = "";
        }
    }

    OnClickConnect()
    {
        if (this.mWebsocket.IsConnected())
        {
            this.AddBubble(1, "이미 접속 중입니다.");
            return;
        }

        this.mWebsocket.Connect();
    }

    SendChattingMsg(msg : string)
    {
        if (!this.mWebsocket.IsConnected())
        {
            this.AddBubble(1, "서버에 접속되지 않았습니다.");
            return;
        }

        if (this.mUserId == -1)
        {
            this.AddBubble(1, "아직 메시지를 보낼 수 없습니다.");
            return;
        }
        
        var sendData = {
            id : 1,
            userid : this.mUserId,
            name : Base64.encode(this.mMyName),
            msg : Base64.encode(msg),
        };

        var json : string = JSON.stringify(sendData);
        this.mWebsocket.SendMsg(json);

        console.log(json);
    }

    RequestUserId()
    {
        if (!this.mWebsocket.IsConnected())
            return;

            var sendData = {
                id : 0,
            };
    
            this.mWebsocket.SendMsg(JSON.stringify(sendData));
    }

    OnConnected()
    {
        CChatringMain.GetInstance().AddBubble(1, "서버에 접속되었습니다.");

        CChatringMain.GetInstance().RequestUserId();
    }

    SetUserId(userId)
    {
        this.mUserId = userId;
        this.mMyName = "Guest" + userId;
    }

    OnMsgArrived(msg : string)
    {
        try
        {
            var data = JSON.parse(msg);

            switch (data.id)
            {
                case 0: //유저 id수신됨
                    {
                        CChatringMain.GetInstance().SetUserId(parseInt(data.userid));

                        console.log("recv my id : " + CChatringMain.GetInstance().mUserId);
                    }
                    break;
                case 1: //메시지 수신됨
                    {
                        //내가 보낸메시지면
                        if (parseInt(data.userid) == CChatringMain.GetInstance().mUserId)
                            return;

                        console.log("sender id : " + data.userid);
                        console.log("my id : " + CChatringMain.GetInstance().mUserId);
                        
                        try
                        {
                            var name : string = Base64.decode(data.name);
                            var msg : string = Base64.decode(data.msg);

                            console.log("name : " + name);
                            console.log("msg : " + msg);

                            var chat : string = name + " : " + msg;

                            CChatringMain.GetInstance().AddBubble(0, chat);
                        }
                        catch(e)
                        {
                            console.log(e.toString());
                        }                        
                    }
                    break;
            }
        }
        catch(e)
        {

        }
    }

    OnConnectionClosed()
    {
        CChatringMain.GetInstance().AddBubble(1, "서버접속이 해제되었습니다.");
    }
}
