using ChatServer.Util;
using Newtonsoft.Json.Linq;
using SuperSocket.SocketBase;
using SuperSocket.SocketBase.Config;
using SuperSocket.SocketBase.Logging;
using SuperSocket.WebSocket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Server
{
    public class CWebSocketServer : WebSocketServer<CClientUser>
    {
        int mMaxUsers = 0;
        int mPort = 0;
        int mLastSessionId = 0;
        string mServerName = "Websocket Server";

        List<CClientUser> mUserList = null;
        List<string> mMsgList = null;

        public int GetPort()
        {
            return mPort;
        }

        public int GetMaxUser()
        {
            return mMaxUsers;
        }

        //해당 포트로 서버 초기화
        public void Init()
        {
            mUserList = new List<CClientUser>();
            mMsgList = new List<string>();

            mPort = 33777;
            mMaxUsers = 1000;
        }

        //서버 시작
        public bool StartServer()
        {
            var rootConfig = new RootConfig { DisablePerformanceDataCollector = true };
            var c = new ServerConfig();

            c.Port = mPort;
            c.Ip = "Any";
            c.MaxConnectionNumber = mMaxUsers;
            c.Mode = SocketMode.Tcp;
            c.Name = mServerName;

            NewSessionConnected += new SessionHandler<CClientUser>(mWebSocketServer_NewSessionConnected);
            NewMessageReceived += new SessionHandler<CClientUser, string>(appServer_NewMessageReceived);
            SessionClosed += new SessionHandler<CClientUser, CloseReason>(mWebSocketServer_SessionClosed);

            bool ret = Setup(rootConfig, c, null, null, new ConsoleLogFactory(), null, null);

            if (!ret)
            {
                Console.WriteLine("server starting failed.");
                return false;
            }

            return Start();
        }

        //서버 종료
        public void StopServer()
        {
            Stop();

            Console.WriteLine("server stopping.");
        }

        void appServer_NewMessageReceived(CClientUser session, string message)
        {
            try
            {
                CJsonUtil json = new CJsonUtil();

                if (!json.Parse(message))
                {
#if DEBUG
                    Console.WriteLine("invalid message arrived0");
#endif
                    return;
                }

                int id = json.GetInt("id", -1);

                if (id < 0)
                {
#if DEBUG
                    Console.WriteLine("invalid message arrived1");
#endif
                    return;
                }

                switch(id)
                {
                    case 0: //사용자 id요청
                        {
#if DEBUG
                            Console.WriteLine("user id requested");
#endif
                            SendUserId(session);

                            for (int i = 0; i < mMsgList.Count; ++i)
                                SendMessage(session, mMsgList[i]);
                        }
                        break;
                    case 1: //메시지 전송
                        {

                            if (mMsgList.Count < 10)
                                mMsgList.Add(message);
                            else
                            {
                                mMsgList.RemoveAt(0);
                                mMsgList.Add(message);
                            }
#if DEBUG
                            Console.WriteLine("chat message arrived");
#endif
                            BroadcastMessage(message);
                        }
                        break;
                    default:
                        {
#if DEBUG
                            Console.WriteLine("invalid message arrived2");
#endif
                        }
                        break;
                }
            }
            catch(Exception e)
            {

            }
        }

        void mWebSocketServer_NewSessionConnected(CClientUser session)
        {
#if DEBUG
            Console.WriteLine("new session arrived");
#endif

            session.SetID(++mLastSessionId);

            lock(mUserList)
            {
                try
                {
                    int index = FindEmptySessionIndex();

                    if (index < 0)
                        mUserList.Add(session);
                    else
                        mUserList[index] = session;
                }
                catch(Exception e)
                {
                    Console.WriteLine(e.ToString());
                }
            }            
        }

        void mWebSocketServer_SessionClosed(CClientUser session, CloseReason reason)
        {
#if DEBUG
            Console.WriteLine("session closed");
#endif
            lock (mUserList)
            {
                try
                {
                    int index = FindSessionIndex(session);

                    if (index < 0)
                        return;

                    mUserList[index] = null;
                }
                catch(Exception e)
                {
                    Console.WriteLine(e.ToString());
                }
            }            
        }

        void SendUserId(CClientUser session)
        {
            JObject json = new JObject();

            json.Add("id", 0);
            json.Add("userid", session.GetID());

            session.Send(json.ToString());
#if DEBUG
            Console.WriteLine("SendUserId : " + json.ToString());
#endif
        }

        void SendMessage(CClientUser session, string msg)
        {
            session.Send(msg);
        }

        void BroadcastMessage(string msg)
        {
            for (int i = 0;i < mUserList.Count; ++i)
            {
                if (mUserList[i] != null)
                    mUserList[i].Send(msg);
            }
        }

        int FindSessionIndex(CClientUser session)
        {
            for (int i = 0;i < mUserList.Count; ++i)
            {
                if (mUserList[i] == null)
                    continue;

                if (mUserList[i].GetID() == session.GetID())
                {
                    return i;
                }
            }

            return -1;
        }

        int FindEmptySessionIndex()
        {
            for (int i = 0; i < mUserList.Count; ++i)
            {
                if (mUserList[i] == null)
                    return i;
            }

            return -1;
        }
    }
}
