using ChatServer.Server;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Service
{
    public class Service : ServiceBase
    {
        CConsoleMain mServer = null;

        public Service()
        {
            ServiceName = "GameServer";
            mServer = new CConsoleMain();
        }

        protected override void OnStart(string[] args)
        {
            mServer.Init();
        }

        protected override void OnStop()
        {
            mServer.Release();
        }
    }
}
