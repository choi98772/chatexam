using SuperSocket.WebSocket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Server
{
    public class CClientUser : WebSocketSession<CClientUser>
    {
        int mSessionId;

        public void SetID(int sessionId) { mSessionId = sessionId; }
        public int GetID() { return mSessionId; }


    }
}
