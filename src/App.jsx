
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  computeGapToNextTier,
  fetchEarningsIngressCard,
  fetchSchemeById,
  fetchSchemes,
  hasExpiringSoonScheme,
  maxDisplayPayoutRupees,
} from "./services/schemeService.js";
import { getSchemesEntryTab, setSchemesEntryTab } from "./schemesNavigation.js";
import {
  fetchDealerPersonalCommission,
  fetchDealerStoreTransactions,
  productFilterOptions,
  promoterListForFilter,
} from "./services/earningsTransactionsService.js";
import {
  applySheetFilters,
  buildCsv,
  computeDateRange,
  computeSummary,
  fetchPromoterTransactions,
  filterByDateRange,
  formatCustomChipLabel,
  formatTxnRowDateTime,
  PROMOTER_TXN_COLORS,
} from "./services/promoterTransactionsService.js";
import {
  Activity,
  Banknote,
  BarChart3,
  Calculator,
  Check,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  FileText,
  Filter,
  House,
  IndianRupee,
  Loader2,
  Link2,
  PartyPopper,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Receipt,
  Copy,
  Search,
  Share2,
  ShieldAlert,
  ClipboardList,
  Sparkles,
  ScanBarcode,
  Landmark,
  MapPin,
  Package,
  Battery,
  Smartphone,
  Star,
  Store,
  Target,
  TrendingUp,
  Trophy,
  Truck,
  Users,
  X,
} from "lucide-react";

const DS = {
  color: {
    purple800:"#18084A",purple700:"#2E1773",purple600:"#4E29BB",purple500:"#926FF3",purple400:"#B59CF5",purple300:"#D1C5FA",purple200:"#ECEBFF",purple100:"#F8F7FD",
    onyx800:"#0A0A0A",onyx700:"#121212",onyx600:"#2F2F2F",onyx500:"#5D5D5D",onyx400:"#B0B0B0",onyx300:"#E7E7E7",onyx200:"#F6F6F6",onyx100:"#FFFFFF",
    green800:"#004A19",green700:"#1C772C",green600:"#149A40",green500:"#55B94D",green400:"#85E37D",green300:"#B2F2AD",green200:"#DAFAD7",green100:"#F3FFF2",
    blue800:"#004768",blue700:"#006A97",blue600:"#009DE0",blue500:"#1EB7E7",blue400:"#59D8FF",blue300:"#A1E7FD",blue200:"#DEF7FF",blue100:"#EEFAFF",
    orange800:"#5B2C00",orange700:"#B15A08",orange600:"#D97700",orange500:"#F4A024",orange400:"#FFC368",orange300:"#FFD79B",orange200:"#FFEDC5",orange100:"#FFF8E7",
    cerise800:"#4F0826",cerise700:"#981950",cerise600:"#D82A7B",cerise500:"#EC5FAB",cerise400:"#F8A9D6",cerise300:"#FAD0E9",cerise200:"#FCE7F4",cerise100:"#FDF2F8",
  },
  space:{1:4,2:8,3:12,4:16,5:20,6:24,8:32},
  radius:{sm:6,md:8,lg:10,xl:12,pill:999},
  font:"'Euclid Circular B',-apple-system,sans-serif",
};

const acc = (domain) => domain==="EV"
  ? {primary:DS.color.green600,dark:DS.color.green700,light:DS.color.green100,mid:DS.color.green200,text:DS.color.green800}
  : {primary:DS.color.purple600,dark:DS.color.purple700,light:DS.color.purple100,mid:DS.color.purple200,text:DS.color.purple800};

const PARTNERS={Electronics:["Xiaomi","Oppo","LFR","GT","Bajaj Finance"],EV:["Hero Vida","Ather Energy"]};
const PARTNER_LOGO_LOCAL_OVERRIDES={
  Xiaomi:"/partners/xiaomi.svg",
};
const PARTNER_LOGO_DOMAINS={
  Oppo:"oppo.com",
  LFR:null,
  GT:null,
  "Bajaj Finance":"bajajfinserv.in",
  "Hero Vida":"herovida.com",
  "Ather Energy":"atherenergy.com",
};
const PERSONAS=["Promoter","Dealer","Distributor","Brand Admin","EV Dealer"];
const USER_STATES=["New user","Returning","KYC skipped"];
const USE_CASES=["Sell","File claim","Check earnings","Onboarding","Manage team"];
const ERROR_STATES=["None (happy path)","IMEI invalid","Payment failed","Wallet empty","OEM API down"];

/** Base config = domain + partner + persona + userState — drives which use cases are offered. */
function getUseCaseOptionsForConfig(base){
  const { persona, domain } = base;
  if(persona==="Brand Admin"||persona==="Distributor"){
    return USE_CASES.filter((u)=>u!=="File claim");
  }
  if(domain==="EV"){
    return USE_CASES.filter((u)=>u!=="Manage team");
  }
  return [...USE_CASES];
}

/** Full config including useCase — drives sell-flow vs operational errors. */
function getErrorOptionsForConfig(full){
  const uc=full.useCase;
  if(uc==="Sell"||uc==="File claim"){
    return [...ERROR_STATES];
  }
  return ["None (happy path)","OEM API down"];
}

function coerceBasicFields(b){
  let { domain, partner, persona, userState } = { ...b };
  if(domain==="EV"){
    if(!PARTNERS.EV.includes(partner)) partner="Hero Vida";
    if(!["EV Dealer","Brand Admin","Distributor"].includes(persona)) persona="EV Dealer";
  }
  if(domain==="Electronics"){
    if(!PARTNERS.Electronics.includes(partner)) partner="Xiaomi";
  }
  return { domain, partner, persona, userState };
}

function pickFirstValid(value, options){
  return options.includes(value)?value:options[0];
}

const DC={blue:"#0052A2",blueMuted:"rgba(255,255,255,0.22)",green:"#2ECC71",surface:"#F0F2F5",ink:"#0F172A"};

const ICON_STROKE=2;

const POLICIES_PERIOD_LABELS={today:"Today",last30d:"Last 30 days",lastQtr:"Last quarter"};

const PROMOTER_PAYOUT_BANK_DEMO={
  bankName:"HDFC Bank",
  accountHolder:"Arjun Kumar",
  accountMasked:"•••• •••• 4521",
  ifsc:"HDFC0001234",
};

const WITHDRAWAL_ETA_SHORT="1–2 business days";
const WITHDRAWAL_ETA_DETAIL="Wed, 2 Apr 2026 · 6pm IST";

function makeWithdrawalRef(){
  return`WD-${Math.floor(Math.random()*900000+100000)}`;
}

function parseRupeeAmountFromLabel(s){
  if(s==null||s==="") return 12840;
  const n=String(s).replace(/[₹,\s]/g,"");
  const v=parseInt(n,10);
  return Number.isFinite(v)&&v>0?v:12840;
}

const QUICK_CONTACTS_PROMOTER=[
  {id:"manager",role:"Manager",name:"Anita Desai",phone:"+919876543210",email:"anita.desai@store.in"},
  {id:"sales",role:"Sales persons",name:"Store sales desk",phone:"+919811223344",email:"sales.chennai@store.in"},
  {id:"acko",role:"Acko Customer care",name:"Claims & policies",phone:"18002662256",email:"hello@acko.com"},
];

const PROMOTER_POLICIES_ISSUED_LIST=[
  {id:"POL-2025-10435",plan:"2Y Total Protection",device:"Xiaomi 14",customer:"Priya Nair",date:"30 Mar 2025",premium:"₹1,799"},
  {id:"POL-2025-10428",plan:"1Y ALD + EW",device:"Redmi Note 13",customer:"Rahul K.",date:"29 Mar 2025",premium:"₹999"},
  {id:"POL-2025-10421",plan:"2Y Total Protection",device:"Oppo Reno11",customer:"Meena S.",date:"28 Mar 2025",premium:"₹1,799"},
  {id:"POL-2025-10418",plan:"2Y Money Back",device:"Xiaomi 14 Pro",customer:"Vikram Sethi",date:"27 Mar 2025",premium:"₹1,999"},
  {id:"POL-2025-10402",plan:"1Y ALD + EW",device:"Realme 12",customer:"Anita M.",date:"26 Mar 2025",premium:"₹999"},
  {id:"POL-2025-10388",plan:"2Y Total Protection",device:"Samsung A35",customer:"Deepak P.",date:"25 Mar 2025",premium:"₹1,799"},
  {id:"POL-2025-10371",plan:"1Y ALD + EW",device:"Vivo V30",customer:"Kiran L.",date:"24 Mar 2025",premium:"₹999"},
  {id:"POL-2025-10355",plan:"2Y Total Protection",device:"Nothing Phone 2a",customer:"Sneha R.",date:"23 Mar 2025",premium:"₹1,799"},
];

const STORE_POLICIES_ISSUED_LIST=[
  {id:"POL-2025-10436",plan:"1Y ALD + EW",device:"Redmi 13",customer:"Amit V.",staff:"You",date:"30 Mar 2025",premium:"₹999"},
  {id:"POL-2025-10435",plan:"2Y Total Protection",device:"Xiaomi 14",customer:"Priya Nair",staff:"You",date:"30 Mar 2025",premium:"₹1,799"},
  {id:"POL-2025-10434",plan:"2Y Total Protection",device:"Oppo F25",customer:"Ravi K.",staff:"Neha P.",date:"30 Mar 2025",premium:"₹1,799"},
  {id:"POL-2025-10433",plan:"1Y ALD + EW",device:"Realme C65",customer:"Sunita M.",staff:"Arjun L.",date:"29 Mar 2025",premium:"₹999"},
  {id:"POL-2025-10428",plan:"1Y ALD + EW",device:"Redmi Note 13",customer:"Rahul K.",staff:"You",date:"29 Mar 2025",premium:"₹999"},
  {id:"POL-2025-10421",plan:"2Y Total Protection",device:"Oppo Reno11",customer:"Meena S.",staff:"Neha P.",date:"28 Mar 2025",premium:"₹1,799"},
];

const PROMOTER_RECENT_POLICIES=[
  {id:"POL-2025-10435",line:"Xiaomi 14 · 2Y Total Protection",status:"Sold",sub:"Paid · 14 min ago",commission:"₹180"},
  {id:"—",line:"Oppo Reno11 · 1Y ALD",status:"In progress",sub:"Payment link pending · Vikram S.",commission:"—"},
  {id:"POL-2025-10428",line:"Redmi Note 13 · ALD",status:"Sold",sub:"Yesterday · 6:42 pm",commission:"₹88"},
  {id:"POL-2025-10421",line:"Realme 12 · 2Y TP",status:"Sold",sub:"28 Mar 2025",commission:"₹180"},
  {id:"POL-2025-10418",line:"Xiaomi 14 Pro · Money Back",status:"In progress",sub:"KYC pending · customer",commission:"—"},
];

const WHAT_IF_RUPEES_PER_POLICY=483;

const HOME_DATA={
  Promoter:    {kpi:"₹1,240",kpiSub:"14 policies · 3 above target",kpiLabel:"Earned today",      m2:"₹18,450",m2Label:"This month",        alert:"8 more sales to unlock ₹500 bonus",cta:"Sell now",targetProgressPct:72,targetSubtext:"₹18,450 of ₹25,600 monthly target",dcCommissionHero:"₹12,840",whatIfLine:"Close 3 more mPOS policies to hit stretch",whatIfDelta:"+₹1,450",whatIfProgressPct:70,nbaName:"Vikram Sethi",nbaBadge:"Link · 2h left",nbaCopy:"Follow-up: customer hasn’t paid yet. UPI payment link for 2Y Total Protection (₹1,799) expires in 2 hours — call now to nudge completion.",salesPolicies:"42",salesConversion:"18.4%",policiesIssuedMetrics:{today:{my:{policiesCount:"4",conversion:"22.4%",mostSoldPolicy:"2Y Total Protection"},store:{policiesCount:"28",conversion:"19.1%",mostSoldPolicy:"2Y Total Protection"}},last30d:{my:{policiesCount:"42",conversion:"18.4%",mostSoldPolicy:"2Y Total Protection"},store:{policiesCount:"186",conversion:"17.2%",mostSoldPolicy:"1Y ALD + EW"}},lastQtr:{my:{policiesCount:"128",conversion:"17.2%",mostSoldPolicy:"2Y Total Protection"},store:{policiesCount:"540",conversion:"16.8%",mostSoldPolicy:"2Y Total Protection"}}}},
  Dealer:      {kpi:"₹3.2L", kpiSub:"32 policies · 4 staff active",kpiLabel:"Store GWP today",   m2:"3 zero-sale staff",m2Label:"Action needed", alert:"Store wallet: ₹12,400",         cta:"Sell now"},
  Distributor: {kpi:"18/22", kpiSub:"4 zero-sale dealers flagged",  kpiLabel:"Dealers active",    m2:"₹8.4L",  m2Label:"Network GWP today",  alert:"2 dealer onboardings pending",   cta:"View network"},
  "Brand Admin":{kpi:"68%",  kpiSub:"vs 55% target · +13 pts",      kpiLabel:"Attach rate today", m2:"₹2.3 Cr",m2Label:"GWP this month",    alert:"Karnataka down 4% WoW",          cta:"Launch campaign"},
  "EV Dealer": {kpi:"12",    kpiSub:"8 warranties · 67% attach",    kpiLabel:"Deliveries today",  m2:"₹48,000",m2Label:"Commissions earned", alert:"1 claim approval pending",       cta:"Issue warranty"},
};

function PartnerLogo({partner,size=40,style={}}){
  const localSrc=PARTNER_LOGO_LOCAL_OVERRIDES[partner];
  const domain=PARTNER_LOGO_DOMAINS[partner];
  const remoteUrl=domain?`https://logo.clearbit.com/${domain}`:"";
  const url=localSrc||remoteUrl||"";
  const [imgFailed,setImgFailed]=useState(!url);
  const initials=partner.split(/\s+/).filter(Boolean).map(w=>w[0]).join("").slice(0,2).toUpperCase()||"?";
  const boxSize=size;
  return(
    <div
      role="img"
      aria-label={`${partner} logo`}
      style={{
        width:boxSize,
        height:boxSize,
        borderRadius:Math.min(12,Math.round(boxSize/4)),
        background:DS.color.onyx100,
        border:`1px solid ${DS.color.onyx300}`,
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        flexShrink:0,
        overflow:"hidden",
        boxSizing:"border-box",
        ...style,
      }}
    >
      {url&&!imgFailed?(
        <img
          src={url}
          alt=""
          onError={()=>setImgFailed(true)}
          style={{width:"100%",height:"100%",objectFit:"contain",padding:Math.max(2,boxSize*0.12),boxSizing:"border-box"}}
        />
      ):(
        <span style={{fontSize:Math.max(0.28*boxSize,10),fontWeight:700,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1}}>{initials}</span>
      )}
    </div>
  );
}

const LEADERBOARD_PROMOTER={
  rank:12,
  monthlyEarnings:"+₹4.2k",
  monthlyLabel:"This month",
  progressPct:68,
  nextRankText:"240 points to Rank #11",
  podium:[
    {rank:2,name:"Sarah J."},
    {rank:1,name:"Marcus V.",first:true},
    {rank:3,name:"Elena R."},
  ],
};
const LEADERBOARD_DEALER={
  rank:5,
  monthlyEarnings:"+₹1.8L",
  monthlyLabel:"This month",
  progressPct:52,
  nextRankText:"₹12.4k GWP to Rank #4",
  podium:[
    {rank:2,name:"Phoenix Mall Store"},
    {rank:1,name:"T-Nagar Flagship",first:true},
    {rank:3,name:"OMR Express"},
  ],
};
const LEADERBOARD_DISTRIBUTOR={
  rank:3,
  monthlyEarnings:"+₹8.4L",
  monthlyLabel:"Network GWP",
  progressPct:72,
  nextRankText:"2 more active dealers to Rank #2",
  podium:[
    {rank:2,name:"West Region"},
    {rank:1,name:"South Region",first:true},
    {rank:3,name:"North Region"},
  ],
};

const DASH={
  cardSurface:{borderRadius:DS.radius.xl,boxShadow:"0 4px 24px rgba(0,82,162,0.12)",border:`1px solid ${DS.color.onyx300}`},
  eyebrow:{fontSize:11,fontWeight:600,letterSpacing:"0.2px",fontFamily:DS.font},
  cardTitle:{fontSize:16,fontWeight:700,color:DC.ink,fontFamily:DS.font,lineHeight:1.25},
  cardSubtitle:{fontSize:12,color:DS.color.onyx500,fontFamily:DS.font,lineHeight:1.45,marginTop:2},
  sectionTitle:{fontSize:13,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font},
  caption:{fontSize:12,color:DS.color.onyx500,fontFamily:DS.font,lineHeight:1.45},
  meta:{fontSize:11,color:DS.color.onyx400,fontFamily:DS.font},
  body:{fontSize:13,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1.5},
};

const DashboardCard=({children,style={}})=>(
  <div style={{background:DS.color.onyx100,padding:`${DS.space[4]}px`,...DASH.cardSurface,...style}}>{children}</div>
);

function PromoDashboardCardHeader({icon:Icon,iconBg,iconColor,title,subtitle,right}){
  return(
    <>
      <div style={{display:"flex",alignItems:"flex-start",gap:DS.space[3],marginBottom:DS.space[4]}}>
        <div style={{width:44,height:44,borderRadius:DS.radius.lg,background:iconBg||DS.color.blue200,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Icon size={22} strokeWidth={ICON_STROKE} color={iconColor||DC.blue} aria-hidden />
        </div>
        <div style={{flex:1,minWidth:0,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:DS.space[2]}}>
          <div style={{minWidth:0}}>
            <div style={DASH.cardTitle}>{title}</div>
            {subtitle&&<div style={DASH.cardSubtitle}>{subtitle}</div>}
          </div>
          {right}
        </div>
      </div>
    </>
  );
}

function leaderboardInitials(name){
  const p=name.split(/\s+/).filter(Boolean);
  if(p.length>=2) return`${p[0][0]}${p[p.length-1][0]}`.toUpperCase();
  return name.slice(0,2).toUpperCase();
}

function LeaderboardSection({variant,domain,cta}){
  const primary=domain==="EV"?DS.color.green600:DC.blue;
  const data=variant==="promoter"?LEADERBOARD_PROMOTER:variant==="dealer"?LEADERBOARD_DEALER:LEADERBOARD_DISTRIBUTOR;
  const performersTitle=variant==="promoter"?"Top performers":variant==="dealer"?"Top peer stores":"Top regions";
  const order=[2,1,3].map(r=>data.podium.find(x=>x.rank===r)).filter(Boolean);
  const blockH={1:88,2:58,3:58};
  const iconBg=domain==="EV"?DS.color.green200:DS.color.blue200;
  return(
    <DashboardCard style={{marginBottom:DS.space[8]}}>
      <PromoDashboardCardHeader
        icon={Star}
        iconBg={iconBg}
        iconColor={primary}
        title="Leaderboard"
        subtitle="Your rank and monthly earnings vs peers"
      />
      <div style={{marginBottom:DS.space[5]}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:DS.space[4]}}>
          <div className="counter" style={{fontSize:24,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,lineHeight:1.15}}>Rank #{data.rank}</div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div className="counter" style={{fontSize:16,fontWeight:700,color:DS.color.green700,fontFamily:DS.font}}>{data.monthlyEarnings}</div>
            <div style={{...DASH.meta,marginTop:4}}>{data.monthlyLabel}</div>
          </div>
        </div>
        <div style={{height:8,borderRadius:DS.radius.pill,background:DS.color.onyx200,overflow:"hidden",marginTop:DS.space[4],marginBottom:DS.space[2]}}>
          <div style={{height:"100%",width:`${data.progressPct}%`,borderRadius:DS.radius.pill,background:primary,transition:"width 200ms ease"}}/>
        </div>
        <div style={{...DASH.caption,fontStyle:"italic"}}>{data.nextRankText}</div>
      </div>
      <div style={{height:1,background:DS.color.onyx300,marginBottom:DS.space[4]}}/>
      <div style={{...DASH.sectionTitle,marginBottom:DS.space[4]}}>{performersTitle}</div>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:DS.space[2],paddingTop:DS.space[2]}}>
        {order.map(entry=>{
          const isFirst=!!entry.first;
          const h=blockH[entry.rank];
          const initials=leaderboardInitials(entry.name);
          const avatarBorder=isFirst?`2px solid ${primary}`:entry.rank===3?`2px solid ${DS.color.orange300}`:`1.5px solid ${DS.color.onyx300}`;
          const avatarGlow=isFirst?{boxShadow:`0 0 0 3px ${primary}33`}:{};
          return(
            <div key={entry.rank} style={{flex:1,minWidth:0,maxWidth:120,display:"flex",flexDirection:"column",alignItems:"center"}}>
              <div style={{position:"relative",marginBottom:DS.space[2],width:52,height:52}}>
                {isFirst&&(
                  <div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",zIndex:2}}>
                    <Star size={18} fill="#EAB308" color="#CA8A04" strokeWidth={1.25} aria-hidden />
                  </div>
                )}
                <div
                  style={{
                    width:52,
                    height:52,
                    borderRadius:DS.radius.lg,
                    border:avatarBorder,
                    background:isFirst?(domain==="EV"?DS.color.green100:DS.color.blue100):entry.rank===3?DS.color.orange100:DS.color.onyx200,
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    fontSize:13,
                    fontWeight:700,
                    color:isFirst?primary:DS.color.onyx700,
                    fontFamily:DS.font,
                    ...avatarGlow,
                  }}
                >
                  {initials}
                </div>
              </div>
              <div
                style={{
                  width:"100%",
                  minHeight:h,
                  borderRadius:`${DS.radius.md}px ${DS.radius.md}px ${DS.radius.sm}px ${DS.radius.sm}px`,
                  background:isFirst?primary:DS.color.onyx200,
                  display:"flex",
                  flexDirection:"column",
                  alignItems:"center",
                  justifyContent:"center",
                  padding:`${DS.space[2]}px ${DS.space[1]}px`,
                  boxSizing:"border-box",
                }}
              >
                <span className="counter" style={{fontSize:22,fontWeight:700,color:isFirst?"#fff":DS.color.onyx800,fontFamily:DS.font,lineHeight:1}}>{entry.rank}</span>
                <span style={{fontSize:9,fontWeight:600,color:isFirst?"rgba(255,255,255,0.92)":DS.color.onyx600,fontFamily:DS.font,textAlign:"center",letterSpacing:"0.2px",marginTop:4,lineHeight:1.25}}>{entry.name}</span>
              </div>
            </div>
          );
        })}
      </div>
      {cta&&(
        <div style={{marginTop:DS.space[4]}}>
          <Btn variant="outline" size="sm" full onClick={cta.onClick}>{cta.label}</Btn>
        </div>
      )}
    </DashboardCard>
  );
}

function teamLeaderboardVariant(persona){
  if(persona==="Promoter") return "promoter";
  if(persona==="Dealer"||persona==="EV Dealer") return "dealer";
  return "distributor";
}

const TEAM_TOP_10_ROWS=[
  {rank:1,name:"Marcus V.",detail:"+₹18.2k · 42 policies"},
  {rank:2,name:"Sarah J.",detail:"+₹16.1k · 38 policies"},
  {rank:3,name:"Elena R.",detail:"+₹14.8k · 35 policies"},
  {rank:4,name:"Arjun Sharma",detail:"+₹12.4k · 31 policies"},
  {rank:5,name:"Priya N.",detail:"+₹11.9k · 29 policies"},
  {rank:6,name:"Rahul K.",detail:"+₹10.2k · 26 policies"},
  {rank:7,name:"Meena S.",detail:"+₹9.6k · 24 policies"},
  {rank:8,name:"Vikram S.",detail:"+₹8.9k · 22 policies"},
  {rank:9,name:"Anita D.",detail:"+₹8.1k · 21 policies"},
  {rank:10,name:"Deepak P.",detail:"+₹7.4k · 19 policies"},
];

const TEAM_PEER_STORE=[
  {name:"Rahul K.",role:"Sales",shift:"10am–7pm",status:"on-floor"},
  {name:"Meena S.",role:"Sales",shift:"10am–7pm",status:"on-floor"},
  {name:"Vivek R.",role:"Sales",shift:"2pm–10pm",status:"break"},
  {name:"Divya M.",role:"Store lead",shift:"10am–7pm",status:"on-floor"},
  {name:"Anita Desai",role:"Manager",shift:"Full day",status:"office"},
];

const BRAND_FEED_EMOJIS=["👍","❤️","🎉","👏","🔥","💪"];

const BRAND_MANAGER_POSTS=[
  {id:"p1",kind:"badge",title:"Top Achiever",body:"Shout-out to T-Nagar for leading weekly attach rate across Chennai!",time:"2h ago"},
  {id:"p2",kind:"kudos",title:"Kudos for the highest sale",body:"₹1,799 2Y TP closed in under 4 minutes — great consult.",time:"5h ago"},
  {id:"p3",kind:"store",title:"Top store in the region",body:"Your store is #2 in South zone GWP this week. Keep the momentum.",time:"Yesterday"},
  {id:"p4",kind:"quote",title:"Daily spark",body:"“Small wins every shift compound into your best month.” — Brand Sales",time:"Yesterday"},
  {id:"p5",kind:"quote",title:"Motivation",body:"Focus on attach, not just footfall — quality conversations win.",time:"2 days ago"},
];

