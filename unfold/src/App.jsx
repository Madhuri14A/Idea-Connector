
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { classifyWish } from "./utils/gemini";

const T = {
  pearl:      "#F7F3EE",
  pearlDeep:  "#EDE6DC",
  parchment:  "#E8D8B8",
  parchDark:  "#C4A878",
  sage:       "#7A9E87",
  sageMid:    "#A8C4B0",
  sageLight:  "#D4E6DA",
  rose:       "#C4818A",
  roseMid:    "#DDA8B0",
  roseLight:  "#F2DDE0",
  ink:        "#2C2420",
  inkMid:     "#6B5C56",
  inkLight:   "#A0908A",
  gold:       "#C8A96E",
  goldLight:  "#E8CC90",
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Lato:wght@300;400&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{background:${T.pearl};min-height:100vh;font-family:'Lato',sans-serif;color:${T.ink};-webkit-font-smoothing:antialiased;}
    textarea:focus,input:focus{outline:none;}
    button{cursor:pointer;border:none;background:none;}
    ::selection{background:${T.roseLight};color:${T.ink};}

    @keyframes petalDrift{
      0%{transform:translateY(-20px) rotate(0deg);opacity:0;}
      10%{opacity:0.5;}90%{opacity:0.25;}
      100%{transform:translateY(110vh) rotate(380deg);opacity:0;}
    }
    .petal{position:fixed;pointer-events:none;border-radius:50% 0 50% 0;animation:petalDrift linear infinite;z-index:0;}

    @keyframes breathe{
      0%,100%{transform:scale(1);opacity:0.13;}
      50%{transform:scale(1.07);opacity:0.22;}
    }

    @keyframes starTwinkle{
      0%,100%{opacity:0;transform:scale(0);}
      40%,60%{opacity:1;transform:scale(1);}
    }
    .star{position:absolute;border-radius:50%;animation:starTwinkle ease-in-out infinite;}

    /* ── INK BLEED: lines blur in from nothing, settle like wet ink drying ── */
    @keyframes inkSettle{
      0%  {opacity:0;filter:blur(14px) brightness(1.4);transform:scaleX(1.04) translateY(3px);}
      35% {opacity:0.7;filter:blur(4px) brightness(1.1);transform:scaleX(1.01) translateY(1px);}
      100%{opacity:1;filter:blur(0px) brightness(1);transform:scaleX(1) translateY(0);}
    }
    .ink-line{animation:inkSettle 1.3s cubic-bezier(0.0,0.0,0.2,1.0) forwards;opacity:0;}

    /* ── GOLD DUST: each char drops in with golden glow that fades ── */
    @keyframes goldDrop{
      0%  {opacity:0;transform:translateY(-18px);color:${T.goldLight};text-shadow:0 0 18px rgba(200,169,110,1),0 0 36px rgba(200,169,110,0.7);}
      45% {opacity:1;transform:translateY(2px);color:${T.goldLight};text-shadow:0 0 10px rgba(200,169,110,0.8);}
      100%{opacity:1;transform:translateY(0);color:inherit;text-shadow:none;}
    }
    .gold-line{animation:goldDrop 0.85s cubic-bezier(0.16,1,0.3,1) forwards;opacity:0;}

    /* ── CURSOR ── */
    @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
    .cursor{display:inline-block;width:1.5px;height:1.05em;background:${T.rose};margin-left:2px;vertical-align:text-bottom;animation:blink 0.9s ease infinite;}
  `}</style>
);

const PETALS = Array.from({length:12},(_,i)=>{
  const p=(n)=>(((Math.sin(n*127.1+311.7)*43758.5)%1)+1)%1;
  return{id:i,left:`${5+i*8}%`,size:8+p(i*3)*10,duration:14+p(i*5)*12,delay:p(i*7)*16,
    color:i%3===0?T.roseMid:i%3===1?T.sageMid:T.gold};
});
const PetalLayer=()=>(
  <>{PETALS.map(p=>(
    <div key={p.id} className="petal" style={{left:p.left,width:p.size,height:p.size*1.3,
      background:p.color,opacity:0,animationDuration:`${p.duration}s`,animationDelay:`${p.delay}s`}}/>
  ))}</>
);

const STARS=Array.from({length:28},(_,i)=>{
  const p=(n)=>(((Math.sin(n*127.1+311.7)*43758.5)%1)+1)%1;
  return{top:`${p(i*3)*88+6}%`,left:`${p(i*3+1)*88+6}%`,size:1.5+p(i*3+2)*2.8,
    dur:`${2+p(i*7)*2.5}s`,delay:`${p(i*5)*3.5}s`,
    color:i%5===0?T.gold:i%5===1?T.roseMid:i%5===2?'#b0a8e8':T.pearl};
});

function useTypewriter(text,speed=34,startDelay=500){
  const[displayed,setDisplayed]=useState('');
  const[done,setDone]=useState(false);
  useEffect(()=>{
    setDisplayed('');setDone(false);
    if(!text)return;
    let i=0;
    const t=setTimeout(()=>{
      const iv=setInterval(()=>{i++;setDisplayed(text.slice(0,i));if(i>=text.length){clearInterval(iv);setDone(true);}},speed);
      return()=>clearInterval(iv);
    },startDelay);
    return()=>clearTimeout(t);
  },[text,speed,startDelay]);
  return{displayed,done};
}

function useLineReveal(text,lineDelay=140,startDelay=1200){
  const[visible,setVisible]=useState(0);
  const[done,setDone]=useState(false);
  useEffect(()=>{
    setVisible(0);setDone(false);
    if(!text)return;
    const ls=text.split('\n');
    const ts=ls.map((_,i)=>setTimeout(()=>{setVisible(i+1);if(i===ls.length-1)setDone(true);},startDelay+i*lineDelay));
    return()=>ts.forEach(clearTimeout);
  },[text,lineDelay,startDelay]);
  return{lines:text?text.split('\n'):[],visible,done};
}

function useIsMobile(breakpoint=768){
  const[isMobile,setIsMobile]=useState(()=>
    typeof window!=='undefined'?window.innerWidth<=breakpoint:false
  );
  useEffect(()=>{
    const onResize=()=>setIsMobile(window.innerWidth<=breakpoint);
    window.addEventListener('resize',onResize);
    return()=>window.removeEventListener('resize',onResize);
  },[breakpoint]);
  return isMobile;
}

const BurnCanvas=({onComplete,onBurnTop})=>{
  const ref=useRef(null);
  useEffect(()=>{
    const canvas=ref.current;
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    const W=canvas.width,H=canvas.height;
    let burnY=H; // burn line starts at bottom, moves up
    let ashParticles=[];
    let frameId;
    let phase='burning'; // burning → ashing → done
    let phaseTimer=0;
    let hitTop=false;

    const rand=(a,b)=>a+Math.random()*(b-a);

    const burnEdge=(y,x)=>{
      return y
        +Math.sin(x*0.04+phaseTimer*0.06)*7
        +Math.sin(x*0.09+phaseTimer*0.10)*4
        +Math.sin(x*0.02-phaseTimer*0.04)*5;
    };

    const spawnAsh=()=>{
      for(let i=0;i<3;i++){
        ashParticles.push({
          x:rand(40,W-40),y:burnY-rand(0,20),
          vx:rand(-1.2,1.2),vy:rand(-0.5,0.8),
          rot:rand(0,360),rotV:rand(-3,3),
          w:rand(3,9),h:rand(1,4),
          opacity:rand(0.6,0.9),
          color:`hsl(20,${rand(5,20)|0}%,${rand(12,30)|0}%)`,
        });
      }
    };

    const draw=()=>{
      phaseTimer++;
      ctx.clearRect(0,0,W,H);

      if(phase==='burning'){
        burnY-=1.4;
        if(!hitTop&&burnY<18){hitTop=true;onBurnTop&&onBurnTop();}
        if(burnY<-30){phase='ashing';}

        ctx.fillStyle='rgba(5,1,0,0.97)';
        ctx.fillRect(0,burnY+4,W,H);

        const edgeGrad=ctx.createLinearGradient(0,burnY-6,0,burnY+10);
        edgeGrad.addColorStop(0,'rgba(5,1,0,0)');
        edgeGrad.addColorStop(1,'rgba(5,1,0,0.97)');
        ctx.fillStyle=edgeGrad;
        ctx.fillRect(0,burnY-6,W,16);

        for(let x=0;x<W;x+=2){
          const ey=burnEdge(burnY,x);
          const glowH=rand(8,18);
          const g=ctx.createLinearGradient(x,ey-glowH,x,ey+4);
          g.addColorStop(0,'rgba(255,180,0,0)');
          g.addColorStop(0.5,`rgba(255,${rand(80,140)|0},0,0.6)`);
          g.addColorStop(1,'rgba(180,20,0,0.9)');
          ctx.fillStyle=g;
          ctx.fillRect(x,ey-glowH,2,glowH+4);
        }

        for(let f=0;f<10;f++){
          const fx=rand(0,W);
          const fh=rand(10,26);
          const fw=rand(4,10);
          const fy=burnEdge(burnY,fx);
          ctx.save();
          const fg=ctx.createLinearGradient(fx,fy,fx,fy-fh);
          fg.addColorStop(0,`rgba(255,${rand(40,100)|0},0,0.95)`);
          fg.addColorStop(0.5,`rgba(255,${rand(120,180)|0},0,0.6)`);
          fg.addColorStop(1,'rgba(255,220,80,0)');
          ctx.fillStyle=fg;
          ctx.beginPath();
          ctx.moveTo(fx-fw/2,fy);
          ctx.quadraticCurveTo(fx+rand(-fw,fw),fy-fh*0.6,fx,fy-fh);
          ctx.quadraticCurveTo(fx+rand(-fw,fw)*0.5,fy-fh*0.4,fx+fw/2,fy);
          ctx.fill();
          ctx.restore();
        }

        if(phaseTimer%4===0)spawnAsh();
      }

      ashParticles.forEach(a=>{
        a.x+=a.vx; a.y+=a.vy+0.2; a.rot+=a.rotV; a.opacity-=0.004;
        if(a.opacity<=0)return;
        ctx.save();
        ctx.globalAlpha=Math.max(0,a.opacity);
        ctx.translate(a.x,a.y);
        ctx.rotate(a.rot*Math.PI/180);
        ctx.fillStyle=a.color;
        ctx.fillRect(-a.w/2,-a.h/2,a.w,a.h);
        ctx.restore();
      });
      ashParticles=ashParticles.filter(a=>a.opacity>0&&a.y<H+40);

      if(phase==='ashing'&&ashParticles.length===0){
        phase='done';
        ctx.fillStyle='rgba(5,1,0,1)';
        ctx.fillRect(0,0,W,H);
        setTimeout(onComplete,40);
        return;
      }

      frameId=requestAnimationFrame(draw);
    };
    frameId=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(frameId);
  },[onComplete]);

  return(
    <canvas ref={ref} width={560} height={600}
      style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:20,borderRadius:2}}/>
  );
};

const paperAccentMap={
  offer_letter:        T.sage,
  bank_notification:   T.gold,
  handwritten_note:    T.rose,
  apology_letter:      T.inkMid,
  future_self:         T.sageMid,
  grief_letter:        T.roseMid,
  resignation_letter:  T.rose,
  acceptance_letter:   T.sage,
  manifestation:       T.gold,
  fortune_ticket:      T.gold,
};

const OfferLetterContent=({content,accent,done,lines,visible})=>{
  let parsed={};
  try{ parsed=JSON.parse(content); }catch{ parsed.body=content; }

  const{company='',role='',salary='',startDate='',body='',signatory=''}=parsed;

  return(
    <div style={{fontFamily:"'Lato',sans-serif",fontSize:13,color:T.inkMid,lineHeight:2}}>
      <div style={{borderBottom:`2px solid ${accent}`,paddingBottom:14,marginBottom:20}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:300,color:T.ink,letterSpacing:'0.04em'}}>
          {company||'Studio Orion'}
        </div>
        <div style={{fontSize:10,letterSpacing:'0.22em',color:T.inkLight,textTransform:'uppercase',marginTop:4}}>
          Offer of Employment
        </div>
      </div>

      {[
        ['Position',role||'Senior Designer'],
        ['Salary',salary||'₹24,00,000 per annum'],
        ['Start Date',startDate||'Upon acceptance'],
      ].map(([k,v],i)=>(
        <motion.div key={k}
          initial={{opacity:0,x:-8}}
          animate={visible>i?{opacity:1,x:0}:{}}
          transition={{duration:0.6,ease:[0.16,1,0.3,1]}}
          style={{display:'flex',gap:16,paddingBottom:8,borderBottom:`1px solid rgba(180,160,130,0.18)`,marginBottom:8}}
        >
          <span style={{width:90,flexShrink:0,fontSize:9,letterSpacing:'0.2em',textTransform:'uppercase',color:accent,paddingTop:3}}>{k}</span>
          <span style={{color:T.ink,fontWeight:400}}>{v}</span>
        </motion.div>
      ))}

      <div style={{marginTop:20,fontFamily:"'IM Fell English',serif",fontStyle:'italic',fontSize:17,color:T.ink,lineHeight:1.85}}>
        {lines.slice(3).map((line,i)=>(
          <div key={i} className={visible>i+3?'ink-line':undefined}
            style={{animationDelay:`${i*120}ms`,minHeight:'1.85em',opacity:visible>i+3?undefined:0}}>
            {line||'\u00A0'}
          </div>
        ))}
      </div>

      {done&&signatory&&(
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.6,duration:0.8}}
          style={{marginTop:28,paddingTop:16,borderTop:`1px solid rgba(180,160,130,0.2)`,
            fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:16,color:T.inkMid}}>
          — {signatory}
        </motion.div>
      )}
    </div>
  );
};

const ArtifactPhase=({artifactType,content,tone,from,onReset,burnable})=>{
  const isMobile=useIsMobile(768);
  const[burning,setBurning]=useState(false);
  const[burnDone,setBurnDone]=useState(false);
  const[paperHidden,setPaperHidden]=useState(false);
  const[showFeeling,setShowFeeling]=useState(false);
  const containerRef=useRef(null);

  const isOffer   =artifactType==='offer_letter';
  const isFortune =artifactType==='fortune_ticket';
  const isFormal  =tone==='formal'||isOffer;
  const isBank    =artifactType==='bank_notification';

  const INK_TYPES =['grief_letter','handwritten_note','apology_letter','future_self','resignation_letter','acceptance_letter'];
  const GOLD_TYPES=['offer_letter','bank_notification','manifestation'];
  const animClass =INK_TYPES.includes(artifactType)?'ink-line':GOLD_TYPES.includes(artifactType)?'gold-line':'ink-line';

  const lineDelay  =INK_TYPES.includes(artifactType)?160:GOLD_TYPES.includes(artifactType)?130:140;
  const lineStart  =isOffer?800:INK_TYPES.includes(artifactType)?1300:1000;

  const{lines,visible,done}=useLineReveal(content,lineDelay,lineStart);
  const accent=paperAccentMap[artifactType]||T.roseMid;

  const contentFont =isFormal||isBank?"'Lato',sans-serif":"'IM Fell English',serif";
  const contentSize =(isBank?13:isFortune?18:isFormal?14:19)-(isMobile?2:0);
  const contentStyle=!isFormal&&!isBank&&!isFortune?'italic':'normal';
  const lineH       =isBank?2.1:isFortune?2.2:1.95;

  if(isFortune){
    return(
      <motion.div initial={{opacity:0,y:50,rotate:-1.5}} animate={{opacity:1,y:0,rotate:0}}
        exit={{opacity:0,scale:0.95}} transition={{duration:1.4,ease:[0.16,1,0.3,1]}}
        style={{width:'100%',maxWidth:isMobile?320:340,padding:isMobile?'0 14px':'0 20px',position:'relative',zIndex:10}}>
        {[0,1].map(side=>(
          <div key={side} style={{display:'flex',justifyContent:'space-between',padding:`${side?'6px':'0'} 4px ${side?'0':'6px'}`}}>
            {Array.from({length:9}).map((_,i)=>(
              <div key={i} style={{width:10,height:10,borderRadius:'50%',background:T.pearlDeep,opacity:0.6}}/>
            ))}
          </div>
        )).filter((_,i)=>i===0)}
        <div style={{
          background:'linear-gradient(160deg,#FFFBEE,#FFF5CC)',
          border:`2px dashed rgba(200,169,110,0.4)`,borderRadius:4,
          boxShadow:`0 4px 24px rgba(200,169,110,0.2),0 20px 60px rgba(200,169,110,0.1)`,
          padding:isMobile?'28px 22px 24px':'36px 32px 32px',position:'relative',
        }}>
          <div style={{fontFamily:"'Lato',sans-serif",fontSize:9,letterSpacing:'0.32em',color:T.gold,
            textTransform:'uppercase',marginBottom:22,textAlign:'center',opacity:0.6}}>
            FORTUNE · NO. {String(lines.length*37+11).padStart(4,'0')}
          </div>
          <div style={{fontFamily:contentFont,fontSize:contentSize,fontStyle:contentStyle,lineHeight:lineH,textAlign:'center',color:T.ink}}>
            {lines.map((line,i)=>(
              <div key={i} className={visible>i?'ink-line':undefined}
                style={{animationDelay:`${i*110}ms`,minHeight:`${lineH}em`,opacity:visible>i?undefined:0}}>
                {line||'\u00A0'}
              </div>
            ))}
          </div>
          {done&&from&&(
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8,duration:1.2}}
              style={{marginTop:22,fontFamily:"'Lato',sans-serif",fontSize:9,letterSpacing:'0.22em',
                color:T.gold,textTransform:'uppercase',textAlign:'center',opacity:0.5}}>
              — {from}
            </motion.div>
          )}
          <div style={{position:'absolute',bottom:-14,right:24,width:28,height:28,borderRadius:'50%',
            background:`radial-gradient(circle at 35% 35%,#FFE082,${T.gold})`,
            boxShadow:`0 2px 10px rgba(200,169,110,0.5)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>
            <span style={{color:'white'}}>★</span>
          </div>
        </div>
        {Array.from({length:9}).map((_,i)=>(
          <div key={i} style={{width:10,height:10,borderRadius:'50%',background:T.pearlDeep,
            opacity:0.6,display:'inline-block',margin:'6px 4px 0'}}/>
        ))}
        {done&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.5,duration:1.5}}
            style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,marginTop:32}}>
            <p style={{fontFamily:"'Lato',sans-serif",fontWeight:300,fontSize:11,letterSpacing:'0.15em',
              color:T.inkLight,textTransform:'uppercase'}}>carry this with you</p>
            <motion.button initial={{opacity:0}} animate={{opacity:1}} transition={{delay:4.5,duration:1}}
              whileHover={{color:T.rose}} onClick={onReset}
              style={{fontFamily:"'IM Fell English',serif",fontStyle:'italic',fontSize:15,
                color:T.inkLight,letterSpacing:'0.04em',transition:'color 0.3s'}}>
              ↩ something else is on my heart
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return(
    <motion.div initial={{opacity:0,y:60}} animate={{opacity:1,y:0}}
      exit={burning||burnDone?{opacity:0,transition:{duration:0}}:{opacity:0,scale:0.97}}
      transition={{duration:1.4,ease:[0.16,1,0.3,1]}}
      style={{width:'100%',maxWidth:560,padding:isMobile?'0 14px':'0 20px',position:'relative',zIndex:10}}>

      <div ref={containerRef} style={{position:'relative'}}>
        {!paperHidden&&(
          <>
            <motion.div
          initial={{opacity:0,y:60}}
          animate={{opacity:1,y:0}}
          exit={{opacity:0,scale:0.97}}
          transition={{duration:1.4,ease:[0.16,1,0.3,1]}}
          style={{
            background:`
              linear-gradient(175deg,#EDE0C0 0%,#E5D4A8 25%,#DBC898 50%,#E2D0A8 75%,#E8D8B4 100%)
            `,
            borderRadius:'2px 3px 2px 4px', // slightly uneven corners
            border:`1px solid rgba(160,120,60,0.25)`,
            borderTop:`3px solid ${accent}`,

            clipPath:`polygon(
              0% 0%,
              97.5% 0%,98.8% 0.6%,99.4% 0.2%,100% 0.8%,
              100% 98.5%,99.2% 99.1%,98.6% 98.7%,97.8% 99.6%,97.2% 99.2%,96.8% 100%,
              2.2% 100%,1.6% 99.4%,0.8% 99.8%,0.2% 99.1%,0% 98.5%,
              0% 0%
            )`,

            boxShadow:`
              2px 3px 0 rgba(100,70,30,0.08),
              4px 6px 0 rgba(100,70,30,0.05),
              0 12px 40px rgba(80,50,20,0.18),
              0 40px 80px rgba(60,35,15,0.12),
              inset 0 0 60px rgba(100,70,20,0.06)
            `,
            padding:isMobile?'30px 22px 34px':'48px 44px 52px',
            position:'relative',overflow:'hidden',
          }}>


          <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0,background:`
            radial-gradient(ellipse 6% 4% at 7% 12%,  rgba(100,60,20,0.22) 0%,transparent 100%),
            radial-gradient(ellipse 4% 3% at 88% 8%,  rgba(90,55,18,0.18)  0%,transparent 100%),
            radial-gradient(ellipse 5% 4% at 15% 78%, rgba(105,62,22,0.2)  0%,transparent 100%),
            radial-gradient(ellipse 3% 2% at 78% 85%, rgba(95,58,20,0.17)  0%,transparent 100%),
            radial-gradient(ellipse 4% 3% at 45% 6%,  rgba(98,60,20,0.14)  0%,transparent 100%),
            radial-gradient(ellipse 6% 5% at 93% 52%, rgba(92,55,18,0.16)  0%,transparent 100%),
            radial-gradient(ellipse 3% 2% at 32% 92%, rgba(100,62,22,0.13) 0%,transparent 100%),
            radial-gradient(ellipse 5% 3% at 68% 3%,  rgba(88,53,17,0.15)  0%,transparent 100%)
          `}}/>

          <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0,background:`
            radial-gradient(ellipse 30% 20% at 8% 55%,  rgba(130,90,40,0.06) 0%,transparent 70%),
            radial-gradient(ellipse 22% 28% at 88% 22%, rgba(120,80,35,0.07) 0%,transparent 70%),
            radial-gradient(ellipse 18% 22% at 55% 88%, rgba(115,75,32,0.05) 0%,transparent 70%)
          `}}/>

          <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0,background:`
            radial-gradient(ellipse 100% 100% at 50% 50%,transparent 40%,rgba(90,55,20,0.14) 80%,rgba(70,40,12,0.22) 100%)
          `}}/>

          <div style={{position:'absolute',top:'40%',left:0,right:0,height:1,
            background:'linear-gradient(90deg,transparent 2%,rgba(90,55,20,0.22) 15%,rgba(90,55,20,0.30) 50%,rgba(90,55,20,0.22) 85%,transparent 98%)',
            pointerEvents:'none',zIndex:0}}/>
          <div style={{position:'absolute',top:'calc(40% + 1px)',left:0,right:0,height:22,
            background:'linear-gradient(to bottom,rgba(60,35,10,0.05),transparent)',
            pointerEvents:'none',zIndex:0}}/>

          <div style={{position:'absolute',top:0,bottom:0,left:'33%',width:1,
            background:'linear-gradient(to bottom,transparent 3%,rgba(90,55,20,0.14) 20%,rgba(90,55,20,0.18) 50%,rgba(90,55,20,0.14) 80%,transparent 97%)',
            pointerEvents:'none',zIndex:0}}/>

          <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0,opacity:0.55,
            backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E")`,
            backgroundRepeat:'repeat',mixBlendMode:'multiply'}}/>

          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontFamily:"'Lato',sans-serif",fontSize:9,fontWeight:300,
              letterSpacing:'0.28em',color:accent,textTransform:'uppercase',
              marginBottom:20,opacity:0.7}}>
              {artifactType.replace(/_/g,' ')}
            </div>

            {isOffer
              ? <OfferLetterContent content={content} accent={accent} done={done} lines={lines} visible={visible}/>
              : (
                <div style={{fontFamily:contentFont,fontSize:contentSize,fontStyle:contentStyle,
                  color:T.ink,lineHeight:lineH,letterSpacing:'0.01em'}}>
                  {lines.map((line,i)=>(
                    <div key={i}
                      className={visible>i?animClass:undefined}
                      style={{
                        animationDelay:`${i*lineDelay*0.5}ms`,
                        minHeight:`${lineH}em`,
                        opacity:visible>i?undefined:0,
                      }}>
                      {line||'\u00A0'}
                    </div>
                  ))}
                </div>
              )
            }

            {done&&from&&!isOffer&&(
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                transition={{delay:0.5,duration:0.9}}
                style={{marginTop:28,paddingTop:18,
                  borderTop:`1px solid rgba(130,90,40,0.2)`,
                  fontFamily:"'IM Fell English',serif",fontStyle:'italic',
                  fontSize:17,color:T.inkMid}}>
                — {from}
              </motion.div>
            )}
          </div>

          <div style={{position:'absolute',bottom:18,right:28,zIndex:2,
            width:30,height:30,borderRadius:'50%',
            background:`radial-gradient(circle at 35% 35%,${T.roseMid},${T.rose})`,
            boxShadow:`0 2px 8px rgba(180,100,110,0.4)`,
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:11}}>
            <span style={{color:'white',fontFamily:'serif'}}>✦</span>
          </div>
            </motion.div>
          </>
        )}

        {burning&&!burnDone&&(
          <BurnCanvas
            onBurnTop={()=>{setPaperHidden(true);setShowFeeling(true);}}
            onComplete={()=>{setBurnDone(true);setShowFeeling(false);onReset();}}
          />
        )}
      </div>

      {showFeeling&&(
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:30}}>
          <div style={{fontFamily:"'IM Fell English',serif",fontStyle:'italic',fontSize:22,
            color:'rgba(230,220,200,0.85)',letterSpacing:'0.08em',textTransform:'uppercase'}}>
            Feeling Good
          </div>
        </div>
      )}

      {done&&!burning&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          transition={{delay:2,duration:1.5}}
          style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,marginTop:36}}>
          <p style={{fontFamily:"'Lato',sans-serif",fontWeight:300,fontSize:11,
            letterSpacing:'0.15em',color:T.inkLight,textTransform:'uppercase'}}>
            sit with this for a moment
          </p>
          {burnable&&(
            <motion.button initial={{opacity:0}} animate={{opacity:1}}
              transition={{delay:3.5,duration:1.2}}
              whileHover={{color:'#B83000',letterSpacing:'0.22em'}}
              onClick={()=>setBurning(true)}
              style={{fontFamily:"'Lato',sans-serif",fontWeight:300,fontSize:10,
                color:'#993300',letterSpacing:'0.18em',textTransform:'uppercase',
                transition:'color 0.3s,letter-spacing 0.4s',padding:'4px 0'}}>
              🔥 burn it
            </motion.button>
          )}
          <motion.button initial={{opacity:0}} animate={{opacity:1}}
            transition={{delay:5,duration:1}}
            whileHover={{color:T.rose}}
            onClick={onReset}
            style={{fontFamily:"'IM Fell English',serif",fontStyle:'italic',
              fontSize:15,color:T.inkLight,letterSpacing:'0.04em',transition:'color 0.3s'}}>
            ↩ something else is on my heart
          </motion.button>
        </motion.div>
      )}

    </motion.div>
  );
};

