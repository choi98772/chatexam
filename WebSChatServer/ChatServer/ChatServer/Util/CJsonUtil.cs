using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Util
{
    public class CJsonUtil
    {
        JObject mJson = null;

        public bool Parse(string json)
        {
            try
            {
                mJson = JObject.Parse(json);
            }
            catch(Exception e)
            {
                return false;
            }

            return true;
        }

        public int GetInt(string key, int defaultValue)
        {
            try
            {
                JToken temp = mJson[key];

                if (temp == null)
                    return defaultValue;

                return int.Parse(temp.ToString());
            }
            catch(Exception e)
            {
                return defaultValue;
            }
        }

        public float GetFloat(string key, float defaultValue)
        {
            try
            {
                JToken temp = mJson[key];

                if (temp == null)
                    return defaultValue;

                return float.Parse(temp.ToString());
            }
            catch (Exception e)
            {
                return defaultValue;
            }
        }

        public string GetString(string key, string defaultValue)
        {
            try
            {
                JToken temp = mJson[key];

                if (temp == null)
                    return defaultValue;

                return temp.ToString();
            }
            catch (Exception e)
            {
                return defaultValue;
            }
        }
    }
}