function PromoterDigitalCustodianHome({d,onNav,domain,onWithdrawalComplete,trackClaimOpen,setTrackClaimOpen,claimFilingOpen,setClaimFilingOpen,policyFinderOpen,setPolicyFinderOpen,claimPrefill,setClaimPrefill}){
  const navigate=useNavigate();
  const [schemesExpiringDot,setSchemesExpiringDot]=useState(false);
  const [policiesListOpen,setPoliciesListOpen]=useState(false);
  const [withdrawFlow,setWithdrawFlow]=useState(null);
  const [withdrawAmountStr,setWithdrawAmountStr]=useState("");
  const [addBankOpen,setAddBankOpen]=useState(false);
  const [newBankDraft,setNewBankDraft]=useState({bankName:"",account:"",ifsc:""});
  const [whatIfPolicyCount,setWhatIfPolicyCount]=useState(3);
  const [recentShowAll,setRecentShowAll]=useState(false);
  const [policiesScope,setPoliciesScope]=useState("my");
  const [policiesPeriod,setPoliciesPeriod]=useState("today");
  const [homeImei,setHomeImei]=useState("");
  const [quickLinkHint,setQuickLinkHint]=useState("");
  useEffect(()=>{
    if(!quickLinkHint) return;
    const t=setTimeout(()=>setQuickLinkHint(""),3200);
    return ()=>clearTimeout(t);
  },[quickLinkHint]);
  useEffect(()=>{
    setSchemesExpiringDot(hasExpiringSoonScheme({domain}));
  },[domain]);
  const hero=d.dcCommissionHero||d.m2;
  const maxWithdrawRupees=parseRupeeAmountFromLabel(hero);
  const policiesTodayCount=d.policiesIssuedMetrics?.today?.my?.policiesCount ?? d.salesPolicies;
  const simPct=typeof d.whatIfProgressPct==="number"?d.whatIfProgressPct:70;
  const whatIfExtra=whatIfPolicyCount*WHAT_IF_RUPEES_PER_POLICY;

  const policiesIssuedSlice=(()=>{
    const m=d.policiesIssuedMetrics;
    const row=m?.[policiesPeriod]?.[policiesScope==="my"?"my":"store"];
    if(row) return row;
    return{policiesCount:d.salesPolicies,conversion:d.salesConversion,mostSoldPolicy:"2Y Total Protection"};
  })();

  const storeRecentList=STORE_POLICIES_ISSUED_LIST.map(p=>({
    id:p.id,
    line:`${p.device} · ${p.plan}`,
    status:"Sold",
    sub:`${p.staff} · ${p.date}`,
    commission:"—",
  }));
  const recentSource=policiesScope==="my"?PROMOTER_RECENT_POLICIES:storeRecentList;
  const recentSlice=recentShowAll?recentSource:recentSource.slice(0,3);

  const withdrawAmountNum=parseInt(String(withdrawAmountStr).replace(/\D/g,""),10);
  const withdrawAmountValid=Number.isFinite(withdrawAmountNum)&&withdrawAmountNum>0&&withdrawAmountNum<=maxWithdrawRupees;
  const withdrawAmountDisplay=withdrawAmountValid?withdrawAmountNum:0;

  const finishWithdrawal=(goToEarnings)=>{
    onWithdrawalComplete?.({
      amountRupees:withdrawAmountDisplay,
      ref:makeWithdrawalRef(),
      etaShort:WITHDRAWAL_ETA_SHORT,
      etaDetail:WITHDRAWAL_ETA_DETAIL,
      status:"processing",
    });
    setWithdrawFlow(null);
    setWithdrawAmountStr("");
    if(goToEarnings) onNav("earnings");
  };

  if(withdrawFlow==="amount"){
    return(
      <div style={{fontFamily:DS.font}}>
        <div style={{display:"flex",alignItems:"center",gap:DS.space[2],marginBottom:DS.space[4]}}>
          <button type="button" className="abtn" onClick={()=>{setWithdrawFlow(null);setWithdrawAmountStr("");}} style={{border:"none",background:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:DC.blue,padding:`${DS.space[2]}px`,fontFamily:DS.font}}>← Back</button>
        </div>
        <div style={{fontSize:18,fontWeight:700,color:DC.ink,marginBottom:4}}>Withdraw commission</div>
        <div style={{fontSize:13,color:DS.color.onyx500,marginBottom:DS.space[5],lineHeight:1.45}}>Enter how much you want to withdraw. Available balance is shown below.</div>
        <Card style={{marginBottom:DS.space[4],padding:DS.space[4]}}>
          <div style={{fontSize:12,color:DS.color.onyx500,marginBottom:4,fontFamily:DS.font}}>Available to withdraw</div>
          <div className="counter" style={{fontSize:26,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font}}>{hero}</div>
        </Card>
        <div style={{marginBottom:DS.space[2],fontSize:13,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font}}>Amount (₹)</div>
        <input
          className="ainput"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="e.g. 5000"
          value={withdrawAmountStr}
          onChange={e=>setWithdrawAmountStr(e.target.value.replace(/\D/g,"").slice(0,8))}
          style={{width:"100%",height:52,padding:`0 ${DS.space[4]}px`,border:`1.5px solid ${DS.color.onyx300}`,borderRadius:DS.radius.lg,fontFamily:DS.font,fontSize:18,fontWeight:600,color:DS.color.onyx800,background:DS.color.onyx100,marginBottom:DS.space[3]}}
        />
        {withdrawAmountStr&&!withdrawAmountValid&&(
          <div style={{fontSize:12,color:DS.color.cerise600,marginBottom:DS.space[3],fontFamily:DS.font}}>
            {withdrawAmountNum>maxWithdrawRupees?`Enter an amount up to ₹${maxWithdrawRupees.toLocaleString("en-IN")}`:"Enter a valid amount"}
          </div>
        )}
        <div style={{display:"flex",flexWrap:"wrap",gap:DS.space[2],marginBottom:DS.space[5]}}>
          {[
            {label:"25%",val:Math.floor(maxWithdrawRupees*0.25)},
            {label:"50%",val:Math.floor(maxWithdrawRupees*0.5)},
            {label:"Max",val:maxWithdrawRupees},
          ].map(q=>(
            <button
              key={q.label}
              type="button"
              className="abtn"
              onClick={()=>setWithdrawAmountStr(String(q.val))}
              style={{
                padding:`${DS.space[2]}px ${DS.space[3]}px`,
                borderRadius:DS.radius.pill,
                border:`1px solid ${DS.color.onyx300}`,
                background:DS.color.onyx100,
                fontFamily:DS.font,
                fontSize:12,
                fontWeight:600,
                color:DC.blue,
                cursor:"pointer",
              }}
            >
              {q.label} · ₹{q.val.toLocaleString("en-IN")}
            </button>
          ))}
        </div>
        <Btn variant="primary" full style={{background:DC.blue}} disabled={!withdrawAmountValid} onClick={()=>withdrawAmountValid&&setWithdrawFlow("bank")}>
          Continue to bank details →
        </Btn>
      </div>
    );
  }

  if(withdrawFlow==="bank"){
    return(
      <div style={{fontFamily:DS.font,position:"relative",minHeight:"100%"}}>
        <div style={{display:"flex",alignItems:"center",gap:DS.space[2],marginBottom:DS.space[4]}}>
          <button type="button" className="abtn" onClick={()=>{setWithdrawFlow("amount");setAddBankOpen(false);}} style={{border:"none",background:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:DC.blue,padding:`${DS.space[2]}px`,fontFamily:DS.font}}>← Back</button>
        </div>
        <div style={{fontSize:18,fontWeight:700,color:DC.ink,marginBottom:4}}>Confirm bank account</div>
        <div style={{fontSize:13,color:DS.color.onyx500,marginBottom:DS.space[4],lineHeight:1.45}}>We’ll send <strong>₹{withdrawAmountDisplay.toLocaleString("en-IN")}</strong> to this account via NEFT ({WITHDRAWAL_ETA_SHORT}).</div>
        <Card style={{marginBottom:DS.space[3],padding:DS.space[4]}}>
          <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[3],fontFamily:DS.font}}>Registered payout account</div>
          <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[2]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font,gap:DS.space[2]}}>
            <span style={{fontSize:13,color:DS.color.onyx500}}>Bank</span>
            <span style={{fontSize:13,fontWeight:600,color:DS.color.onyx800,textAlign:"right"}}>{PROMOTER_PAYOUT_BANK_DEMO.bankName}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[2]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font}}>
            <span style={{fontSize:13,color:DS.color.onyx500}}>Account holder</span>
            <span style={{fontSize:13,fontWeight:600,color:DS.color.onyx800,textAlign:"right",maxWidth:"55%"}}>{PROMOTER_PAYOUT_BANK_DEMO.accountHolder}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[2]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font}}>
            <span style={{fontSize:13,color:DS.color.onyx500}}>Account no.</span>
            <span className="counter" style={{fontSize:14,fontWeight:600,color:DS.color.onyx800}}>{PROMOTER_PAYOUT_BANK_DEMO.accountMasked}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[2]}px 0`,fontFamily:DS.font}}>
            <span style={{fontSize:13,color:DS.color.onyx500}}>IFSC</span>
            <span className="counter" style={{fontSize:13,fontWeight:600,color:DS.color.onyx800}}>{PROMOTER_PAYOUT_BANK_DEMO.ifsc}</span>
          </div>
        </Card>
        <button
          type="button"
          className="abtn"
          onClick={()=>setAddBankOpen(true)}
          style={{
            width:"100%",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            gap:DS.space[2],
            marginBottom:DS.space[4],
            padding:`${DS.space[3]}px ${DS.space[4]}px`,
            borderRadius:DS.radius.lg,
            border:`1.5px dashed ${DC.blue}`,
            background:DS.color.blue100,
            fontFamily:DS.font,
            fontSize:13,
            fontWeight:600,
            color:DC.blue,
            cursor:"pointer",
          }}
        >
          <Plus size={18} strokeWidth={ICON_STROKE} aria-hidden />
          Add new bank account
        </button>
        <div style={{fontSize:12,color:DS.color.onyx400,marginBottom:DS.space[4],lineHeight:1.45,fontFamily:DS.font}}>To replace this account permanently, go to Settings → Payouts after this withdrawal.</div>
        <Btn variant="primary" full style={{background:DC.blue}} onClick={()=>setWithdrawFlow("success")}>
          Confirm withdrawal
        </Btn>
        {addBankOpen&&(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-bank-title"
            onClick={()=>setAddBankOpen(false)}
            style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",zIndex:20,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:DS.space[3]}}
          >
            <div style={{width:"100%",background:DS.color.onyx100,borderRadius:`${DS.radius.xl}px ${DS.radius.xl}px 0 0`,padding:DS.space[5],boxShadow:"0 -8px 32px rgba(0,0,0,0.2)",maxHeight:"85%",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:DS.space[4]}}>
                <h3 id="add-bank-title" style={{fontSize:17,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font,margin:0}}>Add bank account</h3>
                <button type="button" className="abtn" aria-label="Close" onClick={()=>setAddBankOpen(false)} style={{border:"none",background:"none",cursor:"pointer",padding:DS.space[2]}}>
                  <X size={22} color={DS.color.onyx500} aria-hidden />
                </button>
              </div>
              <p style={{fontSize:12,color:DS.color.onyx500,marginBottom:DS.space[4],lineHeight:1.45,fontFamily:DS.font}}>We’ll verify new accounts within 24 hours. This withdrawal will still be sent to your registered HDFC account.</p>
              <AInput label="Bank name" placeholder="e.g. ICICI Bank" value={newBankDraft.bankName} onChange={e=>setNewBankDraft(b=>({...b,bankName:e.target.value}))}/>
              <AInput label="Account number" placeholder="Enter account number" value={newBankDraft.account} onChange={e=>setNewBankDraft(b=>({...b,account:e.target.value.replace(/\D/g,"").slice(0,18)}))}/>
              <AInput label="IFSC code" placeholder="e.g. SBIN0001234" value={newBankDraft.ifsc} onChange={e=>setNewBankDraft(b=>({...b,ifsc:e.target.value.toUpperCase().slice(0,11)}))}/>
              <div style={{display:"flex",gap:DS.space[3],marginTop:DS.space[4]}}>
                <Btn variant="outline" full onClick={()=>setAddBankOpen(false)}>Cancel</Btn>
                <Btn variant="primary" full style={{background:DC.blue}} disabled={!newBankDraft.bankName.trim()||newBankDraft.account.length<9||newBankDraft.ifsc.length<11} onClick={()=>{setAddBankOpen(false);setNewBankDraft({bankName:"",account:"",ifsc:""});}}>
                  Save
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if(withdrawFlow==="success"){
    return(
      <div style={{fontFamily:DS.font,textAlign:"center",paddingTop:DS.space[2]}}>
        <div style={{width:80,height:80,borderRadius:40,background:DS.color.green200,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Check size={40} strokeWidth={ICON_STROKE} color={DS.color.green700} aria-hidden />
        </div>
        <div style={{fontSize:20,fontWeight:700,color:DS.color.onyx800,marginBottom:8,fontFamily:DS.font}}>Withdrawal submitted</div>
        <div style={{fontSize:14,color:DS.color.onyx600,marginBottom:DS.space[4],lineHeight:1.5,fontFamily:DS.font,maxWidth:300,marginLeft:"auto",marginRight:"auto"}}>
          ₹{withdrawAmountDisplay.toLocaleString("en-IN")} will be credited to your {PROMOTER_PAYOUT_BANK_DEMO.bankName} account ending in 4521.
        </div>
        <Card style={{marginBottom:DS.space[5],padding:DS.space[4],textAlign:"left"}}>
          <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2],fontFamily:DS.font}}>Estimated time (ETA)</div>
          <div style={{fontSize:15,fontWeight:700,color:DS.color.onyx800,marginBottom:4,fontFamily:DS.font}}>{WITHDRAWAL_ETA_SHORT}</div>
          <div style={{fontSize:13,color:DS.color.onyx600,lineHeight:1.45,fontFamily:DS.font}}>Expected credit by <strong>{WITHDRAWAL_ETA_DETAIL}</strong></div>
          <div style={{fontSize:11,color:DS.color.onyx400,marginTop:DS.space[3],lineHeight:1.4,fontFamily:DS.font}}>NEFT timings apply. You’ll get SMS when the transfer is initiated.</div>
        </Card>
        <Btn variant="primary" full style={{background:DC.blue}} onClick={()=>finishWithdrawal(true)}>
          View transactions
        </Btn>
        <button type="button" className="abtn" onClick={()=>finishWithdrawal(false)} style={{width:"100%",marginTop:DS.space[3],padding:DS.space[3],border:"none",background:"none",cursor:"pointer",fontFamily:DS.font,fontSize:14,fontWeight:600,color:DS.color.onyx500}}>
          Back to home
        </button>
      </div>
    );
  }

  if(policiesListOpen){
    const fullList=policiesScope==="my"?PROMOTER_POLICIES_ISSUED_LIST:STORE_POLICIES_ISSUED_LIST;
    const scopeTitle=policiesScope==="my"?"My policies":"All policies (store)";
    return(
      <div style={{fontFamily:DS.font}}>
        <div style={{display:"flex",alignItems:"center",gap:DS.space[2],marginBottom:DS.space[4]}}>
          <button type="button" className="abtn" onClick={()=>setPoliciesListOpen(false)} style={{border:"none",background:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:DC.blue,padding:`${DS.space[2]}px`,fontFamily:DS.font}}>← Back</button>
        </div>
        <div style={{fontSize:16,fontWeight:700,color:DC.ink,marginBottom:2}}>Policies issued</div>
        <div style={{fontSize:12,color:DS.color.onyx500,marginBottom:DS.space[4],lineHeight:1.4}}>
          {scopeTitle} · {POLICIES_PERIOD_LABELS[policiesPeriod]} · {policiesIssuedSlice.policiesCount} total
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:DS.space[2]}}>
          {fullList.map(p=>(
            <Card key={p.id} style={{padding:`${DS.space[3]}px ${DS.space[4]}px`,borderRadius:DS.radius.lg}}>
              <div style={{fontSize:12,fontWeight:700,color:DC.blue,marginBottom:4}}>{p.id}</div>
              <div style={{fontSize:13,fontWeight:600,color:DS.color.onyx800}}>{p.plan}</div>
              <div style={{fontSize:12,color:DS.color.onyx600,marginTop:2}}>{p.device} · {p.customer}</div>
              {p.staff&&<div style={{fontSize:11,color:DS.color.onyx500,marginTop:4}}>Issued by {p.staff}</div>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:DS.space[2]}}>
                <span style={{fontSize:11,color:DS.color.onyx400}}>{p.date}</span>
                <span className="counter" style={{fontSize:13,fontWeight:700,color:DS.color.onyx800}}>{p.premium}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if(claimFilingOpen){
    return(
      <ClaimFilingPlaceholder prefill={claimPrefill} onBack={()=>{ setClaimPrefill(null); setClaimFilingOpen(false); }} />
    );
  }

  if(policyFinderOpen){
    return(
      <PolicyFinderFlow
        domain={domain}
        onBack={()=>setPolicyFinderOpen(false)}
        onRaiseClaim={p=>{
          setPolicyFinderOpen(false);
          setClaimPrefill({
            policyId:p.policyId,
            deviceBrand:p.deviceBrand,
            deviceModel:p.deviceModel,
            customerName:p.customerName,
            customerPhone:p.customerPhone,
            imei:p.imei,
          });
          setClaimFilingOpen(true);
        }}
      />
    );
  }

  if(trackClaimOpen){
    return(
      <div style={{fontFamily:DS.font,flex:1,overflowY:"auto",minHeight:0}}>
        <TrackClaimFlow domain={domain} onBack={()=>setTrackClaimOpen(false)} />
      </div>
    );
  }

  return(
    <div style={{fontFamily:DS.font}}>
      <div style={{background:DC.blue,borderRadius:22,padding:DS.space[5],marginBottom:DS.space[8],boxShadow:"0 12px 32px rgba(0,82,162,0.28)"}}>
        <div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.85)",letterSpacing:"0.3px",marginBottom:DS.space[2]}}>Commission to withdraw</div>
        <div className="counter" style={{fontSize:34,fontWeight:700,color:"#fff",lineHeight:1.1,marginBottom:DS.space[3]}}>{hero}</div>
        <div
          style={{
            display:"flex",
            gap:DS.space[2],
            marginBottom:DS.space[4],
          }}
        >
          <div
            style={{
              flex:1,
              minWidth:0,
              display:"flex",
              alignItems:"center",
              gap:DS.space[2],
              padding:`${DS.space[2]}px ${DS.space[3]}px`,
              borderRadius:DS.radius.pill,
              background:domain==="EV"?"rgba(180,245,200,0.12)":"rgba(255,255,255,0.09)",
              border:"1px solid rgba(255,255,255,0.14)",
            }}
          >
            <TrendingUp size={15} strokeWidth={ICON_STROKE} color="rgba(255,255,255,0.45)" aria-hidden style={{flexShrink:0}} />
            <span className="counter" style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.88)",letterSpacing:"-0.02em"}}>{d.kpi}</span>
            <span style={{fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.42)",fontFamily:DS.font,whiteSpace:"nowrap"}}>today</span>
          </div>
          <div
            style={{
              flex:1,
              minWidth:0,
              display:"flex",
              alignItems:"center",
              gap:DS.space[2],
              padding:`${DS.space[2]}px ${DS.space[3]}px`,
              borderRadius:DS.radius.pill,
              background:"rgba(255,255,255,0.06)",
              border:"1px solid rgba(255,255,255,0.11)",
            }}
          >
            <span className="counter" style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.82)",letterSpacing:"-0.02em"}}>{policiesTodayCount}</span>
            <span style={{fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.4)",fontFamily:DS.font,lineHeight:1.25}}>policies today</span>
          </div>
        </div>
        <div style={{height:1,background:DC.blueMuted,marginBottom:DS.space[3]}}/>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.95)",lineHeight:1.45,marginBottom:DS.space[3]}}>{d.whatIfLine}</div>
        <div style={{height:8,borderRadius:DS.radius.pill,background:"rgba(255,255,255,0.2)",overflow:"hidden",marginBottom:DS.space[2]}}>
          <div style={{height:"100%",width:`${simPct}%`,borderRadius:DS.radius.pill,background:DC.green,boxShadow:`0 0 12px ${DC.green}88`}}/>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:DS.space[3]}}>
          <div className="counter" style={{fontSize:15,fontWeight:700,color:DC.green}}>{d.whatIfDelta}</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"stretch",gap:DS.space[3],paddingTop:DS.space[2],borderTop:"1px solid rgba(255,255,255,0.2)"}}>
          <button
            type="button"
            className="abtn"
            onClick={()=>onNav("earnings")}
            style={{
              flex:1,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              gap:DS.space[2],
              background:"rgba(255,255,255,0.08)",
              border:"1px solid rgba(255,255,255,0.18)",
              borderRadius:DS.radius.lg,
              padding:`${DS.space[3]}px ${DS.space[2]}px`,
              cursor:"pointer",
              fontFamily:DS.font,
              fontSize:12,
              fontWeight:600,
              color:"rgba(255,255,255,0.95)",
              touchAction:"manipulation",
            }}
          >
            <BarChart3 size={16} strokeWidth={ICON_STROKE} color="rgba(255,255,255,0.9)" aria-hidden style={{flexShrink:0}} />
            <span>Show earnings</span>
            <ChevronRight size={16} strokeWidth={ICON_STROKE} color="rgba(255,255,255,0.65)" aria-hidden style={{flexShrink:0}} />
          </button>
          <button
            type="button"
            className="abtn"
            onClick={()=>setWithdrawFlow("amount")}
            style={{
              flex:1,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              gap:DS.space[2],
              background:"rgba(255,255,255,0.08)",
              border:"1px solid rgba(255,255,255,0.18)",
              borderRadius:DS.radius.lg,
              padding:`${DS.space[3]}px ${DS.space[2]}px`,
              cursor:"pointer",
              fontFamily:DS.font,
              fontSize:12,
              fontWeight:600,
              color:"rgba(255,255,255,0.95)",
              touchAction:"manipulation",
            }}
          >
            <IndianRupee size={16} strokeWidth={ICON_STROKE} color="rgba(255,255,255,0.9)" aria-hidden style={{flexShrink:0}} />
            <span>Withdraw</span>
            <ChevronRight size={16} strokeWidth={ICON_STROKE} color="rgba(255,255,255,0.65)" aria-hidden style={{flexShrink:0}} />
          </button>
        </div>
      </div>

      <DashboardCard style={{marginBottom:DS.space[8]}}>
        <PromoDashboardCardHeader
          icon={FileText}
          title="Issue insurance"
          subtitle="Enter IMEI or scan the barcode to start a sale"
        />
        <div style={{display:"flex",gap:DS.space[2],alignItems:"stretch",marginBottom:DS.space[4]}}>
          <input
            className="ainput"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="IMEI (15 digits)"
            value={homeImei}
            onChange={e=>setHomeImei(e.target.value.replace(/\D/g,"").slice(0,15))}
            style={{flex:1,minWidth:0,height:52,padding:`0 ${DS.space[4]}px`,border:`1.5px solid ${DS.color.onyx300}`,borderRadius:DS.radius.lg,fontFamily:DS.font,fontSize:16,fontWeight:500,color:DS.color.onyx800,background:DS.color.onyx100}}
          />
          <button
            type="button"
            className="abtn"
            aria-label="Scan IMEI barcode"
            onClick={()=>onNav("sell")}
            style={{
              width:52,
              height:52,
              flexShrink:0,
              borderRadius:DS.radius.lg,
              border:`1.5px solid ${DC.blue}`,
              background:DS.color.blue100,
              cursor:"pointer",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              padding:0,
            }}
          >
            <ScanBarcode size={26} strokeWidth={ICON_STROKE} color={DC.blue} aria-hidden />
          </button>
        </div>
        <button
          type="button"
          className="abtn"
          onClick={()=>onNav("sell")}
          style={{
            width:"100%",
            minHeight:56,
            border:"none",
            borderRadius:DS.radius.lg,
            background:`linear-gradient(180deg, ${DC.blue} 0%, #003d7a 100%)`,
            color:"#fff",
            fontFamily:DS.font,
            fontSize:16,
            fontWeight:700,
            cursor:"pointer",
            boxShadow:"0 8px 20px rgba(0,82,162,0.35)",
            letterSpacing:"0.2px",
          }}
        >
          Check device & continue
        </button>
      </DashboardCard>

      <DashboardCard style={{marginBottom:DS.space[8]}}>
        <PromoDashboardCardHeader
          icon={Link2}
          iconBg={DS.color.orange200}
          iconColor={DS.color.orange700}
          title="Next best action"
          subtitle="Prioritized follow-ups from your pipeline"
          right={(
            <button type="button" style={{background:"none",border:"none",fontSize:12,fontWeight:600,color:DC.blue,cursor:"pointer",fontFamily:DS.font,flexShrink:0}}>View all</button>
          )}
        />
        <div style={{marginBottom:DS.space[4]}}>
          <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:DS.space[2],marginBottom:4}}>
            <span style={{...DASH.cardTitle,fontSize:14}}>{d.nbaName}</span>
            <Badge variant="orange">{d.nbaBadge||"Follow up"}</Badge>
          </div>
          <div style={DASH.caption}>{d.nbaCopy}</div>
        </div>
        <div style={{display:"flex",gap:DS.space[3]}}>
          <Btn variant="primary" size="sm" full style={{background:DC.blue,flex:1}} onClick={()=>{}}>Call now</Btn>
          <Btn variant="outline" size="sm" full style={{flex:1}} onClick={()=>{}}>Details</Btn>
        </div>
      </DashboardCard>

      {quickLinkHint&&(
        <div style={{marginBottom:DS.space[3]}}>
          <AlertBanner type="info" message={quickLinkHint} />
        </div>
      )}
      <HomeQuickLinksWidget
        accent={domain==="EV"?DS.color.green600:DC.blue}
        schemesExpiringDot={schemesExpiringDot}
        onAction={(id)=>{
          if(id==="track"){ setTrackClaimOpen(true); return; }
          if(id==="raise"){ setClaimPrefill(null); setClaimFilingOpen(true); return; }
          if(id==="finder"){ setPolicyFinderOpen(true); return; }
          if(id==="schemes"){ setSchemesEntryTab("home"); navigate("/schemes"); return; }
          setQuickLinkHint(HOME_QUICK_LINK_MESSAGES[id]||"Opening…");
        }}
      />

      <LeaderboardSection variant="promoter" domain={domain} />

      <DashboardCard style={{marginBottom:DS.space[8]}}>
        <PromoDashboardCardHeader
          icon={Calculator}
          iconBg={DS.color.blue200}
          iconColor={DC.blue}
          title="Earnings calculator"
          subtitle="Adjust extra policies you could close — projected commission uses your typical plan mix"
        />
        <div style={{marginBottom:DS.space[4]}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:DS.space[3]}}>
            <span style={{fontSize:14,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font}}>Extra policies</span>
            <span className="counter" style={{fontSize:28,fontWeight:700,color:DC.blue,fontFamily:DS.font}}>{whatIfPolicyCount}</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={whatIfPolicyCount}
            onChange={e=>setWhatIfPolicyCount(Number(e.target.value))}
            style={{width:"100%",height:8,accentColor:DC.blue,cursor:"pointer"}}
          />
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:DS.color.onyx400,marginTop:6,fontFamily:DS.font}}>
            <span>0</span>
            <span>20</span>
          </div>
        </div>
        <div style={{padding:DS.space[4],background:`linear-gradient(145deg, ${DC.surface} 0%, #e8eef5 100%)`,borderRadius:DS.radius.lg,border:`1px solid ${DS.color.onyx300}`,marginBottom:DS.space[3]}}>
          <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,letterSpacing:"0.2px",marginBottom:DS.space[2],fontFamily:DS.font}}>Additional commission</div>
          <div className="counter" style={{fontSize:32,fontWeight:700,color:DS.color.green700,lineHeight:1.1,fontFamily:DS.font}}>+₹{whatIfExtra.toLocaleString("en-IN")}</div>
          <div style={{fontSize:12,color:DS.color.onyx500,marginTop:DS.space[3],fontFamily:DS.font}}>
            {whatIfPolicyCount} × ₹{WHAT_IF_RUPEES_PER_POLICY.toLocaleString("en-IN")} / policy
          </div>
        </div>
        <div style={{fontSize:11,color:DS.color.onyx400,lineHeight:1.5,fontFamily:DS.font}}>Illustrative only — assumes ALD, TP, RoP mix. Actual earnings vary by SKU.</div>
      </DashboardCard>

      <DashboardCard style={{marginBottom:DS.space[8]}}>
        <PromoDashboardCardHeader
          icon={BarChart3}
          title="Policies issued"
          subtitle="My policies vs store · filter by period"
        />
        <div
          role="tablist"
          aria-label="Policy scope"
          style={{display:"flex",gap:4,marginBottom:DS.space[3],padding:4,background:DS.color.onyx200,borderRadius:DS.radius.lg}}
        >
          {[{id:"my",label:"My policies"},{id:"store",label:"All policies (store)"}].map(t=>(
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={policiesScope===t.id}
              className="abtn"
              onClick={()=>{setPoliciesScope(t.id);setRecentShowAll(false);}}
              style={{
                flex:1,
                padding:`${DS.space[2]}px ${DS.space[3]}px`,
                border:"none",
                borderRadius:DS.radius.md,
                cursor:"pointer",
                fontFamily:DS.font,
                fontSize:12,
                fontWeight:policiesScope===t.id?700:500,
                color:policiesScope===t.id?DS.color.onyx800:DS.color.onyx500,
                background:policiesScope===t.id?DS.color.onyx100:"transparent",
                boxShadow:policiesScope===t.id?"0 1px 3px rgba(0,0,0,0.08)":"none",
                touchAction:"manipulation",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:DS.space[2],marginBottom:DS.space[4]}}>
          {[{id:"today",label:"Today"},{id:"last30d",label:"Last 30d"},{id:"lastQtr",label:"Last Qtr"}].map(p=>(
            <button
              key={p.id}
              type="button"
              className="abtn"
              onClick={()=>setPoliciesPeriod(p.id)}
              style={{
                padding:`6px ${DS.space[3]}px`,
                borderRadius:DS.radius.pill,
                border:`1px solid ${policiesPeriod===p.id?DC.blue:DS.color.onyx300}`,
                background:policiesPeriod===p.id?`${DC.blue}14`:"transparent",
                color:policiesPeriod===p.id?DC.blue:DS.color.onyx600,
                fontFamily:DS.font,
                fontSize:12,
                fontWeight:policiesPeriod===p.id?600:500,
                cursor:"pointer",
                touchAction:"manipulation",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:DS.space[2],marginBottom:DS.space[3]}}>
          <MetricCard label="No. of policies issued" value={policiesIssuedSlice.policiesCount} accent={DS.color.blue600} />
          <MetricCard label="Conversion rate" value={policiesIssuedSlice.conversion} sub="vs. eligible leads" accent={DS.color.green600} />
          <MetricCard label="Most sold policy" value={policiesIssuedSlice.mostSoldPolicy} sub="by count" accent={DS.color.purple600} />
        </div>
        <button
          type="button"
          className="abtn"
          onClick={()=>setPoliciesListOpen(true)}
          style={{
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            gap:DS.space[2],
            width:"100%",
            padding:`${DS.space[3]}px`,
            marginBottom:0,
            background:DC.surface,
            borderRadius:DS.radius.lg,
            border:`1px solid ${DS.color.onyx300}`,
            cursor:"pointer",
            fontFamily:DS.font,
            fontSize:13,
            fontWeight:600,
            color:DC.blue,
            touchAction:"manipulation",
          }}
        >
          View full list
          <ChevronRight size={14} strokeWidth={ICON_STROKE} color={DS.color.onyx400} aria-hidden style={{flexShrink:0}} />
        </button>
      </DashboardCard>

      <DashboardCard style={{marginBottom:DS.space[8]}}>
        <PromoDashboardCardHeader
          icon={Activity}
          title="Latest activity"
          subtitle={policiesScope==="my"?"Sold or in progress · newest first":"Store · all staff · newest first"}
          right={recentSource.length>3?(
            <button type="button" className="abtn" onClick={()=>setRecentShowAll(r=>!r)} style={{border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:600,color:DC.blue,fontFamily:DS.font,padding:0,flexShrink:0}}>
              {recentShowAll?"Show less":"Show all"}
            </button>
          ):null}
        />
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          {recentSlice.map((r,i)=>(
            <div key={`${r.id}-${i}`} style={{padding:`${DS.space[3]}px 0`,borderBottom:i<recentSlice.length-1?`1px solid ${DS.color.onyx300}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:DS.space[2]}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{...DASH.body,fontWeight:600,color:DS.color.onyx800}}>{r.line}</div>
                  <div style={{...DASH.caption,marginTop:4}}>{r.sub}</div>
                </div>
                <Badge variant={r.status==="Sold"?"green":"orange"}>{r.status}</Badge>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:DS.space[2]}}>
                <span style={DASH.meta}>{r.id!=="—"?r.id:"Draft / pending"}</span>
                <span className="counter" style={{fontSize:12,fontWeight:600,color:r.commission!=="—"?DS.color.green700:DS.color.onyx400}}>{r.commission!=="—"?`Comm. ${r.commission}`:"—"}</span>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard>
        <PromoDashboardCardHeader
          icon={Phone}
          title="Quick contacts"
          subtitle="Call or email your manager, sales, or Acko support"
        />
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          {QUICK_CONTACTS_PROMOTER.map((c,idx)=>(
            <div key={c.id} style={{paddingTop:idx>0?DS.space[4]:0,paddingBottom:DS.space[4],borderBottom:idx<QUICK_CONTACTS_PROMOTER.length-1?`1px solid ${DS.color.onyx300}`:"none"}}>
              <div style={{...DASH.sectionTitle,marginBottom:DS.space[3]}}>{c.name}</div>
              <div style={{display:"flex",gap:DS.space[2]}}>
                <a
                  className="abtn"
                  href={`tel:${c.phone.replace(/\s/g,"")}`}
                  style={{
                    flex:1,
                    display:"inline-flex",
                    alignItems:"center",
                    justifyContent:"center",
                    gap:6,
                    minHeight:40,
                    padding:`0 ${DS.space[3]}px`,
                    borderRadius:DS.radius.md,
                    border:`1px solid ${DC.blue}`,
                    background:`${DC.blue}0D`,
                    color:DC.blue,
                    fontFamily:DS.font,
                    fontSize:13,
                    fontWeight:600,
                    textDecoration:"none",
                    touchAction:"manipulation",
                  }}
                >
                  <Phone size={15} strokeWidth={ICON_STROKE} aria-hidden style={{flexShrink:0}} />
                  Call
                </a>
                <a
                  className="abtn"
                  href={`mailto:${c.email}`}
                  style={{
                    flex:1,
                    display:"inline-flex",
                    alignItems:"center",
                    justifyContent:"center",
                    gap:6,
                    minHeight:40,
                    padding:`0 ${DS.space[3]}px`,
                    borderRadius:DS.radius.md,
                    border:`1px solid ${DS.color.onyx300}`,
                    background:DS.color.onyx100,
                    color:DS.color.onyx800,
                    fontFamily:DS.font,
                    fontSize:13,
                    fontWeight:600,
                    textDecoration:"none",
                    touchAction:"manipulation",
                  }}
                >
                  <Mail size={15} strokeWidth={ICON_STROKE} aria-hidden style={{flexShrink:0}} />
                  Email
                </a>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}

const fontCSS=`
@font-face{font-family:'Euclid Circular B';src:url('https://pub-c050457d48794d5bb9ffc2b4649de2c1.r2.dev/Euclid%20Font/EuclidCircularB-Regular.otf') format('opentype');font-weight:400;}
@font-face{font-family:'Euclid Circular B';src:url('https://pub-c050457d48794d5bb9ffc2b4649de2c1.r2.dev/Euclid%20Font/EuclidCircularB-Medium.otf') format('opentype');font-weight:500;}
@font-face{font-family:'Euclid Circular B';src:url('https://pub-c050457d48794d5bb9ffc2b4649de2c1.r2.dev/Euclid%20Font/EuclidCircularB-Semibold.otf') format('opentype');font-weight:600;}
@font-face{font-family:'Euclid Circular B';src:url('https://pub-c050457d48794d5bb9ffc2b4649de2c1.r2.dev/Euclid%20Font/EuclidCircularB-Bold.otf') format('opentype');font-weight:700;}
*{box-sizing:border-box;-webkit-font-smoothing:antialiased;}
.abtn:active:not(:disabled){transform:scale(0.97);}
.abtn:focus{outline:none;box-shadow:0 0 0 3px #ECEBFF;}
.ainput:focus{outline:none;border-color:#4E29BB;box-shadow:0 0 0 3px #ECEBFF;}
.ainput-err:focus{outline:none;border-color:#D82A7B;box-shadow:0 0 0 3px #FCE7F4;}
.navbtn:hover{background:#F8F7FD;}
.counter{font-variant-numeric:tabular-nums;}
@keyframes mpos-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
`;

// ── Atoms ──────────────────────────────────────────────────────────────────
const Btn=({children,variant="primary",size="md",disabled,onClick,full,style={}})=>{
  const sz={sm:{h:40,px:16,fs:13,r:DS.radius.md},md:{h:48,px:24,fs:14,r:DS.radius.lg},lg:{h:56,px:32,fs:16,r:DS.radius.xl}};
  const s=sz[size]||sz.md;
  const V={
    primary:  {bg:DS.color.purple600,color:"#fff",  border:"none"},
    primaryEV:{bg:DS.color.green600, color:"#fff",  border:"none"},
    secondary:{bg:DS.color.onyx200,  color:DS.color.onyx700,border:"none"},
    outline:  {bg:"transparent",     color:DS.color.onyx700,border:`1px solid ${DS.color.onyx300}`},
    ghost:    {bg:"transparent",     color:DS.color.purple600,border:"none"},
    danger:   {bg:DS.color.cerise600,color:"#fff",  border:"none"},
    success:  {bg:DS.color.green600, color:"#fff",  border:"none"},
  };
  const v=V[variant]||V.primary;
  return <button className="abtn" onClick={onClick} disabled={disabled} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:DS.space[2],height:s.h,minWidth:s.h,padding:`0 ${s.px}px`,fontFamily:DS.font,fontSize:s.fs,fontWeight:600,lineHeight:1,borderRadius:s.r,border:v.border,background:v.bg,color:v.color,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.5:1,width:full?"100%":"auto",transition:"background 150ms ease,transform 100ms ease,box-shadow 150ms ease",...style}}>{children}</button>;
};

const AInput=({label,placeholder,defaultValue,value,onChange,error,type="text"})=>(
  <div style={{marginBottom:DS.space[4]}}>
    {label&&<label style={{display:"block",marginBottom:DS.space[2],fontSize:14,fontWeight:500,color:DS.color.onyx700,fontFamily:DS.font}}>{label}</label>}
    <input className={error?"ainput ainput-err":"ainput"} type={type} placeholder={placeholder} value={value} onChange={onChange} defaultValue={defaultValue}
      style={{width:"100%",height:48,padding:`0 ${DS.space[4]}px`,border:`1px solid ${error?DS.color.cerise600:DS.color.onyx400}`,borderRadius:DS.radius.lg,fontFamily:DS.font,fontSize:16,color:DS.color.onyx800,background:error?DS.color.cerise100:DS.color.onyx100,transition:"border-color 150ms,box-shadow 150ms",touchAction:"manipulation"}}/>
    {error&&<div style={{marginTop:DS.space[2],fontSize:12,color:DS.color.cerise700,fontFamily:DS.font}}>{error}</div>}
  </div>
);

const Badge=({children,variant="purple",dot})=>{
  const M={purple:{bg:DS.color.purple200,c:DS.color.purple700},green:{bg:DS.color.green200,c:DS.color.green700},orange:{bg:DS.color.orange200,c:DS.color.orange700},cerise:{bg:DS.color.cerise200,c:DS.color.cerise700},blue:{bg:DS.color.blue200,c:DS.color.blue700},gray:{bg:DS.color.onyx200,c:DS.color.onyx600}};
  const v=M[variant]||M.purple;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:DS.radius.pill,background:v.bg,color:v.c,fontSize:11,fontWeight:600,fontFamily:DS.font}}>{dot&&<span style={{width:6,height:6,borderRadius:"50%",background:v.c,flexShrink:0}}/>}{children}</span>;
};

const Card=({children,style={}})=>(
  <div style={{background:DS.color.onyx100,boxShadow:"0 0 0 1px rgba(0,0,0,0.08)",borderRadius:DS.radius.xl,padding:`${DS.space[4]}px`,...style}}>{children}</div>
);

const MetricCard=({label,value,sub,accent})=>(
  <div style={{background:accent+"14",borderRadius:DS.radius.lg,padding:`${DS.space[3]}px ${DS.space[4]}px`,flex:1,boxShadow:`inset 0 0 0 1px ${accent}26`,fontFamily:DS.font}}>
    <div style={{...DASH.eyebrow,marginBottom:DS.space[2],fontSize:10,letterSpacing:"0.35px"}}>{label}</div>
    <div className="counter" style={{fontSize:18,fontWeight:700,color:DS.color.onyx800,lineHeight:1.2}}>{value}</div>
    {sub&&<div style={{...DASH.meta,marginTop:4,lineHeight:1.35}}>{sub}</div>}
  </div>
);

const AlertBanner=({message,type="warning"})=>{
  const M={warning:{bg:DS.color.orange200,c:DS.color.orange700},error:{bg:DS.color.cerise200,c:DS.color.cerise700},info:{bg:DS.color.blue200,c:DS.color.blue700},success:{bg:DS.color.green200,c:DS.color.green700}};
  const v=M[type]||M.warning;
  return <div style={{background:v.bg,borderRadius:DS.radius.lg,padding:`${DS.space[3]}px ${DS.space[4]}px`,fontSize:13,fontWeight:500,color:v.c,fontFamily:DS.font,marginBottom:DS.space[3]}}>{message}</div>;
};

const WizardBar=({steps,current,primary})=>{
  const p=primary||DS.color.purple600;
  return(
    <div style={{display:"flex",alignItems:"center",gap:DS.space[2]}}>
      {steps.map((s,i)=>(
        <div key={s} style={{flex:1,display:"flex",alignItems:"center",gap:DS.space[2]}}>
          <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,fontFamily:DS.font,background:i<current?DS.color.green500:i===current?p:DS.color.onyx300,color:i<=current?"#fff":DS.color.onyx500,boxShadow:i===current?`0 0 0 4px ${p}33`:"none",transition:"background 200ms,box-shadow 200ms"}}>{i<current?<Check size={14} strokeWidth={ICON_STROKE} color="#fff" aria-hidden />:i+1}</div>
          {i<steps.length-1&&<div style={{flex:1,height:2,borderRadius:1,background:i<current?DS.color.green500:DS.color.onyx300,transition:"background 200ms"}}/>}
        </div>
      ))}
    </div>
  );
};

const OnboardingBackLink=({onClick,primary,label="Back"})=>(
  <button type="button" className="abtn" onClick={onClick} style={{border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:primary,fontFamily:DS.font,padding:0,marginBottom:DS.space[3],display:"block",textAlign:"left",width:"100%"}}>
    ← {label}
  </button>
);

const OnboardingProgress=({stepIndex,total,label,primary})=>{
  const pct=Math.min(100,Math.round(((stepIndex+1)/total)*100));
  const ariaLabel=label?`Step ${stepIndex+1} of ${total}: ${label}`:`Step ${stepIndex+1} of ${total}`;
  return(
    <div style={{marginBottom:DS.space[4]}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:DS.space[2],gap:DS.space[3]}}>
        <div style={{fontSize:11,fontWeight:600,color:primary,letterSpacing:"0.2px",fontFamily:DS.font,lineHeight:1.35}}>
          Step {stepIndex+1} of {total}{label?` · ${label}`:""}
        </div>
        <span style={{fontSize:11,fontWeight:600,color:DS.color.onyx400,fontFamily:DS.font,flexShrink:0}} aria-hidden>{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={stepIndex+1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={ariaLabel}
        style={{height:4,borderRadius:2,background:DS.color.onyx300,overflow:"hidden"}}
      >
        <div style={{height:"100%",width:`${pct}%`,background:primary,transition:"width 280ms ease"}} />
      </div>
    </div>
  );
};

const NavBar=({active,onNav,domain})=>{
  const a=acc(domain);
  const tabs=[
    {id:"home",label:"Home",Icon:House,size:15},
    {id:"sell",label:"Sell",Icon:Plus,size:20},
    {id:"earnings",label:"Earnings",Icon:IndianRupee,size:15},
    {id:"team",label:"Team",Icon:Users,size:15},
  ];
  return(
    <div style={{display:"flex",borderTop:`1px solid ${DS.color.onyx300}`,background:DS.color.onyx100}}>
      {tabs.map(t=>{
        const on=active===t.id;
        const Icon=t.Icon;
        const sz=t.id==="sell"?20:t.size;
        return <button key={t.id} className="navbtn" onClick={()=>onNav(t.id)} style={{flex:1,padding:"8px 0 10px",border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,fontFamily:DS.font,touchAction:"manipulation"}}>
          <Icon size={sz} strokeWidth={ICON_STROKE} color={on?a.primary:DS.color.onyx400} aria-hidden style={{display:"block"}} />
          <span style={{fontSize:10,fontWeight:on?600:400,color:on?a.primary:DS.color.onyx400,letterSpacing:"0.2px"}}>{t.label}</span>
        </button>;
      })}
    </div>
  );
};

const PROMOTER_SIGNUP_PROFILE={name:"Arjun Sharma",mobile:"+91 98765 43210"};
const DEALER_SIGNUP_PROFILE={
  name:"Vikram Krishnan",
  mobile:"+91 98402 11557",
  email:"vikram.krishnan@retail.in",
  pan:"ABCDE1234F",
  gst:"29ABCDE1234F1Z5",
};
const DEALER_INITIAL_STORES=[
  {id:"s1",name:"T-Nagar Flagship",city:"Chennai"},
  {id:"s2",name:"Phoenix Mall Store",city:"Chennai"},
];

function PromoterAuthFlow({config,onDone,domain}){
  const a=acc(domain);
  const primary=a.primary;
  const [step,setStep]=useState("phone");
  const [phone,setPhone]=useState("");
  const [otp,setOtp]=useState("");
  const sendOtp=()=>{
    if(phone.replace(/\D/g,"").length>=10) setStep("otp");
  };
  const verify=()=>{
    if(otp.replace(/\D/g,"").length>=6) onDone();
  };
  return(
    <div style={{flex:1,overflowY:"auto",padding:`${DS.space[5]}px ${DS.space[4]}px`,display:"flex",flexDirection:"column"}}>
      <div style={{textAlign:"center",marginBottom:DS.space[5]}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:DS.space[3]}}>
          <PartnerLogo partner={config.partner} size={48} />
        </div>
        <h1 style={{fontSize:22,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,margin:0,lineHeight:1.2}}>Sign in to mPOS</h1>
        <p style={{fontSize:13,color:DS.color.onyx500,fontFamily:DS.font,marginTop:DS.space[2],lineHeight:1.5}}>
          Use your registered mobile number. We’ll send a one-time code to verify it’s you — this keeps your commissions and customer data secure.
        </p>
      </div>
      {step==="phone"?(
        <>
          <label style={{fontSize:12,fontWeight:600,color:DS.color.onyx600,fontFamily:DS.font,marginBottom:DS.space[2],display:"block"}}>Mobile number</label>
          <input
            className="ainput"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="e.g. 98765 43210"
            value={phone}
            onChange={e=>setPhone(e.target.value.replace(/[^\d+\s]/g,"").slice(0,14))}
            style={{width:"100%",height:52,padding:`0 ${DS.space[4]}px`,border:`1px solid ${DS.color.onyx400}`,borderRadius:DS.radius.lg,fontFamily:DS.font,fontSize:16,marginBottom:DS.space[4]}}
          />
          <Btn variant={domain==="EV"?"primaryEV":"primary"} full onClick={sendOtp} style={{background:primary}}>Send OTP</Btn>
          <div style={{display:"flex",alignItems:"center",gap:DS.space[3],margin:`${DS.space[5]}px 0`}}>
            <div style={{flex:1,height:1,background:DS.color.onyx300}}/>
            <span style={{fontSize:12,color:DS.color.onyx400,fontFamily:DS.font}}>or continue with</span>
            <div style={{flex:1,height:1,background:DS.color.onyx300}}/>
          </div>
          <button
            type="button"
            className="abtn"
            onClick={onDone}
            style={{
              width:"100%",
              minHeight:52,
              borderRadius:DS.radius.lg,
              border:`1px solid ${DS.color.onyx300}`,
              background:DS.color.onyx100,
              fontFamily:DS.font,
              fontSize:14,
              fontWeight:600,
              color:DS.color.onyx800,
              cursor:"pointer",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              gap:DS.space[3],
              marginBottom:DS.space[2],
            }}
          >
            <span style={{fontSize:18,fontWeight:700,color:"#4285F4"}}>G</span>
            Google
          </button>
          <button
            type="button"
            className="abtn"
            onClick={onDone}
            style={{
              width:"100%",
              minHeight:52,
              borderRadius:DS.radius.lg,
              border:`1px solid ${DS.color.onyx300}`,
              background:DS.color.onyx100,
              fontFamily:DS.font,
              fontSize:14,
              fontWeight:600,
              color:DS.color.onyx800,
              cursor:"pointer",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              gap:DS.space[3],
            }}
          >
            Apple
          </button>
          <p style={{fontSize:11,color:DS.color.onyx400,fontFamily:DS.font,textAlign:"center",marginTop:DS.space[5],lineHeight:1.5}}>
            Social sign-in links your work identity. Same permissions apply — you’ll still confirm your store and bank details for payouts.
          </p>
        </>
      ):(
        <>
          <div style={{display:"flex",alignItems:"center",gap:DS.space[2],marginBottom:DS.space[4]}}>
            <button type="button" className="abtn" onClick={()=>{setStep("phone");setOtp("");}} style={{border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:primary,fontFamily:DS.font,padding:0}}>← Change number</button>
          </div>
          <p style={{fontSize:13,color:DS.color.onyx600,fontFamily:DS.font,marginBottom:DS.space[3],lineHeight:1.5}}>
            Enter the 6-digit code sent to <strong>{phone||"+91 ···· ···· 3210"}</strong>. Codes expire in 10 minutes.
          </p>
          <label style={{fontSize:12,fontWeight:600,color:DS.color.onyx600,fontFamily:DS.font,marginBottom:DS.space[2],display:"block"}}>One-time password</label>
          <input
            className="ainput"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="• • • • • •"
            value={otp}
            onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
            style={{width:"100%",height:52,padding:`0 ${DS.space[4]}px`,border:`1px solid ${DS.color.onyx400}`,borderRadius:DS.radius.lg,fontFamily:DS.font,fontSize:20,letterSpacing:8,textAlign:"center",marginBottom:DS.space[4]}}
          />
          <Btn variant={domain==="EV"?"primaryEV":"primary"} full onClick={verify} style={{background:primary}} disabled={otp.length<6}>Verify & continue</Btn>
          <button type="button" className="abtn" style={{width:"100%",marginTop:DS.space[3],background:"none",border:"none",color:primary,fontSize:13,fontWeight:600,fontFamily:DS.font,cursor:"pointer"}} onClick={()=>{}}>
            Resend OTP in 0:42
          </button>
        </>
      )}
    </div>
  );
}

function maskBankDigitsForDisplay(num){
  const d=num.replace(/\D/g,"");
  if(d.length<=4) return d||"—";
  return `···· ${d.slice(-4)}`;
}

function bankNameFromIfsc(ifsc){
  const c=(ifsc||"").toUpperCase().slice(0,4);
  const M={
    SBIN:"State Bank of India",
    HDFC:"HDFC Bank",
    ICIC:"ICICI Bank",
    UTIB:"Axis Bank",
    KKBK:"Kotak Mahindra Bank",
    YESB:"YES Bank",
    PUNB:"Punjab National Bank",
    BARB:"Bank of Baroda",
    IDFB:"IDFC FIRST Bank",
  };
  return M[c]||`Linked bank (${c})`;
}

const PROMOTER_ONBOARD_LABELS=["Welcome","Your profile","Location","Bank account","Verify account","All set"];

function PromoterFirstLoginOnboarding({config,onDone,domain}){
  const a=acc(domain);
  const primary=a.primary;
  const [step,setStep]=useState(0);
  const storeLabel=`${config.partner} · Chennai flagship`;
  const [locEnabled,setLocEnabled]=useState(false);
  const [bank,setBank]=useState({holder:PROMOTER_SIGNUP_PROFILE.name,account:"",ifsc:""});
  const [pennyDropState,setPennyDropState]=useState("idle");
  const [bankSkipped,setBankSkipped]=useState(false);
  const P_TOTAL=6;
  if(step===0) return(
    <div style={{flex:1,overflowY:"auto",padding:`${DS.space[5]}px ${DS.space[4]}px`}}>
      <OnboardingProgress stepIndex={0} total={P_TOTAL} label={PROMOTER_ONBOARD_LABELS[0]} primary={primary} />
      <h2 style={{fontSize:22,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,margin:`0 0 ${DS.space[3]}px`,lineHeight:1.2}}>Welcome to mPOS</h2>
      <p style={{fontSize:14,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1.55,marginBottom:DS.space[5]}}>
        You’re signed in. Over the next minute we’ll confirm who you are, where you sell, and how you get paid — so every sale is attributed correctly and your commissions land in the right account.
      </p>
      <Card style={{background:a.light,border:`1px solid ${primary}33`}}>
        <div style={{display:"flex",gap:DS.space[3],alignItems:"flex-start"}}>
          <Smartphone size={22} strokeWidth={ICON_STROKE} color={primary} style={{flexShrink:0,marginTop:2}} aria-hidden />
          <div>
            <div style={{fontSize:13,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font}}>Sell insurance at the counter</div>
            <div style={{fontSize:12,color:DS.color.onyx500,fontFamily:DS.font,marginTop:4,lineHeight:1.45}}>Scan devices, issue plans, track earnings — all in one app.</div>
          </div>
        </div>
      </Card>
      <Btn variant={domain==="EV"?"primaryEV":"primary"} full style={{marginTop:DS.space[6],background:primary}} onClick={()=>setStep(1)}>Continue</Btn>
    </div>
  );
  if(step===1) return(
    <div style={{flex:1,overflowY:"auto",padding:`${DS.space[5]}px ${DS.space[4]}px`}}>
      <OnboardingBackLink primary={primary} onClick={()=>setStep(0)} />
      <OnboardingProgress stepIndex={1} total={P_TOTAL} label={PROMOTER_ONBOARD_LABELS[1]} primary={primary} />
      <h2 style={{fontSize:20,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,margin:`0 0 ${DS.space[2]}px`,lineHeight:1.2}}>Confirm your details</h2>
      <p style={{fontSize:13,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1.5,marginBottom:DS.space[4]}}>
        We pulled these from your employer and {config.partner}. Accurate name and store help us route policies, resolve disputes, and show the right targets on your dashboard.
      </p>
      <Card style={{marginBottom:DS.space[4]}}>
        <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[3]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font}}>
          <span style={{fontSize:14,color:DS.color.onyx500}}>Full name</span>
          <span style={{fontSize:14,fontWeight:600,color:DS.color.onyx800}}>{PROMOTER_SIGNUP_PROFILE.name}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[3]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font}}>
          <span style={{fontSize:14,color:DS.color.onyx500}}>Mobile</span>
          <span style={{fontSize:14,fontWeight:500,color:DS.color.onyx800}}>{PROMOTER_SIGNUP_PROFILE.mobile}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:`${DS.space[3]}px 0`,fontFamily:DS.font,gap:DS.space[3]}}>
          <span style={{fontSize:14,color:DS.color.onyx500,flexShrink:0}}>Associated store</span>
          <span style={{fontSize:14,fontWeight:600,color:DS.color.onyx800,textAlign:"right",lineHeight:1.35}}>{storeLabel}</span>
        </div>
      </Card>
      <p style={{fontSize:12,color:DS.color.onyx400,fontFamily:DS.font,lineHeight:1.45}}>Wrong store? Ask your manager to update your mapping in the partner portal — we can’t change it here for security reasons.</p>
      <Btn variant={domain==="EV"?"primaryEV":"primary"} full style={{marginTop:DS.space[5],background:primary}} onClick={()=>setStep(2)}>Yes, this is correct</Btn>
      <Btn variant="outline" full style={{marginTop:DS.space[3]}} onClick={()=>{}}>Report a problem</Btn>
    </div>
  );
  if(step===2) return(
    <div style={{flex:1,overflowY:"auto",padding:`${DS.space[5]}px ${DS.space[4]}px`}}>
      <OnboardingBackLink primary={primary} onClick={()=>setStep(1)} />
      <OnboardingProgress stepIndex={2} total={P_TOTAL} label={PROMOTER_ONBOARD_LABELS[2]} primary={primary} />
      <div style={{display:"flex",justifyContent:"center",marginBottom:DS.space[4]}}>
        <div style={{width:64,height:64,borderRadius:DS.radius.xl,background:a.light,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <MapPin size={32} strokeWidth={ICON_STROKE} color={primary} aria-hidden />
        </div>
      </div>
      <h2 style={{fontSize:20,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,margin:`0 0 ${DS.space[2]}px`,lineHeight:1.2}}>Enable location access</h2>
      <p style={{fontSize:13,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1.5,marginBottom:DS.space[4]}}>
        We use your approximate location while you’re on shift to confirm you’re at an authorised retail point, show store-specific schemes, and protect against misuse. We don’t track you when you’re off duty.
      </p>
      <AlertBanner type="info" message="You can change this anytime in Settings → Privacy." />
      {!locEnabled?(
        <Btn variant={domain==="EV"?"primaryEV":"primary"} full style={{background:primary}} onClick={()=>setLocEnabled(true)}>Allow location access</Btn>
      ):(
        <>
          <div style={{padding:DS.space[4],background:DS.color.green100,border:`1px solid ${DS.color.green400}`,borderRadius:DS.radius.lg,marginBottom:DS.space[4],fontFamily:DS.font}}>
            <div style={{fontSize:13,fontWeight:600,color:DS.color.green800}}>Location enabled</div>
            <div style={{fontSize:12,color:DS.color.green700,marginTop:4}}>Chennai · ~120 m accuracy</div>
          </div>
          <Btn variant={domain==="EV"?"primaryEV":"primary"} full style={{background:primary}} onClick={()=>setStep(3)}>Continue</Btn>
        </>
      )}
    </div>
  );
  if(step===3) return(
    <div style={{flex:1,overflowY:"auto",padding:`${DS.space[5]}px ${DS.space[4]}px`}}>
      <OnboardingBackLink primary={primary} onClick={()=>setStep(2)} />
      <OnboardingProgress stepIndex={3} total={P_TOTAL} label={PROMOTER_ONBOARD_LABELS[3]} primary={primary} />
      <div style={{display:"flex",justifyContent:"center",marginBottom:DS.space[4]}}>
        <div style={{width:64,height:64,borderRadius:DS.radius.xl,background:a.light,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Landmark size={30} strokeWidth={ICON_STROKE} color={primary} aria-hidden />
        </div>
      </div>
      <h2 style={{fontSize:20,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,margin:`0 0 ${DS.space[2]}px`,lineHeight:1.2}}>Add your bank account</h2>
      <p style={{fontSize:13,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1.5,marginBottom:DS.space[4]}}>
        Commissions are paid by NEFT to a bank account in your name. We need your account number and IFSC so we can verify the account, apply TDS correctly, and comply with RBI norms. Your details are encrypted.
      </p>
      <AInput label="Account holder name" value={bank.holder} onChange={e=>setBank(b=>({...b,holder:e.target.value}))} />
      <AInput label="Bank account number" placeholder="Enter account number" value={bank.account} onChange={e=>setBank(b=>({...b,account:e.target.value.replace(/\D/g,"").slice(0,18)}))} />
      <AInput label="IFSC code" placeholder="e.g. SBIN0001234" value={bank.ifsc} onChange={e=>setBank(b=>({...b,ifsc:e.target.value.toUpperCase().slice(0,11)}))} />
      <p style={{fontSize:11,color:DS.color.onyx400,fontFamily:DS.font,marginBottom:DS.space[4],lineHeight:1.45}}>Must match your KYC name. UPI IDs alone aren’t accepted for commission settlement.</p>
      <Btn variant={domain==="EV"?"primaryEV":"primary"} full style={{background:primary}} disabled={!bank.account||bank.ifsc.length<11} onClick={()=>{setBankSkipped(false);setPennyDropState("idle");setStep(4);}}>Continue to verification</Btn>
      <button type="button" className="abtn" style={{width:"100%",marginTop:DS.space[3],background:"none",border:"none",color:DS.color.onyx500,fontSize:13,fontWeight:600,fontFamily:DS.font,cursor:"pointer"}} onClick={()=>{setBankSkipped(true);setPennyDropState("idle");setStep(5);}}>
        Skip for now — add bank in Settings
      </button>
    </div>
  );
  const resolvedBankName=bankNameFromIfsc(bank.ifsc);
  const startPennyDrop=()=>{
    setPennyDropState("sending");
    window.setTimeout(()=>{setPennyDropState("idle");setStep(5);},2000);
  };
  if(step===4) return(
    <div style={{flex:1,overflowY:"auto",padding:`${DS.space[5]}px ${DS.space[4]}px`}}>
      <OnboardingBackLink primary={primary} onClick={()=>{setStep(3);setPennyDropState("idle");}} />
      <OnboardingProgress stepIndex={4} total={P_TOTAL} label={PROMOTER_ONBOARD_LABELS[4]} primary={primary} />
      <div style={{display:"flex",justifyContent:"center",marginBottom:DS.space[3]}}>
        <div style={{width:56,height:56,borderRadius:DS.radius.xl,background:a.light,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <IndianRupee size={28} strokeWidth={ICON_STROKE} color={primary} aria-hidden />
        </div>
      </div>
      <h2 style={{fontSize:20,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,margin:`0 0 ${DS.space[2]}px`,lineHeight:1.2}}>Confirm bank details</h2>
      <p style={{fontSize:13,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1.45,marginBottom:DS.space[4]}}>
        We’ll send <strong>₹1</strong> to verify this account before your first payout.
      </p>
      <Card style={{marginBottom:DS.space[4]}}>
        <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,letterSpacing:"0.2px",marginBottom:DS.space[3],fontFamily:DS.font}}>Your account</div>
        <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[2]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font,gap:DS.space[2]}}>
          <span style={{fontSize:13,color:DS.color.onyx500,flexShrink:0}}>Bank</span>
          <span style={{fontSize:13,fontWeight:600,color:DS.color.onyx800,textAlign:"right",lineHeight:1.35}}>{resolvedBankName}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[2]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font}}>
          <span style={{fontSize:13,color:DS.color.onyx500}}>Account holder</span>
          <span style={{fontSize:13,fontWeight:600,color:DS.color.onyx800,textAlign:"right",maxWidth:"55%"}}>{bank.holder}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[2]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font}}>
          <span style={{fontSize:13,color:DS.color.onyx500}}>Account no.</span>
          <span className="counter" style={{fontSize:14,fontWeight:600,color:DS.color.onyx800}}>{maskBankDigitsForDisplay(bank.account)}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[2]}px 0`,fontFamily:DS.font}}>
          <span style={{fontSize:13,color:DS.color.onyx500}}>IFSC</span>
          <span className="counter" style={{fontSize:13,fontWeight:600,color:DS.color.onyx800}}>{bank.ifsc}</span>
        </div>
      </Card>
      {pennyDropState==="sending"&&(
        <div style={{display:"flex",alignItems:"center",gap:DS.space[3],padding:DS.space[3],marginBottom:DS.space[4],justifyContent:"center",fontFamily:DS.font}}>
          <Loader2 size={22} strokeWidth={ICON_STROKE} color={primary} style={{animation:"mpos-spin 0.9s linear infinite"}} aria-hidden />
          <span style={{fontSize:13,fontWeight:500,color:DS.color.onyx700}}>Sending ₹1 penny drop…</span>
        </div>
      )}
      {pennyDropState==="idle"&&(
        <Btn variant={domain==="EV"?"primaryEV":"primary"} full style={{background:primary}} onClick={startPennyDrop}>
          Confirm & start ₹1 verification
        </Btn>
      )}
      {pennyDropState==="idle"&&(
        <button type="button" className="abtn" style={{width:"100%",marginTop:DS.space[3],background:"none",border:"none",color:DS.color.onyx500,fontSize:12,fontFamily:DS.font,cursor:"pointer"}} onClick={()=>{setStep(3);setPennyDropState("idle");}}>
          Edit bank details
        </button>
      )}
    </div>
  );
  if(step===5) return(
    <div style={{flex:1,overflowY:"auto",padding:`${DS.space[5]}px ${DS.space[4]}px`,display:"flex",flexDirection:"column",alignItems:"stretch",textAlign:"center"}}>
      <div style={{width:"100%",textAlign:"left"}}>
        <OnboardingBackLink primary={primary} onClick={()=>{if(bankSkipped){setStep(3);}else{setStep(4);setPennyDropState("idle");}}} />
        <OnboardingProgress stepIndex={5} total={P_TOTAL} label={PROMOTER_ONBOARD_LABELS[5]} primary={primary} />
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
        <div style={{width:88,height:88,borderRadius:44,background:`linear-gradient(145deg, ${bankSkipped?DS.color.orange200:DS.color.green200} 0%, ${bankSkipped?DS.color.orange300:DS.color.green300} 100%)`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:DS.space[4],boxShadow:`0 8px 28px ${bankSkipped?DS.color.orange500:DS.color.green500}44`}}>
          <PartyPopper size={44} strokeWidth={ICON_STROKE} color={bankSkipped?DS.color.orange800:DS.color.green800} aria-hidden />
        </div>
        {bankSkipped?(
          <>
            <AlertBanner type="warning" message="Bank not added — add account details in Settings → Payouts to receive commissions."/>
            <h2 style={{fontSize:22,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,margin:`0 0 ${DS.space[2]}px`,lineHeight:1.25}}>You’re set to start selling</h2>
            <p style={{fontSize:14,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1.55,marginBottom:DS.space[5],maxWidth:300}}>
              Your profile and store are active on mPOS. Complete bank setup when you’re ready to withdraw.
            </p>
          </>
        ):(
          <>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,marginBottom:DS.space[2],padding:`4px ${DS.space[3]}px`,background:DS.color.green100,borderRadius:DS.radius.pill,border:`1px solid ${DS.color.green400}`}}>
              <Check size={16} strokeWidth={ICON_STROKE} color={DS.color.green700} aria-hidden />
              <span style={{fontSize:12,fontWeight:600,color:DS.color.green800,fontFamily:DS.font}}>Penny drop successful</span>
            </div>
            <h2 style={{fontSize:22,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,margin:`0 0 ${DS.space[2]}px`,lineHeight:1.25}}>Your mPOS account is ready</h2>
            <p style={{fontSize:14,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1.55,marginBottom:DS.space[5],maxWidth:300}}>
              {resolvedBankName} is verified. You can sell on mPOS and get commissions paid to this account.
            </p>
          </>
        )}
        <div style={{width:"100%",marginTop:"auto",paddingTop:DS.space[4]}}>
          <Btn variant={domain==="EV"?"primaryEV":"primary"} full style={{background:primary}} onClick={onDone}>Go to dashboard</Btn>
        </div>
      </div>
    </div>
  );
  return null;
}

function maskPanForDisplay(pan){
  const p=(pan||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
  if(p.length<5) return p||"—";
  return`${p.slice(0,5)}****${p.slice(-1)}`;
}

const DEALER_ONBOARD_LABELS=["Welcome","Business details","Bank account","Verify account","Payout verified","Your stores"];

function DealerFirstLoginOnboarding({config,onDone,domain}){
  const a=acc(domain);
  const primary=a.primary;
  const D_TOTAL=6;
  const [step,setStep]=useState(0);
  const [bank,setBank]=useState({holder:DEALER_SIGNUP_PROFILE.name,account:"",ifsc:""});
  const [pennyDropState,setPennyDropState]=useState("idle");
  const [bankSkipped,setBankSkipped]=useState(false);
  const [stores,setStores]=useState(()=>DEALER_INITIAL_STORES.map(s=>({...s})));
  const [addOpen,setAddOpen]=useState(false);
  const [newStoreName,setNewStoreName]=useState("");
  const [newStoreCity,setNewStoreCity]=useState("Chennai");
  const resolvedBankName=bankNameFromIfsc(bank.ifsc);
  const startPennyDrop=()=>{
    setPennyDropState("sending");
    window.setTimeout(()=>{setPennyDropState("idle");setStep(4);},2000);
  };
  const addStore=()=>{
    const n=newStoreName.trim();
    if(!n) return;
    setStores(s=>[...s,{id:`s${Date.now()}`,name:n,city:newStoreCity.trim()||"—"}]);
    setNewStoreName("");
    setNewStoreCity("Chennai");
    setAddOpen(false);
  };
  if(step===0) return(
    <div style={{flex:1,overflowY:"auto",padding:`${DS.space[5]}px ${DS.space[4]}px`}}>
      <OnboardingProgress stepIndex={0} total={D_TOTAL} label={DEALER_ONBOARD_LABELS[0]} primary={primary} />
      <h2 style={{fontSize:22,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,margin:`0 0 ${DS.space[3]}px`,lineHeight:1.2}}>Welcome to mPOS</h2>
      <p style={{fontSize:14,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1.55,marginBottom:DS.space[5]}}>
        You’re signed in as a dealer. We’ll confirm your business and bank details, verify payouts with a ₹1 transfer, then link the stores you manage.
      </p>
      <Card style={{background:a.light,border:`1px solid ${primary}33`}}>
        <div style={{display:"flex",gap:DS.space[3],alignItems:"flex-start"}}>
          <Users size={22} strokeWidth={ICON_STROKE} color={primary} style={{flexShrink:0,marginTop:2}} aria-hidden />
          <div>
            <div style={{fontSize:13,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font}}>Run your retail network</div>
            <div style={{fontSize:12,color:DS.color.onyx500,fontFamily:DS.font,marginTop:4,lineHeight:1.45}}>Issue cover, track staff, and settle commissions — GST-ready.</div>
          </div>
        </div>
      </Card>
      <Btn variant={domain==="EV"?"primaryEV":"primary"} full style={{marginTop:DS.space[6],background:primary}} onClick={()=>setStep(1)}>Continue</Btn>
    </div>
  );
  if(step===1) return(
    <div style={{flex:1,overflowY:"auto",padding:`${DS.space[5]}px ${DS.space[4]}px`}}>
      <OnboardingBackLink primary={primary} onClick={()=>setStep(0)} />
      <OnboardingProgress stepIndex={1} total={D_TOTAL} label={DEALER_ONBOARD_LABELS[1]} primary={primary} />
      <h2 style={{fontSize:20,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,margin:`0 0 ${DS.space[2]}px`,lineHeight:1.2}}>Confirm your details</h2>
      <p style={{fontSize:13,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1.5,marginBottom:DS.space[4]}}>
        From {config.partner} and GST records. Used for TDS, invoices, and compliance.
      </p>
      <Card style={{marginBottom:DS.space[4]}}>
        <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[3]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font}}>
          <span style={{fontSize:14,color:DS.color.onyx500}}>Name</span>
          <span style={{fontSize:14,fontWeight:600,color:DS.color.onyx800}}>{DEALER_SIGNUP_PROFILE.name}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[3]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font}}>
          <span style={{fontSize:14,color:DS.color.onyx500}}>Contact</span>
          <span style={{fontSize:14,fontWeight:500,color:DS.color.onyx800}}>{DEALER_SIGNUP_PROFILE.mobile}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[3]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font,gap:DS.space[2]}}>
          <span style={{fontSize:14,color:DS.color.onyx500,flexShrink:0}}>Email</span>
          <span style={{fontSize:13,fontWeight:500,color:DS.color.onyx800,textAlign:"right",wordBreak:"break-all"}}>{DEALER_SIGNUP_PROFILE.email}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[3]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font}}>
          <span style={{fontSize:14,color:DS.color.onyx500}}>PAN</span>
          <span className="counter" style={{fontSize:14,fontWeight:600,color:DS.color.onyx800}}>{maskPanForDisplay(DEALER_SIGNUP_PROFILE.pan)}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:`${DS.space[3]}px 0`,fontFamily:DS.font,gap:DS.space[3]}}>
          <span style={{fontSize:14,color:DS.color.onyx500,flexShrink:0}}>GSTIN</span>
          <span className="counter" style={{fontSize:13,fontWeight:600,color:DS.color.onyx800,textAlign:"right",lineHeight:1.35}}>{DEALER_SIGNUP_PROFILE.gst}</span>
        </div>
      </Card>
      <p style={{fontSize:12,color:DS.color.onyx400,fontFamily:DS.font,lineHeight:1.45}}>Wrong GST or PAN? Ask your distributor to update the partner portal.</p>
      <Btn variant={domain==="EV"?"primaryEV":"primary"} full style={{marginTop:DS.space[5],background:primary}} onClick={()=>setStep(2)}>Yes, continue</Btn>
      <Btn variant="outline" full style={{marginTop:DS.space[3]}} onClick={()=>{}}>Report a problem</Btn>
    </div>
  );
  if(step===2) return(
    <div style={{flex:1,overflowY:"auto",padding:`${DS.space[5]}px ${DS.space[4]}px`}}>
      <OnboardingBackLink primary={primary} onClick={()=>setStep(1)} />
      <OnboardingProgress stepIndex={2} total={D_TOTAL} label={DEALER_ONBOARD_LABELS[2]} primary={primary} />
      <div style={{display:"flex",justifyContent:"center",marginBottom:DS.space[4]}}>
        <div style={{width:64,height:64,borderRadius:DS.radius.xl,background:a.light,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Landmark size={30} strokeWidth={ICON_STROKE} color={primary} aria-hidden />
        </div>
      </div>
      <h2 style={{fontSize:20,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,margin:`0 0 ${DS.space[2]}px`,lineHeight:1.2}}>Add your bank account</h2>
      <p style={{fontSize:13,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1.5,marginBottom:DS.space[4]}}>
        Payouts go to an account that matches your business name. Details are encrypted.
      </p>
      <AInput label="Account holder name" value={bank.holder} onChange={e=>setBank(b=>({...b,holder:e.target.value}))} />
      <AInput label="Bank account number" placeholder="Enter account number" value={bank.account} onChange={e=>setBank(b=>({...b,account:e.target.value.replace(/\D/g,"").slice(0,18)}))} />
      <AInput label="IFSC code" placeholder="e.g. SBIN0001234" value={bank.ifsc} onChange={e=>setBank(b=>({...b,ifsc:e.target.value.toUpperCase().slice(0,11)}))} />
      <p style={{fontSize:11,color:DS.color.onyx400,fontFamily:DS.font,marginBottom:DS.space[4],lineHeight:1.45}}>Must match your registered business / PAN name.</p>
      <Btn variant={domain==="EV"?"primaryEV":"primary"} full style={{background:primary}} disabled={!bank.account||bank.ifsc.length<11} onClick={()=>{setBankSkipped(false);setPennyDropState("idle");setStep(3);}}>Continue to verification</Btn>
      <button type="button" className="abtn" style={{width:"100%",marginTop:DS.space[3],background:"none",border:"none",color:DS.color.onyx500,fontSize:13,fontWeight:600,fontFamily:DS.font,cursor:"pointer"}} onClick={()=>{setBankSkipped(true);setPennyDropState("idle");setStep(4);}}>
        Skip for now — add bank in Settings
      </button>
    </div>
  );
  if(step===3) return(
    <div style={{flex:1,overflowY:"auto",padding:`${DS.space[5]}px ${DS.space[4]}px`}}>
      <OnboardingBackLink primary={primary} onClick={()=>{setStep(2);setPennyDropState("idle");}} />
      <OnboardingProgress stepIndex={3} total={D_TOTAL} label={DEALER_ONBOARD_LABELS[3]} primary={primary} />
      <div style={{display:"flex",justifyContent:"center",marginBottom:DS.space[3]}}>
        <div style={{width:56,height:56,borderRadius:DS.radius.xl,background:a.light,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <IndianRupee size={28} strokeWidth={ICON_STROKE} color={primary} aria-hidden />
        </div>
      </div>
      <h2 style={{fontSize:20,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,margin:`0 0 ${DS.space[2]}px`,lineHeight:1.2}}>Confirm bank details</h2>
      <p style={{fontSize:13,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1.45,marginBottom:DS.space[4]}}>
        We’ll send <strong>₹1</strong> to verify this account before your first payout.
      </p>
      <Card style={{marginBottom:DS.space[4]}}>
        <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,letterSpacing:"0.2px",marginBottom:DS.space[3],fontFamily:DS.font}}>Your account</div>
        <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[2]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font,gap:DS.space[2]}}>
          <span style={{fontSize:13,color:DS.color.onyx500,flexShrink:0}}>Bank</span>
          <span style={{fontSize:13,fontWeight:600,color:DS.color.onyx800,textAlign:"right",lineHeight:1.35}}>{resolvedBankName}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[2]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font}}>
          <span style={{fontSize:13,color:DS.color.onyx500}}>Account holder</span>
          <span style={{fontSize:13,fontWeight:600,color:DS.color.onyx800,textAlign:"right",maxWidth:"55%"}}>{bank.holder}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[2]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font}}>
          <span style={{fontSize:13,color:DS.color.onyx500}}>Account no.</span>
          <span className="counter" style={{fontSize:14,fontWeight:600,color:DS.color.onyx800}}>{maskBankDigitsForDisplay(bank.account)}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[2]}px 0`,fontFamily:DS.font}}>
          <span style={{fontSize:13,color:DS.color.onyx500}}>IFSC</span>
          <span className="counter" style={{fontSize:13,fontWeight:600,color:DS.color.onyx800}}>{bank.ifsc}</span>
        </div>
      </Card>
      {pennyDropState==="sending"&&(
        <div style={{display:"flex",alignItems:"center",gap:DS.space[3],padding:DS.space[3],marginBottom:DS.space[4],justifyContent:"center",fontFamily:DS.font}}>
          <Loader2 size={22} strokeWidth={ICON_STROKE} color={primary} style={{animation:"mpos-spin 0.9s linear infinite"}} aria-hidden />
          <span style={{fontSize:13,fontWeight:500,color:DS.color.onyx700}}>Sending ₹1 penny drop…</span>
        </div>
      )}
      {pennyDropState==="idle"&&(
        <Btn variant={domain==="EV"?"primaryEV":"primary"} full style={{background:primary}} onClick={startPennyDrop}>
          Confirm & start ₹1 verification
        </Btn>
      )}
      {pennyDropState==="idle"&&(
        <button type="button" className="abtn" style={{width:"100%",marginTop:DS.space[3],background:"none",border:"none",color:DS.color.onyx500,fontSize:12,fontFamily:DS.font,cursor:"pointer"}} onClick={()=>{setStep(2);setPennyDropState("idle");}}>
          Edit bank details
        </button>
      )}
    </div>
  );
  if(step===4) return(
    <div style={{flex:1,overflowY:"auto",padding:`${DS.space[5]}px ${DS.space[4]}px`,display:"flex",flexDirection:"column",alignItems:"stretch",textAlign:"center"}}>
      <div style={{width:"100%",textAlign:"left"}}>
        <OnboardingBackLink primary={primary} onClick={()=>{if(bankSkipped){setStep(2);}else{setStep(3);setPennyDropState("idle");}}} />
        <OnboardingProgress stepIndex={4} total={D_TOTAL} label={DEALER_ONBOARD_LABELS[4]} primary={primary} />
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
        <div style={{width:88,height:88,borderRadius:44,background:`linear-gradient(145deg, ${bankSkipped?DS.color.orange200:DS.color.green200} 0%, ${bankSkipped?DS.color.orange300:DS.color.green300} 100%)`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:DS.space[4],boxShadow:`0 8px 28px ${bankSkipped?DS.color.orange500:DS.color.green500}44`}}>
          <PartyPopper size={44} strokeWidth={ICON_STROKE} color={bankSkipped?DS.color.orange800:DS.color.green800} aria-hidden />
        </div>
        {bankSkipped?(
          <>
            <AlertBanner type="warning" message="Bank not added — complete payouts in Settings → Payouts before your first settlement."/>
            <h2 style={{fontSize:22,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,margin:`0 0 ${DS.space[2]}px`,lineHeight:1.25}}>Business profile ready</h2>
            <p style={{fontSize:14,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1.55,marginBottom:DS.space[5],maxWidth:300}}>
              Next, link the stores you oversee. You can add bank details anytime.
            </p>
          </>
        ):(
          <>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,marginBottom:DS.space[2],padding:`4px ${DS.space[3]}px`,background:DS.color.green100,borderRadius:DS.radius.pill,border:`1px solid ${DS.color.green400}`}}>
              <Check size={16} strokeWidth={ICON_STROKE} color={DS.color.green700} aria-hidden />
              <span style={{fontSize:12,fontWeight:600,color:DS.color.green800,fontFamily:DS.font}}>Penny drop successful</span>
            </div>
            <h2 style={{fontSize:22,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,margin:`0 0 ${DS.space[2]}px`,lineHeight:1.25}}>Your mPOS account is ready</h2>
            <p style={{fontSize:14,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1.55,marginBottom:DS.space[5],maxWidth:300}}>
              {resolvedBankName} verified. Next, link the stores you oversee.
            </p>
          </>
        )}
        <div style={{width:"100%",marginTop:"auto",paddingTop:DS.space[4]}}>
          <Btn variant={domain==="EV"?"primaryEV":"primary"} full style={{background:primary}} onClick={()=>setStep(5)}>Continue</Btn>
        </div>
      </div>
    </div>
  );
  if(step===5) return(
    <div style={{flex:1,overflowY:"auto",overflowX:"hidden",padding:`${DS.space[5]}px ${DS.space[4]}px`,display:"flex",flexDirection:"column",position:"relative",minHeight:0}}>
      <OnboardingBackLink primary={primary} onClick={()=>setStep(4)} />
      <OnboardingProgress stepIndex={5} total={D_TOTAL} label={DEALER_ONBOARD_LABELS[5]} primary={primary} />
      <div style={{display:"flex",justifyContent:"center",marginBottom:DS.space[3]}}>
        <div style={{width:56,height:56,borderRadius:DS.radius.xl,background:a.light,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Store size={28} strokeWidth={ICON_STROKE} color={primary} aria-hidden />
        </div>
      </div>
      <h2 style={{fontSize:20,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,margin:`0 0 ${DS.space[2]}px`,lineHeight:1.2}}>Your stores on mPOS</h2>
      <p style={{fontSize:13,color:DS.color.onyx600,fontFamily:DS.font,lineHeight:1.5,marginBottom:DS.space[4]}}>
        Policies and staff activity roll up under each store. Add any location you manage for {config.partner}.
      </p>
      {stores.map(s=>(
        <Card key={s.id} style={{marginBottom:DS.space[3]}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:DS.space[3]}}>
            <div style={{width:40,height:40,borderRadius:DS.radius.md,background:a.mid,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Store size={20} strokeWidth={ICON_STROKE} color={primary} aria-hidden />
            </div>
            <div style={{minWidth:0,flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font}}>{s.name}</div>
              <div style={{fontSize:12,color:DS.color.onyx500,fontFamily:DS.font,marginTop:2}}>{s.city}</div>
            </div>
          </div>
        </Card>
      ))}
      <Btn variant="outline" full style={{marginBottom:DS.space[3]}} onClick={()=>setAddOpen(true)}>
        <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:DS.space[2]}}>
          <Plus size={18} strokeWidth={ICON_STROKE} aria-hidden /> Add a store
        </span>
      </Btn>
      {addOpen&&(
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",zIndex:20,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:DS.space[4]}} role="dialog" aria-modal="true" aria-labelledby="dealer-add-store-title">
          <div style={{width:"100%",maxWidth:360,background:DS.color.onyx100,borderRadius:`${DS.radius.xl}px ${DS.radius.xl}px 0 0`,padding:DS.space[5],boxShadow:"0 -8px 32px rgba(0,0,0,0.2)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:DS.space[4]}}>
              <h3 id="dealer-add-store-title" style={{fontSize:17,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font,margin:0}}>New store</h3>
              <button type="button" className="abtn" aria-label="Close" onClick={()=>setAddOpen(false)} style={{border:"none",background:"none",cursor:"pointer",padding:DS.space[2]}}>
                <X size={22} color={DS.color.onyx500} aria-hidden />
              </button>
            </div>
            <AInput label="Store name" placeholder="e.g. OMR Express" value={newStoreName} onChange={e=>setNewStoreName(e.target.value)} />
            <AInput label="City" placeholder="City" value={newStoreCity} onChange={e=>setNewStoreCity(e.target.value)} />
            <Btn variant={domain==="EV"?"primaryEV":"primary"} full style={{background:primary,marginTop:DS.space[2]}} onClick={addStore} disabled={!newStoreName.trim()}>Save store</Btn>
          </div>
        </div>
      )}
      <div style={{marginTop:"auto",paddingTop:DS.space[4]}}>
        <Btn variant={domain==="EV"?"primaryEV":"primary"} full style={{background:primary}} onClick={onDone}>Go to dashboard</Btn>
      </div>
    </div>
  );
  return null;
}

// ── Onboarding ────────────────────────────────────────────────────────────────
function OnboardingScreen({config,kycSkipped,setKycSkipped,onComplete}){
  const [step,setStep]=useState(0);
  const a=acc(config.domain);
  const steps=["Confirm details","KYC","Quick tour","Done"];
  const tourPoints={
    Promoter:["Scan any IMEI to start a sale in under 60 seconds","Commission credited to your wallet instantly after each sale","Withdraw to your bank same day — no waiting for month-end"],
    Dealer:["Issue insurance directly — same flow as your promoters","Track all staff sales and zero-sale alerts from one view","GST invoices and commissions managed in-app"],
    Distributor:["See your entire dealer network in real time","Get alerted the moment a dealer goes zero-sale","Onboard new dealers yourself — no ops ticket needed"],
    "Brand Admin":["Build and activate schemes without calling Acko","Drill into any region, dealer, or device from one screen","Broadcast updates to your field force from inside the app"],
    "EV Dealer":["Issue ECW and EBW at vehicle delivery — VIN scan","See today's deliveries vs warranties issued live","File and track claims at the same touchpoint as the sale"],
  };

  const screens=[
    <div key="confirm">
      <div style={{textAlign:"center",marginBottom:DS.space[6]}}>
        <div style={{margin:"0 auto 12px",display:"flex",justifyContent:"center"}}>
          <PartnerLogo key={config.partner} partner={config.partner} size={56} />
        </div>
        <div style={{fontSize:20,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font}}>Welcome, Arjun</div>
        <div style={{fontSize:14,color:DS.color.onyx500,marginTop:4,fontFamily:DS.font}}>Confirm your details before we begin</div>
      </div>
      {[["Full name","Arjun Sharma"],["Mobile","+91 98765 43210"],["Role",config.persona],["Partner",config.partner],["City","Chennai, TN"]].map(([l,v])=>(
        <div key={l} style={{display:"flex",justifyContent:"space-between",padding:`${DS.space[3]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font}}>
          <span style={{fontSize:14,color:DS.color.onyx500}}>{l}</span>
          <span style={{fontSize:14,fontWeight:500,color:DS.color.onyx800}}>{v}</span>
        </div>
      ))}
      <div style={{marginTop:DS.space[3],fontSize:12,color:DS.color.onyx400,fontFamily:DS.font}}>Pre-filled by {config.partner}. Tap to edit if anything looks wrong.</div>
      <Btn variant={config.domain==="EV"?"primaryEV":"primary"} full style={{marginTop:DS.space[6]}} onClick={()=>setStep(1)}>Yes, this is correct</Btn>
      <Btn variant="outline" full style={{marginTop:DS.space[3]}}>Edit my details</Btn>
    </div>,

    <div key="kyc">
      <div style={{fontSize:18,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font,marginBottom:4}}>Complete KYC</div>
      <div style={{fontSize:14,color:DS.color.onyx500,fontFamily:DS.font,marginBottom:DS.space[5]}}>Required to activate your wallet and receive commissions</div>
      {[{label:"Aadhaar OTP",sub:"Instant · uses your registered mobile",done:true},{label:"PAN card",sub:"Enter number or upload photo",done:false},{label:"Bank account",sub:"UPI ID or account + IFSC",done:false}].map((item,i)=>(
        <div key={item.label} style={{display:"flex",alignItems:"center",gap:DS.space[3],padding:DS.space[4],border:`1.5px solid ${item.done?a.primary:DS.color.onyx300}`,borderRadius:DS.radius.lg,marginBottom:DS.space[3],background:item.done?a.light:DS.color.onyx100,cursor:"pointer"}}>
          <div style={{width:20,height:20,borderRadius:10,border:`2px solid ${item.done?a.primary:DS.color.onyx400}`,background:item.done?a.primary:"transparent",flexShrink:0}}/>
          <div>
            <div style={{fontSize:14,fontWeight:500,color:DS.color.onyx800,fontFamily:DS.font}}>{item.label}</div>
            <div style={{fontSize:12,color:DS.color.onyx500,fontFamily:DS.font}}>{item.sub}</div>
          </div>
        </div>
      ))}
      <Btn variant={config.domain==="EV"?"primaryEV":"primary"} full style={{marginTop:DS.space[2]}} onClick={()=>setStep(2)}>Verify and continue</Btn>
      <button onClick={()=>{setKycSkipped(true);setStep(2);}} style={{width:"100%",marginTop:DS.space[3],padding:`${DS.space[3]}px`,background:"none",color:DS.color.onyx400,border:`1px solid ${DS.color.onyx300}`,borderRadius:DS.radius.lg,fontSize:13,fontFamily:DS.font,cursor:"pointer"}}>Skip for now — I'll do this later</button>
      <div style={{fontSize:12,color:DS.color.onyx400,textAlign:"center",marginTop:DS.space[2],fontFamily:DS.font}}>Your commissions accrue. Withdrawal unlocks after KYC.</div>
    </div>,

    <div key="tour">
      <div style={{fontSize:18,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font,marginBottom:4}}>Here's what you can do</div>
      <div style={{fontSize:14,color:DS.color.onyx500,fontFamily:DS.font,marginBottom:DS.space[5]}}>A quick look at {config.partner} mPOS</div>
      {(tourPoints[config.persona]||tourPoints["Promoter"]).map((item,i)=>(
        <div key={i} style={{display:"flex",gap:DS.space[3],alignItems:"flex-start",padding:`${DS.space[4]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`}}>
          <div style={{width:32,height:32,borderRadius:DS.radius.md,background:a.mid,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Check size={16} strokeWidth={ICON_STROKE} color={a.primary} aria-hidden />
          </div>
          <div style={{fontSize:14,color:DS.color.onyx700,lineHeight:1.5,paddingTop:4,fontFamily:DS.font}}>{item}</div>
        </div>
      ))}
      <div style={{marginTop:DS.space[4],padding:DS.space[3],background:DS.color.onyx200,borderRadius:DS.radius.lg,fontSize:12,color:DS.color.onyx500,fontFamily:DS.font}}>Revisit anytime from your profile → Help → "Show me around"</div>
      <Btn variant={config.domain==="EV"?"primaryEV":"primary"} full style={{marginTop:DS.space[5]}} onClick={()=>setStep(3)}>Go to my dashboard</Btn>
    </div>,

    <div key="done" style={{textAlign:"center"}}>
      <div style={{width:64,height:64,borderRadius:32,background:DS.color.green200,margin:"24px auto 16px",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Check size={28} strokeWidth={ICON_STROKE} color={DS.color.green700} aria-hidden />
      </div>
      <div style={{fontSize:20,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font,marginBottom:8}}>You're all set, Arjun!</div>
      <div style={{fontSize:14,color:DS.color.onyx500,fontFamily:DS.font,marginBottom:DS.space[6]}}>{config.partner} mPOS is ready. Let's start selling.</div>
      {kycSkipped&&<AlertBanner type="warning" message="Complete KYC to unlock withdrawals — commissions are already accruing."/>}
      <Btn variant={config.domain==="EV"?"primaryEV":"primary"} full onClick={onComplete}>Open my dashboard</Btn>
    </div>,
  ];

  return(
    <div style={{flex:1,overflowY:"auto",padding:`${DS.space[5]}px ${DS.space[4]}px`}}>
      {step>0&&<OnboardingBackLink primary={a.primary} onClick={()=>setStep(s=>s-1)} />}
      <OnboardingProgress stepIndex={step} total={steps.length} label={steps[step]} primary={a.primary} />
      <div style={{marginBottom:DS.space[4]}}>
        <WizardBar steps={steps} current={step} primary={a.primary}/>
      </div>
      {screens[step]}
    </div>
  );
}

const POLICY_FINDER_DEMO_ELECTRONICS=[
  {
    policyId:"POL-2025-10435",
    imei:"353012340123456",
    customerPhone:"9876543210",
    customerName:"Priya Nair",
    deviceBrand:"Xiaomi",
    deviceModel:"Xiaomi 14",
    planType:"2Y Total Protection",
    coverageType:"ADLD + screen",
    policyStatus:"Active",
    purchasedAt:"12 Jan 2025",
    expiresAt:"11 Jan 2027",
    covered:["Accidental drops & impacts","Cracked screen / back glass","Liquid damage (after deductible)","Extended warranty after OEM period ends"],
    notCovered:["Theft & loss","Cosmetic-only damage","Device with prior unauthorised repair","Accessories (charger, case)"],
    ongoingClaims:[
      {claimId:"CLM-2025-44001",badge:"In progress",statusLine:"Repair authorised",statusSub:"Pickup scheduled · ASC Indiranagar",updated:"28 Mar 2025"},
    ],
  },
  {
    policyId:"POL-2025-88721",
    imei:"359876543210987",
    customerPhone:"9123456780",
    customerName:"Rahul Mehta",
    deviceBrand:"Oppo",
    deviceModel:"Reno 11",
    planType:"1Y Screen Secure",
    coverageType:"Screen only",
    policyStatus:"Active",
    purchasedAt:"3 Feb 2025",
    expiresAt:"2 Feb 2026",
    covered:["Front touchscreen / display glass crack","Touch digitiser failure from impact"],
    notCovered:["Liquid damage","Theft","Rear panel / frame","Camera lens unless part of screen repair"],
    ongoingClaims:[],
  },
];

const POLICY_FINDER_DEMO_EV=[
  {
    policyId:"POL-EV-2025-55102",
    imei:"MA3EYD1JS00124",
    customerPhone:"9988776655",
    customerName:"Ananya Rao",
    deviceBrand:"Hero Vida",
    deviceModel:"Vida V2",
    planType:"2Y ECW + EBW",
    coverageType:"Battery · motor · labour",
    policyStatus:"Active",
    purchasedAt:"8 Jan 2025",
    expiresAt:"7 Jan 2027",
    covered:["Battery pack defects & BMS faults","Motor & powertrain electronics","Labour at authorised Hero Vida workshops","On-board charger port (manufacturing defect)"],
    notCovered:["Tyres & consumables","Cosmetic body panels","Charging cable loss","Damage from racing / misuse"],
    ongoingClaims:[
      {claimId:"CLM-EV-2025-1102",badge:"In progress",statusLine:"Workshop assessment",statusSub:"Hero Vida ASC Whitefield · Awaiting parts",updated:"27 Mar 2025"},
    ],
  },
  {
    policyId:"POL-EV-2025-77890",
    imei:"ATHER9K2BLR881",
    customerPhone:"9812345678",
    customerName:"Karthik Iyer",
    deviceBrand:"Ather",
    deviceModel:"450X",
    planType:"1Y battery + motor cover",
    coverageType:"Battery · motor",
    policyStatus:"Active",
    purchasedAt:"15 Nov 2024",
    expiresAt:"14 Nov 2026",
    covered:["Battery module defects","Motor controller & inverter","Drive motor assembly"],
    notCovered:["Brake pads","Accessories & trim","Software OTA issues","Third-party modifications"],
    ongoingClaims:[],
  },
];

function policyFinderDemoList(domain){
  return domain==="EV"?POLICY_FINDER_DEMO_EV:POLICY_FINDER_DEMO_ELECTRONICS;
}

function policyFinderWhatsAppText(p,isEV){
  const idLabel=isEV?"VIN / ID":"IMEI";
  const lines=[
    "Acko mPOS — Policy details",
    `Policy: ${p.policyId}`,
    `${p.deviceBrand} ${p.deviceModel}`,
    `${idLabel}: ${p.imei}`,
    `Customer: ${p.customerName} (+91 ${p.customerPhone})`,
    `Plan: ${p.planType} · ${p.coverageType}`,
    `Valid: ${p.purchasedAt} → ${p.expiresAt}`,
    "",
    "✓ What's covered:",
    ...p.covered.map(x=>`• ${x}`),
    "",
    "✗ What's not covered:",
    ...p.notCovered.map(x=>`• ${x}`),
  ];
  return lines.join("\n");
}

function openPolicyFinderWhatsApp(p,isEV){
  window.open(`https://wa.me/?text=${encodeURIComponent(policyFinderWhatsAppText(p,isEV))}`,"_blank","noopener,noreferrer");
}

function PolicyFinderDeviceAvatar({domain,deviceBrand,primary}){
  const br=(deviceBrand||"").toLowerCase();
  const evHints=["hero","ather","vida"];
  const phoneHints=["xiaomi","oppo","samsung","vivo","realme","oneplus","apple","nothing","motorola","redmi","poco"];
  const isEv=domain==="EV"||evHints.some(h=>br.includes(h));
  const isPhone=!isEv&&phoneHints.some(h=>br.includes(h));
  const Icon=isEv?Battery:isPhone?Smartphone:Package;
  const bg=isEv?DS.color.green200:DS.color.purple200;
  return(
    <div style={{width:56,height:56,borderRadius:16,background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`inset 0 0 0 1px rgba(0,0,0,0.04)`}} aria-hidden>
      <Icon size={26} strokeWidth={2} color={primary}/>
    </div>
  );
}

function PolicyFinderSpecCell({label,children,wide}){
  return(
    <div style={{gridColumn:wide?"1 / -1":undefined,background:DS.color.onyx200,borderRadius:DS.radius.lg,padding:`${DS.space[3]}px ${DS.space[4]}px`}}>
      <div style={{fontSize:10,fontWeight:600,color:DS.color.onyx500,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6,fontFamily:DS.font}}>{label}</div>
      <div style={{fontSize:14,fontWeight:600,color:DS.color.onyx800,lineHeight:1.4,fontFamily:DS.font}}>{children}</div>
    </div>
  );
}

function PolicyFinderFlow({domain,onBack,onRaiseClaim}){
  const a=acc(domain);
  const isEV=domain==="EV";
  const primary=a.primary;
  const policies=policyFinderDemoList(domain);
  const [mode,setMode]=useState("imei");
  const [query,setQuery]=useState("");
  const [searched,setSearched]=useState(false);
  const [results,setResults]=useState([]);
  const [selected,setSelected]=useState(null);

  const runSearch=()=>{
    const raw=query.trim();
    const digits=raw.replace(/\D/g,"");
    setSearched(true);
    if(mode==="mobile"){
      if(digits.length!==10){
        setResults([]);
        return;
      }
      setResults(policies.filter(p=>p.customerPhone===digits));
      return;
    }
    if(raw.length<5){
      setResults([]);
      return;
    }
    const norm=raw.replace(/\s/g,"").toUpperCase();
    setResults(policies.filter(p=>{
      const imeiNorm=String(p.imei).replace(/\s/g,"").toUpperCase();
      const polIdNorm=String(p.policyId).replace(/\s/g,"").toUpperCase();
      return polIdNorm.includes(norm)||imeiNorm.includes(norm)||(digits.length>=5&&(imeiNorm.includes(digits)||polIdNorm.replace(/\D/g,"").includes(digits)));
    }));
  };

  const handleBack=()=>{
    if(selected){
      setSelected(null);
      return;
    }
    onBack();
  };

  if(selected){
    const idLabel=isEV?"VIN / ID":"IMEI";
    return(
      <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,fontFamily:DS.font,background:DS.color.onyx100}}>
        <div style={{display:"flex",alignItems:"center",gap:DS.space[2],padding:`${DS.space[3]}px ${DS.space[4]}px`,borderBottom:`1px solid ${DS.color.onyx300}`,flexShrink:0,zIndex:5,background:DS.color.onyx100}}>
          <button type="button" className="abtn" onClick={handleBack} style={{border:"none",background:"none",cursor:"pointer",padding:DS.space[2],display:"flex",alignItems:"center"}} aria-label="Back">
            <ArrowLeft size={22} strokeWidth={ICON_STROKE} color={DS.color.onyx800}/>
          </button>
          <div style={{flex:1,fontSize:16,fontWeight:600,color:DS.color.onyx800}}>Policy detail</div>
        </div>
        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overflowX:"hidden",padding:DS.space[4],minHeight:0}}>
          <Card style={{padding:DS.space[4],marginBottom:DS.space[4],background:a.light,boxShadow:`inset 0 0 0 1px ${primary}22`}}>
            <div style={{display:"flex",alignItems:"center",gap:DS.space[4],marginBottom:DS.space[4]}}>
              <PolicyFinderDeviceAvatar domain={domain} deviceBrand={selected.deviceBrand} primary={primary}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:4,fontFamily:DS.font}}>{selected.policyId}</div>
                <div style={{fontSize:18,fontWeight:700,color:DS.color.onyx800,lineHeight:1.25,marginBottom:DS.space[2]}}>{selected.deviceBrand} {selected.deviceModel}</div>
                <Badge variant="green" dot>{selected.policyStatus}</Badge>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:DS.space[2]}}>
              <PolicyFinderSpecCell label={idLabel} wide>
                <span className="counter" style={{fontSize:13}}>{selected.imei}</span>
              </PolicyFinderSpecCell>
              <PolicyFinderSpecCell label="Customer">
                {selected.customerName}
              </PolicyFinderSpecCell>
              <PolicyFinderSpecCell label="Mobile">
                <span className="counter">+91 {selected.customerPhone}</span>
              </PolicyFinderSpecCell>
              <PolicyFinderSpecCell label="Plan" wide>
                {selected.planType}
              </PolicyFinderSpecCell>
              <PolicyFinderSpecCell label="Cover type" wide>
                {selected.coverageType}
              </PolicyFinderSpecCell>
              <PolicyFinderSpecCell label="Purchased">
                {selected.purchasedAt}
              </PolicyFinderSpecCell>
              <PolicyFinderSpecCell label="Valid until">
                {selected.expiresAt}
              </PolicyFinderSpecCell>
            </div>
          </Card>

          <div style={{fontSize:12,fontWeight:700,color:DS.color.onyx500,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:DS.space[3],fontFamily:DS.font}}>Ongoing claims</div>
          {selected.ongoingClaims.length===0?(
            <Card style={{padding:DS.space[4],marginBottom:DS.space[4],background:DS.color.onyx200}}>
              <div style={{fontSize:13,color:DS.color.onyx500,fontFamily:DS.font}}>No open claims on this policy.</div>
            </Card>
          ):(
            selected.ongoingClaims.map(c=>(
              <Card key={c.claimId} style={{padding:DS.space[4],marginBottom:DS.space[3],border:`1px solid ${DS.color.onyx300}`,background:DS.color.onyx100}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:DS.space[2],marginBottom:DS.space[2]}}>
                  <div style={{fontSize:14,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font}}>{c.claimId}</div>
                  <Badge variant="orange" dot>{c.badge}</Badge>
                </div>
                <div style={{fontSize:14,fontWeight:600,color:DS.color.onyx800,marginBottom:4,fontFamily:DS.font}}>{c.statusLine}</div>
                <div style={{fontSize:12,color:DS.color.onyx600,marginBottom:DS.space[2],lineHeight:1.45}}>{c.statusSub}</div>
                <div style={{fontSize:11,color:DS.color.onyx400}}>Updated {c.updated}</div>
              </Card>
            ))
          )}

          <div style={{fontSize:12,fontWeight:700,color:DS.color.onyx500,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:DS.space[3],fontFamily:DS.font}}>What&apos;s covered</div>
          <Card style={{padding:DS.space[4],marginBottom:DS.space[4],background:DS.color.green100,border:`1px solid ${DS.color.green400}`}}>
            <div style={{display:"flex",flexDirection:"column",gap:DS.space[3]}}>
              {selected.covered.map((line,i)=>(
                <div key={i} style={{display:"flex",gap:DS.space[3],alignItems:"flex-start"}}>
                  <div style={{flexShrink:0,width:22,height:22,borderRadius:11,background:DS.color.green200,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1}}>
                    <Check size={14} strokeWidth={2.5} color={DS.color.green800} aria-hidden />
                  </div>
                  <span style={{fontSize:13,color:DS.color.onyx800,lineHeight:1.45,fontFamily:DS.font}}>{line}</span>
                </div>
              ))}
            </div>
          </Card>

          <div style={{fontSize:12,fontWeight:700,color:DS.color.onyx500,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:DS.space[3],fontFamily:DS.font}}>What&apos;s not covered</div>
          <Card style={{padding:DS.space[4],marginBottom:DS.space[4],background:DS.color.cerise100,border:`1px solid ${DS.color.cerise300}`}}>
            <div style={{display:"flex",flexDirection:"column",gap:DS.space[3]}}>
              {selected.notCovered.map((line,i)=>(
                <div key={i} style={{display:"flex",gap:DS.space[3],alignItems:"flex-start"}}>
                  <div style={{flexShrink:0,width:22,height:22,borderRadius:11,background:DS.color.cerise200,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1}}>
                    <X size={14} strokeWidth={2.5} color={DS.color.cerise700} aria-hidden />
                  </div>
                  <span style={{fontSize:13,color:DS.color.onyx800,lineHeight:1.45,fontFamily:DS.font}}>{line}</span>
                </div>
              ))}
            </div>
          </Card>

          <div style={{fontSize:11,color:DS.color.onyx400,lineHeight:1.45}}>Summary for reference. See the policy certificate for full terms.</div>
        </div>
        <div
          style={{
            flexShrink:0,
            padding:`${DS.space[3]}px ${DS.space[4]}px`,
            paddingBottom:"max(12px, env(safe-area-inset-bottom))",
            borderTop:`1px solid ${DS.color.onyx300}`,
            background:DS.color.onyx100,
            boxShadow:"0 -8px 24px rgba(0,0,0,0.06)",
          }}
        >
          <button
            type="button"
            className="abtn"
            onClick={()=>openPolicyFinderWhatsApp(selected,isEV)}
            style={{
              width:"100%",
              height:52,
              borderRadius:28,
              border:"none",
              background:DS.color.green700,
              color:"#fff",
              fontFamily:DS.font,
              fontSize:16,
              fontWeight:600,
              cursor:"pointer",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              gap:DS.space[2],
              marginBottom:DS.space[2],
            }}
          >
            <MessageCircle size={20} strokeWidth={ICON_STROKE} aria-hidden />
            Share on WhatsApp
          </button>
          <button
            type="button"
            className="abtn"
            onClick={()=>onRaiseClaim(selected)}
            style={{
              width:"100%",
              height:48,
              borderRadius:28,
              border:`1.5px solid ${primary}`,
              background:DS.color.onyx100,
              color:primary,
              fontFamily:DS.font,
              fontSize:15,
              fontWeight:600,
              cursor:"pointer",
            }}
          >
            Raise a claim
          </button>
        </div>
      </div>
    );
  }

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,fontFamily:DS.font,background:DS.color.onyx100}}>
      <div style={{display:"flex",alignItems:"center",gap:DS.space[2],padding:`${DS.space[3]}px ${DS.space[4]}px`,borderBottom:`1px solid ${DS.color.onyx300}`,flexShrink:0}}>
        <button type="button" className="abtn" onClick={handleBack} style={{border:"none",background:"none",cursor:"pointer",padding:DS.space[2],display:"flex",alignItems:"center"}} aria-label="Back">
          <ArrowLeft size={22} strokeWidth={ICON_STROKE} color={DS.color.onyx800}/>
        </button>
        <div style={{flex:1,fontSize:16,fontWeight:600,color:DS.color.onyx800}}>Policy finder</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:DS.space[4]}}>
        <div style={{fontSize:13,color:DS.color.onyx600,marginBottom:DS.space[4],lineHeight:1.45}}>
          {isEV
            ?"Search by VIN, registration, policy number, or customer mobile — then open claims on that policy."
            :"Search by IMEI, policy number, or customer mobile — then open claims on that policy."}
        </div>
        <div style={{display:"flex",gap:DS.space[2],marginBottom:DS.space[4]}}>
          {[{id:"imei",label:isEV?"VIN / Reg":"IMEI"},{id:"mobile",label:"Mobile"}].map(tab=>(
            <button
              key={tab.id}
              type="button"
              className="abtn"
              onClick={()=>{setMode(tab.id);setQuery("");setSearched(false);setResults([]);}}
              style={{
                flex:1,
                padding:`${DS.space[2]}px ${DS.space[3]}px`,
                borderRadius:DS.radius.lg,
                border:`1.5px solid ${mode===tab.id?primary:DS.color.onyx300}`,
                background:mode===tab.id?a.light:DS.color.onyx100,
                fontFamily:DS.font,
                fontSize:12,
                fontWeight:600,
                color:mode===tab.id?primary:DS.color.onyx600,
                cursor:"pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <AInput
          label={mode==="mobile"?"Customer mobile (10 digits)":(isEV?"VIN, reg. no., or policy number":"IMEI or policy number")}
          placeholder={mode==="mobile"?"9876543210":(isEV?"MA3EYD1JS00124 or POL-EV-2025-55102":"353012340123456")}
          value={query}
          onChange={e=>{
            if(mode==="mobile") setQuery(e.target.value.replace(/\D/g,"").slice(0,10));
            else setQuery(isEV?e.target.value.toUpperCase().slice(0,22):e.target.value.replace(/\s/g,"").slice(0,22));
          }}
        />
        <Btn variant={isEV?"primaryEV":"primary"} full style={{marginTop:DS.space[3]}} onClick={runSearch}>
          Find policy
        </Btn>
        {searched&&results.length===0&&(
          <div style={{marginTop:DS.space[4],padding:DS.space[4],background:DS.color.onyx200,borderRadius:DS.radius.lg}}>
            <div style={{fontSize:13,fontWeight:600,color:DS.color.onyx700,marginBottom:4}}>No policy found</div>
            <div style={{fontSize:12,color:DS.color.onyx500,lineHeight:1.45}}>Check the {mode==="mobile"?"mobile number":isEV?"VIN or registration":"IMEI"} and try again.</div>
          </div>
        )}
        {results.length>0&&(
          <div style={{marginTop:DS.space[4]}}>
            <div style={{fontSize:12,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2],fontFamily:DS.font}}>{results.length} match{results.length===1?"":"es"}</div>
            {results.map(p=>(
              <button
                key={p.policyId}
                type="button"
                className="abtn"
                onClick={()=>setSelected(p)}
                style={{
                  width:"100%",
                  textAlign:"left",
                  padding:DS.space[4],
                  marginBottom:DS.space[2],
                  borderRadius:DS.radius.lg,
                  border:`1px solid ${DS.color.onyx300}`,
                  background:DS.color.onyx100,
                  cursor:"pointer",
                  fontFamily:DS.font,
                }}
              >
                <div style={{fontSize:14,fontWeight:700,color:DS.color.onyx800}}>{p.policyId}</div>
                <div style={{fontSize:12,color:DS.color.onyx600,marginTop:4}}>{p.deviceBrand} {p.deviceModel}</div>
                <div style={{fontSize:11,color:DS.color.onyx400,marginTop:4}}>{p.customerName} · {p.ongoingClaims.length} open claim{p.ongoingClaims.length===1?"":"s"}</div>
              </button>
            ))}
          </div>
        )}
        {!searched&&(
          <div style={{fontSize:12,color:DS.color.onyx400,marginTop:DS.space[4],lineHeight:1.45}}>
            Demo: IMEI <span className="counter">353012340123456</span> · policy <span className="counter">POL-2025-10435</span> · mobile <span className="counter">9876543210</span>
            {isEV&&<> · VIN <span className="counter">MA3EYD1JS00124</span> · <span className="counter">POL-EV-2025-55102</span></>}
          </div>
        )}
      </div>
    </div>
  );
}

function ClaimFilingPlaceholder({onBack,prefill}){
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,fontFamily:DS.font,background:DS.color.onyx100}}>
      <div style={{display:"flex",alignItems:"center",gap:DS.space[2],padding:`${DS.space[3]}px ${DS.space[4]}px`,borderBottom:`1px solid ${DS.color.onyx300}`,flexShrink:0}}>
        <button type="button" className="abtn" onClick={onBack} style={{border:"none",background:"none",cursor:"pointer",padding:DS.space[2],display:"flex",alignItems:"center"}} aria-label="Back">
          <ArrowLeft size={22} strokeWidth={ICON_STROKE} color={DS.color.onyx800}/>
        </button>
        <div style={{flex:1,fontSize:16,fontWeight:600,color:DS.color.onyx800}}>Raise a claim</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:DS.space[4]}}>
        {prefill&&(
          <div style={{marginBottom:DS.space[4]}}>
            <AlertBanner type="success" message={`Linked to ${prefill.policyId} · ${prefill.deviceBrand} ${prefill.deviceModel} · ${prefill.customerName}`}/>
          </div>
        )}
        <AlertBanner type="info" message="Guided FNOL flow — IMEI scan, policy verification, and customer OTP. Build continues in this shell."/>
        <div style={{fontSize:13,color:DS.color.onyx600,marginTop:DS.space[3],lineHeight:1.5}}>Use the back arrow to return to the dashboard.</div>
      </div>
    </div>
  );
}

