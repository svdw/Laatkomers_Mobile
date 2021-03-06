﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using VtiLeerlingenData;
using System.Web.Script.Services;

namespace Laatkomers_Mobile.Services
{
    /// <summary>
    /// Summary description for LaatkomerService
    /// </summary>
    [System.Web.Script.Services.ScriptService]
    public class LaatkomerService : System.Web.Services.WebService
    {
        [WebMethod]
        public List<FullLeerling> GetLaatkomersToDay()
        {
            LeerlingenDataContext context = new LeerlingenDataContext();
            HelpFunctions func = new HelpFunctions();
            List<FullLeerling> results = new List<FullLeerling>();

            results = (from lln in context.Leerlings
                       where lln.TeLaats.Count > 0
                       where lln.Active == true
                       join tlk in context.TeLaats on lln.ID equals tlk.Leerling
                       into tempTelaatkomers
                       from tlk2 in tempTelaatkomers.DefaultIfEmpty()
                       where tlk2.Schooljaar1.Jaren.Equals(func.GetHuidigSchooljaar().Jaren)
                       where tlk2.Datum.Value.Date.Equals(DateTime.Now.Date)
                       select new FullLeerling { ID = lln.ID, Naam = lln.Naam, VoorNaam = lln.VoorNaam, KlasNaam = lln.Kla.KlasNaam, KlasNr = lln.KlasNr, Datum = tlk2.Datum, Schooljaar = tlk2.Schooljaar1.Jaren, AantalTeLaat = lln.TeLaats.Where(tl => (tl.Goedgekeurd == false || tl.Goedgekeurd == null) && tl.Schooljaar1.Jaren.Equals(func.GetHuidigSchooljaar().Jaren)).Count() }
                    )
                   .ToList();

            return results.OrderBy(lln => lln.KlasNaam).ToList();
        }

        [WebMethod]
        [ScriptMethod(UseHttpGet = true, ResponseFormat = ResponseFormat.Json)]
        public string AddTeLaatKomer(string wisaId, string datetime)
        {
            HelpFunctions func = new HelpFunctions();
            LeerlingenDataContext context = new LeerlingenDataContext();
            //Verwijder voorloopnullen
            wisaId = wisaId.TrimStart('0');
            Leerling lln = (from llns in context.Leerlings where llns.Active == true && llns.WisaID.Equals(wisaId) select llns).FirstOrDefault();

            if (lln != null)
            {
                DateTime datum = Convert.ToDateTime(datetime);
                Schooljaar oSchooljaar = func.GetHuidigSchooljaar();

                // 2) Voeg record toe in de TeLaat tabel
                TeLaat telaat = new TeLaat
                {
                    Leerling = lln.ID,
                    Schooljaar = oSchooljaar.ID,
                    Goedgekeurd = false,
                    Reden = "",
                    Datum = datum
                };

                context.TeLaats.InsertOnSubmit(telaat);
                context.SubmitChanges();

                return "OK";
            }
            else
            {
                throw new Exception("Leerling niet gevonden");
            }
        }
    }
}
