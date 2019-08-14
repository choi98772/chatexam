// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class CWebSocket {
    mIsConnected : boolean = false;
    mUrl : string = null;
    mOpenCallback : Function = null;
    mMessageCallback : Function = null;
    mCloseCallback : Function = null;

    mWebSocket : WebSocket = null;

    Init(url : string, openCallback : Function, msgCallback : Function, closeCallback : Function)
    {
        this.mUrl = url;
        this.mOpenCallback = openCallback;
        this.mMessageCallback = msgCallback;
        this.mCloseCallback = closeCallback;
    }

    IsConnected() : boolean
    {
        return this.mIsConnected;
    }

    GetWebSocket() : WebSocket
    {
        return this.mWebSocket;
    }

    Connect()
    {
        this.mWebSocket = new WebSocket(this.mUrl);

        var thisInstance : CWebSocket = this;

        this.mWebSocket.onopen = function(){
            thisInstance.OnWebSocketOpened();
        }

        this.mWebSocket.onmessage = function(msg){
            thisInstance.OnMessageArrive(msg);
        }

        this.mWebSocket.onclose = function(evt){
            thisInstance.OnWebSocketClosed(evt);
        }
    }

    Close()
    {
        if (this.mWebSocket != null)
        {
            this.mWebSocket.close();
        }

        this.mIsConnected = false;
    }
    
    OnWebSocketOpened()
    {
        this.mIsConnected = true;
        if (this.mOpenCallback != null)
        {
            this.mOpenCallback();
        }
    }

    OnMessageArrive(msg : MessageEvent)
    {
        if (this.mMessageCallback == null)
            return;

        this.mMessageCallback(msg.data);
    }

    OnWebSocketClosed(evt)
    {
        this.mIsConnected = false;
        this.mWebSocket = null;

        if (this.mCloseCallback != null)
        {
            this.mCloseCallback();
        }        
    }

    SendMsg(msg : string) : boolean
    {
        if (!this.mIsConnected)
            return false;

        this.mWebSocket.send(msg);
    }
}