function TrackClaimFlow({domain,onBack}){
  const a=acc(domain);
  const isEV=domain==="EV";
  const primary=a.primary;
  const [mode,setMode]=useState("mobile");
  const [input,setInput]=useState("");
  const [error,setError]=useState("");
  const [result,setResult]=useState(null);

  const lookup=()=>{
    setError("");
    if(mode==="mobile"){
      const d=input.replace(/\D/g,"");
      if(d.length!==10){
        setError("Enter a valid 10-digit mobile number");
        return;
      }
      setResult({
        claimId:"CLM-2025-88421",
        badge:"In progress",
        statusLine:"Repair in progress",
        statusSub:"Parts ordered · ASC Chennai · ETA 3–5 days",
        device:isEV?"Hero Vida V2":"Xiaomi 14",
        customerMobile:`+91 ${d.slice(0,5)} ${d.slice(5)}`,
        updated:"28 Mar 2025 · 4:30pm IST",
      });
    } else {
      const raw=input.trim();
      if(raw.length<6){
        setError("Enter claim number (e.g. CLM-2025-88421)");
        return;
      }
      const upper=raw.toUpperCase().replace(/\s/g,"");
      const claimId=upper.startsWith("CLM")?upper:`CLM-2025-${upper.replace(/\D/g,"").padStart(5,"0").slice(0,5)}`;
      setResult({
        claimId,
        badge:"Scheduled",
        statusLine:"Authorised — repair scheduled",
        statusSub:"ASC visit confirmed · Job card #JC-2025-4412",
        device:isEV?"Hero Vida V2":"Xiaomi 14",
        customerMobile:"—",
        updated:"28 Mar 2025 · 4:30pm IST",
      });
    }
  };

  const shareWhatsApp=()=>{
    if(!result) return;
    const text=[
      "Claim status (Acko mPOS)",
      `Claim ID: ${result.claimId}`,
      `Status: ${result.statusLine}`,
      result.statusSub?`Detail: ${result.statusSub}`:null,
      `Device: ${result.device}`,
      `Updated: ${result.updated}`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank","noopener,noreferrer");
  };

  const reset=()=>{
    setResult(null);
    setInput("");
    setError("");
  };

  return(
    <div style={{fontFamily:DS.font,flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      <div style={{display:"flex",alignItems:"center",gap:DS.space[2],padding:`${DS.space[3]}px 0`,marginBottom:DS.space[3],borderBottom:`1px solid ${DS.color.onyx300}`,flexShrink:0}}>
        <button type="button" className="abtn" onClick={onBack} style={{border:"none",background:"none",cursor:"pointer",padding:DS.space[2],display:"flex",alignItems:"center"}} aria-label="Back">
          <ArrowLeft size={22} strokeWidth={ICON_STROKE} color={DS.color.onyx800}/>
        </button>
        <div style={{fontSize:16,fontWeight:600,color:DS.color.onyx800}}>Track claim</div>
      </div>
      <div style={{flex:1,overflowY:"auto",minHeight:0,padding:`${DS.space[2]}px ${DS.space[4]}px ${DS.space[4]}px`}}>
      <div style={{fontSize:13,color:DS.color.onyx500,marginBottom:DS.space[5],lineHeight:1.45}}>Enter the customer&apos;s mobile number or the claim number to view status.</div>

      {!result?(
        <>
          <div style={{display:"flex",gap:DS.space[2],marginBottom:DS.space[4]}}>
            {[{id:"mobile",label:"Mobile number"},{id:"claim",label:"Claim number"}].map(tab=>(
              <button
                key={tab.id}
                type="button"
                className="abtn"
                onClick={()=>{setMode(tab.id);setInput("");setError("");}}
                style={{
                  flex:1,
                  padding:`${DS.space[2]}px ${DS.space[3]}px`,
                  borderRadius:DS.radius.lg,
                  border:`1.5px solid ${mode===tab.id?primary:DS.color.onyx300}`,
                  background:mode===tab.id?a.light:DS.color.onyx100,
                  fontFamily:DS.font,
                  fontSize:12,
                  fontWeight:600,
                  color:mode===tab.id?primary:DS.color.onyx600,
                  cursor:"pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <AInput
            label={mode==="mobile"?"Customer mobile":"Claim number"}
            placeholder={mode==="mobile"?"9876543210":"CLM-2025-88421"}
            value={input}
            onChange={e=>{
              if(mode==="mobile") setInput(e.target.value.replace(/\D/g,"").slice(0,10));
              else setInput(e.target.value);
            }}
            error={error||undefined}
          />
          <Btn variant={isEV?"primaryEV":"primary"} full style={{marginTop:DS.space[2]}} onClick={lookup}>
            Get claim status
          </Btn>
        </>
      ):(
        <>
          <Card style={{marginBottom:DS.space[4],padding:DS.space[4],background:a.light,boxShadow:`inset 0 0 0 1px ${primary}33`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:DS.space[3],marginBottom:DS.space[3]}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:4,fontFamily:DS.font}}>Claim ID</div>
                <div style={{fontSize:15,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font,wordBreak:"break-all"}}>{result.claimId}</div>
              </div>
              <Badge variant="green" dot>{result.badge}</Badge>
            </div>
            <div style={{fontSize:14,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font,marginBottom:6}}>{result.statusLine}</div>
            <div style={{fontSize:12,color:DS.color.onyx600,marginBottom:DS.space[3],lineHeight:1.45}}>{result.statusSub}</div>
            <div style={{borderTop:`1px solid ${DS.color.onyx300}`,paddingTop:DS.space[3],display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontFamily:DS.font,gap:DS.space[2]}}>
                <span style={{color:DS.color.onyx500}}>Device</span>
                <span style={{fontWeight:600,color:DS.color.onyx800,textAlign:"right"}}>{result.device}</span>
              </div>
              {result.customerMobile!=="—"&&(
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontFamily:DS.font,gap:DS.space[2]}}>
                  <span style={{color:DS.color.onyx500}}>Mobile on file</span>
                  <span style={{fontWeight:500,color:DS.color.onyx800}}>{result.customerMobile}</span>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontFamily:DS.font,gap:DS.space[2]}}>
                <span style={{color:DS.color.onyx500}}>Last updated</span>
                <span style={{fontWeight:500,color:DS.color.onyx800,textAlign:"right"}}>{result.updated}</span>
              </div>
            </div>
          </Card>
          <button
            type="button"
            className="abtn"
            onClick={shareWhatsApp}
            style={{
              width:"100%",
              minHeight:48,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              gap:DS.space[2],
              borderRadius:DS.radius.lg,
              border:`1.5px solid ${DS.color.green400}`,
              background:DS.color.green100,
              color:DS.color.green800,
              fontFamily:DS.font,
              fontSize:14,
              fontWeight:600,
              cursor:"pointer",
              marginBottom:DS.space[3],
            }}
          >
            <MessageCircle size={18} strokeWidth={ICON_STROKE} aria-hidden />
            Share status on WhatsApp
          </button>
          <Btn variant="outline" full onClick={reset}>Track another claim</Btn>
        </>
      )}
      </div>
    </div>
  );
}

const HOME_QUICK_LINK_MESSAGES={
  raise:"FNOL claim — opens guided flow with IMEI / invoice.",
  finder:"Policy finder — search by mobile, IMEI, or policy number.",
  wallet:"Store wallet — balance, top-up, and settlement history.",
  schemes:"Schemes — view targets, tiers, and bonuses for this partner.",
};

function isManagementPersona(persona){
  return persona==="Dealer"||persona==="Distributor"||persona==="Brand Admin"||persona==="EV Dealer";
}

function schemeStatusMeta(status){
  if(status==="active") return{label:"Active",variant:"green"};
  if(status==="expiring_soon") return{label:"Ending soon",variant:"orange"};
  if(status==="expired") return{label:"Ended",variant:"gray"};
  return{label:"Upcoming",variant:"blue"};
}

function metricLabel(m){
  if(m==="policy_count") return"Policies";
  if(m==="attach_rate") return"Attach rate";
  return"Plan mix";
}

function formatSchemeDate(iso){
  try{
    const d=new Date(iso+"T12:00:00");
    return d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
  }catch{
    return iso;
  }
}

const SCHEME_LIST_ACCENT={active:"#1D9E75",expiring_soon:"#BA7517",upcoming:"#185FA5",expired:"#888780"};
const SCHEME_STORE_BAR_GRAY="#B4B2A9";
const SCHEME_CHIP_FILL_PROMOTER="#1D9E75";
const SCHEME_CHIP_FILL_DEALER="#185FA5";

function schemeDaysUntilEnd(iso){
  const end=new Date(`${iso}T23:59:59`);
  const now=new Date();
  return Math.max(0,Math.ceil((end-now)/(24*60*60*1000)));
}

function schemeListPillMeta(s){
  if(s.status==="expired") return{label:"Ended",variant:"gray"};
  if(s.status==="upcoming") return{label:"Upcoming",variant:"blue"};
  if(s.status==="expiring_soon"){
    const d=schemeDaysUntilEnd(s.validityEnd);
    return{label:`Ends in ${d} day${d===1?"":"s"}`,variant:"orange"};
  }
  return{label:"Active",variant:"green"};
}

function schemeCardAccent(s){
  return SCHEME_LIST_ACCENT[s.status]||SCHEME_LIST_ACCENT.active;
}

function schemeTargetPayoutRowLeft(s){
  if(s.targetMetric==="policy_count") return`Target: ${s.progress.targetValue} plans`;
  if(s.targetMetric==="attach_rate") return`Target: ${s.progress.targetValue}% attach rate`;
  return`Target: ${s.progress.targetValue}% plan mix`;
}

function schemePayoutRowRight(s){
  if(s.payoutStructure==="flat"&&s.flatPayoutAmount!=null)
    return`Payout: ₹${s.flatPayoutAmount.toLocaleString("en-IN")}`;
  return`Up to ₹${maxDisplayPayoutRupees(s).toLocaleString("en-IN")}`;
}

function topStaffRow(s){
  if(!s.staffBreakdown||!s.staffBreakdown.length) return{name:"—",sales:0};
  return s.staffBreakdown.reduce((m,r)=>(r.sales>m.sales?r:m));
}

function filterSchemesByChip(list,chip){
  if(chip==="all") return list;
  return list.filter(x=>x.status===chip);
}

function filterSchemesAdvanced(list,f){
  return list.filter(s=>{
    if(f.brand!=="all"&&s.brand!==f.brand) return false;
    if(f.product!=="all"){
      const pc=s.productCategory||(s.domain==="EV"?"EV":"Electronics");
      if(f.product!==pc) return false;
    }
    if(f.payout!=="all"){
      const pt=s.payoutStructure==="flat"?"Flat":"Tiered";
      if(f.payout!==pt) return false;
    }
    return true;
  });
}

function schemeListGapCallout(s,isDealer){
  if(s.status!=="active"&&s.status!=="expiring_soon") return null;
  const cur=isDealer?s.progress.storeTotal:s.progress.mySales;
  const target=s.progress.targetValue;
  if(cur>=target){
    return{kind:"done",amount:maxDisplayPayoutRupees(s)};
  }
  const {gapMore,gapPayout}=computeGapToNextTier(s,cur);
  if(gapMore<=0||gapPayout<=0) return null;
  return{kind:"gap",gapMore,gapPayout,isDealer};
}

const SCHEME_STATUS_CHIPS=[
  {id:"all",label:"All"},
  {id:"active",label:"Active"},
  {id:"expiring_soon",label:"Expiring soon"},
  {id:"upcoming",label:"Upcoming"},
  {id:"expired",label:"Ended"},
];

const SCHEME_FILTER_CHIP_LABELS={all:"All",active:"Active",expiring_soon:"Expiring soon",upcoming:"Upcoming",expired:"Ended"};

function SchemesFlow({config,onExit,filterSheetOpen,onFilterOpen,onFilterClose}){
  const a=acc(config.domain);
  const navigate=useNavigate();
  const location=useLocation();
  const [searchParams]=useSearchParams();
  const focusSchemeId=searchParams.get("focus");
  const detailMatch=location.pathname.match(/^\/schemes\/([^/]+)\/?$/);
  const schemeId=detailMatch?detailMatch[1]:null;
  const isEV=config.domain==="EV";
  const management=isManagementPersona(config.persona);

  const [list,setList]=useState([]);
  const [loadingList,setLoadingList]=useState(true);
  const [detail,setDetail]=useState(null);
  const [loadingDetail,setLoadingDetail]=useState(!!schemeId);
  const [statusChip,setStatusChip]=useState("active");
  const [advDraft,setAdvDraft]=useState({brand:"all",product:"all",payout:"all"});
  const [advApplied,setAdvApplied]=useState({brand:"all",product:"all",payout:"all"});

  useEffect(()=>{
    if(schemeId) onFilterClose?.();
  },[schemeId,onFilterClose]);

  useEffect(()=>{
    let c=true;
    setLoadingList(true);
    fetchSchemes({persona:config.persona,domain:config.domain}).then(rows=>{
      if(c) setList(rows);
    }).finally(()=>{ if(c) setLoadingList(false); });
    return ()=>{ c=false; };
  },[config.persona,config.domain]);

  useEffect(()=>{
    if(!schemeId){
      setDetail(null);
      setLoadingDetail(false);
      return;
    }
    let c=true;
    setLoadingDetail(true);
    fetchSchemeById(schemeId,{persona:config.persona}).then(row=>{
      if(c) setDetail(row);
    }).finally(()=>{ if(c) setLoadingDetail(false); });
    return ()=>{ c=false; };
  },[schemeId,config.persona]);

  const backToList=()=>navigate("/schemes");

  const chipFill=management?SCHEME_CHIP_FILL_DEALER:SCHEME_CHIP_FILL_PROMOTER;
  const filteredList=useMemo(()=>{
    const step1=filterSchemesByChip(list,statusChip);
    return filterSchemesAdvanced(step1,advApplied);
  },[list,statusChip,advApplied]);

  if(schemeId){
    if(loadingDetail){
      return(
        <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,fontFamily:DS.font,background:DS.color.onyx100}}>
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:DS.font,fontSize:14,color:DS.color.onyx500}}>Loading…</div>
        </div>
      );
    }
    if(!detail){
      return(
        <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,fontFamily:DS.font,background:DS.color.onyx100}}>
          <div style={{flex:1,padding:DS.space[4]}}>
            <AlertBanner type="warning" message="This scheme could not be loaded."/>
            <Btn variant="outline" full style={{marginTop:DS.space[3]}} onClick={backToList}>Back to schemes</Btn>
          </div>
        </div>
      );
    }

    const st=schemeStatusMeta(detail.status);
    const tgt=detail.targetMetric==="attach_rate"||detail.targetMetric==="plan_type_mix";
    const pctStore=Math.min(100,Math.round((detail.progress.storeTotal/detail.progress.targetValue)*100));
    const pctMy=Math.min(100,Math.round((detail.progress.mySales/detail.progress.targetValue)*100));

    return(
      <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,fontFamily:DS.font,background:DS.color.onyx100}}>
        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:DS.space[4],minHeight:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:DS.space[2],marginBottom:DS.space[4]}}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:18,fontWeight:600,color:DS.color.onyx800,lineHeight:1.25,fontFamily:DS.font}}>{detail.name}</div>
              <div style={{fontSize:12,color:DS.color.onyx500,marginTop:4,fontFamily:DS.font}}>{detail.brand}</div>
            </div>
            <Badge variant={st.variant}>{st.label}</Badge>
          </div>
          {!management&&(
            <Card style={{marginBottom:DS.space[4],padding:DS.space[4],background:a.light,border:`1px solid ${a.primary}33`}}>
              <div style={{fontSize:12,fontWeight:700,color:a.primary,marginBottom:6,fontFamily:DS.font}}>Keep going — every policy counts</div>
              <div style={{fontSize:13,color:DS.color.onyx700,lineHeight:1.45,fontFamily:DS.font}}>
                You&apos;re contributing to the store target. Closing the gap on your personal count unlocks the next tier faster.
              </div>
            </Card>
          )}
          {management&&(
            <Card style={{marginBottom:DS.space[4],padding:DS.space[4],background:DS.color.onyx200,border:`1px solid ${DS.color.onyx300}`}}>
              <div style={{fontSize:12,fontWeight:700,color:DS.color.onyx800,marginBottom:6,fontFamily:DS.font}}>Store lens</div>
              <div style={{fontSize:13,color:DS.color.onyx600,lineHeight:1.45,fontFamily:DS.font}}>
                Compare staff contribution and nudge where the store is short of the programme target.
              </div>
            </Card>
          )}

          <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2],letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:DS.font}}>Validity</div>
          <Card style={{marginBottom:DS.space[4],padding:DS.space[4]}}>
            <div style={{fontSize:14,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font}}>
              {formatSchemeDate(detail.validityStart)} → {formatSchemeDate(detail.validityEnd)}
            </div>
          </Card>

          <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2],letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:DS.font}}>Target</div>
          <Card style={{marginBottom:DS.space[4],padding:DS.space[4]}}>
            <div style={{fontSize:13,color:DS.color.onyx800,fontFamily:DS.font}}>
              <strong>{metricLabel(detail.targetMetric)}</strong>
              {tgt?" · ":" — "}
              <span className="counter">{detail.progress.targetValue}{tgt?"%":""}</span> programme goal
            </div>
          </Card>

          <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2],letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:DS.font}}>Payout</div>
          <Card style={{marginBottom:DS.space[4],padding:DS.space[4]}}>
            {detail.payoutStructure==="flat"&&detail.flatPayoutAmount!=null?(
              <div style={{fontSize:14,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font}}>
                Flat bonus up to <span className="counter">₹{detail.flatPayoutAmount.toLocaleString("en-IN")}</span> on meeting target
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:DS.space[2]}}>
                {detail.tiers&&detail.tiers.map((t,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:`${DS.space[2]}px 0`,borderBottom:i<detail.tiers.length-1?`1px solid ${DS.color.onyx300}`:"none"}}>
                    <span style={{fontSize:13,color:DS.color.onyx700,fontFamily:DS.font}}>
                      {detail.targetMetric==="policy_count"?`At ${t.threshold} policies`:`At ${t.threshold}%`}
                    </span>
                    <span style={{display:"flex",alignItems:"center",gap:DS.space[2]}}>
                      <span className="counter" style={{fontSize:14,fontWeight:700,color:DS.color.onyx800}}>₹{t.payout.toLocaleString("en-IN")}</span>
                      {t.achieved?<Badge variant="green">Hit</Badge>:<Badge variant="gray">Open</Badge>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2],letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:DS.font}}>Eligibility</div>
          <Card style={{marginBottom:DS.space[4],padding:DS.space[4]}}>
            <div style={{fontSize:12,fontWeight:600,color:DS.color.onyx600,marginBottom:DS.space[2],fontFamily:DS.font}}>Products</div>
            <div style={{fontSize:13,color:DS.color.onyx800,lineHeight:1.45,fontFamily:DS.font}}>{detail.eligibilityProducts.join(" · ")}</div>
            <div style={{fontSize:12,fontWeight:600,color:DS.color.onyx600,marginTop:DS.space[3],marginBottom:DS.space[2],fontFamily:DS.font}}>Seller levels</div>
            <div style={{fontSize:13,color:DS.color.onyx800,lineHeight:1.45,fontFamily:DS.font}}>{detail.eligibilitySellerLevels.join(" · ")}</div>
          </Card>

          <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2],letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:DS.font}}>Progress</div>
          <Card style={{marginBottom:DS.space[4],padding:DS.space[4],background:a.light,boxShadow:`inset 0 0 0 1px ${a.primary}22`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:DS.space[2]}}>
              <span style={{fontSize:12,color:DS.color.onyx600,fontFamily:DS.font}}>Store total</span>
              <span className="counter" style={{fontSize:15,fontWeight:700,color:DS.color.onyx800}}>
                {detail.progress.storeTotal}{tgt?"%":""} / {detail.progress.targetValue}{tgt?"%":""}
              </span>
            </div>
            <div style={{height:8,borderRadius:4,background:DS.color.onyx300,overflow:"hidden",marginBottom:DS.space[4]}}>
              <div style={{height:"100%",width:`${pctStore}%`,background:a.primary,transition:"width 240ms ease"}} />
            </div>
            {!management&&(
              <>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:DS.space[2]}}>
                  <span style={{fontSize:12,color:DS.color.onyx600,fontFamily:DS.font}}>My {metricLabel(detail.targetMetric).toLowerCase()}</span>
                  <span className="counter" style={{fontSize:15,fontWeight:700,color:a.dark}}>
                    {detail.progress.mySales}{tgt?"%":""} / {detail.progress.targetValue}{tgt?"%":""}
                  </span>
                </div>
                <div style={{height:8,borderRadius:4,background:DS.color.onyx300,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pctMy}%`,background:isEV?DS.color.green600:DS.color.purple500,transition:"width 240ms ease"}} />
                </div>
              </>
            )}
          </Card>

          {management&&detail.staffBreakdown&&detail.staffBreakdown.length>0&&(
            <>
              <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2],letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:DS.font}}>Per staff</div>
              <Card style={{marginBottom:DS.space[4],padding:0,overflow:"hidden"}}>
                {detail.staffBreakdown.map((row,i)=>(
                  <div key={row.staffName+i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:`${DS.space[3]}px ${DS.space[4]}px`,borderBottom:i<detail.staffBreakdown.length-1?`1px solid ${DS.color.onyx300}`:"none"}}>
                    <span style={{fontSize:14,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font}}>{row.staffName}</span>
                    <span className="counter" style={{fontSize:14,fontWeight:700,color:DS.color.onyx800}}>{row.sales}{tgt?"%":" pol."}</span>
                  </div>
                ))}
              </Card>
            </>
          )}
        </div>
      </div>
    );
  }

  const brandOptions=["all",...Array.from(new Set(list.map(s=>s.brand)))];
  const goSchemeDetail=(id)=>navigate(`/schemes/${id}`);

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,fontFamily:DS.font,background:DS.color.onyx100,position:"relative"}}>
      <div style={{flexShrink:0,borderBottom:`1px solid ${DS.color.onyx300}`,background:DS.color.onyx100}}>
        <div style={{display:"flex",gap:DS.space[2],padding:`${DS.space[2]}px ${DS.space[3]}px`,overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
          {SCHEME_STATUS_CHIPS.map(ch=>{
            const sel=statusChip===ch.id;
            return(
              <button
                key={ch.id}
                type="button"
                className="abtn"
                onClick={()=>setStatusChip(ch.id)}
                style={{
                  flexShrink:0,
                  padding:`6px 14px`,
                  borderRadius:DS.radius.pill,
                  border:sel?"none":`1px solid ${DS.color.onyx300}`,
                  background:sel?chipFill:"transparent",
                  color:sel?"#fff":DS.color.onyx500,
                  fontFamily:DS.font,
                  fontSize:12,
                  fontWeight:600,
                  cursor:"pointer",
                  whiteSpace:"nowrap",
                }}
              >
                {ch.label}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:`${DS.space[3]}px ${DS.space[4]}px`,minHeight:0}}>
        {loadingList&&<div style={{fontSize:14,color:DS.color.onyx500,fontFamily:DS.font}}>Loading schemes…</div>}
        {!loadingList&&filteredList.length===0&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:`${DS.space[6]}px ${DS.space[4]}px`,textAlign:"center"}}>
            <svg width="72" height="72" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{marginBottom:DS.space[4],opacity:0.45}}>
              <circle cx="24" cy="24" r="20" stroke={DS.color.onyx400} strokeWidth="1.5"/>
              <circle cx="24" cy="24" r="12" stroke={DS.color.onyx400} strokeWidth="1.5"/>
              <circle cx="24" cy="24" r="4" stroke={DS.color.onyx400} strokeWidth="1.5"/>
            </svg>
            <div style={{fontFamily:DS.font,fontSize:14,fontWeight:500,color:DS.color.onyx800,marginBottom:DS.space[2]}}>
              No {SCHEME_FILTER_CHIP_LABELS[statusChip]||"matching"} schemes right now
            </div>
            <div style={{fontFamily:DS.font,fontSize:12,color:DS.color.onyx400,lineHeight:1.5,maxWidth:280}}>
              Active schemes will appear here when your brand launches them.
            </div>
          </div>
        )}
        {!loadingList&&filteredList.map(s=>{
          const pill=schemeListPillMeta(s);
          const tgt=s.targetMetric==="attach_rate"||s.targetMetric==="plan_type_mix";
          const t=s.progress.targetValue;
          const my=s.progress.mySales;
          const st=s.progress.storeTotal;
          const pctYou=t>0?Math.min(100,Math.round((my/t)*100)):0;
          const pctStoreBar=t>0?Math.min(100,Math.round((st/t)*100)):0;
          const top=topStaffRow(s);
          const pctTop=t>0?Math.min(100,Math.round((top.sales/t)*100)):0;
          const accent=schemeCardAccent(s);
          const gapLine=schemeListGapCallout(s,management);
          const isFocused=focusSchemeId===s.id;
          return(
            <button
              key={s.id}
              type="button"
              className="abtn"
              onClick={()=>goSchemeDetail(s.id)}
              style={{
                width:"100%",
                textAlign:"left",
                marginBottom:10,
                padding:DS.space[4],
                borderRadius:DS.radius.lg,
                border:`1px solid ${DS.color.onyx300}`,
                borderLeft:`4px solid ${accent}`,
                background:DS.color.onyx100,
                boxShadow:isFocused?`0 0 0 2px ${chipFill}`:"none",
                cursor:"pointer",
                fontFamily:DS.font,
                boxSizing:"border-box",
              }}
            >
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:DS.space[2],marginBottom:DS.space[2]}}>
                <div style={{minWidth:0,flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:DS.color.onyx800,lineHeight:1.35,maxHeight:"2.7em",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{s.name}</div>
                </div>
                <Badge variant={pill.variant}>{pill.label}</Badge>
              </div>
              <div style={{fontSize:11,color:DS.color.onyx500,marginBottom:DS.space[3],fontFamily:DS.font}}>
                Valid: {formatSchemeDate(s.validityStart)} – {formatSchemeDate(s.validityEnd)}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:DS.space[2],gap:DS.space[2]}}>
                <span style={{fontSize:11,color:DS.color.onyx600,fontFamily:DS.font}}>{schemeTargetPayoutRowLeft(s)}</span>
                <span style={{fontSize:11,color:DS.color.onyx800,fontFamily:DS.font,fontWeight:500,textAlign:"right"}}>{schemePayoutRowRight(s)}</span>
              </div>
              <div style={{marginBottom:DS.space[2]}}>
                {!management&&(
                  <>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:11,color:DS.color.onyx600,fontFamily:DS.font}}>You</span>
                      <span className="counter" style={{fontSize:11,fontWeight:600,color:SCHEME_LIST_ACCENT.active}}>
                        {my}{tgt?"%":""} / {t}{tgt?"%":""}
                      </span>
                    </div>
                    <div style={{height:5,borderRadius:3,background:DS.color.onyx300,overflow:"hidden",marginBottom:DS.space[3]}}>
                      <div style={{height:"100%",width:`${pctYou}%`,background:SCHEME_LIST_ACCENT.active,borderRadius:3}} />
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:11,color:DS.color.onyx600,fontFamily:DS.font}}>Store</span>
                      <span className="counter" style={{fontSize:11,fontWeight:600,color:DS.color.onyx500}}>
                        {st}{tgt?"%":""} / {t}{tgt?"%":""}
                      </span>
                    </div>
                    <div style={{height:5,borderRadius:3,background:DS.color.onyx300,overflow:"hidden",marginBottom:DS.space[3]}}>
                      <div style={{height:"100%",width:`${pctStoreBar}%`,background:SCHEME_STORE_BAR_GRAY,borderRadius:3}} />
                    </div>
                  </>
                )}
                {management&&(
                  <>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:11,color:DS.color.onyx600,fontFamily:DS.font}}>Store</span>
                      <span className="counter" style={{fontSize:11,fontWeight:600,color:DS.color.onyx500}}>
                        {st}{tgt?"%":""} / {t}{tgt?"%":""}
                      </span>
                    </div>
                    <div style={{height:5,borderRadius:3,background:DS.color.onyx300,overflow:"hidden",marginBottom:DS.space[3]}}>
                      <div style={{height:"100%",width:`${pctStoreBar}%`,background:SCHEME_STORE_BAR_GRAY,borderRadius:3}} />
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:11,color:DS.color.onyx600,fontFamily:DS.font}}>Top staff</span>
                      <span className="counter" style={{fontSize:11,fontWeight:600,color:DS.color.onyx500}}>
                        {top.sales}{tgt?"%":""} / {t}{tgt?"%":""}
                      </span>
                    </div>
                    <div style={{height:5,borderRadius:3,background:DS.color.onyx300,overflow:"hidden",marginBottom:DS.space[3]}}>
                      <div style={{height:"100%",width:`${pctTop}%`,background:SCHEME_STORE_BAR_GRAY,borderRadius:3}} />
                    </div>
                  </>
                )}
              </div>
              {gapLine&&(
                <div style={{marginBottom:DS.space[2]}}>
                  {gapLine.kind==="done"?(
                    <div style={{fontSize:11,fontWeight:500,color:SCHEME_LIST_ACCENT.active,fontFamily:DS.font}}>
                      Target reached · ₹{gapLine.amount.toLocaleString("en-IN")} unlocked ✓
                    </div>
                  ):gapLine.kind==="gap"?(
                    <div style={{fontSize:11,fontWeight:500,color:"#BA7517",fontFamily:DS.font}}>
                      {gapLine.isDealer
                        ?`Store needs ${gapLine.gapMore} more to unlock ₹${gapLine.gapPayout.toLocaleString("en-IN")}`
                        :`${gapLine.gapMore} more to unlock ₹${gapLine.gapPayout.toLocaleString("en-IN")}`}
                    </div>
                  ):null}
                </div>
              )}
              <div style={{fontSize:10,color:DS.color.onyx500,textAlign:"right",fontFamily:DS.font}}>View details →</div>
            </button>
          );
        })}
      </div>
      {filterSheetOpen&&(
        <div
          role="presentation"
          style={{position:"absolute",inset:0,zIndex:40,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={()=>onFilterClose?.()}
        >
          <div
            role="dialog"
            aria-labelledby="scheme-filter-title"
            onClick={e=>e.stopPropagation()}
            style={{
              width:"100%",
              maxHeight:"78%",
              background:DS.color.onyx100,
              borderTopLeftRadius:DS.radius.xl,
              borderTopRightRadius:DS.radius.xl,
              padding:DS.space[4],
              display:"flex",
              flexDirection:"column",
              gap:DS.space[3],
              boxShadow:"0 -8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div id="scheme-filter-title" style={{fontFamily:DS.font,fontSize:16,fontWeight:600,color:DS.color.onyx800}}>Filter schemes</div>
              <button type="button" className="abtn" onClick={()=>onFilterClose?.()} aria-label="Close" style={{border:"none",background:"none",cursor:"pointer",padding:DS.space[2]}}>
                <X size={22} strokeWidth={ICON_STROKE} color={DS.color.onyx500} />
              </button>
            </div>
            <div>
              <div style={{fontFamily:DS.font,fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2]}}>Brand</div>
              <select
                value={advDraft.brand}
                onChange={e=>setAdvDraft(d=>({...d,brand:e.target.value}))}
                style={{width:"100%",height:40,padding:`0 ${DS.space[3]}px`,borderRadius:DS.radius.lg,border:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font,fontSize:13,background:DS.color.onyx100}}
              >
                {brandOptions.map(b=><option key={b} value={b}>{b==="all"?"All brands":b}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontFamily:DS.font,fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2]}}>Product type</div>
              <select
                value={advDraft.product}
                onChange={e=>setAdvDraft(d=>({...d,product:e.target.value}))}
                style={{width:"100%",height:40,padding:`0 ${DS.space[3]}px`,borderRadius:DS.radius.lg,border:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font,fontSize:13,background:DS.color.onyx100}}
              >
                {["all","Electronics","EV","White Goods"].map(p=><option key={p} value={p}>{p==="all"?"All":p}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontFamily:DS.font,fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2]}}>Payout type</div>
              <select
                value={advDraft.payout}
                onChange={e=>setAdvDraft(d=>({...d,payout:e.target.value}))}
                style={{width:"100%",height:40,padding:`0 ${DS.space[3]}px`,borderRadius:DS.radius.lg,border:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font,fontSize:13,background:DS.color.onyx100}}
              >
                {["all","Flat","Tiered"].map(p=><option key={p} value={p}>{p==="all"?"All":p}</option>)}
              </select>
            </div>
            <Btn variant={isEV?"primaryEV":"primary"} full style={{background:chipFill,marginTop:DS.space[2]}} onClick={()=>{ setAdvApplied({...advDraft}); onFilterClose?.(); }}>
              Apply
            </Btn>
            <button
              type="button"
              className="abtn"
              onClick={()=>{ const z={brand:"all",product:"all",payout:"all"}; setAdvDraft(z); setAdvApplied(z); }}
              style={{border:"none",background:"none",cursor:"pointer",fontFamily:DS.font,fontSize:13,fontWeight:600,color:DS.color.onyx500,textAlign:"center",padding:DS.space[2]}}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HomeQuickLinksWidget({accent,onAction,schemesExpiringDot=false}){
  const items=[
    {id:"raise",label:"Raise claim",Icon:ShieldAlert},
    {id:"track",label:"Track claim",Icon:ClipboardList},
    {id:"finder",label:"Policy finder",Icon:Search},
    {id:"schemes",label:"Schemes",Icon:Target},
    {id:"wallet",label:"Wallet",Icon:Banknote},
  ];
  return(
    <Card style={{marginBottom:DS.space[3],padding:`${DS.space[3]}px ${DS.space[4]}px`}}>
      <div style={{fontSize:12,fontWeight:600,color:DS.color.onyx600,marginBottom:DS.space[3],fontFamily:DS.font,letterSpacing:"0.2px"}}>Quick links</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3, minmax(0, 1fr))",gap:DS.space[2]}}>
        {items.map(({id,label,Icon})=>(
          <button
            key={id}
            type="button"
            className="abtn"
            onClick={()=>onAction?.(id)}
            style={{
              display:"flex",
              flexDirection:"column",
              alignItems:"flex-start",
              gap:DS.space[2],
              padding:`${DS.space[3]}px ${DS.space[3]}px`,
              borderRadius:DS.radius.lg,
              border:`1px solid ${DS.color.onyx300}`,
              background:DS.color.onyx100,
              cursor:"pointer",
              textAlign:"left",
              fontFamily:DS.font,
              touchAction:"manipulation",
              transition:"border-color 120ms ease, box-shadow 120ms ease",
            }}
          >
            <div
              style={{
                position:"relative",
                width:36,
                height:36,
                borderRadius:DS.radius.md,
                background:DS.color.onyx200,
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                flexShrink:0,
              }}
            >
              <Icon size={20} strokeWidth={ICON_STROKE} color={accent} aria-hidden />
              {id==="schemes"&&schemesExpiringDot&&(
                <span
                  title="Scheme ending soon"
                  style={{
                    position:"absolute",
                    top:-1,
                    right:-1,
                    width:8,
                    height:8,
                    borderRadius:"50%",
                    background:DS.color.cerise600,
                    border:"1.5px solid #fff",
                    boxSizing:"border-box",
                  }}
                  aria-hidden
                />
              )}
            </div>
            <span style={{fontSize:12,fontWeight:600,color:DS.color.onyx800,lineHeight:1.3}}>{label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────
function HomeScreen({config,kycSkipped,onNav,onWithdrawalComplete,trackClaimOpen,setTrackClaimOpen,claimFilingOpen,setClaimFilingOpen,policyFinderOpen,setPolicyFinderOpen,claimPrefill,setClaimPrefill}){
  const navigate=useNavigate();
  const a=acc(config.domain);
  const d=HOME_DATA[config.persona]||HOME_DATA["Promoter"];
  const isPromoter=config.persona==="Promoter";
  const [quickLinkHint,setQuickLinkHint]=useState("");
  useEffect(()=>{
    if(!quickLinkHint) return;
    const t=setTimeout(()=>setQuickLinkHint(""),3200);
    return ()=>clearTimeout(t);
  },[quickLinkHint]);
  const workflowFromHome=trackClaimOpen||claimFilingOpen||policyFinderOpen;
  const homeRootStyle=workflowFromHome
    ?{flex:1,minHeight:0,display:"flex",flexDirection:"column",overflow:"hidden",padding:0}
    :{flex:1,overflowY:"auto",padding:DS.space[4]};
  return(
    <div style={homeRootStyle}>
      {kycSkipped&&<AlertBanner type="warning" message="Complete KYC to withdraw earnings. Tap to finish."/>}
      {isPromoter?(
        <PromoterDigitalCustodianHome
          d={d}
          onNav={onNav}
          domain={config.domain}
          onWithdrawalComplete={onWithdrawalComplete}
          trackClaimOpen={trackClaimOpen}
          setTrackClaimOpen={setTrackClaimOpen}
          claimFilingOpen={claimFilingOpen}
          setClaimFilingOpen={setClaimFilingOpen}
          policyFinderOpen={policyFinderOpen}
          setPolicyFinderOpen={setPolicyFinderOpen}
          claimPrefill={claimPrefill}
          setClaimPrefill={setClaimPrefill}
        />
      ):claimFilingOpen?(
        <ClaimFilingPlaceholder prefill={claimPrefill} onBack={()=>{ setClaimPrefill(null); setClaimFilingOpen(false); }} />
      ):policyFinderOpen?(
        <PolicyFinderFlow
          domain={config.domain}
          onBack={()=>setPolicyFinderOpen(false)}
          onRaiseClaim={p=>{
            setPolicyFinderOpen(false);
            setClaimPrefill({
              policyId:p.policyId,
              deviceBrand:p.deviceBrand,
              deviceModel:p.deviceModel,
              customerName:p.customerName,
              customerPhone:p.customerPhone,
              imei:p.imei,
            });
            setClaimFilingOpen(true);
          }}
        />
      ):trackClaimOpen?(
        <TrackClaimFlow domain={config.domain} onBack={()=>setTrackClaimOpen(false)} />
      ):(
        <>
          <Card style={{background:a.light,boxShadow:`inset 0 0 0 1.5px ${a.primary}33`,marginBottom:DS.space[3]}}>
            <div style={{fontSize:12,fontWeight:500,color:DS.color.onyx500,letterSpacing:"0.1px",fontFamily:DS.font}}>{d.kpiLabel}</div>
            <div className="counter" style={{fontSize:28,fontWeight:700,color:DS.color.onyx800,margin:"6px 0 2px",fontFamily:DS.font}}>{d.kpi}</div>
            <div style={{fontSize:12,color:DS.color.onyx500,fontFamily:DS.font,marginBottom:DS.space[4]}}>{d.kpiSub}</div>
            <Btn variant={config.domain==="EV"?"primaryEV":"primary"} size="sm" onClick={()=>onNav("sell")}>{d.cta} →</Btn>
          </Card>
          <div style={{display:"flex",gap:DS.space[3],marginBottom:DS.space[3]}}>
            <MetricCard label={d.m2Label} value={d.m2} accent={a.primary}/>
            <MetricCard label="Scheme" value="Progress" sub={d.alert} accent={DS.color.purple500}/>
          </div>
          {quickLinkHint&&(
            <div style={{marginBottom:DS.space[3]}}>
              <AlertBanner type="info" message={quickLinkHint} />
            </div>
          )}
          <HomeQuickLinksWidget
            accent={a.primary}
            schemesExpiringDot={false}
            onAction={(id)=>{
              if(id==="track"){ setTrackClaimOpen(true); return; }
              if(id==="raise"){ setClaimPrefill(null); setClaimFilingOpen(true); return; }
              if(id==="finder"){ setPolicyFinderOpen(true); return; }
              if(id==="schemes"){ setSchemesEntryTab("home"); navigate("/schemes"); return; }
              setQuickLinkHint(HOME_QUICK_LINK_MESSAGES[id]||"Opening…");
            }}
          />
          {(config.persona==="Dealer"||config.persona==="Distributor")&&(
            <LeaderboardSection variant={config.persona==="Dealer"?"dealer":"distributor"} domain={config.domain} />
          )}
          <Card style={{marginBottom:DS.space[3]}}>
            <div style={{fontSize:12,fontWeight:600,color:DS.color.onyx600,marginBottom:DS.space[2],fontFamily:DS.font}}>Needs attention</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,color:DS.color.onyx700,fontFamily:DS.font}}>{d.alert}</span>
              <Badge variant="purple">→</Badge>
            </div>
          </Card>
        </>
      )}
      {!isPromoter&&!trackClaimOpen&&!claimFilingOpen&&!policyFinderOpen&&(
      <Card>
        <div style={{fontSize:12,fontWeight:600,color:DS.color.onyx600,marginBottom:DS.space[3],fontFamily:DS.font}}>Recent activity</div>
        {[config.domain==="EV"?"ECW issued — Hero Vida V2 · KA01AB1234":"Policy issued — Xiaomi 14 · ₹180 earned",config.domain==="EV"?"Claim approved — ₹4,200 · job card closed":"Scheme bonus unlocked — ₹500 credited","Commission statement for this week ready"].map((n,i)=>(
          <div key={i} style={{fontSize:13,color:DS.color.onyx500,padding:`${DS.space[2]}px 0`,borderBottom:i<2?`1px solid ${DS.color.onyx300}`:"none",fontFamily:DS.font}}>{n}</div>
        ))}
      </Card>
      )}
    </div>
  );
}

// ── Sell flow: plan definitions (comparison + detail) ─────────────────────────
const ELECTRONICS_COMPARE_ROWS=[
  {key:"accidental",label:"Accidental damage (drops, impacts)"},
  {key:"screen",label:"Screen / glass damage"},
  {key:"liquid",label:"Liquid damage"},
  {key:"theft",label:"Theft & loss"},
  {key:"oemExtended",label:"Extended warranty after OEM period"},
  {key:"moneyBack",label:"Money-back if no claim (RoP)"},
];
const EV_COMPARE_ROWS=[
  {key:"battery",label:"Battery pack (defects)"},
  {key:"motor",label:"Motor & powertrain electronics"},
  {key:"controller",label:"Motor controller & wiring"},
  {key:"charging",label:"On-board charger & port"},
  {key:"labour",label:"Labour at authorised service centres"},
];

const SELL_DEVICE_ELECTRONICS={
  model:"Xiaomi 14",
  variant:"12GB + 256GB · Black",
  imei:"353012340123456",
  serial:"SN-X14-IN-88421",
  invoiceDate:"12 Mar 2025",
  oem:"Xiaomi India",
  imageUrl:"/sell/eligibility-phone.svg",
};
const SELL_DEVICE_EV={
  model:"Hero Vida V2",
  variant:"2024 · VIN MA3EYD1JS00124",
  imei:"—",
  serial:"—",
  invoiceDate:"8 Mar 2025",
  oem:"Hero MotoCorp",
  imageUrl:"/sell/eligibility-ev.svg",
};

const SELL_PLANS_ELECTRONICS=[
  {id:"ald1",displayName:"Basic protection",name:"1-year ALD + EW",shortName:"ALD+EW",cover:"Accidental + functional failures",summary:"Accidental + liquid + post‑OEM failures",
    highlights:["Accidental damage","Liquid spills","Extended after OEM warranty"],
    priceEmi:"₹84/mo",fullPrice:"₹999",emiMonths:12,commission:"₹88",tag:null,
    covered:["Accidental physical damage (drops, impacts) in normal use","Electrical / mechanical failure after OEM warranty window","Liquid damage from spills (excluding full immersion)","Standard labour at authorised repair centres"],
    notCovered:["Theft, loss, or mysterious disappearance","Cosmetic scratches without functional impact","Damage from unauthorised repairs or rooting","Intentional damage or fraud"],
    compare:{accidental:true,screen:false,liquid:true,theft:false,oemExtended:true,moneyBack:false},
    howToClaim:["Open the Acko app or call 18002662256 within 48 hours of the incident.","Visit an authorised service centre with your device and invoice.","Repairs approved in 3–5 working days; track status in the app."],
    savingsHighlight:"Typical repair savings of ₹6,000–₹9,000 vs walk‑in rates.",
    specialFeatures:[{id:"p1",title:"Pickup & drop",desc:"Free courier pickup and return at partner service centres in metro cities.",icon:"truck"},{id:"p2",title:"Advance cash",desc:"Up to ₹3,000 advance for urgent repairs at approved centres.",icon:"banknote"}],
    brochureTitle:"1Y ALD + EW — Basic protection"},
  {id:"tp2",displayName:"Comprehensive plan",name:"2-year Total Protection",shortName:"2Y TP",cover:"ALD + EW + screen damage",summary:"Comprehensive cover including screen & liquid damage",
    highlights:["Screen & glass damage","Liquid damage","Accidental + extended care"],
    priceEmi:"₹150/mo",fullPrice:"₹1,799",emiMonths:12,commission:"₹180",tag:"Most sold",
    covered:["Everything in 1-year ALD + EW","Cracked / broken touchscreen & back glass","Higher repair cap for flagship devices","2-year term with single deductible on claims"],
    notCovered:["Theft & loss (add-on where available)","Cosmetic-only damage with working display","Damage outside India unless travel add-on","Commercial resale or bulk grey devices"],
    compare:{accidental:true,screen:true,liquid:true,theft:false,oemExtended:true,moneyBack:false},
    howToClaim:["File a claim in Acko app with photos of damage within 48 hours.","For screen repairs, visit an authorised centre or request pickup & drop.","Claim approval and repair timeline communicated by SMS."],
    savingsHighlight:"Flagship screen repairs can exceed ₹14,500 — this plan caps your out‑of‑pocket cost.",
    specialFeatures:[{id:"p1",title:"Pickup & drop",desc:"Free doorstep pickup and return at authorised centres.",icon:"truck"},{id:"p2",title:"Advance cash",desc:"Up to ₹3,000 advance for urgent repairs at approved network centres.",icon:"banknote"}],
    brochureTitle:"2Y Total Protection — Comprehensive"},
  {id:"rop",displayName:"Liquid & screen + Money Back",name:"2-year Money Back",shortName:"2Y RoP",cover:"ALD + EW · get ₹900 back if no claim",summary:"Full cover with cashback if no claim",
    highlights:["All Total Protection benefits","₹900 cashback if zero claims","Priority support"],
    priceEmi:"₹167/mo",fullPrice:"₹1,999",emiMonths:12,commission:"₹210",tag:"RoP",
    covered:["Full ALD + EW + screen coverage (same as Total Protection)","₹900 cashback to customer if zero approved claims in term","Priority support queue for RoP customers"],
    notCovered:["Theft & loss","Cashback if any claim is approved in the term","Accessories-only claims (case, charger)","Devices with prior third-party repair"],
    compare:{accidental:true,screen:true,liquid:true,theft:false,oemExtended:true,moneyBack:true},
    howToClaim:["Same as Total Protection for repairs.","Cashback processed automatically after policy term if no approved claims.","Bank transfer within 5–7 business days after term end."],
    savingsHighlight:"Potential ₹900 back plus ₹14,000+ in avoided repair costs.",
    specialFeatures:[{id:"p1",title:"Pickup & drop",desc:"Included with all approved repairs.",icon:"truck"},{id:"p2",title:"Advance cash",desc:"Up to ₹3,000 advance for urgent repairs.",icon:"banknote"},
      {id:"p3",title:"Money-back promise",desc:"₹900 to customer if no claim in 2 years.",icon:"sparkles"}],
    brochureTitle:"2Y Money Back — RoP"},
];
const SELL_PLANS_EV=[
  {id:"ecw",displayName:"Extended component warranty",name:"ECW — Extended Component",shortName:"ECW",cover:"Battery, motor, controller",summary:"Battery, motor & controller",
    highlights:["Battery & motor","Controller & wiring","Authorised labour"],
    priceEmi:"₹417/mo",fullPrice:"₹4,999/yr",emiMonths:12,commission:"₹450",tag:null,
    covered:["Battery pack failures after OEM warranty","Motor & inverter defects","Controller, harness & HV junction faults","Labour at Hero authorised EV workshops"],
    notCovered:["Normal battery capacity fade within OEM spec","Tyres, brakes, body panels","Damage from accidents (use motor insurance)","Charging equipment installed at home"],
    compare:{battery:true,motor:true,controller:true,charging:false,labour:true},
    howToClaim:["Call Acko EV helpline or use app within 48 hours.","Tow to authorised Hero Vida workshop — labour covered as per policy.","Parts approval in 3–5 days."],
    savingsHighlight:"HV component repairs can exceed ₹25,000+ outside warranty.",
    specialFeatures:[{id:"p1",title:"Pickup & drop",desc:"Tow to authorised centres (where available).",icon:"truck"},{id:"p2",title:"Advance cash",desc:"Up to ₹5,000 advance for authorised repairs.",icon:"banknote"}],
    brochureTitle:"ECW — Extended Component"},
  {id:"ebw",displayName:"Battery only",name:"EBW — Extended Battery",shortName:"EBW",cover:"Battery pack only",summary:"Battery pack protection",
    highlights:["Battery & BMS","Thermal faults","One replacement if needed"],
    priceEmi:"₹250/mo",fullPrice:"₹2,999/yr",emiMonths:12,commission:"₹280",tag:null,
    covered:["Battery module defects & BMS faults","Thermal runaway protection events (as per policy)","One replacement battery if repair not feasible"],
    notCovered:["Motor, controller, or non-battery electronics","Accidental or flood damage to pack","Unauthorized battery swaps","Commercial fleet high-cycle abuse"],
    compare:{battery:true,motor:false,controller:false,charging:false,labour:true},
    howToClaim:["Report battery fault via app within 48 hours.","Inspection at authorised Hero Vida centre.","Replacement or repair as per assessment."],
    savingsHighlight:"Battery pack replacement can exceed ₹40,000+ without cover.",
    specialFeatures:[{id:"p1",title:"Pickup & drop",desc:"Battery pickup at authorised centres.",icon:"truck"},{id:"p2",title:"Advance cash",desc:"Advance for approved battery repairs.",icon:"banknote"}],
    brochureTitle:"EBW — Extended Battery"},
];

const SellFeatureIcon=({icon,primary})=>{
  const c=primary||DS.color.purple600;
  const s=20;
  if(icon==="truck") return <Truck size={s} strokeWidth={2} color={c} aria-hidden />;
  if(icon==="banknote") return <Banknote size={s} strokeWidth={2} color={c} aria-hidden />;
  return <Sparkles size={s} strokeWidth={2} color={c} aria-hidden />;
};

const CompareCell=({ok})=>(
  <span style={{fontFamily:DS.font,fontSize:12,fontWeight:600,color:ok?DS.color.green700:DS.color.cerise600}}>{ok?"✓":"✗"}</span>
);

// ── Sell ──────────────────────────────────────────────────────────────────────
function SellScreen({config,onBack}){
  const [step,setStep]=useState(0);
  const [plan,setPlan]=useState(null);
  const [payMethod,setPayMethod]=useState(null);
  const [planUi,setPlanUi]=useState("list");
  const [detailPlanId,setDetailPlanId]=useState(null);
  const [showFullPrice,setShowFullPrice]=useState(false);
  const [commReveal,setCommReveal]=useState({});
  const [scanMode,setScanMode]=useState("imei");
  const policyIdRef=useRef(`POL-2025-${Math.floor(Math.random()*90000+10000)}`);
  const a=acc(config.domain);
  const isEV=config.domain==="EV";
  const hasError=config.error!=="None (happy path)";

  const plans=isEV?SELL_PLANS_EV:SELL_PLANS_ELECTRONICS;
  const compareRows=isEV?EV_COMPARE_ROWS:ELECTRONICS_COMPARE_ROWS;
  const device=isEV?SELL_DEVICE_EV:SELL_DEVICE_ELECTRONICS;
  const selectedPlan=plan?plans.find(p=>p.id===plan):null;

  useEffect(()=>{
    if(step!==2){setPlanUi("list");setDetailPlanId(null);}
  },[step]);

  const titles=["Device & IMEI","Confirm device","Eligible plans","Review","Customer details","Payment","Policy issued"];
  const SELL_STEPS=7;

  const toggleComm=pId=>{setCommReveal(r=>({...r,[pId]:!r[pId]}));};
  const brochureText=()=>{
    const lines=[`Acko mPOS — Plan brochure`,`${device.model} · ${isEV?device.variant:`IMEI ${device.imei}`}`,`Partner: ${config.partner}`,``,...plans.map(p=>`• ${p.brochureTitle}\n  ${showFullPrice?`${p.fullPrice} one-time`:`${p.priceEmi} × ${p.emiMonths} mo`}\n  ${p.summary}`)];
    return encodeURIComponent(lines.join("\n"));
  };
  const shareBrochureWa=()=>{window.open(`https://wa.me/?text=${brochureText()}`,"_blank","noopener,noreferrer");};
  const sharePolicyWa=()=>{
    const t=encodeURIComponent(`Hi — your policy ${policyIdRef.current} for ${device.model} is ready.\nDownload: [demo link]\n— ${config.partner} store`);
    window.open(`https://wa.me/?text=${t}`,"_blank","noopener,noreferrer");
  };

  const body=()=>{
    if(step===0) return(
      <div>
        <div style={{fontFamily:DS.font,fontSize:16,fontWeight:600,color:DS.color.onyx800,marginBottom:4}}>{isEV?"Scan VIN or enter reg. no.":"Enter IMEI or scan"}</div>
        <div style={{fontFamily:DS.font,fontSize:13,color:DS.color.onyx500,marginBottom:DS.space[4],lineHeight:1.45}}>
          {isEV?"Scan the VIN plate or type the number manually.":"Use the 15-digit IMEI from the box, dialer (*#06#), or scan the barcode. You can also scan a bill — we’ll read the IMEI via OCR."}
        </div>
        <div style={{display:"flex",gap:DS.space[2],marginBottom:DS.space[3]}}>
          {[{id:"imei",label:isEV?"VIN / Reg":"IMEI / Barcode"},{id:"bill",label:"Scan bill (OCR)"}].map(t=>(
            <button
              key={t.id}
              type="button"
              className="abtn"
              onClick={()=>setScanMode(t.id)}
              style={{
                flex:1,
                padding:`${DS.space[2]}px ${DS.space[3]}px`,
                borderRadius:DS.radius.lg,
                border:`1.5px solid ${scanMode===t.id?a.primary:DS.color.onyx300}`,
                background:scanMode===t.id?a.light:DS.color.onyx100,
                fontFamily:DS.font,
                fontSize:12,
                fontWeight:600,
                color:scanMode===t.id?a.primary:DS.color.onyx600,
                cursor:"pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{height:152,background:DS.color.onyx800,borderRadius:DS.radius.xl,marginBottom:DS.space[4],display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
          {scanMode==="bill"?(
            <>
              <Receipt size={48} strokeWidth={1.5} color="rgba(255,255,255,0.35)" aria-hidden />
              <div style={{position:"absolute",bottom:DS.space[2],left:0,right:0,textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.55)",fontFamily:DS.font,padding:`0 ${DS.space[3]}px`}}>Align invoice — OCR will extract IMEI & model</div>
            </>
          ):(
            <>
              <div style={{width:132,height:82,border:"2px solid #fff",borderRadius:4,opacity:.85,position:"relative"}}>
                <div style={{position:"absolute",top:"50%",left:0,right:0,height:2,background:a.primary,opacity:.95}}/>
              </div>
              <div style={{position:"absolute",bottom:DS.space[2],left:0,right:0,textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.5)",fontFamily:DS.font}}>Position barcode in frame</div>
            </>
          )}
        </div>
        <div style={{textAlign:"center",fontSize:13,color:DS.color.onyx400,fontFamily:DS.font,marginBottom:DS.space[4]}}>— or type manually —</div>
        <AInput placeholder={isEV?"VIN (e.g. MA3EYD1JS00124)…":"15-digit IMEI number…"}/>
        <Btn variant={isEV?"primaryEV":"primary"} full onClick={()=>setStep(1)} style={{marginTop:DS.space[2]}}>{isEV?"Look up vehicle →":"Verify device →"}</Btn>
      </div>
    );

    if(step===1) return(
      <div>
        <div style={{fontFamily:DS.font,fontSize:16,fontWeight:600,color:DS.color.onyx800,marginBottom:4}}>Confirm device</div>
        <div style={{fontFamily:DS.font,fontSize:13,color:DS.color.onyx500,marginBottom:DS.space[4],lineHeight:1.45}}>Check the details below match the handset before you choose a plan.</div>
        {hasError&&config.error==="IMEI invalid"?(
          <div>
            <div style={{background:DS.color.cerise200,border:`1.5px solid ${DS.color.cerise500}`,borderRadius:DS.radius.lg,padding:DS.space[4],marginBottom:DS.space[4]}}>
              <div style={{fontSize:14,fontWeight:600,color:DS.color.cerise700,fontFamily:DS.font}}>Device not found</div>
              <div style={{fontSize:13,color:DS.color.cerise700,marginTop:4,fontFamily:DS.font}}>IMEI not in OEM registry. Please check and retry.</div>
            </div>
            <Btn variant="outline" full onClick={()=>setStep(0)}>← Try again</Btn>
          </div>
        ):hasError&&config.error==="OEM API down"?(
          <div>
            <AlertBanner type="warning" message="OEM API temporarily unavailable. Try again in a few minutes."/>
            <Btn variant="secondary" full onClick={()=>setStep(0)}>← Go back</Btn>
          </div>
        ):(
          <div>
            <div style={{borderRadius:DS.radius.xl,overflow:"hidden",border:`1px solid ${DS.color.onyx300}`,marginBottom:DS.space[4],background:DS.color.onyx100}}>
              <div style={{height:160,background:`linear-gradient(180deg, ${DS.color.onyx200} 0%, ${DS.color.onyx100} 100%)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <img src={device.imageUrl} alt="" style={{maxHeight:140,maxWidth:"88%",objectFit:"contain"}}/>
              </div>
              <div style={{padding:DS.space[4]}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:6,marginBottom:DS.space[2],padding:`4px ${DS.space[2]}px`,background:DS.color.green100,borderRadius:DS.radius.pill,border:`1px solid ${DS.color.green400}`}}>
                  <Check size={14} strokeWidth={ICON_STROKE} color={DS.color.green700} aria-hidden />
                  <span style={{fontSize:11,fontWeight:600,color:DS.color.green800,fontFamily:DS.font}}>Eligible for protection</span>
                </div>
                <div style={{fontFamily:DS.font,fontSize:18,fontWeight:700,color:DS.color.onyx800,marginBottom:4}}>{device.model}</div>
                <div style={{fontFamily:DS.font,fontSize:13,color:DS.color.onyx600,marginBottom:DS.space[3],lineHeight:1.45}}>{device.variant}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {!isEV&&(
                    <>
                      <div style={{display:"flex",justifyContent:"space-between",gap:DS.space[3],fontFamily:DS.font,fontSize:12}}>
                        <span style={{color:DS.color.onyx500}}>IMEI</span>
                        <span className="counter" style={{fontWeight:600,color:DS.color.onyx800,textAlign:"right"}}>{device.imei}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",gap:DS.space[3],fontFamily:DS.font,fontSize:12}}>
                        <span style={{color:DS.color.onyx500}}>Serial</span>
                        <span style={{fontWeight:500,color:DS.color.onyx800,textAlign:"right"}}>{device.serial}</span>
                      </div>
                    </>
                  )}
                  {isEV&&(
                    <div style={{display:"flex",justifyContent:"space-between",gap:DS.space[3],fontFamily:DS.font,fontSize:12}}>
                      <span style={{color:DS.color.onyx500}}>VIN</span>
                      <span className="counter" style={{fontWeight:600,color:DS.color.onyx800,textAlign:"right",fontSize:11}}>{device.variant.split("VIN ")[1]||device.variant}</span>
                    </div>
                  )}
                  <div style={{display:"flex",justifyContent:"space-between",gap:DS.space[3],fontFamily:DS.font,fontSize:12}}>
                    <span style={{color:DS.color.onyx500}}>Invoice / purchase</span>
                    <span style={{fontWeight:500,color:DS.color.onyx800}}>{device.invoiceDate}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",gap:DS.space[3],fontFamily:DS.font,fontSize:12}}>
                    <span style={{color:DS.color.onyx500}}>OEM</span>
                    <span style={{fontWeight:500,color:DS.color.onyx800,textAlign:"right"}}>{device.oem}</span>
                  </div>
                </div>
              </div>
            </div>
            <Btn variant={isEV?"primaryEV":"primary"} full onClick={()=>setStep(2)}>Confirm &amp; see plans →</Btn>
          </div>
        )}
      </div>
    );

    if(step===2) return(
      <div>
        <div style={{fontFamily:DS.font,fontSize:16,fontWeight:600,color:DS.color.onyx800,marginBottom:4}}>Eligible plans</div>
        <div style={{fontFamily:DS.font,fontSize:13,color:DS.color.onyx500,marginBottom:DS.space[4],lineHeight:1.45}}>
          Pick a plan for {device.model}. Prices shown as {showFullPrice?"one-time":"easy EMI"} — toggle below to compare.
        </div>
        <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:DS.space[3],marginBottom:DS.space[3]}}>
          <button type="button" className="abtn" onClick={()=>setShowFullPrice(s=>!s)} style={{display:"inline-flex",alignItems:"center",gap:8,padding:`8px 12px`,borderRadius:DS.radius.pill,border:`1px solid ${DS.color.onyx300}`,background:DS.color.onyx100,fontFamily:DS.font,fontSize:12,fontWeight:600,color:DS.color.onyx700,cursor:"pointer"}}>
            <IndianRupee size={14} strokeWidth={ICON_STROKE} aria-hidden />
            {showFullPrice?"Showing full price":"Showing EMI / month"}
          </button>
          <Btn variant="outline" size="sm" onClick={()=>setPlanUi("compare")}>Compare plans</Btn>
          <button type="button" className="abtn" onClick={shareBrochureWa} style={{display:"inline-flex",alignItems:"center",gap:6,padding:`8px 12px`,borderRadius:DS.radius.pill,border:`1px solid ${DS.color.green400}`,background:DS.color.green100,fontFamily:DS.font,fontSize:12,fontWeight:600,color:DS.color.green800,cursor:"pointer"}}>
            <MessageCircle size={14} strokeWidth={ICON_STROKE} aria-hidden />
            Share brochure (WhatsApp)
          </button>
        </div>
        {plans.map(p=>(
          <div
            key={p.id}
            role="button"
            tabIndex={0}
            onClick={()=>setPlan(p.id)}
            onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setPlan(p.id);}}}
            style={{padding:DS.space[4],border:`1.5px solid ${plan===p.id?a.primary:DS.color.onyx300}`,borderRadius:DS.radius.lg,marginBottom:DS.space[3],cursor:"pointer",background:plan===p.id?a.light:DS.color.onyx100,transition:"border-color 150ms,background 150ms"}}
          >
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:DS.space[2]}}>
              <div style={{flex:1,minWidth:0}}>
                {p.tag&&<Badge variant={p.tag==="RoP"?"blue":"purple"}>{p.tag}</Badge>}
                <div style={{fontFamily:DS.font,fontSize:15,fontWeight:700,color:DS.color.onyx800,marginTop:p.tag?DS.space[2]:0}}>{p.displayName}</div>
                <div style={{fontFamily:DS.font,fontSize:12,color:DS.color.onyx500,marginTop:4,lineHeight:1.4}}>{p.summary}</div>
                <ul style={{margin:DS.space[2]+"px 0 0",paddingLeft:16,fontFamily:DS.font,fontSize:11,color:DS.color.onyx600,lineHeight:1.45}}>
                  {p.highlights.slice(0,3).map((h,i)=>(<li key={i}>{h}</li>))}
                </ul>
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"baseline",justifyContent:"space-between",gap:DS.space[2],marginTop:DS.space[3],paddingTop:DS.space[3],borderTop:`1px solid ${DS.color.onyx300}`}}>
              <div>
                <span className="counter" style={{fontFamily:DS.font,fontSize:20,fontWeight:700,color:DS.color.onyx800}}>{showFullPrice?p.fullPrice:p.priceEmi}</span>
                <div style={{fontFamily:DS.font,fontSize:11,color:DS.color.onyx400,marginTop:2}}>
                  {showFullPrice?`${p.priceEmi} EMI option available`:`Full price ${p.fullPrice} · ${p.emiMonths} months`}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:DS.font,fontSize:11,color:DS.color.onyx500,marginBottom:2}}>Your commission</div>
                {commReveal[p.id]?(
                  <span className="counter" style={{fontFamily:DS.font,fontSize:14,fontWeight:700,color:a.primary}}>{p.commission}</span>
                ):(
                  <button type="button" className="abtn" onClick={e=>{e.stopPropagation();toggleComm(p.id);}} style={{border:"none",background:DS.color.onyx200,padding:`4px 10px`,borderRadius:DS.radius.pill,fontFamily:DS.font,fontSize:11,fontWeight:600,color:DS.color.onyx600,cursor:"pointer"}}>
                    Tap to reveal
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              className="abtn"
              onClick={e=>{e.stopPropagation();setDetailPlanId(p.id);setPlanUi("detail");}}
              style={{width:"100%",marginTop:DS.space[3],padding:`${DS.space[2]}px`,border:`1px dashed ${a.primary}`,borderRadius:DS.radius.md,background:"transparent",fontFamily:DS.font,fontSize:12,fontWeight:600,color:a.primary,cursor:"pointer"}}
            >
              Show full plan details →
            </button>
          </div>
        ))}
        <Btn variant={isEV?"primaryEV":"primary"} full disabled={!plan} onClick={()=>setStep(3)}>Continue to review →</Btn>
      </div>
    );

    if(step===3) return(
      <div>
        <div style={{fontFamily:DS.font,fontSize:16,fontWeight:600,color:DS.color.onyx800,marginBottom:4}}>Review &amp; confirm</div>
        <div style={{fontFamily:DS.font,fontSize:13,color:DS.color.onyx500,marginBottom:DS.space[4],lineHeight:1.45}}>Double-check device and pricing before you collect customer details.</div>
        {selectedPlan&&(
          <>
            <Card style={{marginBottom:DS.space[4],padding:DS.space[4]}}>
              <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2],fontFamily:DS.font}}>Device</div>
              <div style={{fontSize:15,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font}}>{device.model}</div>
              <div style={{fontSize:12,color:DS.color.onyx600,marginTop:4,fontFamily:DS.font}}>{device.variant}</div>
              {!isEV&&<div style={{fontSize:11,color:DS.color.onyx400,marginTop:6,fontFamily:DS.font}}>IMEI {device.imei}</div>}
            </Card>
            <Card style={{marginBottom:DS.space[4],padding:DS.space[4],background:a.light,boxShadow:`inset 0 0 0 1px ${a.primary}22`}}>
              <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2],fontFamily:DS.font}}>Selected plan</div>
              <div style={{fontSize:16,fontWeight:700,color:DS.color.onyx800,fontFamily:DS.font}}>{selectedPlan.displayName}</div>
              <div style={{fontSize:12,color:DS.color.onyx600,marginTop:4,fontFamily:DS.font}}>{selectedPlan.name}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:DS.space[4],paddingTop:DS.space[3],borderTop:`1px solid ${DS.color.onyx300}`}}>
                <div>
                  <div style={{fontSize:11,color:DS.color.onyx500,fontFamily:DS.font}}>Customer pays</div>
                  <span className="counter" style={{fontSize:22,fontWeight:700,color:DS.color.onyx800}}>{showFullPrice?selectedPlan.fullPrice:selectedPlan.priceEmi}</span>
                  <div style={{fontSize:11,color:DS.color.onyx400,marginTop:2}}>{showFullPrice?`or ${selectedPlan.priceEmi} × ${selectedPlan.emiMonths}`:`Full ${selectedPlan.fullPrice}`}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:11,color:DS.color.onyx500,fontFamily:DS.font}}>You earn</div>
                  <span className="counter" style={{fontSize:18,fontWeight:700,color:a.primary}}>{selectedPlan.commission}</span>
                </div>
              </div>
            </Card>
          </>
        )}
        <Btn variant={isEV?"primaryEV":"primary"} full disabled={!selectedPlan} onClick={()=>setStep(4)}>Confirm &amp; enter customer details →</Btn>
      </div>
    );

    if(step===4) return(
      <div>
        <div style={{fontFamily:DS.font,fontSize:16,fontWeight:600,color:DS.color.onyx800,marginBottom:DS.space[4]}}>Customer details</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:DS.space[4]}}>
          <span style={{fontFamily:DS.font,fontSize:13,color:DS.color.onyx500}}>Fill manually or scan invoice</span>
          <Btn variant="ghost" size="sm">Scan invoice</Btn>
        </div>
        <AInput label="Customer name" defaultValue="Priya Nair"/>
        <AInput label="Mobile number" defaultValue="+91 98400 12345" type="tel"/>
        <AInput label={isEV?"Vehicle reg. no.":"Device serial no."} defaultValue={isEV?"KA01AB5678":device.serial}/>
        <Btn variant={isEV?"primaryEV":"primary"} full onClick={()=>setStep(5)}>Continue to payment →</Btn>
      </div>
    );

    if(step===5) return(
      <div>
        <div style={{fontFamily:DS.font,fontSize:16,fontWeight:600,color:DS.color.onyx800,marginBottom:4}}>Payment</div>
        <div style={{fontFamily:DS.font,fontSize:13,color:DS.color.onyx500,marginBottom:DS.space[4],lineHeight:1.45}}>How should the customer pay? You can settle from the store wallet or add the premium to the handset bill.</div>
        {selectedPlan&&(
          <Card style={{marginBottom:DS.space[4],padding:DS.space[3]}}>
            <div style={{fontSize:12,color:DS.color.onyx600,fontFamily:DS.font}}>Amount due</div>
            <div className="counter" style={{fontSize:20,fontWeight:700,color:DS.color.onyx800}}>{showFullPrice?selectedPlan.fullPrice:`${selectedPlan.priceEmi} × ${selectedPlan.emiMonths} mo`}</div>
            <div style={{fontSize:11,color:DS.color.onyx400,marginTop:2}}>{showFullPrice?`EMI option: ${selectedPlan.priceEmi}`:`One-time: ${selectedPlan.fullPrice}`}</div>
          </Card>
        )}
        {hasError&&config.error==="Wallet empty"&&<AlertBanner type="warning" message="Store wallet is empty. Top up before using wallet payment."/>}
        {hasError&&config.error==="Payment failed"&&<AlertBanner type="error" message="Payment failed. Ask the customer to retry or choose another method."/>}
        {[{id:"full",label:"UPI / Card (full payment)",sub:"Customer pays now via QR or card",disabled:false},{id:"emi",label:isEV?"UPI AutoPay":"EMI mandate",sub:isEV?"Auto-renewal for annual plans":`${selectedPlan?`${selectedPlan.priceEmi} × ${selectedPlan.emiMonths}`:"₹84/mo"} · no extra cost`,disabled:false},{id:"wallet",label:"Store wallet",sub:`Balance: ${hasError&&config.error==="Wallet empty"?"₹0 (empty)":"₹12,400"}`,disabled:hasError&&config.error==="Wallet empty"},{id:"deviceBill",label:"Add to device bill",sub:"Premium added to handset invoice at checkout",disabled:false}].map(m=>(
          <div key={m.id} onClick={()=>!m.disabled&&setPayMethod(m.id)} style={{display:"flex",alignItems:"center",gap:DS.space[3],padding:DS.space[4],border:`1.5px solid ${payMethod===m.id?a.primary:m.disabled?DS.color.cerise300:DS.color.onyx300}`,borderRadius:DS.radius.lg,marginBottom:DS.space[3],cursor:m.disabled?"not-allowed":"pointer",opacity:m.disabled?.6:1,background:payMethod===m.id?a.light:DS.color.onyx100,transition:"border-color 150ms"}}>
            <div style={{width:20,height:20,borderRadius:10,border:`2px solid ${payMethod===m.id?a.primary:DS.color.onyx400}`,background:payMethod===m.id?a.primary:"transparent",flexShrink:0,transition:"background 150ms"}}/>
            <div>
              <div style={{fontFamily:DS.font,fontSize:14,fontWeight:500,color:DS.color.onyx800}}>{m.label}</div>
              <div style={{fontFamily:DS.font,fontSize:12,color:DS.color.onyx400}}>{m.sub}</div>
            </div>
          </div>
        ))}
        <Btn variant={isEV?"primaryEV":"primary"} full disabled={!payMethod} onClick={()=>setStep(6)}>Issue policy →</Btn>
      </div>
    );

    if(step===6) return(
      <div style={{textAlign:"center",paddingTop:DS.space[2]}}>
        <div style={{width:72,height:72,borderRadius:36,background:DS.color.green200,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Check size={36} strokeWidth={ICON_STROKE} color={DS.color.green700} aria-hidden />
        </div>
        <div style={{fontFamily:DS.font,fontSize:22,fontWeight:700,color:DS.color.onyx800,marginBottom:8}}>Policy issued</div>
        <Badge variant="green" dot>{policyIdRef.current}</Badge>
        {selectedPlan&&(
          <div style={{textAlign:"left",margin:`${DS.space[5]}px 0`,padding:DS.space[4],background:DS.color.onyx100,borderRadius:DS.radius.xl,border:`1px solid ${DS.color.onyx300}`}}>
            <div style={{fontSize:12,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2],fontFamily:DS.font}}>Policy details</div>
            <div style={{fontSize:14,fontWeight:600,color:DS.color.onyx800,fontFamily:DS.font}}>{selectedPlan.displayName}</div>
            <div style={{fontSize:12,color:DS.color.onyx600,marginTop:4,fontFamily:DS.font}}>{device.model} · {payMethod==="deviceBill"?"Added to device bill":payMethod==="wallet"?"Paid via store wallet":"Customer payment"}</div>
            <div style={{fontSize:11,color:DS.color.onyx400,marginTop:DS.space[3],fontFamily:DS.font}}>Certificate sent to customer mobile on file.</div>
          </div>
        )}
        <div style={{margin:`0 0 ${DS.space[4]}px`,padding:DS.space[4],background:DS.color.green100,border:`1.5px solid ${DS.color.green400}`,borderRadius:DS.radius.xl,textAlign:"left"}}>
          <div style={{fontFamily:DS.font,fontSize:13,fontWeight:600,color:DS.color.green800,marginBottom:DS.space[2]}}>Commission credited</div>
          <div className="counter" style={{fontFamily:DS.font,fontSize:32,fontWeight:700,color:DS.color.green600}}>{selectedPlan?.commission||"—"}</div>
          <div style={{fontFamily:DS.font,fontSize:12,color:DS.color.green700,marginTop:4}}>Added to your wallet instantly</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:DS.space[3]}}>
          <button type="button" className="abtn" onClick={sharePolicyWa} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",minHeight:48,padding:`0 ${DS.space[4]}px`,borderRadius:DS.radius.lg,border:`1.5px solid ${DS.color.green600}`,background:DS.color.green100,color:DS.color.green800,fontFamily:DS.font,fontSize:14,fontWeight:600,cursor:"pointer"}}>
            <Share2 size={18} strokeWidth={ICON_STROKE} aria-hidden />
            Share policy doc to WhatsApp
          </button>
          <Btn variant={isEV?"primaryEV":"primary"} full onClick={()=>{setStep(0);setPlan(null);setPayMethod(null);setPlanUi("list");setDetailPlanId(null);setShowFullPrice(false);setCommReveal({});}}>Sell again</Btn>
        </div>
      </div>
    );
  };

  const showPlanFullscreen=step===2&&(planUi==="compare"||(planUi==="detail"&&detailPlanId));
  const detailPlan=planUi==="detail"&&detailPlanId?plans.find(p=>p.id===detailPlanId):null;

  const planCompareScroll=(
    <>
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:DS.space[3],marginBottom:DS.space[4]}}>
        <div style={{fontFamily:DS.font,fontSize:12,color:DS.color.onyx500}}>✓ Covered · ✗ Not covered</div>
        <button type="button" className="abtn" onClick={shareBrochureWa} style={{display:"inline-flex",alignItems:"center",gap:6,padding:`6px 10px`,borderRadius:DS.radius.pill,border:`1px solid ${DS.color.green400}`,background:DS.color.green100,fontFamily:DS.font,fontSize:11,fontWeight:600,color:DS.color.green800,cursor:"pointer"}}>
          <MessageCircle size={13} strokeWidth={ICON_STROKE} aria-hidden />
          Share brochure
        </button>
      </div>
      <div style={{overflowX:"auto",marginBottom:DS.space[4],WebkitOverflowScrolling:"touch",borderRadius:DS.radius.lg,border:`1px solid ${DS.color.onyx300}`,background:DS.color.onyx100}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontFamily:DS.font,fontSize:11,minWidth:300}}>
          <thead>
            <tr style={{background:DS.color.onyx200}}>
              <th style={{textAlign:"left",padding:`${DS.space[3]}px ${DS.space[2]}px`,color:DS.color.onyx500,fontWeight:600,width:"36%"}}> </th>
              {plans.map(p=>(
                <th key={p.id} style={{textAlign:"center",padding:`${DS.space[3]}px ${DS.space[2]}px`,color:DS.color.onyx800,fontWeight:700,verticalAlign:"bottom",borderLeft:`1px solid ${DS.color.onyx300}`}}>
                  <div style={{maxWidth:76,margin:"0 auto",lineHeight:1.25}}>{p.displayName}</div>
                  <div style={{fontSize:10,fontWeight:500,color:DS.color.onyx500,marginTop:6}}>{showFullPrice?p.fullPrice:p.priceEmi}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareRows.map((row,ri)=>(
              <tr key={row.key} style={{background:ri%2===0?DS.color.onyx100:"rgba(0,0,0,0.02)"}}>
                <td style={{padding:`${DS.space[3]}px ${DS.space[2]}px`,color:DS.color.onyx700,verticalAlign:"top",lineHeight:1.35,borderTop:`1px solid ${DS.color.onyx300}`}}>{row.label}</td>
                {plans.map(p=>(
                  <td key={p.id} style={{textAlign:"center",padding:`${DS.space[3]}px ${DS.space[2]}px`,borderTop:`1px solid ${DS.color.onyx300}`,borderLeft:`1px solid ${DS.color.onyx300}`,verticalAlign:"middle"}}>
                    <CompareCell ok={!!p.compare[row.key]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{fontFamily:DS.font,fontSize:11,color:DS.color.onyx400,lineHeight:1.5}}>For full policy wording, open a plan’s detail page. Commission is masked on the plan list until you tap to reveal.</div>
    </>
  );

  const planDetailScroll=detailPlan&&(
    <>
      {detailPlan.tag&&<div style={{marginBottom:DS.space[2]}}><Badge variant={detailPlan.tag==="RoP"?"blue":"purple"}>{detailPlan.tag}</Badge></div>}
      <div style={{fontFamily:DS.font,fontSize:18,fontWeight:700,color:DS.color.onyx800,marginBottom:4}}>{detailPlan.displayName}</div>
      <div style={{fontFamily:DS.font,fontSize:12,color:DS.color.onyx500,marginBottom:DS.space[4],lineHeight:1.45}}>{detailPlan.summary}</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:DS.space[3],marginBottom:DS.space[4],padding:DS.space[4],background:a.light,borderRadius:DS.radius.lg,border:`1px solid ${DS.color.onyx300}`}}>
        <div>
          <div style={{fontSize:11,color:DS.color.onyx500,fontFamily:DS.font}}>Customer price</div>
          <span className="counter" style={{fontFamily:DS.font,fontSize:20,fontWeight:700,color:DS.color.onyx800}}>{showFullPrice?detailPlan.fullPrice:detailPlan.priceEmi}</span>
          <div style={{fontSize:11,color:DS.color.onyx400,marginTop:4}}>{showFullPrice?`or ${detailPlan.priceEmi} × ${detailPlan.emiMonths}`:`Full ${detailPlan.fullPrice}`}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:11,color:DS.color.onyx500,fontFamily:DS.font}}>Your commission</div>
          {commReveal[detailPlan.id]?(
            <span className="counter" style={{fontSize:16,fontWeight:700,color:a.primary}}>{detailPlan.commission}</span>
          ):(
            <button type="button" className="abtn" onClick={()=>toggleComm(detailPlan.id)} style={{border:"none",background:DS.color.onyx200,padding:`6px 12px`,borderRadius:DS.radius.pill,fontFamily:DS.font,fontSize:11,fontWeight:600,color:DS.color.onyx600,cursor:"pointer"}}>Tap to reveal</button>
          )}
        </div>
      </div>
      <div style={{fontFamily:DS.font,fontSize:13,fontWeight:700,color:DS.color.onyx800,marginBottom:DS.space[2]}}>Plan details</div>
      <div style={{fontFamily:DS.font,fontSize:12,color:DS.color.onyx600,marginBottom:DS.space[4],lineHeight:1.55}}>{detailPlan.cover}</div>
      <div style={{fontFamily:DS.font,fontSize:13,fontWeight:700,color:DS.color.green800,marginBottom:DS.space[2]}}>What is covered</div>
      <ul style={{margin:`0 0 ${DS.space[4]}px`,paddingLeft:18,fontFamily:DS.font,fontSize:12,color:DS.color.onyx700,lineHeight:1.55}}>
        {detailPlan.covered.map((line,i)=>(<li key={i} style={{marginBottom:6}}>{line}</li>))}
      </ul>
      <div style={{fontFamily:DS.font,fontSize:13,fontWeight:700,color:DS.color.cerise700,marginBottom:DS.space[2]}}>What is not covered</div>
      <ul style={{margin:`0 0 ${DS.space[4]}px`,paddingLeft:18,fontFamily:DS.font,fontSize:12,color:DS.color.onyx700,lineHeight:1.55}}>
        {detailPlan.notCovered.map((line,i)=>(<li key={i} style={{marginBottom:6}}>{line}</li>))}
      </ul>
      <div style={{fontFamily:DS.font,fontSize:13,fontWeight:700,color:DS.color.onyx800,marginBottom:DS.space[2]}}>How to claim</div>
      <ol style={{margin:`0 0 ${DS.space[4]}px`,paddingLeft:18,fontFamily:DS.font,fontSize:12,color:DS.color.onyx700,lineHeight:1.55}}>
        {detailPlan.howToClaim.map((line,i)=>(<li key={i} style={{marginBottom:6}}>{line}</li>))}
      </ol>
      <div style={{padding:DS.space[4],background:DS.color.blue100,borderRadius:DS.radius.lg,border:`1px solid ${DS.color.blue200}`,marginBottom:DS.space[4]}}>
        <div style={{fontFamily:DS.font,fontSize:12,fontWeight:700,color:DS.color.blue700,marginBottom:4}}>How much you can save</div>
        <div style={{fontFamily:DS.font,fontSize:12,color:DS.color.blue800,lineHeight:1.5}}>{detailPlan.savingsHighlight}</div>
      </div>
      {detailPlan.specialFeatures?.length>0&&(
        <>
          <div style={{fontFamily:DS.font,fontSize:13,fontWeight:700,color:DS.color.onyx800,marginBottom:DS.space[2]}}>Special features</div>
          <div style={{display:"flex",flexDirection:"column",gap:DS.space[2],marginBottom:DS.space[5]}}>
            {detailPlan.specialFeatures.map(sf=>(
              <div key={sf.id} style={{display:"flex",gap:DS.space[3],padding:DS.space[3],background:DS.color.purple100,borderRadius:DS.radius.lg,border:`1px solid ${DS.color.purple200}`}}>
                <div style={{flexShrink:0,width:40,height:40,borderRadius:DS.radius.md,background:DS.color.onyx100,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <SellFeatureIcon icon={sf.icon} primary={a.primary}/>
                </div>
                <div>
                  <div style={{fontFamily:DS.font,fontSize:13,fontWeight:700,color:DS.color.onyx800}}>{sf.title}</div>
                  <div style={{fontFamily:DS.font,fontSize:11,color:DS.color.onyx600,marginTop:4,lineHeight:1.45}}>{sf.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:DS.space[3]}}>
        <Btn variant={isEV?"primaryEV":"primary"} full onClick={()=>{setPlan(detailPlan.id);setPlanUi("list");setDetailPlanId(null);}}>Choose this plan</Btn>
        <Btn variant="outline" full onClick={()=>{setDetailPlanId(null);setPlanUi("compare");}}>Compare all plans</Btn>
      </div>
    </>
  );

  return(
    <div style={{flex:1,minHeight:0,display:"flex",flexDirection:"column",position:"relative",background:DS.color.onyx100}}>
      <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:DS.space[2],padding:`${DS.space[3]}px ${DS.space[4]}px`,borderBottom:`1px solid ${DS.color.onyx300}`}}>
        <button type="button" className="abtn" onClick={onBack} style={{border:"none",background:"none",cursor:"pointer",padding:DS.space[2],display:"flex",alignItems:"center"}} aria-label="Back">
          <ArrowLeft size={22} strokeWidth={ICON_STROKE} color={DS.color.onyx800}/>
        </button>
        <div style={{fontFamily:DS.font,fontSize:16,fontWeight:600,color:DS.color.onyx800}}>New sale</div>
      </div>
      <div style={{flex:1,minHeight:0,display:"flex",flexDirection:"column",position:"relative"}}>
      {showPlanFullscreen?(
        <div style={{position:"absolute",inset:0,background:DS.color.onyx100,display:"flex",flexDirection:"column",zIndex:10,boxShadow:"inset 0 1px 0 rgba(0,0,0,0.04)"}}>
          <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:DS.space[2],padding:`${DS.space[3]}px ${DS.space[4]}px`,borderBottom:`1px solid ${DS.color.onyx300}`,background:DS.color.onyx100}}>
            <button
              type="button"
              className="abtn"
              onClick={()=>{setDetailPlanId(null);setPlanUi("list");}}
              aria-label="Back"
              style={{
                border:"none",
                background:"none",
                cursor:"pointer",
                padding:DS.space[2],
                flexShrink:0,
                touchAction:"manipulation",
                display:"flex",
                alignItems:"center",
              }}
            >
              <ArrowLeft size={22} strokeWidth={ICON_STROKE} color={DS.color.onyx800}/>
            </button>
            <span style={{fontFamily:DS.font,fontSize:16,fontWeight:600,color:DS.color.onyx800,flex:1,minWidth:0,lineHeight:1.25}}>
              {planUi==="compare"?"Compare plans":(detailPlan?.name||"Plan details")}
            </span>
          </div>
          <div style={{flex:1,minHeight:0,overflowY:"auto",overflowX:"hidden",padding:DS.space[4],WebkitOverflowScrolling:"touch"}}>
            {planUi==="compare"?planCompareScroll:(detailPlan?planDetailScroll:<div style={{fontFamily:DS.font,fontSize:14,color:DS.color.onyx500}}>Could not load this plan.</div>)}
          </div>
        </div>
      ):(
        <div style={{flex:1,minHeight:0,overflowY:"auto",padding:DS.space[4]}}>
          <OnboardingProgress stepIndex={step} total={SELL_STEPS} label={titles[step]} primary={a.primary} />
          {body()}
        </div>
      )}
      </div>
    </div>
  );
}

// ── Earnings: scheme ingress (data from schemeService) ────────────────────────
const SCHEME_INGRESS_TEAL="#1D9E75";
const SCHEME_INGRESS_AMBER="#BA7517";

function SchemeEarningsIngressCard({config,navigate,ingress,loading}){
  const isDealer=isManagementPersona(config.persona);
  const goList=()=>{ setSchemesEntryTab("earnings"); navigate("/schemes"); };
  const goFocused=()=>{
    setSchemesEntryTab("earnings");
    if(ingress?.urgentScheme?.id) navigate(`/schemes?focus=${encodeURIComponent(ingress.urgentScheme.id)}`);
    else goList();
  };
  const rupees=ingress?.schemeEarningsThisMonthRupees;
  const activeCount=ingress?.activeSchemeCount;
  const u=ingress?.urgentScheme;
  const pct=u&&u.target>0?Math.min(100,Math.round((u.current/u.target)*100)):0;

  return(
    <Card style={{marginBottom:DS.space[4],padding:DS.space[4]}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:DS.space[3]}}>
        <span style={{fontFamily:DS.font,fontSize:12,fontWeight:500,color:DS.color.onyx800}}>From schemes</span>
        <button type="button" className="abtn" onClick={goList} style={{border:"none",background:"none",cursor:"pointer",padding:0,fontFamily:DS.font,fontSize:11,fontWeight:500,color:DS.color.onyx500}}>
          View all →
        </button>
      </div>
      <div onClick={goFocused} style={{cursor:"pointer"}} role="presentation">
        <div style={{display:"flex",gap:DS.space[4],marginBottom:DS.space[3]}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:DS.font,fontSize:10,fontWeight:500,color:DS.color.onyx500,marginBottom:4}}>{isDealer?"Store scheme earnings":"My scheme earnings"}</div>
            <div className="counter" style={{fontFamily:DS.font,fontSize:22,fontWeight:700,color:DS.color.onyx800,lineHeight:1.2}}>
              {loading?"—":`₹${(rupees ?? 0).toLocaleString("en-IN")}`}
            </div>
            <div style={{fontFamily:DS.font,fontSize:10,fontWeight:500,color:DS.color.onyx500,marginTop:4}}>This month</div>
          </div>
          <div style={{flex:1,minWidth:0,textAlign:"right"}}>
            <div style={{fontFamily:DS.font,fontSize:10,fontWeight:500,color:DS.color.onyx500,marginBottom:4}}>Active schemes</div>
            <div className="counter" style={{fontFamily:DS.font,fontSize:22,fontWeight:700,color:DS.color.onyx800,lineHeight:1.2}}>
              {loading?"—":(activeCount ?? 0)}
            </div>
            <button type="button" className="abtn" onClick={e=>{ e.stopPropagation(); goList(); }} style={{border:"none",background:"none",cursor:"pointer",padding:0,marginTop:6,fontFamily:DS.font,fontSize:10,fontWeight:600,color:SCHEME_INGRESS_TEAL,width:"100%",textAlign:"right"}}>
              See progress →
            </button>
          </div>
        </div>
        <div style={{borderTop:`1px solid ${DS.color.onyx300}`,paddingTop:DS.space[3]}}>
          {!loading&&(activeCount ?? 0)===0&&(
            <div style={{fontFamily:DS.font,fontSize:12,color:DS.color.onyx400,textAlign:"center",padding:`${DS.space[2]}px 0`}}>No active schemes right now</div>
          )}
          {!loading&&(activeCount ?? 0)>0&&u&&(
            <>
              <div style={{fontFamily:DS.font,fontSize:12,fontWeight:500,color:DS.color.onyx800,marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</div>
              <div style={{fontFamily:DS.font,fontSize:11,color:DS.color.onyx500,marginBottom:DS.space[2]}}>
                {u.isPercent?`${u.current} / ${u.target}%`:`${u.current} / ${u.target} ${u.unitLabel}`}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:DS.space[2],width:"100%"}}>
                <div style={{flex:1,minWidth:0,height:4,borderRadius:2,background:DS.color.onyx300,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:SCHEME_INGRESS_TEAL,borderRadius:2}} />
                </div>
                {u.gapMore>0&&u.gapPayoutRupee>0&&(
                  <span style={{fontFamily:DS.font,fontSize:10,fontWeight:700,color:SCHEME_INGRESS_AMBER,whiteSpace:"nowrap",flexShrink:0}}>
                    {u.gapMore} more → ₹{u.gapPayoutRupee.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

const TXN_STATUS_BADGE={Available:"green",Pending:"orange",Withdrawn:"gray"};

function PromoterTxnStatusPill({status}){
  const M={
    Credited:{bg:DS.color.green200,c:DS.color.green700},
    Pending:{bg:DS.color.orange200,c:DS.color.orange700},
    Reversed:{bg:DS.color.cerise200,c:DS.color.cerise700},
    Withdrawn:{bg:DS.color.onyx200,c:DS.color.onyx600},
  };
  const v=M[status]||M.Credited;
  return(
    <span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:DS.radius.pill,background:v.bg,color:v.c,fontSize:10,fontWeight:600,fontFamily:DS.font}}>{status}</span>
  );
}

function PromoterTransactionsSection({config,onNavigateToSell}){
  const a=acc(config.domain);
  const isEV=config.domain==="EV";
  const navigate=useNavigate();
  const [allRows,setAllRows]=useState([]);
  const [loading,setLoading]=useState(true);
  const [datePreset,setDatePreset]=useState("today");
  const [customStart,setCustomStart]=useState(()=>new Date().toISOString().slice(0,10));
  const [customEnd,setCustomEnd]=useState(()=>new Date().toISOString().slice(0,10));
  const [customRangeOpen,setCustomRangeOpen]=useState(false);
  const [draftStart,setDraftStart]=useState(()=>new Date().toISOString().slice(0,10));
  const [draftEnd,setDraftEnd]=useState(()=>new Date().toISOString().slice(0,10));
  const [filterOpen,setFilterOpen]=useState(false);
  const [exportOpen,setExportOpen]=useState(false);
  const [detailTxn,setDetailTxn]=useState(null);
  const [toast,setToast]=useState(null);
  const [appliedFilters,setAppliedFilters]=useState({status:"all",productType:"all",planType:"all",minCommission:"",maxCommission:""});
  const [draftFilters,setDraftFilters]=useState({status:"all",productType:"all",planType:"all",minCommission:"",maxCommission:""});

  useEffect(()=>{
    let c=true;
    setLoading(true);
    fetchPromoterTransactions().then(r=>{
      if(c) setAllRows(r);
    }).finally(()=>{
      if(c) setLoading(false);
    });
    return ()=>{ c=false; };
  },[]);

  const dateRange=useMemo(()=>computeDateRange(datePreset,customStart,customEnd),[datePreset,customStart,customEnd]);
  const afterDate=useMemo(()=>filterByDateRange(allRows,dateRange),[allRows,dateRange]);
  const filtered=useMemo(()=>applySheetFilters(afterDate,appliedFilters),[afterDate,appliedFilters]);
  const sorted=useMemo(()=>[...filtered].sort((p,q)=>new Date(q.occurredAt)-new Date(p.occurredAt)),[filtered]);
  const summary=useMemo(()=>computeSummary(sorted),[sorted]);

  const customChipLabel=useMemo(()=>{
    if(datePreset!=="custom") return null;
    return formatCustomChipLabel(customStart,customEnd);
  },[datePreset,customStart,customEnd]);

  const activeFilterCount=useMemo(()=>{
    let n=0;
    if(appliedFilters.status!=="all") n++;
    if(appliedFilters.productType!=="all") n++;
    if(appliedFilters.planType!=="all") n++;
    if(appliedFilters.minCommission.trim()!=="") n++;
    if(appliedFilters.maxCommission.trim()!=="") n++;
    return n;
  },[appliedFilters]);

  const chipPresets=[
    {id:"today",label:"Today"},
    {id:"this_week",label:"This week"},
    {id:"this_month",label:"This month"},
    {id:"last_month",label:"Last month"},
    {id:"custom",label:customChipLabel||"Custom"},
  ];

  const openCustom=()=>{
    setDraftStart(customStart);
    setDraftEnd(customEnd);
    setCustomRangeOpen(true);
  };

  const confirmCustom=()=>{
    setCustomStart(draftStart);
    setCustomEnd(draftEnd);
    setDatePreset("custom");
    setCustomRangeOpen(false);
  };

  const chipSelect=(id)=>{
    if(id==="custom"){ openCustom(); return; }
    setDatePreset(id);
  };

  const chipSel=(id)=>{
    if(id==="custom") return datePreset==="custom";
    return datePreset===id;
  };

  const chipFill=isEV?DS.color.green600:DS.color.purple600;

  const rowAmount=(r)=>{
    if(r.uiKind==="pending") return{main:`₹${r.pendingCommissionRupees.toLocaleString("en-IN")}`,color:PROMOTER_TXN_COLORS.AMBER,incl:false};
    if(r.uiKind==="reversed") return{main:`−₹${Math.abs(r.netCreditedRupees).toLocaleString("en-IN")}`,color:PROMOTER_TXN_COLORS.RED,incl:false};
    if(r.uiKind==="withdrawn") return{main:`+₹${r.netCreditedRupees.toLocaleString("en-IN")}`,color:PROMOTER_TXN_COLORS.TEAL,incl:r.tdsRupees>0};
    return{main:`+₹${r.netCreditedRupees.toLocaleString("en-IN")}`,color:PROMOTER_TXN_COLORS.TEAL,incl:r.tdsRupees>0};
  };

  const downloadCsv=()=>{
    const csv=buildCsv(sorted);
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=`transactions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({kind:"share",message:"Export ready — tap to share",blob:csv});
    setExportOpen(false);
  };

  const openPdf=()=>{
    const w=window.open("","_blank");
    if(!w) return;
    const rows=sorted.map(r=>{
      const d=new Date(r.occurredAt);
      return `<tr><td>${d.toLocaleDateString("en-IN")}</td><td>${r.deviceBrand} ${r.deviceModel}</td><td>${r.displayStatus}</td><td>₹${r.pendingCommissionRupees||r.netCreditedRupees}</td></tr>`;
    }).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>Transactions</title><style>body{font-family:sans-serif} table{border-collapse:collapse;width:100%} td{border:1px solid #ddd;padding:6px;font-size:12px}</style></head><body><h2>Transactions</h2><table><thead><tr><th>Date</th><th>Device</th><th>Status</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
    w.document.close();
    w.focus();
    w.print();
    setTimeout(()=>w.close(),250);
    setToast({kind:"share",message:"Export ready — tap to share",blob:null});
    setExportOpen(false);
  };

  const shareToast=async ()=>{
    if(!toast?.blob) return;
    const file=new File([toast.blob],"transactions.csv",{type:"text/csv"});
    try{
      if(navigator.share&&navigator.canShare){ await navigator.share({files:[file],title:"Transactions"}); }
    }catch{
      /* ignore */
    }
    setToast(null);
  };

  useEffect(()=>{
    if(!toast) return;
    const t=setTimeout(()=>setToast(null),6000);
    return ()=>clearTimeout(t);
  },[toast]);

  const copyPolicy=(pn)=>{
    navigator.clipboard?.writeText(pn).catch(()=>{});
  };

  const bgSecondary=DS.color.onyx200;

  return(
    <div style={{position:"relative"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:DS.space[2]}}>
        <div style={{fontFamily:DS.font,fontSize:13,fontWeight:500,color:DS.color.onyx800}}>My transactions</div>
        <div style={{display:"flex",alignItems:"center",gap:DS.space[3]}}>
          <div style={{position:"relative"}}>
            <button type="button" className="abtn" onClick={()=>{ setDraftFilters({...appliedFilters}); setFilterOpen(true); }} aria-label="filter" style={{border:"none",background:DS.color.onyx200,cursor:"pointer",width:36,height:36,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>
              <Filter size={18} strokeWidth={ICON_STROKE} color={DS.color.onyx700}/>
            </button>
            {activeFilterCount>0&&(
              <span style={{position:"absolute",top:-2,right:-2,minWidth:16,height:16,borderRadius:8,background:DS.color.cerise600,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:DS.font,padding:"0 4px"}}>{activeFilterCount}</span>
            )}
          </div>
          <button type="button" className="abtn" onClick={()=>setExportOpen(true)} style={{border:"none",background:"none",cursor:"pointer",fontFamily:DS.font,fontSize:12,fontWeight:600,color:a.primary,padding:0}}>
            Export →
          </button>
        </div>
      </div>

      <div style={{marginLeft:-DS.space[4],marginRight:-DS.space[4],marginBottom:DS.space[3]}}>
        <div style={{display:"flex",gap:DS.space[2],overflowX:"auto",WebkitOverflowScrolling:"touch",paddingLeft:DS.space[4],paddingRight:DS.space[4],scrollbarWidth:"none"}}>
          {chipPresets.map(ch=>{
            const sel=chipSel(ch.id);
            return(
              <button
                key={ch.id}
                type="button"
                className="abtn"
                onClick={()=>chipSelect(ch.id)}
                style={{
                  flexShrink:0,
                  padding:`8px 14px`,
                  borderRadius:DS.radius.pill,
                  border:sel?"none":`1px solid ${DS.color.onyx300}`,
                  background:sel?chipFill:"transparent",
                  color:sel?"#fff":DS.color.onyx600,
                  fontFamily:DS.font,
                  fontSize:12,
                  fontWeight:600,
                  cursor:"pointer",
                  whiteSpace:"nowrap",
                }}
              >
                {ch.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{background:bgSecondary,borderRadius:10,padding:"10px 0",display:"flex",marginBottom:DS.space[3]}}>
        {[
          {label:"Sales",value:String(summary.sales)},
          {label:"Earned (net)",value:`₹${summary.earned.toLocaleString("en-IN")}`},
          {label:"Pending",value:`₹${summary.pending.toLocaleString("en-IN")}`},
        ].map((cell,i)=>(
          <div key={cell.label} style={{flex:1,textAlign:"center",borderLeft:i>0?`0.5px solid ${DS.color.onyx300}`:"none"}}>
            <div style={{fontFamily:DS.font,fontSize:10,color:DS.color.onyx500,marginBottom:2}}>{cell.label}</div>
            <div className="counter" style={{fontFamily:DS.font,fontSize:16,fontWeight:500,color:DS.color.onyx800}}>{cell.value}</div>
          </div>
        ))}
      </div>

      {loading?(
        <Card style={{padding:DS.space[4],display:"flex",alignItems:"center",gap:DS.space[2]}}>
          <Loader2 size={18} strokeWidth={ICON_STROKE} color={DS.color.onyx500} style={{animation:"mpos-spin 0.9s linear infinite"}} aria-hidden />
          <span style={{fontFamily:DS.font,fontSize:13,color:DS.color.onyx500}}>Loading…</span>
        </Card>
      ):sorted.length===0?(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:`${DS.space[6]}px ${DS.space[2]}px`,textAlign:"center"}}>
          <Receipt size={40} strokeWidth={1.25} color={DS.color.onyx400} aria-hidden style={{marginBottom:DS.space[3]}} />
          <div style={{fontFamily:DS.font,fontSize:14,fontWeight:500,color:DS.color.onyx800,marginBottom:DS.space[2]}}>No sales in this period</div>
          <div style={{fontFamily:DS.font,fontSize:12,color:DS.color.onyx500,maxWidth:280,lineHeight:1.5}}>Your transactions will appear here as you sell.</div>
          {datePreset==="today"&&(
            <div style={{marginTop:DS.space[4]}}>
              <div style={{fontFamily:DS.font,fontSize:12,color:DS.color.onyx600,marginBottom:DS.space[2]}}>Tap the Sell button to start earning</div>
              <Btn variant={isEV?"primaryEV":"primary"} full style={{background:chipFill}} onClick={()=>onNavigateToSell?.()}>Sell policy →</Btn>
            </div>
          )}
        </div>
      ):(
        <div style={{borderTop:`0.5px solid ${DS.color.onyx300}`}}>
          {sorted.map(r=>{
            const am=rowAmount(r);
            return(
              <button
                key={r.id}
                type="button"
                className="abtn"
                onClick={()=>setDetailTxn(r)}
                style={{
                  width:"100%",
                  textAlign:"left",
                  border:"none",
                  borderBottom:`0.5px solid ${DS.color.onyx300}`,
                  background:"transparent",
                  cursor:"pointer",
                  padding:`${DS.space[3]}px 0`,
                  minHeight:64,
                  display:"flex",
                  justifyContent:"space-between",
                  gap:DS.space[3],
                  fontFamily:DS.font,
                  boxSizing:"border-box",
                }}
              >
                <div style={{minWidth:0,flex:1}}>
                  <div style={{fontSize:12,fontWeight:500,color:DS.color.onyx800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.deviceBrand} {r.deviceModel}</div>
                  <div style={{fontSize:11,color:DS.color.onyx500,marginTop:2}}>{r.planCode} · {r.tenureLabel}</div>
                  <div style={{fontSize:10,color:DS.color.onyx400,marginTop:2}}>{formatTxnRowDateTime(r.occurredAt)}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div className="counter" style={{fontSize:13,fontWeight:500,color:am.color}}>{am.main}</div>
                  {am.incl&&<div style={{fontSize:9,color:DS.color.onyx400,marginTop:2}}>incl. TDS</div>}
                  <div style={{marginTop:4}}><PromoterTxnStatusPill status={r.displayStatus}/></div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {customRangeOpen&&(
        <div role="presentation" style={{position:"fixed",inset:0,zIndex:80,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setCustomRangeOpen(false)}>
          <div role="dialog" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:360,maxHeight:"70%",background:DS.color.onyx100,borderTopLeftRadius:DS.radius.xl,borderTopRightRadius:DS.radius.xl,padding:DS.space[4],boxShadow:"0 -8px 32px rgba(0,0,0,0.2)"}}>
            <div style={{fontFamily:DS.font,fontSize:16,fontWeight:600,marginBottom:DS.space[3]}}>Date range</div>
            <div style={{marginBottom:DS.space[2]}}>
              <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:4}}>Start</div>
              <input type="date" value={draftStart} onChange={e=>setDraftStart(e.target.value)} style={{width:"100%",height:40,borderRadius:DS.radius.lg,border:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font,padding:`0 ${DS.space[2]}px`}} />
            </div>
            <div style={{marginBottom:DS.space[4]}}>
              <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:4}}>End</div>
              <input type="date" value={draftEnd} onChange={e=>setDraftEnd(e.target.value)} style={{width:"100%",height:40,borderRadius:DS.radius.lg,border:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font,padding:`0 ${DS.space[2]}px`}} />
            </div>
            <Btn variant={isEV?"primaryEV":"primary"} full style={{background:chipFill}} onClick={confirmCustom}>Confirm</Btn>
          </div>
        </div>
      )}

      {filterOpen&&(
        <div role="presentation" style={{position:"fixed",inset:0,zIndex:80,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setFilterOpen(false)}>
          <div role="dialog" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:360,maxHeight:"78%",background:DS.color.onyx100,borderTopLeftRadius:DS.radius.xl,borderTopRightRadius:DS.radius.xl,padding:DS.space[4],overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:DS.space[3]}}>
              <span style={{fontFamily:DS.font,fontSize:16,fontWeight:600}}>Filters</span>
              <button type="button" className="abtn" onClick={()=>setFilterOpen(false)} style={{border:"none",background:"none",cursor:"pointer",padding:DS.space[2]}} aria-label="Close"><X size={22} strokeWidth={ICON_STROKE} color={DS.color.onyx500}/></button>
            </div>
            <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2]}}>Status</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:DS.space[2],marginBottom:DS.space[4]}}>
              {["All","Credited","Pending","Reversed"].map(v=>{
                const id=v==="All"?"all":v;
                const sel=draftFilters.status===id;
                return(
                  <button key={v} type="button" className="abtn" onClick={()=>setDraftFilters(f=>({...f,status:id}))} style={{padding:`6px 12px`,borderRadius:DS.radius.pill,border:sel?"none":`1px solid ${DS.color.onyx300}`,background:sel?chipFill:"transparent",color:sel?"#fff":DS.color.onyx600,fontFamily:DS.font,fontSize:11,fontWeight:600,cursor:"pointer"}}>{v}</button>
                );
              })}
            </div>
            <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2]}}>Product type</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:DS.space[2],marginBottom:DS.space[4]}}>
              {["All","Electronics","EV","White Goods"].map(v=>{
                const id=v==="All"?"all":v;
                const sel=draftFilters.productType===id;
                return(
                  <button key={v} type="button" className="abtn" onClick={()=>setDraftFilters(f=>({...f,productType:id}))} style={{padding:`6px 12px`,borderRadius:DS.radius.pill,border:sel?"none":`1px solid ${DS.color.onyx300}`,background:sel?chipFill:"transparent",color:sel?"#fff":DS.color.onyx600,fontFamily:DS.font,fontSize:11,fontWeight:600,cursor:"pointer"}}>{v}</button>
                );
              })}
            </div>
            <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2]}}>Plan type</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:DS.space[2],marginBottom:DS.space[4]}}>
              {["All","ALD","EW","Total Protection"].map(v=>{
                const id=v==="All"?"all":v;
                const sel=draftFilters.planType===id;
                return(
                  <button key={v} type="button" className="abtn" onClick={()=>setDraftFilters(f=>({...f,planType:id}))} style={{padding:`6px 12px`,borderRadius:DS.radius.pill,border:sel?"none":`1px solid ${DS.color.onyx300}`,background:sel?chipFill:"transparent",color:sel?"#fff":DS.color.onyx600,fontFamily:DS.font,fontSize:11,fontWeight:600,cursor:"pointer"}}>{v}</button>
                );
              })}
            </div>
            <div style={{fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2]}}>Commission range (₹)</div>
            <div style={{display:"flex",gap:DS.space[2],marginBottom:DS.space[4]}}>
              <input type="number" inputMode="numeric" placeholder="Min ₹" value={draftFilters.minCommission} onChange={e=>setDraftFilters(f=>({...f,minCommission:e.target.value}))} style={{flex:1,height:40,borderRadius:DS.radius.lg,border:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font,fontSize:13,padding:`0 ${DS.space[2]}px`}} />
              <input type="number" inputMode="numeric" placeholder="Max ₹" value={draftFilters.maxCommission} onChange={e=>setDraftFilters(f=>({...f,maxCommission:e.target.value}))} style={{flex:1,height:40,borderRadius:DS.radius.lg,border:`1px solid ${DS.color.onyx300}`,fontFamily:DS.font,fontSize:13,padding:`0 ${DS.space[2]}px`}} />
            </div>
            <Btn variant={isEV?"primaryEV":"primary"} full style={{background:chipFill}} onClick={()=>{ setAppliedFilters({...draftFilters}); setFilterOpen(false); }}>Apply filters</Btn>
            <button type="button" className="abtn" onClick={()=>{ const z={status:"all",productType:"all",planType:"all",minCommission:"",maxCommission:""}; setDraftFilters(z); setAppliedFilters(z); }} style={{border:"none",background:"none",cursor:"pointer",padding:DS.space[3],marginTop:DS.space[2],width:"100%",fontFamily:DS.font,fontSize:13,fontWeight:600,color:DS.color.onyx500}}>Reset all</button>
          </div>
        </div>
      )}

      {exportOpen&&(
        <div role="presentation" style={{position:"fixed",inset:0,zIndex:80,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",padding:DS.space[4]}} onClick={()=>setExportOpen(false)}>
          <div role="dialog" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:280,background:DS.color.onyx100,borderRadius:DS.radius.xl,padding:DS.space[3],boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>
            <button type="button" className="abtn" onClick={downloadCsv} style={{width:"100%",textAlign:"left",padding:DS.space[3],border:"none",background:"none",cursor:"pointer",fontFamily:DS.font,fontSize:14,fontWeight:600,color:DS.color.onyx800}}>Export as CSV</button>
            <button type="button" className="abtn" onClick={openPdf} style={{width:"100%",textAlign:"left",padding:DS.space[3],border:"none",background:"none",cursor:"pointer",fontFamily:DS.font,fontSize:14,fontWeight:600,color:DS.color.onyx800}}>Share as PDF</button>
          </div>
        </div>
      )}

      {detailTxn&&(
        <div role="presentation" style={{position:"fixed",inset:0,zIndex:80,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setDetailTxn(null)}>
          <div role="dialog" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:360,maxHeight:"70vh",background:DS.color.onyx100,borderTopLeftRadius:DS.radius.xl,borderTopRightRadius:DS.radius.xl,padding:DS.space[4],overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:DS.space[3]}}>
              <span style={{fontFamily:DS.font,fontSize:16,fontWeight:600}}>Transaction</span>
              <button type="button" className="abtn" onClick={()=>setDetailTxn(null)} style={{border:"none",background:"none",cursor:"pointer",padding:DS.space[2]}} aria-label="Close"><X size={22} strokeWidth={ICON_STROKE} color={DS.color.onyx500}/></button>
            </div>
            <div style={{fontFamily:DS.font,fontSize:16,fontWeight:500,color:DS.color.onyx800,marginBottom:DS.space[2]}}>{detailTxn.deviceBrand} {detailTxn.deviceModel}</div>
            <div style={{display:"flex",alignItems:"center",gap:DS.space[2],marginBottom:DS.space[2]}}>
              <span style={{fontFamily:"ui-monospace,monospace",fontSize:12,color:DS.color.onyx500}}>{detailTxn.policyNumber}</span>
              <button type="button" className="abtn" onClick={()=>copyPolicy(detailTxn.policyNumber)} aria-label="Copy policy number" style={{border:"none",background:"none",cursor:"pointer",padding:DS.space[1]}}><Copy size={16} strokeWidth={ICON_STROKE} color={DS.color.onyx500}/></button>
            </div>
            <div style={{fontSize:12,color:DS.color.onyx500,marginBottom:DS.space[4]}}>{formatTxnRowDateTime(detailTxn.occurredAt)}</div>

            <div style={{fontSize:12,fontWeight:600,color:DS.color.onyx800,marginBottom:DS.space[2]}}>Commission breakdown</div>
            <div style={{border:`1px solid ${DS.color.onyx300}`,borderRadius:DS.radius.lg,padding:DS.space[3],marginBottom:DS.space[3]}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:DS.space[2]}}><span>Base commission</span><span className="counter">₹{detailTxn.baseCommissionRupees}</span></div>
              {detailTxn.schemeBonusRupees>0&&(
                <div style={{marginBottom:DS.space[2]}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span>Scheme bonus</span><span className="counter">₹{detailTxn.schemeBonusRupees}</span></div>
                  {detailTxn.schemeName&&<div style={{fontSize:10,color:DS.color.onyx500}}>{detailTxn.schemeName}</div>}
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:DS.space[2],color:DS.color.cerise700}}><span>TDS deducted</span><span className="counter">−₹{detailTxn.tdsRupees}</span></div>
              <div style={{borderTop:`1px solid ${DS.color.onyx300}`,paddingTop:DS.space[2],display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700,color:PROMOTER_TXN_COLORS.TEAL}}><span>Net credited</span><span className="counter">₹{detailTxn.uiKind==="pending"?0:detailTxn.netCreditedRupees}</span></div>
            </div>

            <div style={{fontSize:12,fontWeight:600,marginBottom:DS.space[2]}}>Status</div>
            <div style={{display:"flex",gap:DS.space[2],marginBottom:DS.space[3],flexWrap:"wrap"}}>
              {["Earned","Approved","Encashed","Reversed"].map((step,i)=>{
                const rev=step==="Reversed";
                if(rev&&!detailTxn.smReversed) return null;
                const done=step==="Earned"?detailTxn.smEarned:step==="Approved"?detailTxn.smApproved:step==="Encashed"?detailTxn.smEncashed:detailTxn.smReversed;
                return(
                  <div key={step} style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:10,height:10,borderRadius:5,background:done?chipFill:DS.color.onyx300}}/>
                    <span style={{fontSize:11,color:done?DS.color.onyx800:DS.color.onyx400}}>{step}</span>
                  </div>
                );
              })}
            </div>
            {detailTxn.smReversed&&detailTxn.reversalReason&&(
              <div style={{fontSize:12,color:DS.color.cerise700,background:DS.color.cerise100,padding:DS.space[2],borderRadius:DS.radius.md,marginBottom:DS.space[3]}}>{detailTxn.reversalReason}</div>
            )}

            <div style={{fontSize:12,fontWeight:600,marginBottom:DS.space[2]}}>Plan details</div>
            <div style={{fontSize:13,color:DS.color.onyx700,marginBottom:DS.space[1]}}>{detailTxn.planCode} · {detailTxn.tenureLabel} · Premium ₹{detailTxn.premiumRupees.toLocaleString("en-IN")}</div>
            <div style={{fontSize:12,color:DS.color.onyx500,marginBottom:DS.space[2]}}>{detailTxn.coverageSummary}</div>
            <div style={{fontSize:12,color:DS.color.onyx600,marginBottom:DS.space[4]}}>Customer: {detailTxn.customerNameMask}</div>

            {detailTxn.uiKind==="reversed"&&(
              <div style={{fontSize:12,color:DS.color.onyx500,marginBottom:DS.space[3]}}>Negative balance note — will offset against future earnings</div>
            )}
            <button type="button" className="abtn" onClick={()=>{ setDetailTxn(null); }} style={{border:"none",background:"none",cursor:"pointer",fontFamily:DS.font,fontSize:13,fontWeight:600,color:a.primary,padding:0}}>View policy →</button>
          </div>
        </div>
      )}

      {toast&&(
        <button type="button" className="abtn" onClick={shareToast} style={{position:"fixed",bottom:DS.space[6],left:"50%",transform:"translateX(-50%)",width:"min(360px, calc(100vw - 32px))",zIndex:90,background:DS.color.onyx800,color:"#fff",border:"none",borderRadius:DS.radius.lg,padding:`${DS.space[3]}px ${DS.space[4]}px`,fontFamily:DS.font,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:DS.space[2],cursor:"pointer",boxShadow:"0 8px 24px rgba(0,0,0,0.25)"}}>
          <Share2 size={16} strokeWidth={ICON_STROKE} color="#fff" aria-hidden />
          {toast.message}
        </button>
      )}
    </div>
  );
}
function DealerTransactionsSection({config}){
  const a=acc(config.domain);
  const isEV=config.domain==="EV";
  const [view,setView]=useState("store");
  const [promoter,setPromoter]=useState("all");
  const [datePreset,setDatePreset]=useState("today");
  const [product,setProduct]=useState("all");
  const [status,setStatus]=useState("all");
  const [storeRows,setStoreRows]=useState([]);
  const [mineRows,setMineRows]=useState([]);
  const [loadingStore,setLoadingStore]=useState(true);
  const [loadingMine,setLoadingMine]=useState(true);

  const promoterOptions=useMemo(()=>["all",...promoterListForFilter(config.domain)],[config.domain]);
  const productOptions=useMemo(()=>productFilterOptions(config.domain),[config.domain]);

  useEffect(()=>{
    let c=true;
    setLoadingStore(true);
    fetchDealerStoreTransactions({
      domain:config.domain,
      promoter,
      datePreset,
      product,
      status,
    }).then(r=>{
      if(c) setStoreRows(r);
    }).finally(()=>{
      if(c) setLoadingStore(false);
    });
    return ()=>{ c=false; };
  },[config.domain,promoter,datePreset,product,status]);

  useEffect(()=>{
    let c=true;
    setLoadingMine(true);
    fetchDealerPersonalCommission({domain:config.domain}).then(r=>{
      if(c) setMineRows(r);
    }).finally(()=>{
      if(c) setLoadingMine(false);
    });
    return ()=>{ c=false; };
  },[config.domain]);

  const resetFilters=()=>{
    setPromoter("all");
    setDatePreset("today");
    setProduct("all");
    setStatus("all");
  };

  const segBtn=(id,label)=>(
    <button
      key={id}
      type="button"
      className="abtn"
      onClick={()=>setView(id)}
      style={{
        flex:1,
        padding:`10px ${DS.space[2]}px`,
        borderRadius:DS.radius.lg,
        border:"none",
        cursor:"pointer",
        fontFamily:DS.font,
        fontSize:12,
        fontWeight:600,
        background:view===id?a.primary:DS.color.onyx200,
        color:view===id?"#fff":DS.color.onyx600,
      }}
    >
      {label}
    </button>
  );

  const selStyle={
    width:"100%",
    height:38,
    padding:`0 ${DS.space[3]}px`,
    borderRadius:DS.radius.lg,
    border:`1px solid ${DS.color.onyx300}`,
    fontFamily:DS.font,
    fontSize:12,
    color:DS.color.onyx800,
    background:DS.color.onyx100,
  };

  const mineRow=(r)=>(
    <Card key={r.id} style={{marginBottom:DS.space[2],padding:`${DS.space[3]}px ${DS.space[4]}px`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:DS.space[2]}}>
        <div style={{minWidth:0}}>
          <div style={{fontFamily:DS.font,fontSize:13,fontWeight:600,color:DS.color.onyx800}}>{r.productLabel}</div>
          <div style={{fontFamily:DS.font,fontSize:11,color:DS.color.onyx400,marginTop:2}}>{r.timeLabel}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div className="counter" style={{fontFamily:DS.font,fontSize:14,fontWeight:700,color:DS.color.onyx800}}>₹{r.commissionRupees.toLocaleString("en-IN")}</div>
          <Badge variant={TXN_STATUS_BADGE[r.status]}>{r.status}</Badge>
        </div>
      </div>
    </Card>
  );

  const storeRow=(r)=>(
    <Card key={r.id} style={{marginBottom:DS.space[2],padding:`${DS.space[3]}px ${DS.space[4]}px`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:DS.space[2]}}>
        <div style={{minWidth:0}}>
          <div style={{fontFamily:DS.font,fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:2}}>{r.promoterName}</div>
          <div style={{fontFamily:DS.font,fontSize:13,fontWeight:600,color:DS.color.onyx800,lineHeight:1.35}}>{r.productLabel}</div>
          <div style={{fontFamily:DS.font,fontSize:11,color:DS.color.onyx400,marginTop:2}}>{r.timeLabel}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div className="counter" style={{fontFamily:DS.font,fontSize:14,fontWeight:700,color:DS.color.onyx800}}>₹{r.commissionRupees.toLocaleString("en-IN")}</div>
          <Badge variant={TXN_STATUS_BADGE[r.status]}>{r.status}</Badge>
        </div>
      </div>
    </Card>
  );

  return(
    <>
      <div style={{fontFamily:DS.font,fontSize:13,fontWeight:600,color:DS.color.onyx800,marginBottom:DS.space[1]}}>Transactions & earnings</div>
      <div style={{fontFamily:DS.font,fontSize:11,color:DS.color.onyx500,marginBottom:DS.space[3],lineHeight:1.45}}>Store-wide activity or your own commission — switch in one tap.</div>
      <div style={{display:"flex",gap:DS.space[2],marginBottom:DS.space[3]}}>
        {segBtn("store","Store transactions")}
        {segBtn("mine","My commission")}
      </div>

      {view==="mine"?(
        loadingMine?(
          <Card style={{padding:DS.space[4],display:"flex",alignItems:"center",gap:DS.space[2]}}>
            <Loader2 size={18} strokeWidth={ICON_STROKE} color={DS.color.onyx500} style={{animation:"mpos-spin 0.9s linear infinite"}} aria-hidden />
            <span style={{fontFamily:DS.font,fontSize:13,color:DS.color.onyx500}}>Loading…</span>
          </Card>
        ):mineRows.length===0?(
          <Card style={{padding:DS.space[4]}}>
            <div style={{fontFamily:DS.font,fontSize:13,color:DS.color.onyx500}}>No personal commission lines yet.</div>
          </Card>
        ):(
          <>
            <div style={{fontFamily:DS.font,fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2]}}>Your commission (not store total)</div>
            {mineRows.map(mineRow)}
          </>
        )
      ):(
        <>
          <Card style={{marginBottom:DS.space[3],padding:DS.space[3]}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:DS.space[2]}}>
              <div style={{fontFamily:DS.font,fontSize:11,fontWeight:600,color:DS.color.onyx500}}>Filters</div>
              <button type="button" className="abtn" onClick={resetFilters} style={{border:"none",background:"none",cursor:"pointer",fontFamily:DS.font,fontSize:11,fontWeight:600,color:a.primary,padding:DS.space[1]}}>
                Reset
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:DS.space[2]}}>
              <div>
                <div style={{fontFamily:DS.font,fontSize:10,fontWeight:600,color:DS.color.onyx500,marginBottom:4}}>Promoter</div>
                <select value={promoter} onChange={e=>setPromoter(e.target.value)} style={selStyle}>
                  {promoterOptions.map(p=><option key={p} value={p}>{p==="all"?"All staff":p}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontFamily:DS.font,fontSize:10,fontWeight:600,color:DS.color.onyx500,marginBottom:4}}>Date</div>
                <select value={datePreset} onChange={e=>setDatePreset(e.target.value)} style={selStyle}>
                  <option value="today">Today</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="all">All</option>
                </select>
              </div>
              <div>
                <div style={{fontFamily:DS.font,fontSize:10,fontWeight:600,color:DS.color.onyx500,marginBottom:4}}>Product</div>
                <select value={product} onChange={e=>setProduct(e.target.value)} style={selStyle}>
                  {productOptions.map(p=><option key={p} value={p}>{p==="all"?"All products":p}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontFamily:DS.font,fontSize:10,fontWeight:600,color:DS.color.onyx500,marginBottom:4}}>Status</div>
                <select value={status} onChange={e=>setStatus(e.target.value)} style={selStyle}>
                  <option value="all">All</option>
                  <option value="Available">Available</option>
                  <option value="Pending">Pending</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>
          </Card>
          {loadingStore?(
            <Card style={{padding:DS.space[4],display:"flex",alignItems:"center",gap:DS.space[2]}}>
              <Loader2 size={18} strokeWidth={ICON_STROKE} color={DS.color.onyx500} style={{animation:"mpos-spin 0.9s linear infinite"}} aria-hidden />
              <span style={{fontFamily:DS.font,fontSize:13,color:DS.color.onyx500}}>Loading store activity…</span>
            </Card>
          ):storeRows.length===0?(
            <Card style={{padding:DS.space[4]}}>
              <div style={{fontFamily:DS.font,fontSize:13,color:DS.color.onyx500}}>No transactions match these filters.</div>
            </Card>
          ):(
            <>
              <div style={{fontFamily:DS.font,fontSize:11,fontWeight:600,color:DS.color.onyx500,marginBottom:DS.space[2]}}>
                {storeRows.length} transaction{storeRows.length!==1?"s":""} · newest first
              </div>
              {storeRows.map(storeRow)}
            </>
          )}
        </>
      )}
    </>
  );
}