const RitualPhase=({feeling,onComplete})=>{
  const short=feeling.length>80?feeling.slice(0,77)+'…':feeling;
  useEffect(()=>{const t=setTimeout(onComplete,5500);return()=>clearTimeout(t);},[onComplete]);
  return(
    <motion.div key="ritual"
      initial={{opacity:0}} animate={{opacity:1}}
      exit={{opacity:0,transition:{duration:1.4,ease:'easeInOut'}}}
      transition={{duration:1.2,ease:'easeInOut'}}
      style={{position:'fixed',inset:0,zIndex:50,
        background:'radial-gradient(ellipse 80% 70% at 50% 45%,#110D2E 0%,#0A0818 55%,#060511 100%)',
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
        gap:28,overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:`
        radial-gradient(ellipse 45% 35% at 28% 62%,rgba(120,60,200,0.18) 0%,transparent 70%),
        radial-gradient(ellipse 38% 28% at 72% 30%,rgba(200,100,140,0.13) 0%,transparent 70%)
      `}}/>
      {STARS.map((s,i)=>(
        <span key={i} className="star" style={{top:s.top,left:s.left,width:s.size,height:s.size,
          background:s.color,boxShadow:`0 0 ${s.size*2}px ${s.color}`,
          animationDuration:s.dur,animationDelay:s.delay}}/>
      ))}
      <motion.p initial={{opacity:0,y:22}} animate={{opacity:0.90,y:0}}
        transition={{delay:0.7,duration:1.8,ease:[0.16,1,0.3,1]}}
        style={{fontFamily:"'IM Fell English',serif",fontStyle:'italic',fontSize:'clamp(18px,3.2vw,26px)',
          color:T.pearl,textAlign:'center',maxWidth:500,lineHeight:1.7,padding:'0 36px',position:'relative',zIndex:1}}>
        &ldquo;{short}&rdquo;
      </motion.p>
      <motion.div initial={{opacity:0,letterSpacing:'1.4em'}} animate={{opacity:1,letterSpacing:'0.52em'}}
        transition={{delay:2.5,duration:1.6,ease:[0.16,1,0.3,1]}}
        style={{fontFamily:"'Lato',sans-serif",fontWeight:300,fontSize:10,color:'#c8a4d4',
          textTransform:'lowercase',position:'relative',zIndex:1}}>
        felt.
      </motion.div>
      <motion.div initial={{scaleX:0,opacity:0}} animate={{scaleX:1,opacity:1}}
        transition={{delay:3.7,duration:1.1,ease:[0.25,1,0.5,1]}}
        style={{width:60,height:1,background:'linear-gradient(90deg,transparent,rgba(200,164,212,0.6),transparent)',
          transformOrigin:'center',position:'relative',zIndex:1}}/>
      <motion.p initial={{opacity:0}} animate={{opacity:0.42}} transition={{delay:4.5,duration:1.3}}
        style={{fontFamily:"'Lato',sans-serif",fontWeight:300,fontSize:9,color:T.pearl,
          letterSpacing:'0.3em',textTransform:'uppercase',position:'relative',zIndex:1}}>
        something is taking shape
      </motion.p>
    </motion.div>
  );
};

