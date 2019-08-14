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
export default class CChattingItem extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;
    
    @property
    textCount : number = 14;
    // LIFE-CYCLE CALLBACKS:
    mBubbleType : number = 0;

    // onLoad () {}

    start () {
    }

    // update (dt) {}
    SetString(value : string, bubbleType : number)
    {
        this.mBubbleType = bubbleType;

        if (value.length < this.textCount)
        {
            this.label.string = value;
        }
        else
        {
            var resultString : string = "";

            for (var i = 0;i < value.length;)
            {
                var count : number = this.textCount;
                
                if ((value.length - i) < count)
                    count = value.length - i;

                var temp : string = value.substr(i, count);

                if (resultString.length > 0)
                    resultString += "\n";

                resultString += temp;

                i += count;
            }

            this.label.string = resultString;
        }

        var size : cc.Size = this.label.node.getContentSize();

        this.node.setContentSize(size.width + 35, size.height + 35);
    }

    SetBubbleType(type : number)
    {
        this.mBubbleType = type;
    }

    GetBubbleType() : number
    {
        return this.mBubbleType;
    }

    GetWidth() : number
    {
        return this.node.getContentSize().width;
    }

    GetHeight() : number
    {
        return this.node.getContentSize().height;
    }

    SetPos(x : number, y : number)
    {
        this.node.setPosition(x, y);
    }

    GetX() : number
    {
        return this.node.getPositionX()
    }

    GetY() : number
    {
        return this.node.getPositionY();
    }
}
