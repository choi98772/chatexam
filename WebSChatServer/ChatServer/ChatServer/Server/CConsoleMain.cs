using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Server
{
    public class CConsoleMain
    {
        CWebSocketServer mServer = null;

        public void Init()
        {
            mServer = new CWebSocketServer();
            mServer.Init();
            mServer.StartServer();
        }

        public void Run()
        {
            Console.ReadLine();
        }

        public void Release()
        {
            if (mServer != null)
            {
                mServer.StopServer();
                mServer = null;
            }
        }
    }
}