const InputPhase=({onSubmit,onFortune})=>{
  const isMobile=useIsMobile(768);
  const[value,setValue]=useState('');
  const[focused,setFocused]=useState(false);
  const[expanded,setExpanded]=useState(false);
  const[yourName,setYourName]=useState('');
  const[detail,setDetail]=useState('');
  const ref=useRef(null);
  useEffect(()=>{setTimeout(()=>ref.current?.focus(),600);},[]);
  const handleSubmit=()=>{if(value.trim().length<3)return;onSubmit(value.trim(),yourName.trim(),detail.trim());};
  const fieldStyle={width:'100%',background:'rgba(255,255,255,0.5)',border:`1px solid ${T.pearlDeep}`,
    borderRadius:10,padding:'9px 14px',fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:T.ink,caretColor:T.rose};
  return(
    <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}
      exit={{opacity:0,y:-30,scale:0.96,filter:'blur(6px)',transition:{duration:1.1,ease:'easeInOut'}}}
      transition={{duration:1.0,ease:[0.16,1,0.3,1]}}
      style={{display:'flex',flexDirection:'column',alignItems:'center',gap:isMobile?24:32,
        width:'100%',maxWidth:520,padding:isMobile?'0 14px':'0 24px',position:'relative',zIndex:10}}>

      <div style={{position:'absolute',width:isMobile?260:320,height:isMobile?260:320,borderRadius:'50%',
        border:`1px solid ${T.roseMid}`,top:'50%',left:'50%',transform:'translate(-50%,-50%)',
        animation:'breathe 5s ease-in-out infinite',pointerEvents:'none'}}/>

      <motion.div initial={{opacity:0,letterSpacing:'0.6em'}} animate={{opacity:1,letterSpacing:'0.28em'}}
        transition={{delay:0.3,duration:1.2}}
        style={{fontFamily:"'Lato',sans-serif",fontWeight:300,fontSize:11,
          letterSpacing:'0.28em',color:T.inkLight,textTransform:'uppercase'}}>
        unfold
      </motion.div>

      <motion.h1 initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5,duration:1}}
        style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300,fontStyle:'italic',
          fontSize:'clamp(28px,5vw,42px)',color:T.ink,textAlign:'center',lineHeight:1.3,letterSpacing:'-0.01em'}}>
        what are you carrying<br/>
        <span style={{color:T.rose}}>right now?</span>
      </motion.h1>

      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.7,duration:0.8}}
        style={{width:'100%',background:'rgba(255,255,255,0.7)',
          border:`1px solid ${focused?T.roseMid:T.pearlDeep}`,borderRadius:24,
          padding:isMobile?'18px 16px 16px':'24px 28px 20px',backdropFilter:'blur(12px)',
          boxShadow:focused?`0 8px 48px rgba(196,129,138,0.12)`:`0 4px 24px rgba(44,36,32,0.06)`,
          transition:'border-color 0.4s,box-shadow 0.4s',position:'relative'}}>

        <div style={{position:'absolute',top:0,left:40,right:40,height:1,
          background:`linear-gradient(90deg,transparent,${T.roseMid},${T.sageMid},transparent)`,
          opacity:0.4,borderRadius:'0 0 4px 4px'}}/>

        <textarea ref={ref} value={value} onChange={e=>setValue(e.target.value)}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))handleSubmit();}}
          placeholder="Pour it out. There's no right way to say it."
          rows={5}
          style={{width:'100%',background:'transparent',border:'none',
            fontFamily:"'Cormorant Garamond',serif",fontWeight:400,fontSize:isMobile?16:18,
            color:T.ink,lineHeight:1.75,resize:'none',caretColor:T.rose}}/>

        <AnimatePresence>
          {expanded&&(
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}}
              exit={{opacity:0,height:0}} transition={{duration:0.35}} style={{overflow:'hidden'}}>
              <div style={{display:'flex',flexDirection:'column',gap:10,paddingTop:14,marginBottom:4}}>
                <p style={{fontFamily:"'Lato',sans-serif",fontSize:10,color:T.inkLight,
                  letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:2}}>
                  make it personal (optional)
                </p>
                <input value={yourName} onChange={e=>setYourName(e.target.value)} placeholder="your name" style={fieldStyle}/>
                <input value={detail} onChange={e=>setDetail(e.target.value)}
                  placeholder="their name · company · a place — whatever fits" style={fieldStyle}/>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
          marginTop:12,paddingTop:12,borderTop:`1px solid ${T.pearlDeep}`}}>
          <button onClick={()=>setExpanded(e=>!e)}
            style={{fontFamily:"'Lato',sans-serif",fontSize:10,textTransform:'uppercase',
              color:expanded?T.rose:T.inkLight,letterSpacing:'0.08em',transition:'color 0.3s'}}>
            {expanded?'▲ less':'✦ make it yours'}
          </button>
          <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={handleSubmit}
            style={{background:`linear-gradient(135deg,${T.rose},${T.roseMid})`,color:'white',
              border:'none',borderRadius:50,padding:'10px 28px',
              fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:400,
              letterSpacing:'0.04em',boxShadow:`0 4px 20px rgba(196,129,138,0.3)`,
              opacity:value.trim().length<3?0.4:1,transition:'opacity 0.3s'}}>
            unfold it
          </motion.button>
        </div>
      </motion.div>

      <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2,duration:1}}
        style={{fontFamily:"'Lato',sans-serif",fontWeight:300,fontSize:12,
          color:T.inkLight,letterSpacing:'0.06em',textAlign:'center'}}>
        what you feel will be heard. what you need will appear.
      </motion.p>

      <motion.button initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2,duration:1.2}}
        whileHover={{scale:1.04,boxShadow:`0 4px 20px rgba(200,169,110,0.3)`}}
        whileTap={{scale:0.97}} onClick={onFortune}
        style={{fontFamily:"'Lato',sans-serif",fontWeight:300,fontSize:12,color:T.gold,
          letterSpacing:'0.2em',textTransform:'uppercase',border:`1px solid rgba(200,169,110,0.35)`,
          borderRadius:50,background:'rgba(255,252,240,0.7)',padding:'10px 22px',
          backdropFilter:'blur(6px)',transition:'box-shadow 0.3s',
          boxShadow:`0 2px 12px rgba(200,169,110,0.12)`}}>
        ✦ know your fortune
      </motion.button>
    </motion.div>
  );
};