// ── Earnings ──────────────────────────────────────────────────────────────────
function EarningsScreen({config,kycSkipped,onNavigateToSell}){
  const navigate=useNavigate();
  const a=acc(config.domain);
  const isEV=config.domain==="EV";
  const isDealerView=isManagementPersona(config.persona);
  const [ingress,setIngress]=useState(null);
  const [ingressLoading,setIngressLoading]=useState(true);
  useEffect(()=>{
    let c=true;
    setIngressLoading(true);
    fetchEarningsIngressCard({
      domain:config.domain,
      isDealer:isDealerView,
    }).then(data=>{
      if(c) setIngress(data);
    }).finally(()=>{
      if(c) setIngressLoading(false);
    });
    return ()=>{ c=false; };
  },[config.domain,config.persona]);
  const available=isEV?"₹6,840":"₹3,290";
  const afterTds=isEV?"₹6,157":"₹2,961";
  const pendingAmt=isEV?"₹450":"₹88";
  return(
    <div style={{flex:1,overflowY:"auto",padding:DS.space[4]}}>
      {kycSkipped&&<AlertBanner type="warning" message="Complete KYC to withdraw. Commissions are accruing safely."/>}
      <Card style={{background:a.light,boxShadow:`inset 0 0 0 1.5px ${a.primary}33`,marginBottom:DS.space[4]}}>
        <div style={{fontFamily:DS.font,fontSize:11,fontWeight:600,color:DS.color.onyx500,letterSpacing:"0.2px"}}>Available to withdraw</div>
        <div className="counter" style={{fontFamily:DS.font,fontSize:40,fontWeight:700,color:DS.color.onyx800,margin:`${DS.space[2]}px 0 ${DS.space[3]}px`,lineHeight:1.1}}>{available}</div>
        <div style={{paddingTop:DS.space[3],borderTop:`1px solid ${DS.color.onyx300}`}}>
          <div style={{fontFamily:DS.font,fontSize:12,color:DS.color.onyx500,marginBottom:DS.space[2]}}>After TDS: <span className="counter" style={{fontWeight:600,color:DS.color.onyx600}}>{afterTds}</span></div>
          <div style={{fontFamily:DS.font,fontSize:12,color:DS.color.onyx500}}>Pending settlement: <span className="counter" style={{fontWeight:600,color:DS.color.onyx600}}>{pendingAmt}</span> <span style={{color:DS.color.onyx400}}>· processing</span></div>
        </div>
        <Btn variant={kycSkipped?"secondary":isEV?"primaryEV":"primary"} full style={{marginTop:DS.space[5]}} disabled={kycSkipped}>{kycSkipped?"Complete KYC to withdraw":"Withdraw now"}</Btn>
      </Card>
      <SchemeEarningsIngressCard config={config} navigate={navigate} ingress={ingress} loading={ingressLoading}/>
      {isDealerView?<DealerTransactionsSection config={config}/>:<PromoterTransactionsSection config={config} onNavigateToSell={onNavigateToSell}/>}
    </div>
  );
}

