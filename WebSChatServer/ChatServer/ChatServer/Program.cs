using ChatServer.Server;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer
{
    class Program
    {
        static void Main(string[] args)
        {
#if ENABLE_SERVICE
            ServiceBase[] ServicesToRun;
            ServicesToRun = new ServiceBase[] { new ChatServer.Service.Service() };
            ServiceBase.Run(ServicesToRun);
#else
            CConsoleMain server = new CConsoleMain();

            server.Init();
            server.Run();
            server.Release();
#endif
        }
    }
}