const QuestionPhase=({question,onAnswer})=>{
  const isMobile=useIsMobile(768);
  const{displayed,done}=useTypewriter(question,48,700);
  return(
    <motion.div initial={{opacity:0,filter:'blur(8px)'}} animate={{opacity:1,filter:'blur(0px)'}}
      exit={{opacity:0,filter:'blur(6px)'}} transition={{duration:1.2,ease:'easeInOut'}}
      style={{display:'flex',flexDirection:'column',alignItems:'center',gap:isMobile?28:40,
        maxWidth:420,width:'100%',padding:isMobile?'0 14px':'0 24px',position:'relative',zIndex:10,textAlign:'center'}}>
      <motion.div animate={{scale:[1,1.15,1],opacity:[0.3,0.6,0.3]}}
        transition={{duration:3,repeat:Infinity,ease:'easeInOut'}}
        style={{width:8,height:8,borderRadius:'50%',background:T.sage}}/>
      <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontWeight:300,
        fontSize:'clamp(22px,4vw,30px)',color:T.ink,lineHeight:1.4,minHeight:80}}>
        {displayed}{!done&&<span className="cursor"/>}
      </p>
      {done&&(
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
          transition={{duration:0.6}}
          style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
          {['manifest it','release it','just hold it'].map(opt=>(
            <motion.button key={opt} whileHover={{scale:1.04,backgroundColor:T.roseLight}}
              whileTap={{scale:0.97}} onClick={()=>onAnswer(opt)}
              style={{background:'rgba(255,255,255,0.7)',border:`1px solid ${T.roseMid}`,
                borderRadius:50,padding:'10px 22px',fontFamily:"'Cormorant Garamond',serif",
                fontSize:16,color:T.ink,backdropFilter:'blur(8px)',transition:'background-color 0.3s'}}>
              {opt}
            </motion.button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

const ReadingState=()=>(
  <motion.div initial={{opacity:0,filter:'blur(10px)'}} animate={{opacity:1,filter:'blur(0px)'}}
    exit={{opacity:0,filter:'blur(8px)',transition:{duration:1.0}}}
    transition={{duration:1.2,ease:'easeInOut'}}
    style={{display:'flex',flexDirection:'column',alignItems:'center',gap:28,zIndex:10,position:'relative'}}>
    <motion.div animate={{rotate:360}} transition={{duration:12,repeat:Infinity,ease:'linear'}}
      style={{width:44,height:44,borderRadius:'50%',border:`1px solid ${T.sageMid}`,
        borderTopColor:T.rose,borderRightColor:T.gold}}/>
    <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6,duration:1.2}}
      style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontWeight:300,
        fontSize:18,color:T.inkMid,letterSpacing:'0.02em'}}>
      reading what you carry…
    </motion.p>
  </motion.div>
);

const FORTUNES=[
  "Something is shifting in your favour right now, quietly, without announcement.",
  "The door you keep knocking on is about to open. Not because it's time — because you stopped leaving.",
  "Rest. You have been fighting long enough. What you need is already on its way to you.",
  "The version of your life you are afraid to hope for is the one being built.",
  "You will not miss it. What is for you will not move on without you.",
  "The waiting is not punishment. It is preparation you cannot see yet.",
  "Every time you chose to stay soft in a hard situation — that was the work. It counted.",
  "Something good is looking for you. Stand still long enough to be found.",
  "You are not behind. You are exactly where the story needs you to be.",
  "The universe heard you. It is just wrapping it carefully.",
  "What you planted in silence is growing. You will see it soon.",
  "Stop explaining yourself to people who have already decided. Your life will say it better.",
  "The answer is closer than the anxiety makes it feel.",
  "Not everything that falls apart is a loss. Some things fall apart so the right thing can find the space.",
  "You are allowed to want more. That wanting is not greed. It is direction.",

  "The love you are ready to give deserves someone ready to receive it. That person exists.",
  "You cannot force a connection that was never meant to grow. Letting go is not failure — it is wisdom.",
  "The relationship you are grieving taught you exactly what you will not settle for next time. That is a gift.",
  "Someone is going to love the version of you that you are still learning to accept.",
  "Being alone right now is not a sign that you are unlovable. It is a sign that you are selective. That is rare.",

  "The work you are doing quietly is being noticed by the right people. Keep going.",
  "Your career is not behind schedule. It is running on a timeline built specifically for you.",
  "The opportunity you almost gave up on is about to show you why you stayed.",
  "You do not need to have it all figured out. You just need to take the next right step.",
  "The skill you undervalue is the one someone else has been searching for.",

  "You are not the same person who got hurt. That version of you became this one. Look how far you have come.",
  "The body remembers everything. Be gentle with it. It carried you through things that should have broken you.",
  "Healing is not linear and it is not loud. Some days it looks like just getting through. That counts.",
  "The part of you that keeps trying — even when it is hard — that is not weakness. That is your whole character.",
  "You do not owe anyone a performance of your pain. You are allowed to heal privately and emerge loudly.",

  "The financial breakthrough you have been praying for is already in motion. Trust the process unfolding.",
  "Money is looking for a home in someone who believes they deserve it. Start believing.",
  "One good decision away. That is all. The moment is closer than you think.",
  "Abundance is not something you chase. It is something you become aligned with. You are almost there.",
  "The investment you made in yourself — the course, the therapy, the late nights learning — is about to pay off.",
];

export default function App(){
  const isMobile=useIsMobile(768);
  const[phase,setPhase]=useState('input');
  const[feeling,setFeeling]=useState('');
  const[person,setPerson]=useState({name:'',detail:''});
  const[question,setQuestion]=useState('');
  const[artifact,setArtifact]=useState(null);

  useEffect(()=>{
    if(phase!=='reading')return;
    (async()=>{
      try{
        const res=await classifyWish(feeling,null,person.name,person.detail);
        if(res.type==='question'){setQuestion(res.question);setPhase('question');}
        else{setArtifact(res);setPhase('artifact');}
      }catch(e){console.error(e);setPhase('input');}
    })();
  },[phase]); // eslint-disable-line

  const handleSubmit=(text,name,detail)=>{
    setFeeling(text);setPerson({name,detail});setPhase('ritual');
  };
  const handleAnswer=async(ans)=>{
    setPhase('reading');
    try{
      const res=await classifyWish(feeling,ans,person.name,person.detail);
      if(res.type==='artifact'){setArtifact(res);setPhase('artifact');}
      else setPhase('input');
    }catch{setPhase('input');}
  };
  const handleFortune=()=>{
    setArtifact({type:'artifact',artifactType:'fortune_ticket',
      content:FORTUNES[Math.floor(Math.random()*FORTUNES.length)],
      tone:'gentle',from:'The Universe',to:'You'});
    setPhase('artifact');
  };
  const handleReset=()=>{setPhase('input');setFeeling('');setPerson({name:'',detail:''});setQuestion('');setArtifact(null);};

  const burnable=artifact&&/\bhate\b|angry|rage|burn|betrayed|toxic|revenge|i want to destroy|despise/i.test(feeling);

  return(
    <>
      <GlobalStyles/>
      <PetalLayer/>
      <div style={{position:'fixed',inset:0,background:`
        radial-gradient(ellipse 60% 50% at 20% 20%,${T.roseLight}55 0%,transparent 60%),
        radial-gradient(ellipse 50% 60% at 80% 80%,${T.sageLight}44 0%,transparent 60%),
        radial-gradient(ellipse 40% 40% at 50% 50%,rgba(255,255,255,0.4) 0%,transparent 70%)
      `,pointerEvents:'none',zIndex:0}}/>
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
        padding:isMobile?'24px 0':'40px 0',position:'relative',zIndex:1}}>
        <AnimatePresence mode="wait">
          {phase==='input'   &&<InputPhase    key="input"    onSubmit={handleSubmit} onFortune={handleFortune}/>}
          {phase==='ritual'  &&<RitualPhase   key="ritual"   feeling={feeling} onComplete={()=>setPhase('reading')}/>}
          {phase==='reading' &&<ReadingState  key="reading"/>}
          {phase==='question'&&<QuestionPhase key="question" question={question} onAnswer={handleAnswer}/>}
          {phase==='artifact'&&artifact&&(
            <ArtifactPhase key="artifact" artifactType={artifact.artifactType}
              content={artifact.content} tone={artifact.tone} from={artifact.from}
              onReset={handleReset} burnable={burnable}/>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