// ── Team ──────────────────────────────────────────────────────────────────────
function TeamScreen({config}){
  const a=acc(config.domain);
  const v=teamLeaderboardVariant(config.persona);
  const [top10Open,setTop10Open]=useState(false);
  const [postEmoji,setPostEmoji]=useState(()=>({}));
  const setReaction=(postId,emoji)=>{
    setPostEmoji(prev=>({...prev,[postId]:prev[postId]===emoji?null:emoji}));
  };
  return(
    <div style={{flex:1,overflowY:"auto",padding:DS.space[4],position:"relative"}}>
      <LeaderboardSection
        variant={v}
        domain={config.domain}
        cta={{label:"See top 10 performers →",onClick:()=>setTop10Open(true)}}
      />

      <div style={{fontFamily:DS.font,fontSize:13,fontWeight:600,color:DS.color.onyx700,marginBottom:DS.space[3],marginTop:DS.space[2]}}>Peers at this store</div>
      {TEAM_PEER_STORE.map((p,i)=>(
        <Card key={i} style={{marginBottom:DS.space[2],padding:`${DS.space[3]}px ${DS.space[4]}px`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:DS.space[3]}}>
            <div style={{display:"flex",alignItems:"center",gap:DS.space[3],minWidth:0}}>
              <div style={{width:40,height:40,borderRadius:DS.radius.pill,background:a.mid,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:600,color:a.primary,fontFamily:DS.font,flexShrink:0}}>{p.name.charAt(0)}</div>
              <div style={{minWidth:0}}>
                <div style={{fontFamily:DS.font,fontSize:13,fontWeight:600,color:DS.color.onyx800}}>{p.name}</div>
                <div style={{fontFamily:DS.font,fontSize:11,color:DS.color.onyx500,marginTop:2}}>{p.role} · {p.shift}</div>
              </div>
            </div>
            <Badge variant={p.status==="break"?"orange":"green"}>{p.status==="on-floor"?"On floor":p.status==="break"?"Break":"In office"}</Badge>
          </div>
        </Card>
      ))}

      <div style={{fontFamily:DS.font,fontSize:13,fontWeight:600,color:DS.color.onyx700,marginBottom:DS.space[3],marginTop:DS.space[5]}}>Brand manager</div>
      {BRAND_MANAGER_POSTS.map(post=>(
        <Card key={post.id} style={{marginBottom:DS.space[4],padding:0,overflow:"hidden"}}>
          <div style={{padding:`${DS.space[3]}px ${DS.space[4]}px`,borderBottom:`1px solid ${DS.color.onyx300}`,display:"flex",alignItems:"center",gap:DS.space[3]}}>
            <div style={{width:36,height:36,borderRadius:DS.radius.pill,background:DS.color.purple200,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:DS.color.purple700,fontFamily:DS.font}}>BM</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:DS.font,fontSize:12,fontWeight:600,color:DS.color.onyx800}}>{config.partner} · Brand manager</div>
              <div style={{fontFamily:DS.font,fontSize:11,color:DS.color.onyx400}}>{post.time}</div>
            </div>
          </div>
          <div style={{padding:DS.space[4]}}>
            <Badge variant={post.kind==="quote"?"blue":"purple"}>{post.kind==="quote"?"Quote":"Spotlight"}</Badge>
            <div style={{fontFamily:DS.font,fontSize:14,fontWeight:600,color:DS.color.onyx800,marginTop:DS.space[2],marginBottom:6}}>{post.title}</div>
            <div style={{fontFamily:DS.font,fontSize:13,color:DS.color.onyx600,lineHeight:1.5}}>{post.body}</div>
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:6,marginTop:DS.space[4],paddingTop:DS.space[3],borderTop:`1px solid ${DS.color.onyx300}`}}>
              {BRAND_FEED_EMOJIS.map(em=>(
                <button
                  key={em}
                  type="button"
                  className="abtn"
                  aria-label={`React ${em}`}
                  aria-pressed={postEmoji[post.id]===em}
                  onClick={()=>setReaction(post.id,em)}
                  style={{
                    fontSize:20,
                    lineHeight:1,
                    padding:"4px 8px",
                    borderRadius:DS.radius.pill,
                    border:postEmoji[post.id]===em?`1.5px solid ${a.primary}`:`1px solid ${DS.color.onyx300}`,
                    background:postEmoji[post.id]===em?a.light:DS.color.onyx100,
                    cursor:"pointer",
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        </Card>
      ))}

      {top10Open&&(
        <div style={{position:"absolute",inset:0,zIndex:20,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-top10-title"
            style={{
              width:"100%",
              maxHeight:"85%",
              background:DS.color.onyx100,
              borderTopLeftRadius:DS.radius.xl,
              borderTopRightRadius:DS.radius.xl,
              boxShadow:"0 -8px 32px rgba(0,0,0,0.2)",
              display:"flex",
              flexDirection:"column",
              overflow:"hidden",
            }}
          >
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:`${DS.space[3]}px ${DS.space[4]}px`,borderBottom:`1px solid ${DS.color.onyx300}`}}>
              <div id="team-top10-title" style={{fontFamily:DS.font,fontSize:16,fontWeight:600,color:DS.color.onyx800}}>Top 10 performers</div>
              <button type="button" className="abtn" onClick={()=>setTop10Open(false)} aria-label="Close" style={{border:"none",background:DS.color.onyx200,width:32,height:32,borderRadius:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <X size={18} strokeWidth={ICON_STROKE} color={DS.color.onyx600} aria-hidden />
              </button>
            </div>
            <div style={{overflowY:"auto",padding:DS.space[4],WebkitOverflowScrolling:"touch"}}>
              {TEAM_TOP_10_ROWS.map(row=>(
                <div
                  key={row.rank}
                  style={{
                    display:"flex",
                    alignItems:"center",
                    gap:DS.space[3],
                    padding:`${DS.space[3]}px 0`,
                    borderBottom:row.rank<10?`1px solid ${DS.color.onyx300}`:"none",
                  }}
                >
                  <span className="counter" style={{fontFamily:DS.font,fontSize:14,fontWeight:700,color:DS.color.onyx400,width:24}}>{row.rank}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:DS.font,fontSize:14,fontWeight:600,color:DS.color.onyx800}}>{row.name}</div>
                    <div style={{fontFamily:DS.font,fontSize:11,color:DS.color.onyx500,marginTop:2}}>{row.detail}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{padding:DS.space[4],borderTop:`1px solid ${DS.color.onyx300}`}}>
              <Btn variant={config.domain==="EV"?"primaryEV":"primary"} full onClick={()=>setTop10Open(false)}>Done</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── More ──────────────────────────────────────────────────────────────────────
function MoreScreen({config,kycSkipped,withdrawalStatus,onDismissWithdrawal}){
  const a=acc(config.domain);
  return(
    <div style={{flex:1,overflowY:"auto",padding:DS.space[4]}}>
      <div style={{display:"flex",alignItems:"center",gap:DS.space[4],marginBottom:DS.space[5]}}>
        <div style={{position:"relative"}}>
          <div style={{width:52,height:52,borderRadius:26,background:a.mid,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:600,color:a.primary,fontFamily:DS.font}}>A</div>
          {withdrawalStatus&&(
            <span style={{position:"absolute",top:0,right:0,width:12,height:12,borderRadius:6,background:DS.color.orange500,border:"2px solid #fff",boxSizing:"border-box"}} aria-hidden />
          )}
        </div>
        <div>
          <div style={{fontFamily:DS.font,fontSize:16,fontWeight:600,color:DS.color.onyx800}}>Arjun Sharma</div>
          <div style={{fontFamily:DS.font,fontSize:12,color:DS.color.onyx500,marginTop:2}}>{config.persona} · {config.partner}</div>
          {kycSkipped&&<Badge variant="orange" dot>KYC pending</Badge>}
        </div>
      </div>
      {withdrawalStatus&&(
        <Card style={{marginBottom:DS.space[4],padding:DS.space[4],background:DS.color.blue100,border:`1px solid ${DS.color.blue200}`,borderRadius:DS.radius.xl}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:DS.space[3],marginBottom:DS.space[2]}}>
            <div style={{display:"flex",alignItems:"center",gap:DS.space[2],flexWrap:"wrap"}}>
              <Badge variant="orange" dot>Processing</Badge>
              <span style={{fontFamily:DS.font,fontSize:14,fontWeight:700,color:DS.color.onyx800}}>Withdrawal</span>
            </div>
            <button type="button" className="abtn" onClick={onDismissWithdrawal} style={{border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:600,color:DS.color.onyx400,fontFamily:DS.font,flexShrink:0}}>
              Dismiss
            </button>
          </div>
          <div className="counter" style={{fontSize:22,fontWeight:700,color:DS.color.onyx800,marginBottom:4,fontFamily:DS.font}}>₹{withdrawalStatus.amountRupees.toLocaleString("en-IN")}</div>
          <div style={{fontSize:12,color:DS.color.onyx600,marginBottom:DS.space[2],fontFamily:DS.font}}>Ref {withdrawalStatus.ref}</div>
          <div style={{fontSize:12,color:DS.color.onyx500,lineHeight:1.45,fontFamily:DS.font}}>
            ETA: <strong>{withdrawalStatus.etaShort}</strong> · {withdrawalStatus.etaDetail}
          </div>
        </Card>
      )}
      {[["Complete KYC",kycSkipped],["My profile",false],["Help & feature tour",false],["Commission disputes",false],["GST / TDS certificates",false],["App settings",false],["Log out",false]].map(([label,isAlert])=>(
        <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:`${DS.space[4]}px 0`,borderBottom:`1px solid ${DS.color.onyx300}`,cursor:"pointer"}}>
          <span style={{fontFamily:DS.font,fontSize:14,fontWeight:isAlert?600:400,color:label==="Log out"?DS.color.cerise600:isAlert?DS.color.orange700:DS.color.onyx800}}>{label}</span>
          <span style={{color:DS.color.onyx300,fontSize:16}}>›</span>
        </div>
      ))}
    </div>
  );
}

// ── Phone Frame ───────────────────────────────────────────────────────────────
function PhoneFrame({config,activeTab,onNavTab,frameWidth=360,kycSkipped,setKycSkipped,onboardingDone,setOnboardingDone,promoterLoggedIn,setPromoterLoggedIn,promoterFirstLoginComplete,setPromoterFirstLoginComplete,dealerLoggedIn,setDealerLoggedIn,dealerFirstLoginComplete,setDealerFirstLoginComplete,withdrawalStatus,setWithdrawalStatus}){
  const a=acc(config.domain);
  const navigate=useNavigate();
  const location=useLocation();
  const pathNorm=location.pathname.replace(/\/$/,"")||"/";
  const isSchemesListRoute=pathNorm==="/schemes";
  const isSchemesDetailRoute=/^\/schemes\/[^/]+$/.test(pathNorm);
  const isSchemesRoute=isSchemesListRoute||isSchemesDetailRoute;
  const [profileOpen,setProfileOpen]=useState(false);
  const [schemeFilterSheetOpen,setSchemeFilterSheetOpen]=useState(false);
  useEffect(()=>{
    if(!isSchemesRoute) setSchemeFilterSheetOpen(false);
  },[isSchemesRoute]);
  const [trackClaimOpen,setTrackClaimOpen]=useState(false);
  const [claimFilingOpen,setClaimFilingOpen]=useState(false);
  const [policyFinderOpen,setPolicyFinderOpen]=useState(false);
  const [claimPrefill,setClaimPrefill]=useState(null);
  const isPromoterNewUser=config.persona==="Promoter"&&config.userState==="New user";
  const isDealerNewUser=config.persona==="Dealer"&&config.userState==="New user";
  const showDealerAuth=isDealerNewUser&&!dealerLoggedIn;
  const showDealerFirstLogin=isDealerNewUser&&dealerLoggedIn&&!dealerFirstLoginComplete;
  const showDealerSetup=showDealerAuth||showDealerFirstLogin;
  const showPromoterAuth=isPromoterNewUser&&!promoterLoggedIn;
  const showPromoterFirstLogin=isPromoterNewUser&&promoterLoggedIn&&!promoterFirstLoginComplete;
  const showPromoterSetup=showPromoterAuth||showPromoterFirstLogin;
  const showLegacyOnboarding=!onboardingDone&&config.userState==="New user"&&!isPromoterNewUser&&!isDealerNewUser;
  const showOnboarding=showLegacyOnboarding;
  const showPersonaFirstRunSetup=showDealerSetup||showPromoterSetup;
  const workflowFullBleed=activeTab==="sell"||trackClaimOpen||claimFilingOpen||policyFinderOpen||isSchemesDetailRoute;
  const showStandardDashboardHeader=!showOnboarding&&!showPersonaFirstRunSetup&&!workflowFullBleed&&!isSchemesListRoute&&!profileOpen;
  const showAccountHeader=!showOnboarding&&!showPersonaFirstRunSetup&&profileOpen;
  const showSchemesDetailHeader=!showOnboarding&&!showPersonaFirstRunSetup&&isSchemesDetailRoute&&!profileOpen;
  const showSchemesListHeader=!showOnboarding&&!showPersonaFirstRunSetup&&isSchemesListRoute&&!profileOpen;
  const screenTitle={home:config.persona==="Promoter"?"Dashboard":"Good morning, Arjun",sell:"New sale",earnings:"My earnings",team:"Team"};
  return(
    <div style={{width:frameWidth,flexShrink:0,background:DS.color.onyx100,borderRadius:40,border:"8px solid #252525",overflow:"hidden",display:"flex",flexDirection:"column",height:700,boxShadow:"0 24px 80px rgba(0,0,0,0.65)"}}>
      <div style={{background:a.primary,padding:`10px ${DS.space[5]}px 8px`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:DS.font,fontSize:12,fontWeight:500,color:"#fff"}}>9:41</span>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <Badge variant={config.domain==="EV"?"green":"purple"}>{config.domain}</Badge>
          <PartnerLogo key={config.partner} partner={config.partner} size={22} style={{background:"rgba(255,255,255,0.96)",borderColor:"rgba(255,255,255,0.45)"}} />
          <span style={{fontFamily:DS.font,fontSize:11,color:"rgba(255,255,255,0.9)",maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{config.partner}</span>
        </div>
        <span style={{fontFamily:DS.font,fontSize:12,fontWeight:500,color:"#fff"}}>100%</span>
      </div>
      {showAccountHeader&&(
        <div style={{padding:`${DS.space[3]}px ${DS.space[4]}px`,borderBottom:`1px solid ${DS.color.onyx300}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:DS.space[3]}}>
          <div style={{display:"flex",alignItems:"center",gap:DS.space[3],minWidth:0,flex:1}}>
            <PartnerLogo key={config.partner} partner={config.partner} size={40} />
            <div style={{minWidth:0}}>
              <div style={{fontFamily:DS.font,fontSize:15,fontWeight:600,color:DS.color.onyx800}}>Account</div>
              <div style={{fontFamily:DS.font,fontSize:11,color:DS.color.onyx400,marginTop:1}}>{config.persona} · {config.partner}</div>
            </div>
          </div>
          <div style={{position:"relative",flexShrink:0}}>
            <button
              type="button"
              aria-label="Close account"
              aria-expanded
              onClick={()=>setProfileOpen(false)}
              className="abtn"
              style={{
                width:36,
                height:36,
                borderRadius:18,
                background:a.mid,
                border:`2px solid ${a.primary}`,
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                fontSize:13,
                fontWeight:600,
                color:a.primary,
                fontFamily:DS.font,
                cursor:"pointer",
                padding:0,
                boxSizing:"border-box",
              }}
            >
              A
            </button>
            {withdrawalStatus&&(
              <span
                title="Withdrawal update"
                style={{
                  position:"absolute",
                  top:-1,
                  right:-1,
                  width:10,
                  height:10,
                  borderRadius:5,
                  background:DS.color.orange500,
                  border:"2px solid #fff",
                  boxSizing:"border-box",
                }}
                aria-hidden
              />
            )}
          </div>
        </div>
      )}
      {showSchemesDetailHeader&&(
        <div
          style={{
            padding:`${DS.space[3]}px ${DS.space[4]}px`,
            borderBottom:`1px solid ${DS.color.onyx300}`,
            display:"flex",
            alignItems:"center",
            gap:DS.space[2],
            background:DS.color.onyx100,
            flexShrink:0,
          }}
        >
          <button
            type="button"
            className="abtn"
            onClick={()=>navigate("/schemes")}
            style={{
              border:"none",
              background:"none",
              cursor:"pointer",
              padding:`${DS.space[2]}px`,
              display:"flex",
              alignItems:"center",
              gap:6,
              flexShrink:0,
              fontFamily:DS.font,
              fontSize:15,
              fontWeight:600,
              color:DS.color.onyx800,
            }}
            aria-label="Back to schemes list"
          >
            <ArrowLeft size={22} strokeWidth={ICON_STROKE} color={DS.color.onyx800}/>
            Back
          </button>
          <div style={{flex:1,minWidth:0,textAlign:"center"}}>
            <div style={{fontFamily:DS.font,fontSize:15,fontWeight:600,color:DS.color.onyx800}}>Scheme</div>
          </div>
          <div style={{width:72,flexShrink:0}} aria-hidden />
        </div>
      )}
      {showSchemesListHeader&&(
        <div style={{padding:`${DS.space[3]}px ${DS.space[4]}px`,borderBottom:`1px solid ${DS.color.onyx300}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:DS.space[3]}}>
          <button
            type="button"
            className="abtn"
            onClick={()=>{ navigate("/"); onNavTab(getSchemesEntryTab()); }}
            style={{
              border:"none",
              background:"none",
              cursor:"pointer",
              padding:`${DS.space[2]}px`,
              display:"flex",
              alignItems:"center",
              gap:6,
              flexShrink:0,
              fontFamily:DS.font,
              fontSize:15,
              fontWeight:600,
              color:DS.color.onyx800,
            }}
            aria-label="Back to previous tab"
          >
            <ArrowLeft size={22} strokeWidth={ICON_STROKE} color={DS.color.onyx800}/>
            Back
          </button>
          <div style={{flex:1,minWidth:0,textAlign:"center"}}>
            <div style={{fontFamily:DS.font,fontSize:15,fontWeight:500,color:DS.color.onyx800}}>Schemes</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:DS.space[2],flexShrink:0}}>
            <button
              type="button"
              className="abtn"
              aria-label="Filter schemes"
              onClick={()=>setSchemeFilterSheetOpen(true)}
              style={{
                width:36,
                height:36,
                borderRadius:18,
                border:"none",
                background:a.mid,
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                cursor:"pointer",
                padding:0,
              }}
            >
              <Filter size={20} strokeWidth={ICON_STROKE} color={a.primary} aria-hidden />
            </button>
            <div style={{position:"relative"}}>
              <button
                type="button"
                aria-label="Open account"
                aria-expanded={false}
                onClick={()=>setProfileOpen(true)}
                className="abtn"
                style={{
                  width:36,
                  height:36,
                  borderRadius:18,
                  background:a.mid,
                  border:"none",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  fontSize:13,
                  fontWeight:600,
                  color:a.primary,
                  fontFamily:DS.font,
                  cursor:"pointer",
                  padding:0,
                  boxSizing:"border-box",
                }}
              >
                A
              </button>
              {withdrawalStatus&&(
                <span
                  title="Withdrawal update"
                  style={{
                    position:"absolute",
                    top:-1,
                    right:-1,
                    width:10,
                    height:10,
                    borderRadius:5,
                    background:DS.color.orange500,
                    border:"2px solid #fff",
                    boxSizing:"border-box",
                  }}
                  aria-hidden
                />
              )}
            </div>
          </div>
        </div>
      )}
      {showStandardDashboardHeader&&(
        <div style={{padding:`${DS.space[3]}px ${DS.space[4]}px`,borderBottom:`1px solid ${DS.color.onyx300}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:DS.space[3]}}>
          <div style={{display:"flex",alignItems:"center",gap:DS.space[3],minWidth:0,flex:1}}>
            <PartnerLogo key={config.partner} partner={config.partner} size={40} />
            <div style={{minWidth:0}}>
              <div style={{fontFamily:DS.font,fontSize:15,fontWeight:600,color:DS.color.onyx800}}>{screenTitle[activeTab]||"mPOS"}</div>
              <div style={{fontFamily:DS.font,fontSize:11,color:DS.color.onyx400,marginTop:1}}>{config.persona} · {config.partner}</div>
            </div>
          </div>
          <div style={{position:"relative",flexShrink:0}}>
            <button
              type="button"
              aria-label="Open account"
              aria-expanded={false}
              onClick={()=>setProfileOpen(true)}
              className="abtn"
              style={{
                width:36,
                height:36,
                borderRadius:18,
                background:a.mid,
                border:"none",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                fontSize:13,
                fontWeight:600,
                color:a.primary,
                fontFamily:DS.font,
                cursor:"pointer",
                padding:0,
                boxSizing:"border-box",
              }}
            >
              A
            </button>
            {withdrawalStatus&&(
              <span
                title="Withdrawal update"
                style={{
                  position:"absolute",
                  top:-1,
                  right:-1,
                  width:10,
                  height:10,
                  borderRadius:5,
                  background:DS.color.orange500,
                  border:"2px solid #fff",
                  boxSizing:"border-box",
                }}
                aria-hidden
              />
            )}
          </div>
        </div>
      )}
      <div style={{flex:1,minHeight:0,display:"flex",flexDirection:"column",position:"relative"}}>
        {showDealerAuth
          ?<PromoterAuthFlow config={config} domain={config.domain} onDone={()=>setDealerLoggedIn(true)}/>
          :showDealerFirstLogin
          ?<DealerFirstLoginOnboarding config={config} domain={config.domain} onDone={()=>{setDealerFirstLoginComplete(true);setOnboardingDone(true);}}/>
          :showPromoterAuth
          ?<PromoterAuthFlow config={config} domain={config.domain} onDone={()=>setPromoterLoggedIn(true)}/>
          :showPromoterFirstLogin
          ?<PromoterFirstLoginOnboarding config={config} domain={config.domain} onDone={()=>{setPromoterFirstLoginComplete(true);setOnboardingDone(true);}}/>
          :showOnboarding
          ?<OnboardingScreen config={config} kycSkipped={kycSkipped} setKycSkipped={setKycSkipped} onComplete={()=>setOnboardingDone(true)}/>
          :profileOpen
          ?<MoreScreen config={config} kycSkipped={kycSkipped} withdrawalStatus={withdrawalStatus} onDismissWithdrawal={()=>setWithdrawalStatus(null)}/>
          :isSchemesRoute
          ?<SchemesFlow
              config={config}
              onExit={()=>navigate("/")}
              filterSheetOpen={schemeFilterSheetOpen}
              onFilterOpen={()=>setSchemeFilterSheetOpen(true)}
              onFilterClose={()=>setSchemeFilterSheetOpen(false)}
            />
          :activeTab==="home"     ?<HomeScreen config={config} kycSkipped={kycSkipped} onNav={id=>{setProfileOpen(false);onNavTab(id);}} onWithdrawalComplete={setWithdrawalStatus} trackClaimOpen={trackClaimOpen} setTrackClaimOpen={setTrackClaimOpen} claimFilingOpen={claimFilingOpen} setClaimFilingOpen={setClaimFilingOpen} policyFinderOpen={policyFinderOpen} setPolicyFinderOpen={setPolicyFinderOpen} claimPrefill={claimPrefill} setClaimPrefill={setClaimPrefill}/>
          :activeTab==="sell"     ?<SellScreen config={config} onBack={()=>{onNavTab("home");}}/>
          :activeTab==="earnings" ?<EarningsScreen config={config} kycSkipped={kycSkipped} onNavigateToSell={()=>{ setProfileOpen(false); onNavTab("sell"); }}/>
          :<TeamScreen config={config}/>
        }
      </div>
      {!showOnboarding&&!showPersonaFirstRunSetup&&!workflowFullBleed&&<NavBar active={isSchemesListRoute?null:activeTab} onNav={id=>{setProfileOpen(false);onNavTab(id);}} domain={config.domain}/>}
    </div>
  );
}

// ── Control Panel ─────────────────────────────────────────────────────────────
function ControlPanel({
  controlStep,
  draftBasic,
  onDraftBasicChange,
  simulatedConfig,
  onSimulatedContextChange,
  onSimulate,
  onBackStep2,
  deviceMode,
  onDeviceModeChange,
}){
  const Sel=({label,field,value,options,onChange})=>(
    <div style={{marginBottom:DS.space[4]}}>
      <div style={{fontFamily:DS.font,fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.5)",marginBottom:DS.space[2],letterSpacing:"0.2px"}}>{label}</div>
      <div style={{position:"relative"}}>
        <select value={value} onChange={e=>onChange(field,e.target.value)} style={{width:"100%",height:40,padding:`0 ${DS.space[4]}px`,paddingRight:36,border:"1px solid rgba(255,255,255,0.14)",borderRadius:DS.radius.lg,fontFamily:DS.font,fontSize:13,color:"rgba(255,255,255,0.92)",background:"#1a1a1a",cursor:"pointer",appearance:"none"}}>
          {options.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
        <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"rgba(255,255,255,0.4)",fontSize:10}}>▾</span>
      </div>
    </div>
  );
  const useCaseOptionsStep2=getUseCaseOptionsForConfig({
    domain:simulatedConfig.domain,
    partner:simulatedConfig.partner,
    persona:simulatedConfig.persona,
    userState:simulatedConfig.userState,
  });
  const errorOptionsStep2=getErrorOptionsForConfig(simulatedConfig);
  return(
    <div style={{width:228,flexShrink:0,background:"#141414",border:"1px solid rgba(255,255,255,0.1)",borderRadius:DS.radius.xl,padding:DS.space[4],overflowY:"auto",height:700,boxSizing:"border-box"}}>
      <div style={{fontFamily:DS.font,fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.95)",marginBottom:DS.space[1]}}>Simulator controls</div>
      <div style={{marginBottom:DS.space[4]}}>
        <div style={{fontFamily:DS.font,fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.5)",marginBottom:DS.space[2],letterSpacing:"0.2px"}}>Device</div>
        <div style={{display:"flex",borderRadius:DS.radius.lg,border:"1px solid rgba(255,255,255,0.14)",overflow:"hidden"}}>
          <button
            type="button"
            className="abtn"
            onClick={()=>onDeviceModeChange("mobile")}
            style={{
              flex:1,
              padding:`${DS.space[2]}px ${DS.space[3]}px`,
              border:"none",
              fontFamily:DS.font,
              fontSize:12,
              fontWeight:600,
              cursor:"pointer",
              touchAction:"manipulation",
              background:deviceMode==="mobile"?"rgba(147,111,243,0.35)":"transparent",
              color:deviceMode==="mobile"?"#fff":"rgba(255,255,255,0.55)",
            }}
          >
            Mobile · 360px
          </button>
          <button
            type="button"
            className="abtn"
            onClick={()=>onDeviceModeChange("tablet")}
            style={{
              flex:1,
              padding:`${DS.space[2]}px ${DS.space[3]}px`,
              border:"none",
              borderLeft:"1px solid rgba(255,255,255,0.1)",
              fontFamily:DS.font,
              fontSize:12,
              fontWeight:600,
              cursor:"pointer",
              touchAction:"manipulation",
              background:deviceMode==="tablet"?"rgba(147,111,243,0.35)":"transparent",
              color:deviceMode==="tablet"?"#fff":"rgba(255,255,255,0.55)",
            }}
          >
            Tablet · 1024px
          </button>
        </div>
      </div>
      {controlStep===1?(
        <>
          <div style={{fontFamily:DS.font,fontSize:11,fontWeight:600,color:DS.color.purple400,marginBottom:DS.space[2]}}>Step 1 · Basic</div>
          <div style={{fontFamily:DS.font,fontSize:11,color:"rgba(255,255,255,0.45)",marginBottom:DS.space[4],lineHeight:1.45}}>Set domain, partner, persona, and user state. The phone updates only after you simulate.</div>
          <Sel label="Domain" field="domain" value={draftBasic.domain} options={["Electronics","EV"]} onChange={onDraftBasicChange}/>
          <Sel label="Partner" field="partner" value={draftBasic.partner} options={PARTNERS[draftBasic.domain]||PARTNERS.Electronics} onChange={onDraftBasicChange}/>
          <Sel label="Persona" field="persona" value={draftBasic.persona} options={PERSONAS} onChange={onDraftBasicChange}/>
          <Sel label="User state" field="userState" value={draftBasic.userState} options={USER_STATES} onChange={onDraftBasicChange}/>
          <button
            type="button"
            className="abtn"
            onClick={onSimulate}
            style={{
              width:"100%",
              marginTop:DS.space[2],
              padding:`${DS.space[3]}px ${DS.space[4]}px`,
              borderRadius:DS.radius.lg,
              border:"none",
              background:DS.color.purple600,
              color:"#fff",
              fontFamily:DS.font,
              fontSize:13,
              fontWeight:600,
              cursor:"pointer",
              touchAction:"manipulation",
            }}
          >
            Simulate
          </button>
        </>
      ):(
        <>
          <button
            type="button"
            className="abtn"
            onClick={onBackStep2}
            style={{
              display:"flex",
              alignItems:"center",
              gap:6,
              padding:0,
              marginBottom:DS.space[3],
              border:"none",
              background:"none",
              cursor:"pointer",
              fontFamily:DS.font,
              fontSize:12,
              fontWeight:600,
              color:DS.color.purple400,
              touchAction:"manipulation",
            }}
          >
            <ArrowLeft size={16} strokeWidth={ICON_STROKE} aria-hidden /> Back to basic
          </button>
          <div style={{fontFamily:DS.font,fontSize:11,fontWeight:600,color:DS.color.purple400,marginBottom:DS.space[2]}}>Step 2 · Context</div>
          <div style={{fontFamily:DS.font,fontSize:11,color:"rgba(255,255,255,0.45)",marginBottom:DS.space[4],lineHeight:1.45}}>Use case and error apply to the running simulation.</div>
          <div style={{height:1,background:"rgba(255,255,255,0.1)",marginBottom:DS.space[4]}}/>
          <div style={{fontFamily:DS.font,fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.5)",letterSpacing:"0.2px",marginBottom:DS.space[3]}}>Active config</div>
          {[["Domain",simulatedConfig.domain],["Partner",simulatedConfig.partner],["Persona",simulatedConfig.persona],["User state",simulatedConfig.userState],["Use case",simulatedConfig.useCase],["Error",simulatedConfig.error]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:`${DS.space[2]}px 0`,borderBottom:"1px solid rgba(255,255,255,0.08)",fontFamily:DS.font}}>
              <span style={{color:"rgba(255,255,255,0.4)"}}>{k}</span>
              <span style={{fontWeight:500,color:"rgba(255,255,255,0.88)",textAlign:"right",marginLeft:8}}>{v}</span>
            </div>
          ))}
          <div style={{height:1,background:"rgba(255,255,255,0.1)",margin:`${DS.space[4]}px 0`}}/>
          <Sel label="Use case" field="useCase" value={simulatedConfig.useCase} options={useCaseOptionsStep2} onChange={onSimulatedContextChange}/>
          <Sel label="Error state" field="error" value={simulatedConfig.error} options={errorOptionsStep2} onChange={onSimulatedContextChange}/>
        </>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function MPOSSimulator(){
  const navigate=useNavigate();
  const location=useLocation();
  const initialSimulated={domain:"Electronics",partner:"Xiaomi",persona:"Promoter",userState:"Returning",useCase:"Onboarding",error:"None (happy path)"};
  const [simulatedConfig,setSimulatedConfig]=useState(initialSimulated);
  const [draftBasic,setDraftBasic]=useState(()=>coerceBasicFields({
    domain:initialSimulated.domain,
    partner:initialSimulated.partner,
    persona:initialSimulated.persona,
    userState:initialSimulated.userState,
  }));
  const [controlStep,setControlStep]=useState(1);
  const [activeTab,setActiveTab]=useState("home");
  const [kycSkipped,setKycSkipped]=useState(false);
  const [onboardingDone,setOnboardingDone]=useState(true);
  const [promoterLoggedIn,setPromoterLoggedIn]=useState(true);
  const [promoterFirstLoginComplete,setPromoterFirstLoginComplete]=useState(true);
  const [dealerLoggedIn,setDealerLoggedIn]=useState(true);
  const [dealerFirstLoginComplete,setDealerFirstLoginComplete]=useState(true);
  const [withdrawalStatus,setWithdrawalStatus]=useState(null);
  const [deviceMode,setDeviceMode]=useState("mobile");
  const frameWidth=deviceMode==="tablet"?1024:360;

  useEffect(()=>{
    const tabMap={"Sell":"sell","File claim":"sell","Check earnings":"earnings","Manage team":"team","Onboarding":"home"};
    if(tabMap[simulatedConfig.useCase]) setActiveTab(tabMap[simulatedConfig.useCase]);
    if(simulatedConfig.persona!=="Promoter"){
      setPromoterLoggedIn(true);
      setPromoterFirstLoginComplete(true);
    }
    if(simulatedConfig.persona!=="Dealer"){
      setDealerLoggedIn(true);
      setDealerFirstLoginComplete(true);
    }
    if(simulatedConfig.userState==="New user"){
      setOnboardingDone(false);
      setKycSkipped(false);
      if(simulatedConfig.persona==="Promoter"){
        setPromoterLoggedIn(false);
        setPromoterFirstLoginComplete(false);
      }
      if(simulatedConfig.persona==="Dealer"){
        setDealerLoggedIn(false);
        setDealerFirstLoginComplete(false);
      }
    }
    if(simulatedConfig.userState==="KYC skipped") {setOnboardingDone(true); setKycSkipped(true);}
    if(simulatedConfig.userState==="Returning"){
      setOnboardingDone(true);
      setKycSkipped(false);
      if(simulatedConfig.persona==="Promoter"){
        setPromoterLoggedIn(true);
        setPromoterFirstLoginComplete(true);
      }
      if(simulatedConfig.persona==="Dealer"){
        setDealerLoggedIn(true);
        setDealerFirstLoginComplete(true);
      }
    }
  },[simulatedConfig.useCase,simulatedConfig.userState,simulatedConfig.domain,simulatedConfig.persona]);

  const handleDraftBasicChange=(field,value)=>{
    setDraftBasic((prev)=>{
      const next={...prev,[field]:value};
      return coerceBasicFields(next);
    });
  };

  const handleSimulate=()=>{
    const base=coerceBasicFields(draftBasic);
    setSimulatedConfig((prev)=>{
      const next={...prev,...base};
      const ucOpts=getUseCaseOptionsForConfig(next);
      next.useCase=pickFirstValid(prev.useCase,ucOpts);
      const errOpts=getErrorOptionsForConfig(next);
      next.error=pickFirstValid(prev.error,errOpts);
      return next;
    });
    setControlStep(2);
  };

  const handleBackToBasic=()=>{
    setDraftBasic(coerceBasicFields({
      domain:simulatedConfig.domain,
      partner:simulatedConfig.partner,
      persona:simulatedConfig.persona,
      userState:simulatedConfig.userState,
    }));
    setControlStep(1);
  };

  const handleSimulatedContextChange=(field,value)=>{
    setSimulatedConfig((c)=>{
      const next={...c,[field]:value};
      if(field==="useCase"){
        const errs=getErrorOptionsForConfig(next);
        if(!errs.includes(next.error)) next.error=errs[0];
      }
      return next;
    });
  };

  const handleNavTab=(id)=>{
    setActiveTab(id);
    if(location.pathname.startsWith("/schemes")) navigate("/",{replace:true});
  };

  return(
    <>
      <style>{fontCSS}</style>
      <div style={{display:"flex",gap:DS.space[6],padding:DS.space[6],alignItems:"flex-start",justifyContent:"flex-start",background:"#0a0a0a",minHeight:"100vh",width:"100%",overflowX:"auto",fontFamily:DS.font,boxSizing:"border-box"}}>
        <ControlPanel
          controlStep={controlStep}
          draftBasic={draftBasic}
          onDraftBasicChange={handleDraftBasicChange}
          simulatedConfig={simulatedConfig}
          onSimulatedContextChange={handleSimulatedContextChange}
          onSimulate={handleSimulate}
          onBackStep2={handleBackToBasic}
          deviceMode={deviceMode}
          onDeviceModeChange={setDeviceMode}
        />
        <PhoneFrame
          config={simulatedConfig}
          activeTab={activeTab}
          onNavTab={handleNavTab}
          frameWidth={frameWidth}
          kycSkipped={kycSkipped}
          setKycSkipped={setKycSkipped}
          onboardingDone={onboardingDone}
          setOnboardingDone={setOnboardingDone}
          promoterLoggedIn={promoterLoggedIn}
          setPromoterLoggedIn={setPromoterLoggedIn}
          promoterFirstLoginComplete={promoterFirstLoginComplete}
          setPromoterFirstLoginComplete={setPromoterFirstLoginComplete}
          dealerLoggedIn={dealerLoggedIn}
          setDealerLoggedIn={setDealerLoggedIn}
          dealerFirstLoginComplete={dealerFirstLoginComplete}
          setDealerFirstLoginComplete={setDealerFirstLoginComplete}
          withdrawalStatus={withdrawalStatus}
          setWithdrawalStatus={setWithdrawalStatus}
        />
      </div>
    </>
  );
}
