// 
}
}500 });
  tus:  }, { sta
   us',atosit stdepd to check : 'Failesage  meslse,
    ess: fasucc     se.json({
 extResponturn N);
    re:', errororcheck errstatus osit r('Deple.erro   conso(error) {
 
  } catch 
); } },
     s,
   mationnfircodeposit.ions: irmat conf       tatus,
: deposit.sus     statncy,
   rret.cucy: deposirenur,
        ctring()unt.toSposit.amoount: de  am
      ash,posit.txHh: detxHas    .id,
    id: deposit{
        :   deposite,
    s: truces  suc   se.json({
 pontRes Nex  return

   });
    }},
     
        dAt,it.confirmeupdatedDeposmedAt: fir con     ,
    nfirmationscoDeposit.pdatedations: uonfirm       c
   status,osit.pdatedDep   status: u       ber(),
umsd.toNt.amountUtedDepositUsd: upda amoun
         currency,Deposit. updatedcy:rren        cu  g(),
rinount.toStosit.amatedDept: updoun am,
         it.txHashdDepossh: update      txHa   id,
 posit.edDe  id: updat     : {
   positde
        ss: true,ce     sucjson({
   se.tRespon  return Nex
    }

           });         },
,
           }  MED',
   : 'CONFIRtatus           sns,
   onfirmatios: tx.cirmation     conf       Data: {
         newid,
     osit.ep entityId: d         posit',
  'de   entity: 
         onfirmed',osit_c: 'dep action
           sit.userId,poId: de    user
          data: {({
        tLog.createsma.audi await pri  
     mationonfir c  // Log   

      );)
     er(Usd.toNumbntmouposit.a      de    ring(),
oStamount.tposit.      de  
  y,sit.currenc     depo   erId,
    deposit.us        alance(
teUserBt upda      awai {
  FIRMED')s !== 'CONposit.statu&& desConfirmed  (i     ife balance
 , updatedy confirmewl    // If n  });

  
      },l,
       nulDate() :? new nfirmed sCormedAt: i       confiING',
   : 'CONFIRMED' 'CONFIRMrmed ? onfi isC   status:    tions,
   irma tx.confrmations:nfi   co {
       ta:    da   },
  deposit.id id:{    where: ate({
     it.updeposisma.dt = await predDeposiat const updsit
     depoUpdate 
      //   );
e
     NetworkTypin asdeposit.cha        rmations,
  tx.confi
      mations(firsEnoughCond = ha isConfirmeconst      
on;on.transacti= verificatinst tx       coion) {
ct.transaficationcess && veriation.sucicif if (ver

   Type
    );Networks osit.chain a
      dep txHash,
     n(ansactioTrify = await verrificationt ve    conss
n for updatelockchaiheck b// C  }

    
  
      });        },,
irmedAtosit.confirmedAt: depnf         coations,
 osit.confirmons: depati  confirm    
    tatus,eposit.status: d         sumber(),
 untUsd.toNmo.a: depositUsd amount         cy,
current.cy: deposi  curren    ),
    t.toString(posit.amounamount: de          .txHash,
ash: deposit      txHd,
     deposit.i        id:{
    deposit:   
     true,ccess:     su.json({
   NextResponseeturn    r
   ') {FIRMED'CONtus === it.sta   if (depost status
 rencurn irmed, retur confalready    // If 
    }

 404 });, { status:      }und',
 fosit notepoe: 'Dmessag      : false,
  ss       succe{
 nse.json(Respoturn Next
      reuserId) { decoded.Id !==t.usersi|| depof (!deposit });

    ish },
    Ha { txhere: w{
     e(findUniqu.deposit. prismaawaitdeposit = onst osit
    c// Get dep
        }
400 });
 status:       }, {red',
quihash rection 'Transa  message:       
se,: falss      succe.json({
  xtResponseNe     return ash) {
 if (!txH  

  ('txHash');etrams.gearchPaHash = sst tx   con.url);
 L(request= new URhParams } searc const {     }

   401 });
us: tat}, { sn',
      valid toke 'Inssage:
        mese,cess: fal
        sucn({sponse.jsoNextRen retur
      coded) {de if (!
    
   yJWT(token);oded = verif  const dec');
  er ', 'earce('Bder.replahHea autt token = cons
       }

);atus: 401 }   }, { st',
   rizedauthoe: 'Un      message,
  ess: fals  succ
      json({sponse.tRe return Nex
     der) {Heaf (!authon');
    iorizatis.get('authquest.headerer = ret authHeadns
    cotry {uest) {
  est: NextReq GET(requtionasync funcort 
 */
exptustak deposit s checndpoint to * GET e*
e;
}

/*balanceturn 

  r },
  });d,
    amountUslanceUsd:      bamount,
ericAd: numalDepositeot    tmount,
  ericAbalance: num
        currency,    ,
serId: {
      u
    create),
    }, new Date(ated:   lastUpd },
   ,
     mountUsdement: a    incr{
    alanceUsd:  b       },
 t,
   ericAmouncrement: num     in  {
 ed: eposittotalD,
       }    ,
 mountumericAincrement: n{
        ce: 
      balanate: {,
    upd  }    },
   rency,
      cur
   serId, u     
   {cy:rrenId_cu    user  
 {here:  wert({
  .balance.ups prismaawaitbalance = st on
  cancebale  or creat // Getount);

 t(amoa= parseFlAmount nst numeric
  co {d: number
)
  amountUsg,: strin  amountng,
strirency: urg,
  cstrinuserId: 
  ance(eUserBaldat upunctionasync fit
 */
ed deposter confirmlance afr bae use
 * Updat
/** }
}
);
  500 }tus:, { sta,
    }_ERROR'OWN'UNKN: ssage .meoror ? errf Errr instanceoror: erroer  sit',
    y depoerifo viled tFaessage: 'se,
      mss: falsuccen({
      jsoe.NextResponsturn 
    reror);:', erion errorrificatsit veerror('Depo    console.rror) {
h (e
  } catc;
  })      },
  irmedAt,
deposit.confonfirmedAt:   cAt,
      ified.verdepositdAt: rifie      veing(),
  .toStrockNumber?eposit.blumber: d blockN
       ons,tiConfirmat.requiredeposions: dmatidConfir requirens,
       rmatioeposit.confi: dationsnfirmco
        it.status,tus: depos      sta,
  .toNumber()amountUsdsit.Usd: depo amount  ency,
     urrsit.c depo currency:(),
       Stringit.amount.tot: depos    amoun    txHash,
: deposit.shtxHa
        sit.id,  id: depo       {
osit:,
      depations})`Confirmrequired${}/rmationsx.confi (${tnfirmationscoWaiting for d. bmitteosit suDep: `    unt!' 
    ur accoedited to yond crmed aonfirDeposit c? ' 
        Confirmedge: isessa    m true,
  cess:     suce.json({
 nsespotRturn Nex
    re   });
   },
 '),
   ser-agentet('ut.headers.gnt: reques  userAge      quest.ip,
 re') ||-forx-forwardeds.get('aderuest.heess: reqipAddr
                },   status,

       firmations,s: tx.confirmation     con  Usd,
   unt         amocurrency,
          
 : tx.value,     amount
       txHash,      a: {
      newDatd,
    t.iyId: deposientit
        eposit',  entity: 'd    
  _submitted',it: 'deposirmed' onfosit_c'depConfirmed ? on: is     acti  serId,
 d: decoded.u      userI
  ata: {{
      de(itLog.creatprisma.aud
    await g action
    // Lod);
    }
untUsx.value, amourrency, tuserId, cce(decoded.analupdateUserBit     awa{
  Confirmed) f (ise
    ibalancser te ud, updaconfirmeIf   // ;

  
    })},     
 ,ulle() : ned ? new DatConfirmfirmedAt: iscon      ),
  ate(At: new D    verified
    (),.toString / 1e9)tx.gasPrice)at(rseFloGwei: (paricesP        gaed,
ed: tx.gasUsasUs       gmp,
 kTimestablocp: tx.mestam  blockTi   umber),
   blockNx.gInt(tber: Bi   blockNum,
     onsedConfirmati      requirons,
  onfirmatitions: tx.c  confirmatus,
           sta,
      amountUsdin,
     cha       
 cy,curren      
  value,nt: tx.   amou
     se(),erCa tx.to.toLowss:dre       toAdCase(),
 oLowerrom.ts: tx.fomAddres
        fr     txHash,.id,
   : wallet    walletIdserId,
    ded.uId: decouser {
              data:{
e(eatcrt.a.deposiit prismsit = awa  const depod
  sit recorpo/ Create de  /

   'PENDING';ONFIRMING' :ns > 0 ? 'C.confirmatiotx: MED' IRCONFed ? 'Confirmis status = constype);
    etworkTn as N chainfirmations,ons(tx.coConfirmatisEnoughhaConfirmed =     const ise);
NetworkTypain as ns(chatioredConfirmequietRions = gonfirmat requiredC
    constations on confirmbased status // Determine;

    rrency), cuuex.valUsdValue(tlateait calcu = awamountUsd
    const USD valuealculate 
    // C 'MATIC';
       :            B' 
 'BN= 'bsc' ?chain ==:                    ? 'ETH' 
 t'm-testnethereu === 'eain chm' ||reu 'ethein ===ncy = charreonst cu   c
 sed on chain currency banetermi   // De  }

       }
  0 });
40us: , { stat     }MATCH',
   IS'AMOUNT_M   error:        Amount}`,
tx}, Got: ${pected ${exExpected:h. smatcnt mimousage: `A    mese,
      cess: fals suc         on({
.jsxtResponse return Ne   
    01) {rence > 0.00fe (dif  
      ifted);
     - expectxAmountth.abs(ence = Ma differnst     comount);
 edActpeeFloat(exarsxpected = ponst e     clue);
 vaseFloat(tx.ount = paronst txAm    c {
  ount)ctedAmpe if (exded
    provify amount if    // Veri

    }
us: 400 });   }, { stat
   ','TX_FAILED   error: in',
     chacklo failed on bnsaction 'Tra    message:e,
    ccess: fals      su  .json({
sextResponNereturn ) {
      = 'failed's == (tx.statuded
    ifeeccion suy transactVerif    // 
    }

 });tus: 400 { sta
      },,ATCH'SS_MISMrror: 'ADDRE
        ellet',cted waonneh your cmatcer does not ction sendsasage: 'Tranes   m  false,
    success: n({
       sponse.jsoReextn Nretur     
 )) {owerCase(oLt.address.tle) !== waltoLowerCase(tx.from.et
    if (user's wall matches om addressfy fr/ Veri   /  }

    400 });
s: { statu },
     DDRESS',IT_APOSINVALID_DEerror: '       `,
 s}dresplatformAd send to: ${. Pleaseosit address depge: `Invalid      messase,
  cess: fal       suc
 e.json({esponsNextRn      retur)) {
 se(ss.toLowerCarmAddrelatfo p) !==e(.toLowerCasf (tx.to
    iESS!;OSIT_ADDRRM_DEP_PLATFOBLIC_PUEXTnv.Ncess.e = proAddressnst platformess
    colatform addr pnt to sen isy transactio Verif
    //nsaction;
cation.traerifist tx = v
    con
    }
);: 404 } { status   },ND',
   _FOUOT: 'TX_Nerror        ockchain',
on blound n not fTransactioe: ' messag       alse,
 fccess:su        
json({esponse.NextR    return on) {
  ransactiication.t| !verifcess |cation.sucifi   if (!ver;

 pe) NetworkTyain assh, chction(txHaansaTr verifywait= aion ficatconst verihain
    on blockcansaction ify tr// Ver   }

    400 });
 tatus: }, { s    ,
  _WALLET'rror: 'NO     et.`,
   et firswallonnect a ase cnnected. Plewallet coo ${chain} age: `Nmess       se,
 falsuccess: {
        json(xtResponse.return Ne
      t) {if (!walle });

      },
   
    true,ive:  isAct  hain,
          cuserId,
    decoded.Id:   user
     ere: { whrst({
     et.findFiallt prisma.wailet = awwalconst n
    aiis ch thllet foruser's wa/ Get  /  }

    409 });
   status:   }, {},
   s,
        tionrmaeposit.confi: existingDnsrmatio confi       us,
  t.statngDeposiisti: ex      status
    .id,posit: existingDe        idosit: {
   dep,
       E_DEPOSIT'r: 'DUPLICATrro        e
',ittedbm sulready beenhas aaction  'This trans  message:     se,
 cess: fal   suc  .json({
   esponsen NextR  retur{
    posit) ingDeist if (ex  });

   ,
  txHash }e: { her      wUnique({
posit.findisma.deawait preposit = istingDonst ex    cdy exists
alreaposit  if de  // Checka;

  n.dattio= validaunt } motedAexpecchain, , shonst { txHa}

    c    s: 400 });
, { statue,
      }agrs[0].messn.error.erro validatioerror:      nput',
  valid i: 'Inssage        melse,
: fa success   json({
    onse.Respeturn Next  ress) {
    ion.succalidat
    if (!v    
rse(body);fePaSchema.saitn = deposvalidatio   const 
 .json();wait requestbody = aonst 
    c
    }
: 401 }); }, { status   ,
  _TOKEN'LIDror: 'INVAer
         token', 'Invalid   message:se,
     : falessucc s({
       sontResponse.jex N      returndecoded) {
 (! 
    if   token);
rifyJWT(ecoded = vest d   conr ', '');
 'Bearer.replace(uthHeadeken = atot 

    cons   }1 });
  status: 40      }, {_AUTH',
or: 'NO err,
       d'izeUnauthor  message: 'se,
      : fal success   n({
    esponse.jso NextRurn ret {
     der)ea(!authH
    if on');zatiuthorit('ageders.t.hea reques = authHeader
    constioncatauthentirify   // Ve  try {
   {
tRequest)equest: Nex POST(rfunctionasync export );

(),
}ptional.string().oount: zexpectedAmgon']),
  , 'polytnet', 'bsc'm-tesreueum', 'ethetherum(['e.en
  chain: z,sh')ion haansactnvalid tr, 'I-9]{64}$/a-fA-F0/^0x[.regex(ing()Hash: z.str
  txbject({hema = z.opositSc denstco

ient(); PrismaCla = newst prismd';

con'zo from  z }';
import {chainib/block from '@/l,
}etworkType  type Nrmations,
dConfi getRequiredress,
 alidAdh,
  isVValidTxHasue,
  isateUsdValalculs,
  cionfirmatonnoughC hasEtion,
 nsacfyTraverirt {
  ls';
impo/auth-utiom '@/libyJWT } frif ver;
import {t'encliom '@prisma/} frt ienismaClmport { Pr
ierver';rom 'next/snse } fNextRespoest, NextRequ
import { 
======================================================================== =====tion
//icahain VerifReal BlockcION API - RIFICATDEPOSIT VE
// =============================================================================